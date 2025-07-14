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
      cast_members: {
        Row: {
          character_name: string | null
          created_at: string
          id: string
          movie_id: string
          name: string
          order_position: number | null
          profile_picture_url: string | null
          tmdb_person_id: number
          updated_at: string
        }
        Insert: {
          character_name?: string | null
          created_at?: string
          id?: string
          movie_id: string
          name: string
          order_position?: number | null
          profile_picture_url?: string | null
          tmdb_person_id: number
          updated_at?: string
        }
        Update: {
          character_name?: string | null
          created_at?: string
          id?: string
          movie_id?: string
          name?: string
          order_position?: number | null
          profile_picture_url?: string | null
          tmdb_person_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cast_members_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members: {
        Row: {
          created_at: string
          department: string | null
          id: string
          job: string
          movie_id: string
          name: string
          profile_picture_url: string | null
          tmdb_person_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          job: string
          movie_id: string
          name: string
          profile_picture_url?: string | null
          tmdb_person_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          job?: string
          movie_id?: string
          name?: string
          profile_picture_url?: string | null
          tmdb_person_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          genre: string[] | null
          id: string
          poster_url: string | null
          rating: number | null
          release_year: number | null
          subscription_tier: string
          title: string
          trailer_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          genre?: string[] | null
          id?: string
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          subscription_tier?: string
          title: string
          trailer_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          genre?: string[] | null
          id?: string
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          subscription_tier?: string
          title?: string
          trailer_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_ratings: {
        Row: {
          created_at: string
          id: string
          movie_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movie_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movie_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ratings_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      viewing_history: {
        Row: {
          completed: boolean | null
          id: string
          movie_id: string
          progress_seconds: number | null
          user_id: string
          watched_at: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          movie_id: string
          progress_seconds?: number | null
          user_id: string
          watched_at?: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          movie_id?: string
          progress_seconds?: number | null
          user_id?: string
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_history_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          created_at: string
          id: string
          movie_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movie_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movie_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
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
