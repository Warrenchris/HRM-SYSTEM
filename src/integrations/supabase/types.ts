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
