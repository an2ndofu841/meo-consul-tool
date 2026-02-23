"use client";

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
  managedLocations,
  adminAlerts,
  todaysTasks,
} from "@/lib/mock-data";
import {
  TrendingDown,
  TrendingUp,
  Star,
  ExternalLink,
  ListChecks,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
  const criticalCount = managedLocations.filter((l) => l.status === "critical").length;
  const warningCount = managedLocations.filter((l) => l.status === "warning").length;
  const totalTasks = todaysTasks.length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">管理ダッシュボード</h1>
        <p className="text-muted-foreground mt-1">2026年2月14日（土）</p>
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
                <p className="text-2xl font-bold">{managedLocations.length}</p>
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
                <p className="text-xs text-muted-foreground">要対応アラート</p>
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
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-xs text-muted-foreground">本日のタスク</p>
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
                <p className="text-2xl font-bold">4.2</p>
                <p className="text-xs text-muted-foreground">平均口コミ評価</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Alerts */}
      <div>
        <SectionHeader
          title="異常検知アラート"
          description="直近24時間の重要な変更・異常"
          className="mb-4"
        />
        <div className="grid md:grid-cols-2 gap-3">
          {adminAlerts.map((alert, idx) => (
            <AlertCard key={idx} {...alert} />
          ))}
        </div>
      </div>

      {/* Two-column: Location list + Today's tasks */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Managed Locations Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                担当案件一覧
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/rankings">全て表示</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                {managedLocations.map((loc) => (
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
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium">{loc.avgRank.toFixed(1)}</span>
                        {loc.rankChange < 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                        )}
                        <span
                          className={cn(
                            "text-xs",
                            loc.rankChange < 0 ? "text-green-600" : "text-red-600"
                          )}
                        >
                          {loc.rankChange > 0 ? "+" : ""}
                          {loc.rankChange.toFixed(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span>{loc.reviewScore}</span>
                        <span className="text-xs text-muted-foreground">({loc.reviewCount})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={loc.pendingTasks > 0 ? "default" : "secondary"}>
                        {loc.pendingTasks}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              本日のタスク
            </CardTitle>
            <p className="text-xs text-muted-foreground">Impact順</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <Badge
                      variant="outline"
                      className={
                        task.impact === "高"
                          ? "border-red-200 text-red-700 bg-red-50"
                          : task.impact === "中"
                          ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                          : "border-gray-200 text-gray-700 bg-gray-50"
                      }
                    >
                      {task.impact}
                    </Badge>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {task.location}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
