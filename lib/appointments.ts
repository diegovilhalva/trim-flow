import { supabase } from './supabase'

export interface CreateAppointmentData {
  client_id: string
  date: string
  time: string
  service: string
  notes?: string
}

export interface Appointment {
  id: string
  user_id: string
  client_id: string
  date: string
  time: string
  service: string
  notes: string | null
  created_at: string
  updated_at: string
  client?: {
    id: string
    name: string
    phone: string | null
    email: string | null
  }
}

export interface UpcomingAppointment {
  id: string
  user_id: string
  date: string
  time: string
  service: string
  appointment_notes: string | null
  client_name: string
  client_phone: string | null
  client_email: string | null
  client_notes: string | null
}

export async function createAppointment(data: CreateAppointmentData, userId: string) {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        user_id: userId,
        client_id: data.client_id,
        date: data.date,
        time: data.time,
        service: data.service,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar agendamento:', error)
      throw new Error('Erro ao criar agendamento')
    }

    return appointment
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    throw error
  }
}

export async function getAppointments(userId: string, date?: string) {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        client:clients(id, name, phone, email)
      `)
      .eq('user_id', userId)
      .order('time', { ascending: true })

    if (date) {
      query = query.eq('date', date)
    }

    const { data: appointments, error } = await query

    if (error) {
      console.error('Erro ao buscar agendamentos:', error)
      throw new Error('Erro ao buscar agendamentos')
    }

    return appointments as Appointment[]
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    throw error
  }
}

export async function getUpcomingAppointments(userId: string) {
  try {
    const { data: appointments, error } = await supabase
      .from('upcoming_appointments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      console.error('Erro ao buscar agendamentos futuros:', error)
      throw new Error('Erro ao buscar agendamentos futuros')
    }

    return appointments as UpcomingAppointment[]
  } catch (error) {
    console.error('Erro ao buscar agendamentos futuros:', error)
    throw error
  }
}

export async function getClients(userId: string) {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, phone, email')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar clientes:', error)
      throw new Error('Erro ao buscar clientes')
    }

    return clients
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Erro ao obter usuário:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Erro ao obter usuário:', error)
    return null
  }
}