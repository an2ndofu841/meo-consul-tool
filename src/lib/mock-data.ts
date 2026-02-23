// ============================================================
// Mock data for development / demo dashboards
// ============================================================

// ---- KPI Data ----
export const kpiData = {
  views: { value: "12,450", change: 8.3, label: "前月比" },
  directions: { value: "3,210", change: 12.5, label: "前月比" },
  calls: { value: "487", change: -2.1, label: "前月比" },
  website: { value: "1,892", change: 15.7, label: "前月比" },
  routes: { value: "2,134", change: 5.2, label: "前月比" },
};

// ---- KW Rank Trend (past 7 days) ----
export const kwRankTrend = [
  { label: "2/8", "渋谷 歯医者": 3, "渋谷 インプラント": 5, "渋谷 矯正": 8, "渋谷 ホワイトニング": 2, "渋谷駅 歯科": 4 },
  { label: "2/9", "渋谷 歯医者": 3, "渋谷 インプラント": 4, "渋谷 矯正": 7, "渋谷 ホワイトニング": 2, "渋谷駅 歯科": 4 },
  { label: "2/10", "渋谷 歯医者": 2, "渋谷 インプラント": 4, "渋谷 矯正": 7, "渋谷 ホワイトニング": 3, "渋谷駅 歯科": 3 },
  { label: "2/11", "渋谷 歯医者": 2, "渋谷 インプラント": 3, "渋谷 矯正": 6, "渋谷 ホワイトニング": 2, "渋谷駅 歯科": 3 },
  { label: "2/12", "渋谷 歯医者": 1, "渋谷 インプラント": 3, "渋谷 矯正": 6, "渋谷 ホワイトニング": 2, "渋谷駅 歯科": 3 },
  { label: "2/13", "渋谷 歯医者": 1, "渋谷 インプラント": 2, "渋谷 矯正": 5, "渋谷 ホワイトニング": 1, "渋谷駅 歯科": 2 },
  { label: "2/14", "渋谷 歯医者": 1, "渋谷 インプラント": 2, "渋谷 矯正": 5, "渋谷 ホワイトニング": 1, "渋谷駅 歯科": 2 },
];

export const kwSeries = [
  { key: "渋谷 歯医者", label: "渋谷 歯医者", color: "#2563eb" },
  { key: "渋谷 インプラント", label: "渋谷 インプラント", color: "#16a34a" },
  { key: "渋谷 矯正", label: "渋谷 矯正", color: "#dc2626" },
  { key: "渋谷 ホワイトニング", label: "渋谷 ホワイトニング", color: "#ea580c" },
  { key: "渋谷駅 歯科", label: "渋谷駅 歯科", color: "#7c3aed" },
];

// ---- KPI Trend (past 6 months) ----
export const kpiTrend = [
  { label: "9月", views: 8200, directions: 2100, calls: 380, website: 1200 },
  { label: "10月", views: 9100, directions: 2400, calls: 410, website: 1350 },
  { label: "11月", views: 9800, directions: 2600, calls: 430, website: 1500 },
  { label: "12月", views: 10500, directions: 2800, calls: 460, website: 1650 },
  { label: "1月", views: 11500, directions: 2900, calls: 497, website: 1640 },
  { label: "2月", views: 12450, directions: 3210, calls: 487, website: 1892 },
];

// ---- Task / Measures Status ----
export const taskSummary = {
  completed: 8,
  inProgress: 3,
  pending: 2,
  total: 13,
};

export const recentTasks = [
  {
    id: "t1",
    title: "GBP写真を10枚追加（院内・スタッフ）",
    status: "completed" as const,
    dueDate: "2/10",
    impact: "中",
  },
  {
    id: "t2",
    title: "週次投稿：ホワイトニングキャンペーン",
    status: "in_progress" as const,
    dueDate: "2/15",
    impact: "高",
  },
  {
    id: "t3",
    title: "口コミ返信（低評価3件）",
    status: "in_progress" as const,
    dueDate: "2/14",
    impact: "高",
  },
  {
    id: "t4",
    title: "営業時間の祝日対応更新",
    status: "pending_approval" as const,
    dueDate: "2/16",
    impact: "中",
  },
  {
    id: "t5",
    title: "Q&Aセクション整備（よくある質問5件）",
    status: "draft" as const,
    dueDate: "2/20",
    impact: "低",
  },
];

