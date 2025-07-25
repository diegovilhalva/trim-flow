"use client"

import * as React from "react"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Pencil, Trash2, Clock, Calendar as CalendarDaysIcon } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewAppointmentModal } from "@/components/new-appointment-modal"
import { EditAppointmentModal } from "@/components/edit-appointment-modal"
import { getAppointments, getUpcomingAppointments, getCurrentUser, deleteAppointment, getAppointmentById, type Appointment, type UpcomingAppointment } from "@/lib/appointments"

export default function SchedulePage() {
  const userName = "João" // Placeholder for user name
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = React.useState<UpcomingAppointment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadingUpcoming, setLoadingUpcoming] = React.useState(true)
  const [refreshKey, setRefreshKey] = React.useState(0)
  
  // Estados para modal de edição
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [appointmentToEdit, setAppointmentToEdit] = React.useState<Appointment | null>(null)
  
  // Estados para confirmação de deleção
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = React.useState<{id: string, clientName: string} | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // Carregar agendamentos do dia
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

  // Carregar agendamentos futuros
  const loadUpcomingAppointments = React.useCallback(async () => {
    setLoadingUpcoming(true)
    try {
      const user = await getCurrentUser()
      if (user) {
        const upcomingData = await getUpcomingAppointments(user.id)
        setUpcomingAppointments(upcomingData)
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos futuros:', error)
      toast.error("Erro ao carregar agendamentos futuros")
    } finally {
      setLoadingUpcoming(false)
    }
  }, [])

  // Carregar agendamentos quando a data mudar
  React.useEffect(() => {
    loadAppointments()
  }, [loadAppointments, refreshKey])

  // Carregar agendamentos futuros na inicialização e quando houver refresh
  React.useEffect(() => {
    loadUpcomingAppointments()
  }, [loadUpcomingAppointments, refreshKey])

  // Função para atualizar a lista quando um novo agendamento for criado
  const handleAppointmentCreated = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Função para abrir modal de edição
  const handleEditAppointment = async (appointmentId: string) => {
    try {
      const user = await getCurrentUser()
      if (user) {
        const appointment = await getAppointmentById(appointmentId, user.id)
        setAppointmentToEdit(appointment)
        setEditModalOpen(true)
      }
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error)
      toast.error("Erro ao carregar dados do agendamento")
    }
  }

  // Função para fechar modal de edição
  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setAppointmentToEdit(null)
  }

  // Função para confirmar atualização
  const handleAppointmentUpdated = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Função para abrir diálogo de confirmação de deleção
  const handleDeleteAppointment = (appointmentId: string, clientName: string) => {
    setAppointmentToDelete({ id: appointmentId, clientName })
    setDeleteDialogOpen(true)
  }

  // Função para confirmar deleção
  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return

    try {
      setDeleting(true)
      const user = await getCurrentUser()
      if (user) {
        await deleteAppointment(appointmentToDelete.id, user.id)
        toast.success("Agendamento cancelado com sucesso!")
        setRefreshKey(prev => prev + 1)
        setDeleteDialogOpen(false)
        setAppointmentToDelete(null)
      }
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error)
      toast.error("Erro ao cancelar agendamento. Tente novamente.")
    } finally {
      setDeleting(false)
    }
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
          <h2 className="font-semibold text-xl md:text-2xl">Agenda</h2>
          <NewAppointmentModal onAppointmentCreated={handleAppointmentCreated} />
        </div>

        <Tabs defaultValue="day" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="day" className="flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4" />
              Agendamentos do Dia
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Próximos Agendamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="day" className="space-y-4">
            <div className="flex items-center gap-4 w-full">
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditAppointment(appointment.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar Agendamento</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAppointment(appointment.id, appointment.client?.name || 'Cliente')}
                          >
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
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {loadingUpcoming ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Carregando próximos agendamentos...</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-bold">
                          {appointment.client_name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditAppointment(appointment.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar Agendamento</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAppointment(appointment.id, appointment.client_name)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Cancelar Agendamento</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm font-medium text-primary">
                          {format(new Date(appointment.date), "PPP", { locale: ptBR })}
                        </CardDescription>
                        <CardDescription className="text-sm text-muted-foreground">
                          Horário: {appointment.time}
                        </CardDescription>
                        <CardDescription className="text-sm text-muted-foreground">
                          Serviço: {appointment.service}
                        </CardDescription>
                        {appointment.appointment_notes && (
                          <CardDescription className="text-sm text-muted-foreground mt-2">
                            Obs: {appointment.appointment_notes}
                          </CardDescription>
                        )}
                        {appointment.client_phone && (
                          <CardDescription className="text-sm text-muted-foreground mt-1">
                            Tel: {appointment.client_phone}
                          </CardDescription>
                        )}
                        {appointment.client_email && (
                          <CardDescription className="text-sm text-muted-foreground mt-1">
                            Email: {appointment.client_email}
                          </CardDescription>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p>Nenhum agendamento futuro encontrado.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Edição */}
      <EditAppointmentModal 
        appointment={appointmentToEdit}
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        onAppointmentUpdated={handleAppointmentUpdated}
      />

      {/* Diálogo de Confirmação de Deleção */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o agendamento de <strong>{appointmentToDelete?.clientName}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Não, manter agendamento
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleting ? 'Cancelando...' : 'Sim, cancelar agendamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  )
}
