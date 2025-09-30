export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          check_in_date_time: string;
          check_out_date_time: string;
          created_at: string | null;
          guest_email: string;
          guest_name: string;
          id: string;
          property_id: string;
          updated_at: string | null;
        };
        Insert: {
          check_in_date_time: string;
          check_out_date_time: string;
          created_at?: string | null;
          guest_email: string;
          guest_name: string;
          id?: string;
          property_id: string;
          updated_at?: string | null;
        };
        Update: {
          check_in_date_time?: string;
          check_out_date_time?: string;
          created_at?: string | null;
          guest_email?: string;
          guest_name?: string;
          id?: string;
          property_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      chat: {
        Row: {
          booking_id: string | null;
          created_at: string | null;
          id: string;
          message: string;
          sender: Database["public"]["Enums"]["chat_sender"];
          source: Database["public"]["Enums"]["chat_source"];
          task_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          booking_id?: string | null;
          created_at?: string | null;
          id?: string;
          message: string;
          sender: Database["public"]["Enums"]["chat_sender"];
          source: Database["public"]["Enums"]["chat_source"];
          task_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          booking_id?: string | null;
          created_at?: string | null;
          id?: string;
          message?: string;
          sender?: Database["public"]["Enums"]["chat_sender"];
          source?: Database["public"]["Enums"]["chat_source"];
          task_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chat_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      faq: {
        Row: {
          answer: string;
          created_at: string | null;
          id: string;
          property_id: string | null;
          question: string;
          updated_at: string | null;
        };
        Insert: {
          answer: string;
          created_at?: string | null;
          id?: string;
          property_id?: string | null;
          question: string;
          updated_at?: string | null;
        };
        Update: {
          answer?: string;
          created_at?: string | null;
          id?: string;
          property_id?: string | null;
          question?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "faq_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      partners: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          phone: string | null;
          type: Database["public"]["Enums"]["task_type"];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          name: string;
          phone?: string | null;
          type: Database["public"]["Enums"]["task_type"];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          phone?: string | null;
          type?: Database["public"]["Enums"]["task_type"];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          access_instructions: string | null;
          address: string;
          created_at: string | null;
          id: string;
          updated_at: string | null;
          wifi_password: string | null;
          wifi_ssid: string | null;
        };
        Insert: {
          access_instructions?: string | null;
          address: string;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
          wifi_password?: string | null;
          wifi_ssid?: string | null;
        };
        Update: {
          access_instructions?: string | null;
          address?: string;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
          wifi_password?: string | null;
          wifi_ssid?: string | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          booking_id: string | null;
          can_start_after: string | null;
          created_at: string | null;
          due_date: string | null;
          end_date: string | null;
          id: string;
          partner_id: string | null;
          property_id: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["task_status"];
          task_description: string;
          type: Database["public"]["Enums"]["task_type"];
          updated_at: string | null;
        };
        Insert: {
          booking_id?: string | null;
          can_start_after?: string | null;
          created_at?: string | null;
          due_date?: string | null;
          end_date?: string | null;
          id?: string;
          partner_id?: string | null;
          property_id: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          task_description: string;
          type: Database["public"]["Enums"]["task_type"];
          updated_at?: string | null;
        };
        Update: {
          booking_id?: string | null;
          can_start_after?: string | null;
          created_at?: string | null;
          due_date?: string | null;
          end_date?: string | null;
          id?: string;
          partner_id?: string | null;
          property_id?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          task_description?: string;
          type?: Database["public"]["Enums"]["task_type"];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      chat_sender: "system" | "user" | "agent" | "partner";
      chat_source: "app" | "email" | "sms" | "other";
      task_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "cancelled"
        | "completed";
      task_type: "cleaning" | "maintenance" | "inspection" | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      chat_sender: ["system", "user", "agent", "partner"],
      chat_source: ["app", "email", "sms", "other"],
      task_status: [
        "pending",
        "confirmed",
        "in_progress",
        "cancelled",
        "completed",
      ],
      task_type: ["cleaning", "maintenance", "inspection", "other"],
    },
  },
} as const;