// ---- Recommended Actions ----
export const recommendedActions = [
  {
    id: "ra1",
    title: "口コミ返信率を90%以上に改善",
    reason: "現在の返信率72%。競合A（95%）との差が拡大中。",
    impact: "高",
  },
  {
    id: "ra2",
    title: "「矯正」関連投稿を週2回に増加",
    reason: "「渋谷 矯正」が5位停滞。投稿頻度アップで改善見込み。",
    impact: "中",
  },
  {
    id: "ra3",
    title: "施術事例の写真を追加（ビフォーアフター）",
    reason: "写真枚数で競合Bに20枚差。視覚的訴求力を強化。",
    impact: "中",
  },
];

// ---- Alerts ----
export const clientAlerts = [
  {
    type: "review_negative" as const,
    title: "低評価口コミが増加",
    description: "直近7日で★2以下が3件。前週比+2件。テーマ：待ち時間",
    timestamp: "2時間前",
  },
  {
    type: "rank_drop" as const,
    title: "「渋谷 歯医者」順位変動",
    description: "3位→1位に改善（過去7日）",
    timestamp: "本日",
  },
];

// ---- Pending Approvals (for client) ----
export const pendingApprovals = [
  {
    id: "a1",
    title: "ホワイトニングキャンペーン投稿",
    type: "投稿",
    submittedBy: "田中 太郎",
    submittedAt: "2/12",
    impact: "高",
    description: "2月後半のホワイトニングキャンペーンに関する投稿。割引情報とビフォーアフター写真を含む。",
  },
  {
    id: "a2",
    title: "営業時間の祝日対応",
    type: "GBP更新",
    submittedBy: "田中 太郎",
    submittedAt: "2/13",
    impact: "中",
    description: "2/23(祝)の営業時間変更。通常10:00-19:00→10:00-17:00に短縮。",
  },
  {
    id: "a3",
    title: "口コミ返信文（★2評価への返信）",
    type: "口コミ返信",
    submittedBy: "佐藤 花子",
    submittedAt: "2/14",
    impact: "高",
    description: "待ち時間に関する低評価への丁寧な返信文案。改善対応済みであることを伝達。",
  },
];

// ---- Admin: Managed Locations ----
export const managedLocations = [
  {
    id: "l1",
    name: "渋谷デンタルクリニック",
    client: "株式会社メディカルA",
    avgRank: 2.1,
    rankChange: -0.8,
    reviewScore: 4.2,
    reviewCount: 156,
    pendingTasks: 3,
    status: "good" as const,
  },
  {
    id: "l2",
    name: "新宿ビューティーサロン",
    client: "BeautyGroup株式会社",
    avgRank: 4.5,
    rankChange: 1.2,
    reviewScore: 3.8,
    reviewCount: 89,
    pendingTasks: 5,
    status: "warning" as const,
  },
  {
    id: "l3",
    name: "池袋イタリアンレストラン",
    client: "フードカンパニー株式会社",
    avgRank: 6.3,
    rankChange: 2.1,
    reviewScore: 4.5,
    reviewCount: 234,
    pendingTasks: 1,
    status: "critical" as const,
  },
  {
    id: "l4",
    name: "品川フィットネスジム",
    client: "ヘルスケア株式会社",
    avgRank: 3.2,
    rankChange: -0.3,
    reviewScore: 4.0,
    reviewCount: 67,
    pendingTasks: 2,
    status: "good" as const,
  },
  {
    id: "l5",
    name: "横浜ペットクリニック",
    client: "アニマルケア株式会社",
    avgRank: 1.8,
    rankChange: -0.5,
    reviewScore: 4.7,
    reviewCount: 312,
    pendingTasks: 0,
    status: "good" as const,
  },
];

