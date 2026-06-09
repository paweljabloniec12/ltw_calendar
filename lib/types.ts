export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ServiceType =
  | "Fotografia"
  | "Video"
  | "Zespół"
  | "DJ"
  | "Dekoracje"
  | "Beauty"
  | "Bar"
  | "Cukiernia"
  | "Atrakcje"
  | "Samochód"
  | "Content Creator"
  | "Oprawa muzyczna"
  | "Animacje";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          service_type: ServiceType;
          phone: string | null;
          email_public: string | null;
          website_url: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          tiktok_url: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
          service_type: ServiceType;
          phone?: string | null;
          email_public?: string | null;
          website_url?: string | null;
          instagram_url?: string | null;
          facebook_url?: string | null;
          tiktok_url?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          full_name?: string;
          service_type?: ServiceType;
          phone?: string | null;
          email_public?: string | null;
          website_url?: string | null;
          instagram_url?: string | null;
          facebook_url?: string | null;
          tiktok_url?: string | null;
          description?: string | null;
          is_active?: boolean;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      booked_dates: {
        Row: {
          id: string;
          provider_id: string;
          date: string;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          provider_id: string;
          date: string;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          date?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "booked_dates_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type BookedDate = Database["public"]["Tables"]["booked_dates"]["Row"];
