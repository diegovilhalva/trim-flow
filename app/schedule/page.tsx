"use client"

import * as React from "react"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { NewAppointmentModal } from "@/components/new-appointment-modal"
import { getAppointments, getCurrentUser, type Appointment } from "@/lib/appointments"

export default function SchedulePage() {
  const userName = "João" // Placeholder for user name
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshKey, setRefreshKey] = React.useState(0)

  // Carregar agendamentos
  const loadAppointments = React.useCallback(async () => {
    if (!date) return

    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (user) {
        const formattedDate = format(date, "yyyy-MM-dd")
        const appointmentsData = await getAppointments(user.id, formattedDate)
        setAppointments(appointmentsData)
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      toast.error("Erro ao carregar agendamentos")
    } finally {
      setLoading(false)
    }
  }, [date])

  // Carregar agendamentos quando a data mudar
  React.useEffect(() => {
    loadAppointments()
  }, [loadAppointments, refreshKey])

  // Função para atualizar a lista quando um novo agendamento for criado
  const handleAppointmentCreated = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Filtra os agendamentos com base na data selecionada
  const filteredAppointments = React.useMemo(() => {
    if (!date) return []
    const formattedDate = format(date, "yyyy-MM-dd")
    return appointments.filter((appt) => appt.date === formattedDate)
  }, [appointments, date])

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Agenda</h1>
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
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-semibold text-xl md:text-2xl">Agendamentos do Dia</h2>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecionar data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
            <NewAppointmentModal onAppointmentCreated={handleAppointmentCreated} />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Carregando agendamentos...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">
                      {appointment.client?.name || 'Cliente não encontrado'}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar Agendamento</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Cancelar Agendamento</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-muted-foreground">
                      Horário: {appointment.time}
                    </CardDescription>
                    <CardDescription className="text-sm text-muted-foreground">
                      Serviço: {appointment.service}
                    </CardDescription>
                    {appointment.notes && (
                      <CardDescription className="text-sm text-muted-foreground mt-2">
                        Obs: {appointment.notes}
                      </CardDescription>
                    )}
                    {appointment.client?.phone && (
                      <CardDescription className="text-sm text-muted-foreground mt-1">
                        Tel: {appointment.client.phone}
                      </CardDescription>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>Nenhum agendamento para esta data.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </SidebarInset>
  )
}
