"use client"

import Image from "next/image"
import { CalendarDays, Users, UserCheck, PlusCircle } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { getDashboardStats, getMonthlyAppointmentsStats, getRecentClients, type DashboardStats } from "@/lib/appointments"

function DashboardContent() {
  const { user, signOut } = useAuth()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalClients: 0,
    todayAppointments: 0,
    futureAppointments: 0,
    lastClient: null
  })
  const [monthlyStats, setMonthlyStats] = useState({
    currentMonth: 0,
    lastMonth: 0,
    percentageChange: 0
  })
  const [recentClients, setRecentClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Obter nome do usuário dos metadados ou usar email como fallback
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || "Usuário"

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const [stats, monthly, clients] = await Promise.all([
          getDashboardStats(user.id),
          getMonthlyAppointmentsStats(user.id),
          getRecentClients(user.id, 5)
        ])
        
        setDashboardStats(stats)
        setMonthlyStats(monthly)
        setRecentClients(clients)
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        toast.error('Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Logout realizado com sucesso!")
    } catch (error) {
      toast.error("Erro ao fazer logout")
    }
  }

  const formatPercentageChange = (change: number) => {
    if (change > 0) {
      return `+${change}% desde o mês passado`
    } else if (change < 0) {
      return `${change}% desde o mês passado`
    } else {
      return 'Sem mudança desde o mês passado'
    }
  }

  const getLastClientDisplay = () => {
    if (!dashboardStats.lastClient) {
      return {
        name: 'Nenhum cliente ainda',
        service: 'Faça seu primeiro agendamento'
      }
    }
    return {
      name: dashboardStats.lastClient.name,
      service: `${dashboardStats.lastClient.service} (${dashboardStats.lastClient.time})`
    }
  }

  const lastClientInfo = getLastClientDisplay()

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Olá, {userName}!</h1>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full border w-8 h-8">
                <Image
                  src="/placeholder-user.jpg"
                  width="32"
                  height="32"
                  className="rounded-full"
                  alt="Avatar do Usuário"
                />
                <span className="sr-only">Menu do Usuário</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuItem>Suporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl md:text-2xl">Visão Geral</h2>
          <Button className="ml-auto" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : dashboardStats.totalClients}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "Carregando..." : `${monthlyStats.currentMonth} agendamentos este mês`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos do Dia</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : dashboardStats.todayAppointments}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "Carregando..." : `${dashboardStats.futureAppointments} agendamentos futuros`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Último Cliente Atendido</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sm leading-tight">
                {loading ? "..." : lastClientInfo.name}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "Carregando..." : lastClientInfo.service}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Recent Clients Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clientes Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-1 flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentClients.length > 0 ? (
                <div className="space-y-3">
                  {recentClients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.phone || client.email || 'Sem contato'}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {client.last_visit 
                          ? new Date(client.last_visit).toLocaleDateString('pt-BR')
                          : 'Primeira visita'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum cliente cadastrado ainda
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Comece adicionando seus primeiros clientes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Agendamentos este mês</span>
                      <span className="text-2xl font-bold">{monthlyStats.currentMonth}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPercentageChange(monthlyStats.percentageChange)}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mês atual</span>
                      <span className="font-medium">{monthlyStats.currentMonth}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Mês anterior</span>
                      <span>{monthlyStats.lastMonth}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Total de agendamentos futuros: {dashboardStats.futureAppointments}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </SidebarInset>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
