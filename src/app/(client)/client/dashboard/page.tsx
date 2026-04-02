"use client";

import { useEffect, useState } from "react";
import { Eye, MapPin, Phone, Globe, Star, Loader2, MessageSquare } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  date: string;
  locations: Array<{
    id: string;
    name: string;
    reviewScore: number;
    reviewCount: number;
    pendingTasks: number;
    status: "good" | "warning" | "critical";
    keywords: Array<{
      keyword: string;
      currentRank: number | null;
      change: number;
    }>;
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    author: string;
    body: string | null;
    locationName: string;
    reviewed_at: string;
    reply_status: string;
  }>;
  taskSummary: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  todayTasks: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string;
    locationName: string;
  }>;
  pendingApprovals: Array<{
    id: string;
    taskTitle: string;
    locationName: string;
    createdAt: string;
  }>;
  stats: {
    totalLocations: number;
    totalReviews: number;
    overallAvgRating: number;
    pendingReviewReplies: number;
  };
}

export default function ClientDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || !data.stats) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        データの取得に失敗しました。ページを再読み込みしてください。
      </div>
    );
  }

  const firstLocation = data.locations[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground mt-1">
          {firstLocation?.name || "店舗未登録"} — {data.date}
        </p>
      </div>

      {/* Summary Highlight */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">概要</h3>
          <p className="text-blue-100 leading-relaxed">
            {data.stats.totalLocations > 0 ? (
              <>
                現在 <span className="font-bold text-white">{data.stats.totalLocations} 店舗</span> を管理中。
                口コミは合計 <span className="font-bold text-white">{data.stats.totalReviews} 件</span>
                （平均 ★{data.stats.overallAvgRating}）。
                {data.stats.pendingReviewReplies > 0 && (
                  <>未返信の口コミが <span className="font-bold text-white">{data.stats.pendingReviewReplies} 件</span> あります。</>
                )}
                {data.taskSummary.pending > 0 && (
                  <> 対応待ちのタスクが <span className="font-bold text-white">{data.taskSummary.pending} 件</span> あります。</>
                )}
              </>
            ) : (
              "ロケーションが登録されていません。管理者にお問い合わせください。"
            )}
          </p>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div>
        <SectionHeader title="主要指標" className="mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            title="総口コミ数"
            value={data.stats.totalReviews.toLocaleString()}
            change={0}
            changeLabel=""
            icon={<MessageSquare className="h-4 w-4" />}
          />
          <KpiCard
            title="平均評価"
            value={data.stats.overallAvgRating ? `★${data.stats.overallAvgRating}` : "—"}
            change={0}
            changeLabel=""
            icon={<Star className="h-4 w-4" />}
          />
          <KpiCard
            title="担当店舗"
            value={data.stats.totalLocations.toString()}
            change={0}
            changeLabel=""
            icon={<MapPin className="h-4 w-4" />}
          />
          <KpiCard
            title="未返信口コミ"
            value={data.stats.pendingReviewReplies.toString()}
            change={data.stats.pendingReviewReplies > 0 ? -1 : 0}
            changeLabel={data.stats.pendingReviewReplies > 0 ? "要対応" : "なし"}
            icon={<Globe className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Two-column: Tasks + Reviews */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Task Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">施策実施状況</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span>完了 {data.taskSummary.completed}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span>進行中 {data.taskSummary.inProgress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <span>未着手 {data.taskSummary.pending}</span>
              </div>
            </div>

            {data.taskSummary.total > 0 && (
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-4">
                <div className="h-full flex">
                  <div
                    className="bg-green-500"
                    style={{ width: `${(data.taskSummary.completed / data.taskSummary.total) * 100}%` }}
                  />
                  <div
                    className="bg-blue-500"
                    style={{ width: `${(data.taskSummary.inProgress / data.taskSummary.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {data.todayTasks.length > 0 ? (
              <div className="space-y-3">
                {data.todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusBadge status={task.status} />
                      <span className="text-sm truncate">{task.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {task.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                対応待ちのタスクはありません
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">最新の口コミ</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/client/reviews">全て表示</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentReviews.length > 0 ? (
              <div className="space-y-3">
                {data.recentReviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "h-3 w-3",
                              s <= review.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-200"
                            )}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{review.author}</span>
                      </div>
                      {review.reply_status === "pending" && (
                        <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
                          未返信
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.body || "（コメントなし）"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {review.locationName} · {new Date(review.reviewed_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                口コミはまだありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {data.pendingApprovals.length > 0 && (
        <div>
          <SectionHeader
            title="承認待ち一覧"
            description="管理側から提出された施策の承認をお願いします"
            className="mb-4"
          />
          <div className="grid gap-4">
            {data.pendingApprovals.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{item.taskTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.locationName} · {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline">差戻し</Button>
                      <Button size="sm">承認</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
