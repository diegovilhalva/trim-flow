import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Função auxiliar para tratamento de erros do Supabase
export const getSupabaseErrorMessage = (error: any): string => {
  if (error?.message) {
    // Traduzir mensagens comuns do Supabase para português
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Email ou senha incorretos'
      case 'Email not confirmed':
        return 'Email não confirmado. Verifique sua caixa de entrada'
      case 'User already registered':
        return 'Usuário já cadastrado com este email'
      case 'Password should be at least 6 characters':
        return 'A senha deve ter pelo menos 6 caracteres'
      case 'Unable to validate email address: invalid format':
        return 'Formato de email inválido'
      case 'Email rate limit exceeded':
        return 'Muitas tentativas. Tente novamente em alguns minutos'
      default:
        return error.message
    }
  }
  return 'Erro desconhecido. Tente novamente.'
}

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          email: string | null
          last_visit: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          email?: string | null
          last_visit?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          last_visit?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          client_id: string
          date: string
          time: string
          service: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          date: string
          time: string
          service: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          date?: string
          time?: string
          service?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}