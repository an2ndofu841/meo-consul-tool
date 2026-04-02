"use client";

import { useEffect, useState } from "react";
import { AlertCard } from "@/components/shared/alert-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingDown,
  TrendingUp,
  Star,
  ExternalLink,
  ListChecks,
  AlertTriangle,
  Building2,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  date: string;
  locations: Array<{
    id: string;
    name: string;
    client: string;
    avgRank: number | null;
    rankChange: number;
    reviewScore: number;
    reviewCount: number;
    pendingTasks: number;
    recentNegativeReviews: number;
    status: "good" | "warning" | "critical";
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
  stats: {
    totalLocations: number;
    totalReviews: number;
    overallAvgRating: number;
    pendingReviewReplies: number;
  };
}

const statusColors = {
  good: "bg-green-500",
  warning: "bg-yellow-500",
  critical: "bg-red-500",
};

const statusLabels = {
  good: "良好",
  warning: "注意",
  critical: "要対応",
};

export default function AdminDashboardPage() {
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

  if (!data || data.locations === undefined) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        データの取得に失敗しました。ページを再読み込みしてください。
      </div>
    );
  }

  const criticalCount = data.locations.filter((l) => l.status === "critical").length;
  const warningCount = data.locations.filter((l) => l.status === "warning").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
        <p className="text-muted-foreground mt-1">{data.date}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.totalLocations}</p>
                <p className="text-xs text-muted-foreground">担当店舗</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalCount + warningCount}</p>
                <p className="text-xs text-muted-foreground">要対応</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <ListChecks className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.taskSummary.total}</p>
                <p className="text-xs text-muted-foreground">総タスク数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.overallAvgRating || "—"}</p>
                <p className="text-xs text-muted-foreground">平均口コミ評価</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews Alert */}
      {data.stats.pendingReviewReplies > 0 && (
        <div>
          <SectionHeader title="未返信口コミ" className="mb-4" />
          <div className="grid md:grid-cols-2 gap-3">
            {data.recentReviews
              .filter((r) => r.reply_status === "pending")
              .slice(0, 4)
              .map((review) => (
                <AlertCard
                  key={review.id}
                  type={review.rating <= 2 ? "review_negative" : "competitor_change"}
                  title={`${review.locationName} — ★${review.rating}`}
                  description={review.body || `${review.author}さんからの口コミ`}
                  timestamp={new Date(review.reviewed_at).toLocaleDateString("ja-JP")}
                />
              ))}
          </div>
        </div>
      )}

      {/* Location list + Today's tasks */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">担当案件一覧</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/rankings">全て表示</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.locations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                ロケーションが登録されていません。GBP連携ページでロケーションを追加してください。
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ステータス</TableHead>
                    <TableHead>店舗名</TableHead>
                    <TableHead className="hidden md:table-cell">クライアント</TableHead>
                    <TableHead className="text-right">平均順位</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">口コミ</TableHead>
                    <TableHead className="text-right">タスク</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2.5 w-2.5 rounded-full", statusColors[loc.status])} />
                          <span className="text-xs text-muted-foreground">
                            {statusLabels[loc.status]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{loc.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {loc.client}
                      </TableCell>
                      <TableCell className="text-right">
                        {loc.avgRank ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-medium">{loc.avgRank}</span>
                            {loc.rankChange > 0 ? (
                              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                            ) : loc.rankChange < 0 ? (
                              <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                            ) : null}
                            {loc.rankChange !== 0 && (
                              <span
                                className={cn(
                                  "text-xs",
                                  loc.rankChange > 0 ? "text-green-600" : "text-red-600"
                                )}
                              >
                                {loc.rankChange > 0 ? "+" : ""}{loc.rankChange}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        {loc.reviewCount > 0 ? (
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            <span>{loc.reviewScore}</span>
                            <span className="text-xs text-muted-foreground">({loc.reviewCount})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={loc.pendingTasks > 0 ? "default" : "secondary"}>
                          {loc.pendingTasks}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href="/admin/gbp">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Today's Tasks / Pending tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              対応が必要なタスク
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                現在対応が必要なタスクはありません
              </p>
            ) : (
              <div className="space-y-4">
                {data.todayTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <StatusBadge status={task.status} />
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{task.locationName}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      {data.recentReviews.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">最新の口コミ</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/reviews">全て表示</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="flex items-start gap-3 border rounded-lg p-3">
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-3.5 w-3.5",
                          s <= review.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{review.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {review.locationName}
                      </span>
                      {review.reply_status === "pending" && (
                        <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          未返信
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.body || "（コメントなし）"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