// ---- Admin: Anomaly Alerts ----
export const adminAlerts = [
  {
    type: "rank_drop" as const,
    title: "池袋イタリアン：主要KW急落",
    description: "「池袋 イタリアン」が3位→8位に急落。競合の投稿頻度増加が原因の可能性。",
    timestamp: "30分前",
    locationId: "l3",
  },
  {
    type: "review_negative" as const,
    title: "新宿ビューティー：低評価急増",
    description: "直近3日で★1が4件。「予約」「接客」に関する不満が集中。",
    timestamp: "1時間前",
    locationId: "l2",
  },
  {
    type: "competitor_change" as const,
    title: "競合更新検知：渋谷デンタル",
    description: "競合「渋谷駅前歯科」がカテゴリを変更。写真を15枚追加。",
    timestamp: "3時間前",
    locationId: "l1",
  },
  {
    type: "dangerous_edit" as const,
    title: "NAP差分検知：品川フィットネス",
    description: "Googleマップ上の電話番号がGBP登録と不一致。確認が必要。",
    timestamp: "5時間前",
    locationId: "l4",
  },
];

// ---- Admin: Today's Tasks ----
export const todaysTasks = [
  {
    id: "at1",
    title: "口コミ返信（低評価3件）- 渋谷デンタル",
    location: "渋谷デンタルクリニック",
    impact: "高",
    dueDate: "今日",
    status: "in_progress" as const,
  },
  {
    id: "at2",
    title: "週次投稿作成 - 新宿ビューティー",
    location: "新宿ビューティーサロン",
    impact: "高",
    dueDate: "今日",
    status: "draft" as const,
  },
  {
    id: "at3",
    title: "競合分析レポート - 池袋イタリアン",
    location: "池袋イタリアンレストラン",
    impact: "高",
    dueDate: "今日",
    status: "draft" as const,
  },
  {
    id: "at4",
    title: "月次レポート生成 - 品川フィットネス",
    location: "品川フィットネスジム",
    impact: "中",
    dueDate: "今日",
    status: "draft" as const,
  },
  {
    id: "at5",
    title: "GBP写真アップロード - 横浜ペット",
    location: "横浜ペットクリニック",
    impact: "低",
    dueDate: "今日",
    status: "in_progress" as const,
  },
];

// ---- Notifications ----
export const mockNotifications = [
  {
    id: "n1",
    type: "rank_drop" as const,
    title: "順位急落アラート",
    message: "池袋イタリアン「池袋 イタリアン」が3位→8位",
    link: "/admin/rankings",
    isRead: false,
    createdAt: "10分前",
  },
  {
    id: "n2",
    type: "review_negative" as const,
    title: "低評価口コミ",
    message: "新宿ビューティーに★1の口コミが投稿されました",
    link: "/admin/reviews",
    isRead: false,
    createdAt: "30分前",
  },
  {
    id: "n3",
    type: "approval_required" as const,
    title: "承認リクエスト",
    message: "ホワイトニング投稿の承認待ち",
    link: "/admin/tasks",
    isRead: false,
    createdAt: "1時間前",
  },
  {
    id: "n4",
    type: "competitor_change" as const,
    title: "競合変更検知",
    message: "渋谷駅前歯科がカテゴリを変更しました",
    link: "/admin/competitors",
    isRead: true,
    createdAt: "3時間前",
  },
  {
    id: "n5",
    type: "task_assigned" as const,
    title: "タスク割当",
    message: "品川フィットネスの月次レポート作成が割り当てられました",
    link: "/admin/tasks",
    isRead: true,
    createdAt: "昨日",
  },
];

// ---- Review Summary ----
export const reviewSummary = {
  totalCount: 156,
  averageRating: 4.2,
  thisMonthCount: 12,
  thisMonthAvg: 3.8,
  themes: [
    { theme: "接客", positive: 45, negative: 8 },
    { theme: "待ち時間", positive: 12, negative: 18 },
    { theme: "清潔感", positive: 38, negative: 3 },
    { theme: "価格", positive: 22, negative: 11 },
    { theme: "品質", positive: 52, negative: 5 },
  ],
};
