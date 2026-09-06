export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      persons: {
        Row: {
          id: string
          family_code: string | null
          full_name: string
          nickname: string | null
          gender: string | null
          birth_place: string | null
          birth_date: string | null
          death_date: string | null
          education: string | null
          occupation: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          province: string | null
          photo_path: string | null
          life_status: string
          data_status: string
          edit_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_code?: string | null
          full_name: string
          nickname?: string | null
          gender?: string | null
          birth_place?: string | null
          birth_date?: string | null
          death_date?: string | null
          education?: string | null
          occupation?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          photo_path?: string | null
          life_status?: string
          data_status?: string
          edit_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_code?: string | null
          full_name?: string
          nickname?: string | null
          gender?: string | null
          birth_place?: string | null
          birth_date?: string | null
          death_date?: string | null
          education?: string | null
          occupation?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          photo_path?: string | null
          life_status?: string
          data_status?: string
          edit_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      families: {
        Row: {
          id: string
          family_code: string | null
          family_name: string | null
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_code?: string | null
          family_name?: string | null
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_code?: string | null
          family_name?: string | null
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      relationships: {
        Row: {
          id: string
          person_id: string | null
          related_person_id: string | null
          relationship_type: string | null
          status: string
          created_by: string | null
          verified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id?: string | null
          related_person_id?: string | null
          relationship_type?: string | null
          status?: string
          created_by?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string | null
          related_person_id?: string | null
          relationship_type?: string | null
          status?: string
          created_by?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
