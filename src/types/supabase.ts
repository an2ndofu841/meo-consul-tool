// Auto-generated types placeholder
// In production, generate with: npx supabase gen types typescript --linked > src/types/supabase.ts

export type UserRole = "agency_admin" | "operator" | "client_viewer" | "client_operator";

export type TaskStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "in_progress"
  | "completed"
  | "reviewing";

export type ReplyStatus = "pending" | "draft" | "approved" | "published";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type AssetStatus = "requested" | "uploaded" | "approved" | "rejected";

export type NotificationType =
  | "rank_drop"
  | "review_negative"
  | "competitor_change"
  | "dangerous_edit"
  | "approval_required"
  | "task_assigned"
  | "asset_requested";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          auth_uid: string;
          org_id: string;
          client_id: string | null;
          email: string;
          full_name: string;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_uid: string;
          org_id: string;
          client_id?: string | null;
          email: string;
          full_name: string;
          role: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          client_id?: string | null;
          email?: string;
          full_name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          org_id: string;
          company_name: string;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          company_name: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          company_name?: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          address: string;
          gbp_place_id: string | null;
          phone: string | null;
          category: string | null;
          attributes: Record<string, unknown> | null;
          business_hours: Record<string, unknown> | null;
          target_kpi: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          address: string;
          gbp_place_id?: string | null;
          phone?: string | null;
          category?: string | null;
          attributes?: Record<string, unknown> | null;
          business_hours?: Record<string, unknown> | null;
          target_kpi?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          address?: string;
          gbp_place_id?: string | null;
          phone?: string | null;
          category?: string | null;
          attributes?: Record<string, unknown> | null;
          business_hours?: Record<string, unknown> | null;
          target_kpi?: Record<string, unknown> | null;
          updated_at?: string;
        };
      };
      keywords: {
        Row: {
          id: string;
          location_id: string;
          keyword: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          keyword: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          keyword?: string;
          is_primary?: boolean;
        };
      };
      rank_observations: {
        Row: {
          id: string;
          location_id: string;
          keyword_id: string;
          observed_date: string;
          grid_point: string | null;
          rank: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          keyword_id: string;
          observed_date: string;
          grid_point?: string | null;
          rank: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          keyword_id?: string;
          observed_date?: string;
          grid_point?: string | null;
          rank?: number;
        };
      };
      competitors: {
        Row: {
          id: string;
          location_id: string;
          name: string;
          gbp_place_id: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          name: string;
          gbp_place_id?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          name?: string;
          gbp_place_id?: string | null;
          category?: string | null;
        };
      };
      competitor_observations: {
        Row: {
          id: string;
          competitor_id: string;
          observed_date: string;
          field_name: string;
          old_value: string | null;
          new_value: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          competitor_id: string;
          observed_date: string;
          field_name: string;
          old_value?: string | null;
          new_value?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          competitor_id?: string;
          observed_date?: string;
          field_name?: string;
          old_value?: string | null;
          new_value?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          location_id: string;
          google_review_id: string | null;
          author: string;
          rating: number;
          body: string | null;
          theme: string | null;
          reply_status: ReplyStatus;
          reviewed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          google_review_id?: string | null;
          author: string;
          rating: number;
          body?: string | null;
          theme?: string | null;
          reply_status?: ReplyStatus;
          reviewed_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          google_review_id?: string | null;
          author?: string;
          rating?: number;
          body?: string | null;
          theme?: string | null;
          reply_status?: ReplyStatus;
          reviewed_at?: string;
        };
      };
      review_reply_drafts: {
        Row: {
          id: string;
          review_id: string;
          author_id: string;
          body: string;
          status: ApprovalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          author_id: string;
          body: string;
          status?: ApprovalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          author_id?: string;
          body?: string;
          status?: ApprovalStatus;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          location_id: string;
          assignee_id: string | null;
          created_by_id: string;
          template_id: string | null;
          title: string;
          description: string | null;
          purpose: string | null;
          expected_impact: string | null;
          status: TaskStatus;
          due_date: string | null;
          requires_approval: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          assignee_id?: string | null;
          created_by_id: string;
          template_id?: string | null;
          title: string;
          description?: string | null;
          purpose?: string | null;
          expected_impact?: string | null;
          status?: TaskStatus;
          due_date?: string | null;
          requires_approval?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          assignee_id?: string | null;
          template_id?: string | null;
          title?: string;
          description?: string | null;
          purpose?: string | null;
          expected_impact?: string | null;
          status?: TaskStatus;
          due_date?: string | null;
          requires_approval?: boolean;
          updated_at?: string;
        };
      };
      task_templates: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          industry: string | null;
          description: string | null;
          default_purpose: string | null;
          default_impact: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          industry?: string | null;
          description?: string | null;
          default_purpose?: string | null;
          default_impact?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          industry?: string | null;
          description?: string | null;
          default_purpose?: string | null;
          default_impact?: string | null;
        };
      };
      approvals: {
        Row: {
          id: string;
          task_id: string;
          reviewer_id: string | null;
          status: ApprovalStatus;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          reviewer_id?: string | null;
          status?: ApprovalStatus;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          reviewer_id?: string | null;
          status?: ApprovalStatus;
          comment?: string | null;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          location_id: string;
          generated_by_id: string;
          report_month: string;
          summary: string | null;
          pdf_url: string | null;
          share_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          generated_by_id: string;
          report_month: string;
          summary?: string | null;
          pdf_url?: string | null;
          share_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          generated_by_id?: string;
          report_month?: string;
          summary?: string | null;
          pdf_url?: string | null;
          share_url?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          location_id: string | null;
          user_id: string;
          action: string;
          target_type: string;
          target_id: string;
          old_value: Record<string, unknown> | null;
          new_value: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id?: string | null;
          user_id: string;
          action: string;
          target_type: string;
          target_id: string;
          old_value?: Record<string, unknown> | null;
          new_value?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string | null;
          user_id?: string;
          action?: string;
          target_type?: string;
          target_id?: string;
          old_value?: Record<string, unknown> | null;
          new_value?: Record<string, unknown> | null;
        };
      };
      assets: {
        Row: {
          id: string;
          location_id: string;
          requested_by_id: string;
          uploaded_by_id: string | null;
          title: string;
          description: string | null;
          file_url: string | null;
          status: AssetStatus;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          requested_by_id: string;
          uploaded_by_id?: string | null;
          title: string;
          description?: string | null;
          file_url?: string | null;
          status?: AssetStatus;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          requested_by_id?: string;
          uploaded_by_id?: string | null;
          title?: string;
          description?: string | null;
          file_url?: string | null;
          status?: AssetStatus;
          comment?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          message?: string;
          link?: string | null;
          is_read?: boolean;
        };
      };
      user_locations: {
        Row: {
          id: string;
          user_id: string;
          location_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          location_id?: string;
        };
      };
    };
    Enums: {
      user_role: UserRole;
      task_status: TaskStatus;
      reply_status: ReplyStatus;
      approval_status: ApprovalStatus;
      asset_status: AssetStatus;
      notification_type: NotificationType;
    };
  };
}
