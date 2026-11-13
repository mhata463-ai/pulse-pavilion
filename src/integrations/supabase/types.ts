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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cashbox_records: {
        Row: {
          cash: number
          cheques: number
          day: string
          deferred: number
          hospital_id: string
          id: string
          insurance: number
          match_status: string
          matched_at: string | null
          matched_snapshot: Json | null
          pledges: Json
          updated_at: string
          wallets: number
        }
        Insert: {
          cash?: number
          cheques?: number
          day?: string
          deferred?: number
          hospital_id: string
          id?: string
          insurance?: number
          match_status?: string
          matched_at?: string | null
          matched_snapshot?: Json | null
          pledges?: Json
          updated_at?: string
          wallets?: number
        }
        Update: {
          cash?: number
          cheques?: number
          day?: string
          deferred?: number
          hospital_id?: string
          id?: string
          insurance?: number
          match_status?: string
          matched_at?: string | null
          matched_snapshot?: Json | null
          pledges?: Json
          updated_at?: string
          wallets?: number
        }
        Relationships: [
          {
            foreignKeyName: "cashbox_records_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_limits: {
        Row: {
          category: string
          hospital_id: string
          id: string
          max_amount: number
          period: string
        }
        Insert: {
          category: string
          hospital_id: string
          id?: string
          max_amount: number
          period: string
        }
        Update: {
          category?: string
          hospital_id?: string
          id?: string
          max_amount?: number
          period?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_limits_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          details: Json
          external_ref: string | null
          hospital_id: string
          id: string
          invoice_no: string | null
          item: string
          period: string
          spent_on: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          details?: Json
          external_ref?: string | null
          hospital_id: string
          id?: string
          invoice_no?: string | null
          item: string
          period: string
          spent_on?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          details?: Json
          external_ref?: string | null
          hospital_id?: string
          id?: string
          invoice_no?: string | null
          item?: string
          period?: string
          spent_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_access: {
        Row: {
          hospital_id: string
          user_id: string
        }
        Insert: {
          hospital_id: string
          user_id: string
        }
        Update: {
          hospital_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_access_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_vitals: {
        Row: {
          attendance: Json
          beds: Json
          day: string
          electricity: Json
          emergency: Json
          hospital_id: string
          id: string
          returns: number
          revenue: number
          surgeries: Json
          updated_at: string
        }
        Insert: {
          attendance?: Json
          beds?: Json
          day?: string
          electricity?: Json
          emergency?: Json
          hospital_id: string
          id?: string
          returns?: number
          revenue?: number
          surgeries?: Json
          updated_at?: string
        }
        Update: {
          attendance?: Json
          beds?: Json
          day?: string
          electricity?: Json
          emergency?: Json
          hospital_id?: string
          id?: string
          returns?: number
          revenue?: number
          surgeries?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_vitals_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          code: string
          created_at: string
          id: string
          last_sync_at: string | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          external_ref: string | null
          hospital_id: string
          id: string
          is_read: boolean
          kind: string
          remind_at: string | null
          reply: string | null
          sender: string | null
          source: string
        }
        Insert: {
          body: string
          created_at?: string
          external_ref?: string | null
          hospital_id: string
          id?: string
          is_read?: boolean
          kind: string
          remind_at?: string | null
          reply?: string | null
          sender?: string | null
          source: string
        }
        Update: {
          body?: string
          created_at?: string
          external_ref?: string | null
          hospital_id?: string
          id?: string
          is_read?: boolean
          kind?: string
          remind_at?: string | null
          reply?: string | null
          sender?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_returns: {
        Row: {
          amount: number
          created_at: string
          external_ref: string | null
          hospital_id: string
          id: string
          kind: string
          quantity: number
          reason: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          external_ref?: string | null
          hospital_id: string
          id?: string
          kind: string
          quantity?: number
          reason?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          external_ref?: string | null
          hospital_id?: string
          id?: string
          kind?: string
          quantity?: number
          reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_returns_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          day: string
          employee_code: string
          employee_name: string
          hospital_id: string
          id: string
          job_title: string | null
          late_minutes: number
          shift: string
          status: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          day: string
          employee_code: string
          employee_name: string
          hospital_id: string
          id?: string
          job_title?: string | null
          late_minutes?: number
          shift?: string
          status?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          day?: string
          employee_code?: string
          employee_name?: string
          hospital_id?: string
          id?: string
          job_title?: string | null
          late_minutes?: number
          shift?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_attendance_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_hospital: { Args: { hid: string }; Returns: boolean }
      match_cashbox: {
        Args: { record_id: string; undo: boolean }
        Returns: undefined
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
