"use client";

import { Eye, MapPin, Phone, Globe, Navigation } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MultiLineChart } from "@/components/dashboard/multi-line-chart";
import { AlertCard } from "@/components/shared/alert-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  kpiData,
  kwRankTrend,
  kwSeries,
  taskSummary,
  recentTasks,
  recommendedActions,
  clientAlerts,
  pendingApprovals,
} from "@/lib/mock-data";

export default function ClientDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground mt-1">
          渋谷デンタルクリニック - 2026年2月
        </p>
      </div>

      {/* Monthly Highlight */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">今月のハイライト</h3>
          <p className="text-blue-100 leading-relaxed">
            主要KW「渋谷 歯医者」が<span className="font-bold text-white">1位を獲得</span>しました。
            表示回数は前月比+8.3%で順調に成長中。
            口コミでは「待ち時間」に関する低評価が増加傾向のため、対策施策を提案しています。
          </p>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div>
        <SectionHeader title="主要KPI" className="mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard
            title="表示回数"
            value={kpiData.views.value}
            change={kpiData.views.change}
            changeLabel={kpiData.views.label}
            icon={<Eye className="h-4 w-4" />}
          />
          <KpiCard
            title="経路検索"
            value={kpiData.directions.value}
            change={kpiData.directions.change}
            changeLabel={kpiData.directions.label}
            icon={<MapPin className="h-4 w-4" />}
          />
          <KpiCard
            title="通話数"
            value={kpiData.calls.value}
            change={kpiData.calls.change}
            changeLabel={kpiData.calls.label}
            icon={<Phone className="h-4 w-4" />}
          />
          <KpiCard
            title="ウェブサイト"
            value={kpiData.website.value}
            change={kpiData.website.change}
            changeLabel={kpiData.website.label}
            icon={<Globe className="h-4 w-4" />}
          />
          <KpiCard
            title="ルート"
            value={kpiData.routes.value}
            change={kpiData.routes.change}
            changeLabel={kpiData.routes.label}
            icon={<Navigation className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* KW Rank Trend Chart */}
      <MultiLineChart
        title="主要キーワード順位推移（過去7日）"
        data={kwRankTrend}
        series={kwSeries}
        invertY={true}
        height={280}
      />

      {/* Two-column: Tasks + Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Task Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">施策実施状況</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Summary bar */}
            <div className="flex gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span>完了 {taskSummary.completed}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span>進行中 {taskSummary.inProgress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <span>未着手 {taskSummary.pending}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-4">
              <div className="h-full flex">
                <div
                  className="bg-green-500"
                  style={{ width: `${(taskSummary.completed / taskSummary.total) * 100}%` }}
                />
                <div
                  className="bg-blue-500"
                  style={{ width: `${(taskSummary.inProgress / taskSummary.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-3">
              {recentTasks.map((task) => (
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
          </CardContent>
        </Card>

        {/* Alerts + Recommended Actions */}
        <div className="space-y-6">
          {/* Alerts */}
          <div>
            <SectionHeader title="アラート" className="mb-3" />
            <div className="space-y-3">
              {clientAlerts.map((alert, idx) => (
                <AlertCard key={idx} {...alert} />
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                次月の推奨アクション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedActions.map((action) => (
                  <div key={action.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={
                          action.impact === "高"
                            ? "border-red-200 text-red-700 bg-red-50"
                            : "border-blue-200 text-blue-700 bg-blue-50"
                        }
                      >
                        Impact: {action.impact}
                      </Badge>
                      <span className="text-sm font-medium">{action.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{action.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Approvals */}
      <div>
        <SectionHeader
          title="承認待ち一覧"
          description="管理側から提出された施策・投稿の承認をお願いします"
          className="mb-4"
        />
        <div className="grid gap-4">
          {pendingApprovals.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.type}</Badge>
                      <Badge
                        variant="outline"
                        className={
                          item.impact === "高"
                            ? "border-red-200 text-red-700 bg-red-50"
                            : "border-blue-200 text-blue-700 bg-blue-50"
                        }
                      >
                        Impact: {item.impact}
                      </Badge>
                    </div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      提出者: {item.submittedBy} / {item.submittedAt}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline">
                      差戻し
                    </Button>
                    <Button size="sm">承認</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
