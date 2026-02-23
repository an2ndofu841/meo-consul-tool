import type { UserRole } from "@/types/supabase";

// ---- Roles ----
export const ROLES = {
  AGENCY_ADMIN: "agency_admin" as const,
  OPERATOR: "operator" as const,
  CLIENT_VIEWER: "client_viewer" as const,
  CLIENT_OPERATOR: "client_operator" as const,
};

export const ADMIN_ROLES: UserRole[] = [ROLES.AGENCY_ADMIN, ROLES.OPERATOR];
export const CLIENT_ROLES: UserRole[] = [ROLES.CLIENT_VIEWER, ROLES.CLIENT_OPERATOR];

export const ROLE_LABELS: Record<UserRole, string> = {
  agency_admin: "管理者",
  operator: "運用担当",
  client_viewer: "クライアント（閲覧）",
  client_operator: "クライアント（運用）",
};

// ---- Task Status ----
export const TASK_STATUS_LABELS: Record<string, string> = {
  draft: "下書き",
  pending_approval: "承認待ち",
  approved: "承認済み",
  in_progress: "実行中",
  completed: "完了",
  reviewing: "効果検証",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending_approval: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  reviewing: "bg-purple-100 text-purple-800",
};

// ---- Notification Types ----
export const NOTIFICATION_LABELS: Record<string, string> = {
  rank_drop: "順位急落",
  review_negative: "低評価口コミ",
  competitor_change: "競合変更検知",
  dangerous_edit: "危険な変更",
  approval_required: "承認リクエスト",
  task_assigned: "タスク割当",
  asset_requested: "素材依頼",
};

// ---- Navigation ----
export const ADMIN_NAV_ITEMS = [
  { label: "ダッシュボード", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "順位計測", href: "/admin/rankings", icon: "TrendingUp" },
  { label: "要因分解", href: "/admin/analysis", icon: "SearchCheck" },
  { label: "競合監視", href: "/admin/competitors", icon: "Eye" },
  { label: "施策ボード", href: "/admin/tasks", icon: "KanbanSquare" },
  { label: "口コミ運用", href: "/admin/reviews", icon: "MessageSquare" },
  { label: "GBP管理", href: "/admin/gbp", icon: "Store" },
  { label: "レポート", href: "/admin/reports", icon: "FileText" },
  { label: "監査ログ", href: "/admin/audit-log", icon: "Shield" },
  { label: "設定", href: "/admin/settings", icon: "Settings" },
] as const;

export const CLIENT_NAV_ITEMS = [
  { label: "ダッシュボード", href: "/client/dashboard", icon: "LayoutDashboard" },
  { label: "月次レポート", href: "/client/reports", icon: "FileText" },
  { label: "承認センター", href: "/client/approvals", icon: "CheckCircle" },
  { label: "素材提出", href: "/client/assets", icon: "Upload" },
  { label: "口コミ", href: "/client/reviews", icon: "MessageSquare" },
] as const;

// ---- Review Themes ----
export const REVIEW_THEMES = [
  "接客",
  "待ち時間",
  "清潔感",
  "価格",
  "品質",
  "アクセス",
  "雰囲気",
  "その他",
] as const;

// ---- GBP Danger Fields ----
export const GBP_DANGER_FIELDS = [
  "category",
  "name",
  "address",
  "phone",
  "primary_attributes",
] as const;

export const GBP_SAFE_FIELDS = [
  "description",
  "photos",
  "posts",
  "qa",
  "menu",
] as const;
