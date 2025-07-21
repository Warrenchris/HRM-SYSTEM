export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appraisal_objectives: {
        Row: {
          actual_value: string | null
          appraisal_id: string
          created_at: string
          employee_comments: string | null
          employee_rating: number | null
          id: string
          manager_comments: string | null
          manager_rating: number | null
          objective_description: string | null
          objective_title: string
          target_value: string | null
          updated_at: string
          weight_percentage: number | null
        }
        Insert: {
          actual_value?: string | null
          appraisal_id: string
          created_at?: string
          employee_comments?: string | null
          employee_rating?: number | null
          id?: string
          manager_comments?: string | null
          manager_rating?: number | null
          objective_description?: string | null
          objective_title: string
          target_value?: string | null
          updated_at?: string
          weight_percentage?: number | null
        }
        Update: {
          actual_value?: string | null
          appraisal_id?: string
          created_at?: string
          employee_comments?: string | null
          employee_rating?: number | null
          id?: string
          manager_comments?: string | null
          manager_rating?: number | null
          objective_description?: string | null
          objective_title?: string
          target_value?: string | null
          updated_at?: string
          weight_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_objectives_appraisal_id_fkey"
            columns: ["appraisal_id"]
            isOneToOne: false
            referencedRelation: "appraisals"
            referencedColumns: ["id"]
          },
        ]
      }
      appraisals: {
        Row: {
          appraisal_period: string
          appraiser_id: string
          areas_for_improvement: string | null
          created_at: string
          development_needs: string | null
          due_date: string
          employee_id: string
          goals_achievement: string | null
          id: string
          manager_appraisal_comments: string | null
          manager_appraisal_completed: boolean
          overall_rating: number | null
          self_appraisal_comments: string | null
          self_appraisal_completed: boolean
          status: string
          strengths: string | null
          updated_at: string
        }
        Insert: {
          appraisal_period: string
          appraiser_id: string
          areas_for_improvement?: string | null
          created_at?: string
          development_needs?: string | null
          due_date: string
          employee_id: string
          goals_achievement?: string | null
          id?: string
          manager_appraisal_comments?: string | null
          manager_appraisal_completed?: boolean
          overall_rating?: number | null
          self_appraisal_comments?: string | null
          self_appraisal_completed?: boolean
          status?: string
          strengths?: string | null
          updated_at?: string
        }
        Update: {
          appraisal_period?: string
          appraiser_id?: string
          areas_for_improvement?: string | null
          created_at?: string
          development_needs?: string | null
          due_date?: string
          employee_id?: string
          goals_achievement?: string | null
          id?: string
          manager_appraisal_comments?: string | null
          manager_appraisal_completed?: boolean
          overall_rating?: number | null
          self_appraisal_comments?: string | null
          self_appraisal_completed?: boolean
          status?: string
          strengths?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appraisals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          approved_by: string | null
          break_duration: number | null
          break_end_time: string | null
          break_start_time: string | null
          clock_in_time: string
          clock_out_ip_address: unknown | null
          clock_out_location: string | null
          clock_out_time: string | null
          created_at: string
          employee_id: string
          id: string
          ip_address: unknown | null
          is_approved: boolean | null
          location: string | null
          notes: string | null
          status: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          break_duration?: number | null
          break_end_time?: string | null
          break_start_time?: string | null
          clock_in_time: string
          clock_out_ip_address?: unknown | null
          clock_out_location?: string | null
          clock_out_time?: string | null
          created_at?: string
          employee_id: string
          id?: string
          ip_address?: unknown | null
          is_approved?: boolean | null
          location?: string | null
          notes?: string | null
          status?: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          break_duration?: number | null
          break_end_time?: string | null
          break_start_time?: string | null
          clock_in_time?: string
          clock_out_ip_address?: unknown | null
          clock_out_location?: string | null
          clock_out_time?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          ip_address?: unknown | null
          is_approved?: boolean | null
          location?: string | null
          notes?: string | null
          status?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      attendance_settings: {
        Row: {
          allowed_ip_addresses: string[] | null
          break_duration_minutes: number | null
          company_name: string | null
          created_at: string
          id: string
          ip_restriction_enabled: boolean | null
          late_threshold_minutes: number | null
          location_tracking_enabled: boolean | null
          overtime_threshold_hours: number | null
          updated_at: string
          weekend_work_allowed: boolean | null
          work_end_time: string
          work_start_time: string
        }
        Insert: {
          allowed_ip_addresses?: string[] | null
          break_duration_minutes?: number | null
          company_name?: string | null
          created_at?: string
          id?: string
          ip_restriction_enabled?: boolean | null
          late_threshold_minutes?: number | null
          location_tracking_enabled?: boolean | null
          overtime_threshold_hours?: number | null
          updated_at?: string
          weekend_work_allowed?: boolean | null
          work_end_time?: string
          work_start_time?: string
        }
        Update: {
          allowed_ip_addresses?: string[] | null
          break_duration_minutes?: number | null
          company_name?: string | null
          created_at?: string
          id?: string
          ip_restriction_enabled?: boolean | null
          late_threshold_minutes?: number | null
          location_tracking_enabled?: boolean | null
          overtime_threshold_hours?: number | null
          updated_at?: string
          weekend_work_allowed?: boolean | null
          work_end_time?: string
          work_start_time?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          achievements: Json | null
          address: string | null
          auth_email: string | null
          bank_account_holder_name: string | null
          bank_account_number: string | null
          bank_branch_location: string | null
          bank_code: string | null
          bank_identifier_code: string | null
          bank_name: string | null
          basic_salary: number | null
          bonuses: Json | null
          branch_code: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          courses_taken: Json | null
          created_at: string
          date_of_birth: string | null
          department: string
          documents: Json | null
          email: string | null
          emergency_contact: string | null
          emergency_contact_number: string | null
          emergency_contact_person: string | null
          emergency_phone: string | null
          employee_id: string
          exit_date: string | null
          first_name: string
          gender: string | null
          hourly_rate: number | null
          id: string
          id_number: string | null
          join_date: string
          kra_pin: string | null
          last_name: string
          local_address: string | null
          login_password: string | null
          marital_status: string | null
          mpesa_name: string | null
          mpesa_number: string | null
          mpesa_payment_status: string | null
          next_of_kin_email: string | null
          next_of_kin_mobile: string | null
          next_of_kin_name: string | null
          next_of_kin_relationship: string | null
          nssf_number: string | null
          office_branch: string | null
          office_email: string | null
          other_academics: string | null
          other_name: string | null
          passport_photo_url: string | null
          permanent_address: string | null
          personal_email: string | null
          phone: string | null
          position: string
          reporting_to: string | null
          role: string | null
          salary: number | null
          second_name: string | null
          shif_number: string | null
          site_project: string | null
          status: string
          updated_at: string
        }
        Insert: {
          achievements?: Json | null
          address?: string | null
          auth_email?: string | null
          bank_account_holder_name?: string | null
          bank_account_number?: string | null
          bank_branch_location?: string | null
          bank_code?: string | null
          bank_identifier_code?: string | null
          bank_name?: string | null
          basic_salary?: number | null
          bonuses?: Json | null
          branch_code?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          courses_taken?: Json | null
          created_at?: string
          date_of_birth?: string | null
          department: string
          documents?: Json | null
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_number?: string | null
          emergency_contact_person?: string | null
          emergency_phone?: string | null
          employee_id: string
          exit_date?: string | null
          first_name: string
          gender?: string | null
          hourly_rate?: number | null
          id?: string
          id_number?: string | null
          join_date: string
          kra_pin?: string | null
          last_name: string
          local_address?: string | null
          login_password?: string | null
          marital_status?: string | null
          mpesa_name?: string | null
          mpesa_number?: string | null
          mpesa_payment_status?: string | null
          next_of_kin_email?: string | null
          next_of_kin_mobile?: string | null
          next_of_kin_name?: string | null
          next_of_kin_relationship?: string | null
          nssf_number?: string | null
          office_branch?: string | null
          office_email?: string | null
          other_academics?: string | null
          other_name?: string | null
          passport_photo_url?: string | null
          permanent_address?: string | null
          personal_email?: string | null
          phone?: string | null
          position: string
          reporting_to?: string | null
          role?: string | null
          salary?: number | null
          second_name?: string | null
          shif_number?: string | null
          site_project?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          achievements?: Json | null
          address?: string | null
          auth_email?: string | null
          bank_account_holder_name?: string | null
          bank_account_number?: string | null
          bank_branch_location?: string | null
          bank_code?: string | null
          bank_identifier_code?: string | null
          bank_name?: string | null
          basic_salary?: number | null
          bonuses?: Json | null
          branch_code?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          courses_taken?: Json | null
          created_at?: string
          date_of_birth?: string | null
          department?: string
          documents?: Json | null
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_number?: string | null
          emergency_contact_person?: string | null
          emergency_phone?: string | null
          employee_id?: string
          exit_date?: string | null
          first_name?: string
          gender?: string | null
          hourly_rate?: number | null
          id?: string
          id_number?: string | null
          join_date?: string
          kra_pin?: string | null
          last_name?: string
          local_address?: string | null
          login_password?: string | null
          marital_status?: string | null
          mpesa_name?: string | null
          mpesa_number?: string | null
          mpesa_payment_status?: string | null
          next_of_kin_email?: string | null
          next_of_kin_mobile?: string | null
          next_of_kin_name?: string | null
          next_of_kin_relationship?: string | null
          nssf_number?: string | null
          office_branch?: string | null
          office_email?: string | null
          other_academics?: string | null
          other_name?: string | null
          passport_photo_url?: string | null
          permanent_address?: string | null
          personal_email?: string | null
          phone?: string | null
          position?: string
          reporting_to?: string | null
          role?: string | null
          salary?: number | null
          second_name?: string | null
          shif_number?: string | null
          site_project?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          employee_id: string | null
          id: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_internal: boolean
          task_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_internal?: boolean
          task_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_by: string
          assigned_to: string
          attachments: Json | null
          completed_at: string | null
          complexity_level: string
          created_at: string
          department: string | null
          description: string | null
          due_date: string | null
          escalated_at: string | null
          escalated_to: string | null
          escalation_reason: string | null
          estimated_hours: number | null
          id: string
          priority: string
          progress_percentage: number
          started_at: string | null
          status: string
          tags: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_by: string
          assigned_to: string
          attachments?: Json | null
          completed_at?: string | null
          complexity_level?: string
          created_at?: string
          department?: string | null
          description?: string | null
          due_date?: string | null
          escalated_at?: string | null
          escalated_to?: string | null
          escalation_reason?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          progress_percentage?: number
          started_at?: string | null
          status?: string
          tags?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_by?: string
          assigned_to?: string
          attachments?: Json | null
          completed_at?: string | null
          complexity_level?: string
          created_at?: string
          department?: string | null
          description?: string | null
          due_date?: string | null
          escalated_at?: string | null
          escalated_to?: string | null
          escalation_reason?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          progress_percentage?: number
          started_at?: string | null
          status?: string
          tags?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_escalated_to_fkey"
            columns: ["escalated_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          created_by: string
          department: string | null
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          created_by: string
          department?: string | null
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          created_by?: string
          department?: string | null
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
