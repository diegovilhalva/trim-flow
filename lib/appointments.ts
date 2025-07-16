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
    const today = new Date().toISOString().split('T')[0]
    
    const { data: appointments, error } = await supabase
      .from('upcoming_appointments')
      .select('*')
      .eq('user_id', userId)
      .gt('date', today) // Apenas datas DEPOIS de hoje
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

// Dashboard Statistics Functions
export interface DashboardStats {
  totalClients: number
  todayAppointments: number
  futureAppointments: number
  lastClient: {
    name: string
    service: string
    time: string
  } | null
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get total clients count
    const { count: totalClients, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (clientsError) {
      console.error('Erro ao contar clientes:', clientsError)
    }

    // Get today's appointments count
    const { count: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('date', today)

    if (todayError) {
      console.error('Erro ao contar agendamentos de hoje:', todayError)
    }

    // Get future appointments count (today and after)
    const { count: futureAppointments, error: futureError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', today)

    if (futureError) {
      console.error('Erro ao contar agendamentos futuros:', futureError)
    }

    // Get last attended client (most recent appointment before today)
    const { data: lastAppointment, error: lastError } = await supabase
      .from('appointments')
      .select(`
        time,
        service,
        client:clients(name)
      `)
      .eq('user_id', userId)
      .lt('date', today)
      .order('date', { ascending: false })
      .order('time', { ascending: false })
      .limit(1)
      .single()

    if (lastError && lastError.code !== 'PGRST116') {
      console.error('Erro ao buscar último cliente:', lastError)
    }

    return {
      totalClients: totalClients || 0,
      todayAppointments: todayAppointments || 0,
      futureAppointments: futureAppointments || 0,
      lastClient: lastAppointment ? {
        name: lastAppointment.client?.name || 'Cliente',
        service: lastAppointment.service,
        time: lastAppointment.time
      } : null
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    return {
      totalClients: 0,
      todayAppointments: 0,
      futureAppointments: 0,
      lastClient: null
    }
  }
}

export async function getRecentClients(userId: string, limit: number = 5) {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, phone, email, last_visit, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar clientes recentes:', error)
      throw new Error('Erro ao buscar clientes recentes')
    }

    return clients
  } catch (error) {
    console.error('Erro ao buscar clientes recentes:', error)
    return []
  }
}

export async function getMonthlyAppointmentsStats(userId: string) {
  try {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Current month
    const currentMonthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
    
    // Last month
    const lastMonthStart = new Date(lastMonthYear, lastMonth, 1).toISOString().split('T')[0]
    const lastMonthEnd = new Date(lastMonthYear, lastMonth + 1, 0).toISOString().split('T')[0]

    const { count: currentMonthCount, error: currentError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', currentMonthStart)
      .lte('date', currentMonthEnd)

    const { count: lastMonthCount, error: lastError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', lastMonthStart)
      .lte('date', lastMonthEnd)

    if (currentError || lastError) {
      console.error('Erro ao buscar estatísticas mensais:', currentError || lastError)
    }

    const current = currentMonthCount || 0
    const last = lastMonthCount || 0
    const percentageChange = last > 0 ? ((current - last) / last) * 100 : 0

    return {
      currentMonth: current,
      lastMonth: last,
      percentageChange: Math.round(percentageChange)
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas mensais:', error)
    return {
      currentMonth: 0,
      lastMonth: 0,
      percentageChange: 0
    }
  }
}

// Appointment Management Functions
export interface UpdateAppointmentData {
  client_id?: string
  date?: string
  time?: string
  service?: string
  notes?: string
}

export async function deleteAppointment(appointmentId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)
      .eq('user_id', userId) // Garantir que só o proprietário pode deletar

    if (error) {
      console.error('Erro ao deletar agendamento:', error)
      throw new Error('Erro ao deletar agendamento')
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error)
    throw error
  }
}

export async function updateAppointment(appointmentId: string, userId: string, updateData: UpdateAppointmentData) {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .eq('user_id', userId) // Garantir que só o proprietário pode atualizar
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar agendamento:', error)
      throw new Error('Erro ao atualizar agendamento')
    }

    return appointment
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    throw error
  }
}

export async function getAppointmentById(appointmentId: string, userId: string) {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(id, name, phone, email)
      `)
      .eq('id', appointmentId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Erro ao buscar agendamento:', error)
      throw new Error('Erro ao buscar agendamento')
    }

    return appointment as Appointment
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error)
    throw error
  }
}