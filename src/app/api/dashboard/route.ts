import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sc = createServiceClient();

    const { data: appUser } = await sc
      .from("users")
      .select("org_id, role")
      .eq("auth_uid", user.id)
      .single();

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch locations with client info
    const { data: locations } = await sc
      .from("locations")
      .select("id, name, address, category, gbp_place_id, gbp_account_id, gbp_location_name, client_id")
      .order("name");

    // Fetch clients
    const { data: clients } = await sc
      .from("clients")
      .select("id, company_name")
      .eq("org_id", appUser.org_id);

    const clientMap = new Map((clients || []).map(c => [c.id, c.company_name]));

    // Fetch all reviews
    const { data: reviews } = await sc
      .from("reviews")
      .select("id, location_id, rating, body, author, reply_status, reviewed_at")
      .order("reviewed_at", { ascending: false })
      .limit(200);

    // Fetch tasks
    const { data: tasks } = await sc
      .from("tasks")
      .select("id, title, status, location_id, due_date, requires_approval, created_at")
      .order("due_date", { ascending: true })
      .limit(100);

    // Fetch pending approvals
    const { data: approvals } = await sc
      .from("approvals")
      .select("id, task_id, status, comment, created_at")
      .eq("status", "pending")
      .limit(20);

    // Fetch keywords with latest rank
    const { data: keywords } = await sc
      .from("keywords")
      .select("id, keyword, location_id, is_primary")
      .limit(50);

    const { data: rankObservations } = await sc
      .from("rank_observations")
      .select("id, keyword_id, observed_date, rank")
      .order("observed_date", { ascending: false })
      .limit(500);

    // Build location summaries
    const locationSummaries = (locations || []).map(loc => {
      const locReviews = (reviews || []).filter(r => r.location_id === loc.id);
      const avgRating = locReviews.length > 0
        ? locReviews.reduce((sum, r) => sum + r.rating, 0) / locReviews.length
        : 0;
      const recentNegative = locReviews.filter(r => r.rating <= 2 &&
        new Date(r.reviewed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      const locTasks = (tasks || []).filter(t => t.location_id === loc.id);
      const pendingTasks = locTasks.filter(t =>
        ["draft", "pending_approval", "in_progress"].includes(t.status)
      ).length;

      const locKeywords = (keywords || []).filter(k => k.location_id === loc.id);
      const latestRanks = locKeywords.map(kw => {
        const ranks = (rankObservations || []).filter(r => r.keyword_id === kw.id);
        const latest = ranks[0];
        const previous = ranks.length > 1 ? ranks[1] : null;
        return {
          keyword: kw.keyword,
          isPrimary: kw.is_primary,
          currentRank: latest?.rank || null,
          previousRank: previous?.rank || null,
          change: latest && previous ? previous.rank - latest.rank : 0,
        };
      });

      const avgRank = latestRanks.filter(r => r.currentRank).length > 0
        ? latestRanks.filter(r => r.currentRank).reduce((sum, r) => sum + (r.currentRank || 0), 0) / latestRanks.filter(r => r.currentRank).length
        : null;

      const avgRankChange = latestRanks.filter(r => r.change !== 0).length > 0
        ? latestRanks.filter(r => r.change !== 0).reduce((sum, r) => sum + r.change, 0) / latestRanks.filter(r => r.change !== 0).length
        : 0;

      let status: "good" | "warning" | "critical" = "good";
      if (recentNegative >= 3 || (avgRank && avgRank > 10)) status = "critical";
      else if (recentNegative >= 1 || (avgRank && avgRank > 5)) status = "warning";

      return {
        id: loc.id,
        name: loc.name,
        address: loc.address,
        client: clientMap.get(loc.client_id) || "未設定",
        gbpLinked: !!(loc.gbp_location_name),
        avgRank: avgRank ? Math.round(avgRank * 10) / 10 : null,
        rankChange: Math.round(avgRankChange * 10) / 10,
        reviewScore: Math.round(avgRating * 10) / 10,
        reviewCount: locReviews.length,
        pendingTasks,
        recentNegativeReviews: recentNegative,
        status,
        keywords: latestRanks,
      };
    });

    // Recent reviews (last 10)
    const recentReviews = (reviews || []).slice(0, 10).map(r => {
      const loc = (locations || []).find(l => l.id === r.location_id);
      return {
        ...r,
        locationName: loc?.name || "不明",
      };
    });

    // Task summary
    const allTasks = tasks || [];
    const taskSummary = {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status === "completed").length,
      inProgress: allTasks.filter(t => t.status === "in_progress").length,
      pending: allTasks.filter(t => ["draft", "pending_approval"].includes(t.status)).length,
    };

    // Today's tasks
    const today = new Date().toISOString().split("T")[0];
    const todayTasks = allTasks
      .filter(t => t.status !== "completed" && t.due_date && t.due_date <= today)
      .slice(0, 10)
      .map(t => {
        const loc = (locations || []).find(l => l.id === t.location_id);
        return {
          id: t.id,
          title: t.title,
          status: t.status,
          dueDate: t.due_date,
          locationName: loc?.name || "不明",
        };
      });

    // Overall stats
    const totalReviews = (reviews || []).length;
    const overallAvgRating = totalReviews > 0
      ? Math.round((reviews || []).reduce((sum, r) => sum + r.rating, 0) / totalReviews * 10) / 10
      : 0;

    // Pending approvals with task info
    const pendingApprovalList = (approvals || []).map(a => {
      const task = allTasks.find(t => t.id === a.task_id);
      const loc = task ? (locations || []).find(l => l.id === task.location_id) : null;
      return {
        id: a.id,
        taskTitle: task?.title || "不明なタスク",
        locationName: loc?.name || "",
        status: a.status,
        createdAt: a.created_at,
      };
    });

    return NextResponse.json({
      date: new Date().toLocaleDateString("ja-JP", {
        year: "numeric", month: "long", day: "numeric", weekday: "short",
      }),
      role: appUser.role,
      locations: locationSummaries,
      recentReviews,
      taskSummary,
      todayTasks,
      pendingApprovals: pendingApprovalList,
      stats: {
        totalLocations: (locations || []).length,
        totalReviews,
        overallAvgRating,
        pendingReviewReplies: (reviews || []).filter(r => r.reply_status === "pending").length,
      },
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
