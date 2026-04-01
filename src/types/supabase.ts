export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      approvals: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          reviewer_id: string | null
          status: Database["public"]["Enums"]["approval_status"]
          task_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          task_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          comment: string | null
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          location_id: string
          requested_by_id: string
          status: Database["public"]["Enums"]["asset_status"]
          title: string
          updated_at: string
          uploaded_by_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          location_id: string
          requested_by_id: string
          status?: Database["public"]["Enums"]["asset_status"]
          title: string
          updated_at?: string
          uploaded_by_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          location_id?: string
          requested_by_id?: string
          status?: Database["public"]["Enums"]["asset_status"]
          title?: string
          updated_at?: string
          uploaded_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_requested_by_id_fkey"
            columns: ["requested_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_uploaded_by_id_fkey"
            columns: ["uploaded_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          location_id: string | null
          new_value: Json | null
          old_value: Json | null
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          location_id?: string | null
          new_value?: Json | null
          old_value?: Json | null
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          location_id?: string | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          org_id: string
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          org_id: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_observations: {
        Row: {
          competitor_id: string
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          observed_date: string
          old_value: string | null
        }
        Insert: {
          competitor_id: string
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          observed_date: string
          old_value?: string | null
        }
        Update: {
          competitor_id?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          observed_date?: string
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_observations_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          category: string | null
          created_at: string
          gbp_place_id: string | null
          id: string
          location_id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          gbp_place_id?: string | null
          id?: string
          location_id: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          gbp_place_id?: string | null
          id?: string
          location_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitors_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      google_tokens: {
        Row: {
          access_token: string
          created_at: string
          google_email: string
          id: string
          org_id: string
          refresh_token: string
          scopes: string[]
          token_expiry: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          google_email: string
          id?: string
          org_id: string
          refresh_token: string
          scopes?: string[]
          token_expiry: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          google_email?: string
          id?: string
          org_id?: string
          refresh_token?: string
          scopes?: string[]
          token_expiry?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_tokens_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          keyword: string
          location_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          keyword: string
          location_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          keyword?: string
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keywords_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          attributes: Json | null
          business_hours: Json | null
          category: string | null
          client_id: string
          created_at: string
          gbp_account_id: string | null
          gbp_location_name: string | null
          gbp_place_id: string | null
          id: string
          name: string
          phone: string | null
          target_kpi: Json | null
          updated_at: string
        }
        Insert: {
          address: string
          attributes?: Json | null
          business_hours?: Json | null
          category?: string | null
          client_id: string
          created_at?: string
          gbp_account_id?: string | null
          gbp_location_name?: string | null
          gbp_place_id?: string | null
          id?: string
          name: string
          phone?: string | null
          target_kpi?: Json | null
          updated_at?: string
        }
        Update: {
          address?: string
          attributes?: Json | null
          business_hours?: Json | null
          category?: string | null
          client_id?: string
          created_at?: string
          gbp_account_id?: string | null
          gbp_location_name?: string | null
          gbp_place_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          target_kpi?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      rank_observations: {
        Row: {
          created_at: string
          grid_point: string | null
          id: string
          keyword_id: string
          location_id: string
          observed_date: string
          rank: number
        }
        Insert: {
          created_at?: string
          grid_point?: string | null
          id?: string
          keyword_id: string
          location_id: string
          observed_date: string
          rank: number
        }
        Update: {
          created_at?: string
          grid_point?: string | null
          id?: string
          keyword_id?: string
          location_id?: string
          observed_date?: string
          rank?: number
        }
        Relationships: [
          {
            foreignKeyName: "rank_observations_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_observations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          generated_by_id: string
          id: string
          location_id: string
          pdf_url: string | null
          report_month: string
          share_url: string | null
          summary: string | null
        }
        Insert: {
          created_at?: string
          generated_by_id: string
          id?: string
          location_id: string
          pdf_url?: string | null
          report_month: string
          share_url?: string | null
          summary?: string | null
        }
        Update: {
          created_at?: string
          generated_by_id?: string
          id?: string
          location_id?: string
          pdf_url?: string | null
          report_month?: string
          share_url?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_id_fkey"
            columns: ["generated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reply_drafts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          review_id: string
          status: Database["public"]["Enums"]["approval_status"]
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          review_id: string
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          review_id?: string
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reply_drafts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reply_drafts_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author: string
          body: string | null
          created_at: string
          google_review_id: string | null
          id: string
          location_id: string
          rating: number
          reply_status: Database["public"]["Enums"]["reply_status"]
          reviewed_at: string
          theme: string | null
        }
        Insert: {
          author: string
          body?: string | null
          created_at?: string
          google_review_id?: string | null
          id?: string
          location_id: string
          rating: number
          reply_status?: Database["public"]["Enums"]["reply_status"]
          reviewed_at: string
          theme?: string | null
        }
        Update: {
          author?: string
          body?: string | null
          created_at?: string
          google_review_id?: string | null
          id?: string
          location_id?: string
          rating?: number
          reply_status?: Database["public"]["Enums"]["reply_status"]
          reviewed_at?: string
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string
          default_impact: string | null
          default_purpose: string | null
          description: string | null
          id: string
          industry: string | null
          name: string
          org_id: string
        }
        Insert: {
          created_at?: string
          default_impact?: string | null
          default_purpose?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          name: string
          org_id: string
        }
        Update: {
          created_at?: string
          default_impact?: string | null
          default_purpose?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by_id: string
          description: string | null
          due_date: string | null
          expected_impact: string | null
          id: string
          location_id: string
          purpose: string | null
          requires_approval: boolean
          status: Database["public"]["Enums"]["task_status"]
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by_id: string
          description?: string | null
          due_date?: string | null
          expected_impact?: string | null
          id?: string
          location_id: string
          purpose?: string | null
          requires_approval?: boolean
          status?: Database["public"]["Enums"]["task_status"]
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by_id?: string
          description?: string | null
          due_date?: string | null
          expected_impact?: string | null
          id?: string
          location_id?: string
          purpose?: string | null
          requires_approval?: boolean
          status?: Database["public"]["Enums"]["task_status"]
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          created_at: string
          id: string
          location_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_uid: string
          avatar_url: string | null
          client_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          auth_uid: string
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          auth_uid?: string
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_app_user: {
        Args: never
        Returns: {
          auth_uid: string
          avatar_url: string | null
          client_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "users"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin_role: { Args: never; Returns: boolean }
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      asset_status: "requested" | "uploaded" | "approved" | "rejected"
      notification_type:
        | "rank_drop"
        | "review_negative"
        | "competitor_change"
        | "dangerous_edit"
        | "approval_required"
        | "task_assigned"
        | "asset_requested"
      reply_status: "pending" | "draft" | "approved" | "published"
      task_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "in_progress"
        | "completed"
        | "reviewing"
      user_role:
        | "agency_admin"
        | "operator"
        | "client_viewer"
        | "client_operator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      approval_status: ["pending", "approved", "rejected"],
      asset_status: ["requested", "uploaded", "approved", "rejected"],
      notification_type: [
        "rank_drop",
        "review_negative",
        "competitor_change",
        "dangerous_edit",
        "approval_required",
        "task_assigned",
        "asset_requested",
      ],
      reply_status: ["pending", "draft", "approved", "published"],
      task_status: [
        "draft",
        "pending_approval",
        "approved",
        "in_progress",
        "completed",
        "reviewing",
      ],
      user_role: [
        "agency_admin",
        "operator",
        "client_viewer",
        "client_operator",
      ],
    },
  },
} as const

export type UserRole = Database["public"]["Enums"]["user_role"]
export type TaskStatus = Database["public"]["Enums"]["task_status"]
export type ReplyStatus = Database["public"]["Enums"]["reply_status"]
export type ApprovalStatus = Database["public"]["Enums"]["approval_status"]
export type AssetStatus = Database["public"]["Enums"]["asset_status"]
export type NotificationType = Database["public"]["Enums"]["notification_type"]
