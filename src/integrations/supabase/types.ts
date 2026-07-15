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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accident_events: {
        Row: {
          created_at: string
          description: string | null
          id: string
          injuries_estimated: number | null
          latitude: number
          longitude: number
          passengers_count: number | null
          priority: string
          severity: string
          status: string
          timestamp: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          injuries_estimated?: number | null
          latitude: number
          longitude: number
          passengers_count?: number | null
          priority: string
          severity?: string
          status?: string
          timestamp?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          injuries_estimated?: number | null
          latitude?: number
          longitude?: number
          passengers_count?: number | null
          priority?: string
          severity?: string
          status?: string
          timestamp?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accident_events_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "ais140_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      ais140_vehicles: {
        Row: {
          created_at: string
          current_lat: number | null
          current_lng: number | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          last_updated: string | null
          owner_name: string | null
          registration_number: string
          status: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          id: string
          last_updated?: string | null
          owner_name?: string | null
          registration_number: string
          status?: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          last_updated?: string | null
          owner_name?: string | null
          registration_number?: string
          status?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      ambulances: {
        Row: {
          assigned_accident_id: string | null
          created_at: string
          current_lat: number | null
          current_lng: number | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          registration_number: string
          status: string
        }
        Insert: {
          assigned_accident_id?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          id: string
          registration_number: string
          status?: string
        }
        Update: {
          assigned_accident_id?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          registration_number?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambulances_assigned_accident_id_fkey"
            columns: ["assigned_accident_id"]
            isOneToOne: false
            referencedRelation: "accident_events"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          created_at: string
          floor: number
          id: string
          patient_id: string | null
          patient_name: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          floor: number
          id: string
          patient_id?: string | null
          patient_name?: string | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          floor?: number
          id?: string
          patient_id?: string | null
          patient_name?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          created_at: string
          current_patients: number
          id: string
          max_patients: number
          name: string
          password: string
          specialty: string
          status: string
        }
        Insert: {
          created_at?: string
          current_patients?: number
          id: string
          max_patients?: number
          name: string
          password?: string
          specialty: string
          status?: string
        }
        Update: {
          created_at?: string
          current_patients?: number
          id?: string
          max_patients?: number
          name?: string
          password?: string
          specialty?: string
          status?: string
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          accident_id: string
          acknowledged_at: string | null
          alert_type: string
          created_at: string
          id: string
          message: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          accident_id: string
          acknowledged_at?: string | null
          alert_type: string
          created_at?: string
          id?: string
          message?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          accident_id?: string
          acknowledged_at?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          message?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_alerts_accident_id_fkey"
            columns: ["accident_id"]
            isOneToOne: false
            referencedRelation: "accident_events"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number
          allocation_decision: string | null
          arrival_time: string
          assigned_bed: string | null
          assigned_doctor_id: string | null
          bp_diastolic: number
          bp_systolic: number
          chief_complaint: string
          comorbidities: string[] | null
          created_at: string
          deterioration_probability: number | null
          gender: string
          heart_rate: number
          id: string
          name: string
          oxygen_saturation: number
          respiratory_rate: number
          risk_factors: string[] | null
          risk_level: string | null
          severity: string | null
          status: string
          symptoms: string[] | null
          temperature: number
          triage_reasoning: string[] | null
          triage_score: number | null
        }
        Insert: {
          age: number
          allocation_decision?: string | null
          arrival_time?: string
          assigned_bed?: string | null
          assigned_doctor_id?: string | null
          bp_diastolic: number
          bp_systolic: number
          chief_complaint: string
          comorbidities?: string[] | null
          created_at?: string
          deterioration_probability?: number | null
          gender: string
          heart_rate: number
          id: string
          name: string
          oxygen_saturation: number
          respiratory_rate: number
          risk_factors?: string[] | null
          risk_level?: string | null
          severity?: string | null
          status?: string
          symptoms?: string[] | null
          temperature: number
          triage_reasoning?: string[] | null
          triage_score?: number | null
        }
        Update: {
          age?: number
          allocation_decision?: string | null
          arrival_time?: string
          assigned_bed?: string | null
          assigned_doctor_id?: string | null
          bp_diastolic?: number
          bp_systolic?: number
          chief_complaint?: string
          comorbidities?: string[] | null
          created_at?: string
          deterioration_probability?: number | null
          gender?: string
          heart_rate?: number
          id?: string
          name?: string
          oxygen_saturation?: number
          respiratory_rate?: number
          risk_factors?: string[] | null
          risk_level?: string | null
          severity?: string | null
          status?: string
          symptoms?: string[] | null
          temperature?: number
          triage_reasoning?: string[] | null
          triage_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_assigned_doctor_id_fkey"
            columns: ["assigned_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      response_timings: {
        Row: {
          accident_id: string
          alert_received_at: string
          ambulance_arrived_at: string | null
          ambulance_dispatched_at: string | null
          ambulance_id: string | null
          created_at: string
          hospital_notified_at: string | null
          id: string
          patient_arrived_hospital_at: string | null
        }
        Insert: {
          accident_id: string
          alert_received_at: string
          ambulance_arrived_at?: string | null
          ambulance_dispatched_at?: string | null
          ambulance_id?: string | null
          created_at?: string
          hospital_notified_at?: string | null
          id?: string
          patient_arrived_hospital_at?: string | null
        }
        Update: {
          accident_id?: string
          alert_received_at?: string
          ambulance_arrived_at?: string | null
          ambulance_dispatched_at?: string | null
          ambulance_id?: string | null
          created_at?: string
          hospital_notified_at?: string | null
          id?: string
          patient_arrived_hospital_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "response_timings_accident_id_fkey"
            columns: ["accident_id"]
            isOneToOne: false
            referencedRelation: "accident_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_timings_ambulance_id_fkey"
            columns: ["ambulance_id"]
            isOneToOne: false
            referencedRelation: "ambulances"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
