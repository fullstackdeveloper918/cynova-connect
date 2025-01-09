export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      cynova_updates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_published: boolean | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exports: {
        Row: {
          created_at: string | null
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          project_id: string | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          status: string | null
          thumbnail_url: string | null
          title: string
          type: Database["public"]["Enums"]["project_type"]
          updated_at: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          type: Database["public"]["Enums"]["project_type"]
          updated_at?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          id: string
          options: Json | null
          project_id: string
          question: string
          question_type: Database["public"]["Enums"]["quiz_question_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          id?: string
          options?: Json | null
          project_id: string
          question: string
          question_type: Database["public"]["Enums"]["quiz_question_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          id?: string
          options?: Json | null
          project_id?: string
          question?: string
          question_type?: Database["public"]["Enums"]["quiz_question_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_status: string | null
          plan_limits: Json | null
          plan_name: string
          redirect_status: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_status?: string | null
          plan_limits?: Json | null
          plan_name: string
          redirect_status?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_status?: string | null
          plan_limits?: Json | null
          plan_name?: string
          redirect_status?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          details: Json | null
          id: string
          metric_type: Database["public"]["Enums"]["system_metric_type"]
          recorded_at: string | null
          value: number
        }
        Insert: {
          details?: Json | null
          id?: string
          metric_type: Database["public"]["Enums"]["system_metric_type"]
          recorded_at?: string | null
          value: number
        }
        Update: {
          details?: Json | null
          id?: string
          metric_type?: Database["public"]["Enums"]["system_metric_type"]
          recorded_at?: string | null
          value?: number
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      temp_videos: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          duration: number | null
          expires_at: string | null
          file_size: number | null
          file_url: string | null
          id: string
          original_filename: string
          status: Database["public"]["Enums"]["video_processing_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          duration?: number | null
          expires_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          original_filename: string
          status?: Database["public"]["Enums"]["video_processing_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          duration?: number | null
          expires_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          original_filename?: string
          status?: Database["public"]["Enums"]["video_processing_status"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits_balance: number
          id: string
          last_reset_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_balance?: number
          id?: string
          last_reset_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_balance?: number
          id?: string
          last_reset_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          ai_images_created: number | null
          created_at: string | null
          export_minutes_used: number | null
          id: string
          month_start: string | null
          storage_used: number | null
          updated_at: string | null
          user_id: string
          videos_created: number | null
          voiceover_minutes_used: number | null
        }
        Insert: {
          ai_images_created?: number | null
          created_at?: string | null
          export_minutes_used?: number | null
          id?: string
          month_start?: string | null
          storage_used?: number | null
          updated_at?: string | null
          user_id: string
          videos_created?: number | null
          voiceover_minutes_used?: number | null
        }
        Update: {
          ai_images_created?: number | null
          created_at?: string | null
          export_minutes_used?: number | null
          id?: string
          month_start?: string | null
          storage_used?: number | null
          updated_at?: string | null
          user_id?: string
          videos_created?: number | null
          voiceover_minutes_used?: number | null
        }
        Relationships: []
      }
      video_segments: {
        Row: {
          combined_url: string | null
          created_at: string | null
          end_time: number
          file_size: number | null
          file_url: string | null
          gameplay_url: string | null
          id: string
          is_combined: boolean | null
          name: string
          start_time: number
          status: Database["public"]["Enums"]["segment_status"] | null
          temp_video_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          combined_url?: string | null
          created_at?: string | null
          end_time: number
          file_size?: number | null
          file_url?: string | null
          gameplay_url?: string | null
          id?: string
          is_combined?: boolean | null
          name: string
          start_time: number
          status?: Database["public"]["Enums"]["segment_status"] | null
          temp_video_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          combined_url?: string | null
          created_at?: string | null
          end_time?: number
          file_size?: number | null
          file_url?: string | null
          gameplay_url?: string | null
          id?: string
          is_combined?: boolean | null
          name?: string
          start_time?: number
          status?: Database["public"]["Enums"]["segment_status"] | null
          temp_video_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_segments_temp_video_id_fkey"
            columns: ["temp_video_id"]
            isOneToOne: false
            referencedRelation: "temp_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      would_you_rather_questions: {
        Row: {
          created_at: string | null
          id: string
          option_a: string
          option_b: string
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_a: string
          option_b: string
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_a?: string
          option_b?: string
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "would_you_rather_questions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_total_storage: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_videos: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_admin_action: {
        Args: {
          action: string
          entity_type: string
          entity_id: string
          details: Json
        }
        Returns: undefined
      }
      record_system_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_monthly_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      project_type:
        | "chatgpt_video"
        | "fake_text"
        | "reddit_video"
        | "split_video"
        | "voiceover_video"
        | "would_you_rather"
        | "quiz_video"
      question_type: "multiple_choice" | "true_false"
      quiz_question_type: "multiple_choice" | "true_false"
      segment_status: "pending" | "processing" | "completed" | "failed"
      subscription_status: "active" | "canceled" | "past_due"
      system_metric_type:
        | "cpu_usage"
        | "memory_usage"
        | "api_latency"
        | "storage_usage"
      user_role: "admin" | "user"
      video_processing_status: "pending" | "processing" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
