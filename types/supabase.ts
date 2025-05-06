export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      partner_inquiries: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          message: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email: string
          message: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          message?: string
          status?: string
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string | null
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name?: string | null
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string | null
          created_at?: string
          last_login?: string | null
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
