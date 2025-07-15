"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, PlusCircle } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createAppointment, getClients, getCurrentUser } from "@/lib/appointments"

const mockTimeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
]

const mockServices = ["Corte", "Barba", "Corte + Barba", "Sobrancelha", "Hidratação"]

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
}

interface NewAppointmentModalProps {
  onAppointmentCreated?: () => void
}

export function NewAppointmentModal({ onAppointmentCreated }: NewAppointmentModalProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedClient, setSelectedClient] = React.useState<string | undefined>(undefined)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = React.useState<string | undefined>(undefined)
  const [selectedService, setSelectedService] = React.useState<string | undefined>(undefined)
  const [observations, setObservations] = React.useState("")
  const [clients, setClients] = React.useState<Client[]>([])
  const [loading, setLoading] = React.useState(false)
  const [loadingClients, setLoadingClients] = React.useState(true)

  // Carregar clientes quando o modal abrir
  React.useEffect(() => {
    if (open) {
      loadClients()
    }
  }, [open])

  const loadClients = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        const clientsData = await getClients(user.id)
        setClients(clientsData)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast.error("Erro ao carregar clientes")
    } finally {
      setLoadingClients(false)
    }
  }

  const resetForm = () => {
    setSelectedClient(undefined)
    setSelectedDate(undefined)
    setSelectedTime(undefined)
    setSelectedService(undefined)
    setObservations("")
  }

  const handleSaveAppointment = async () => {
    // Validação
    if (!selectedClient || !selectedDate || !selectedTime || !selectedService) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)

    try {
      const user = await getCurrentUser()
      if (!user) {
        toast.error("Usuário não encontrado. Faça login novamente.")
        return
      }

      const appointmentData = {
        client_id: selectedClient,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        service: selectedService,
        notes: observations.trim() || undefined,
      }

      await createAppointment(appointmentData, user.id)
      
      toast.success("Agendamento criado com sucesso!")
      
      // Fechar modal e resetar form
      setOpen(false)
      resetForm()
      
      // Notificar componente pai para atualizar a lista
      if (onAppointmentCreated) {
        onAppointmentCreated()
      }
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast.error("Erro ao criar agendamento. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>Preencha os detalhes para criar um novo agendamento.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient} disabled={loadingClients}>
              <SelectTrigger id="client">
                <SelectValue placeholder={loadingClients ? "Carregando clientes..." : "Selecione um cliente"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Clientes</SelectLabel>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Data do agendamento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={selectedDate} 
                  onSelect={setSelectedDate} 
                  initialFocus 
                  locale={ptBR}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="time">Horário *</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Horários</SelectLabel>
                  {mockTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="service">Serviço *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Serviços</SelectLabel>
                  {mockServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Adicione observações sobre o agendamento..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSaveAppointment} disabled={loading}>
            {loading ? "Salvando..." : "Salvar agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
