"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getClients, updateAppointment, getCurrentUser, type Appointment } from "@/lib/appointments"

interface EditAppointmentModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onAppointmentUpdated: () => void
}

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
}

export function EditAppointmentModal({ 
  appointment, 
  isOpen, 
  onClose, 
  onAppointmentUpdated 
}: EditAppointmentModalProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = React.useState("")
  const [selectedClient, setSelectedClient] = React.useState("")
  const [selectedService, setSelectedService] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [clients, setClients] = React.useState<Client[]>([])

  // Carregar dados do agendamento quando modal abrir
  React.useEffect(() => {
    if (appointment && isOpen) {
      setSelectedDate(new Date(appointment.date))
      setSelectedTime(appointment.time)
      setSelectedClient(appointment.client_id)
      setSelectedService(appointment.service)
      setNotes(appointment.notes || "")
    }
  }, [appointment, isOpen])

  // Carregar clientes
  React.useEffect(() => {
    const loadClients = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          const clientsData = await getClients(user.id)
          setClients(clientsData)
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        toast.error("Erro ao carregar lista de clientes")
      }
    }

    if (isOpen) {
      loadClients()
    }
  }, [isOpen])

  // Limpar formulário ao fechar
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedDate(undefined)
      setSelectedTime("")
      setSelectedClient("")
      setSelectedService("")
      setNotes("")
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!appointment) {
      toast.error("Nenhum agendamento selecionado")
      return
    }

    if (!selectedDate || !selectedTime || !selectedClient || !selectedService) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    try {
      setLoading(true)
      const user = await getCurrentUser()
      
      if (!user) {
        toast.error("Usuário não autenticado")
        return
      }

      const formattedDate = format(selectedDate, "yyyy-MM-dd")

      await updateAppointment(appointment.id, user.id, {
        client_id: selectedClient,
        date: formattedDate,
        time: selectedTime,
        service: selectedService,
        notes: notes.trim() || undefined,
      })

      toast.success("Agendamento atualizado com sucesso!")
      onAppointmentUpdated()
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      toast.error("Erro ao atualizar agendamento. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  // Gerar horários disponíveis (8h às 18h)
  const timeSlots = React.useMemo(() => {
    const slots = []
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }, [])

  // Serviços disponíveis
  const services = [
    "Corte Masculino",
    "Corte + Barba",
    "Apenas Barba",
    "Corte Infantil",
    "Corte + Sobrancelha",
    "Corte + Barba + Sobrancelha",
    "Retoque",
    "Hidratação",
    "Outros"
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>
            Altere as informações do agendamento conforme necessário.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecionar data</span>}
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
              <Select value={selectedTime} onValueChange={setSelectedTime} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="service">Serviço *</Label>
              <Select value={selectedService} onValueChange={setSelectedService} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações adicionais (opcional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Agendamento'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}