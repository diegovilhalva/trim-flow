"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, PlusCircle, Edit } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  last_visit: string | null
  notes: string | null
}

interface ClientModalProps {
  client?: Client // If provided, modal is in edit mode
  onClientSaved?: () => void
  trigger?: React.ReactNode
}

export function ClientModal({ client, onClientSaved, trigger }: ClientModalProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  
  const isEditing = !!client
  
  // Form fields
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [lastVisitDate, setLastVisitDate] = React.useState<Date | undefined>(undefined)
  const [notes, setNotes] = React.useState("")

  // Form validation
  const [errors, setErrors] = React.useState<{
    name?: string
    phone?: string
    email?: string
  }>({})

  // Pre-populate fields when editing
  React.useEffect(() => {
    if (client && open) {
      setName(client.name || "")
      setPhone(client.phone || "")
      setEmail(client.email || "")
      setNotes(client.notes || "")
      
      // Parse last_visit date
      if (client.last_visit) {
        try {
          const date = parseISO(client.last_visit)
          setLastVisitDate(date)
        } catch (error) {
          console.error('Error parsing date:', error)
          setLastVisitDate(undefined)
        }
      } else {
        setLastVisitDate(undefined)
      }
    }
  }, [client, open])

  const formatPhoneNumber = (value: string) => {
    if (!value) return value
    const phoneNumber = value.replace(/\D/g, "")
    const phoneNumberLength = phoneNumber.length

    if (phoneNumberLength < 3) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`
    }
    if (phoneNumberLength < 11) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value)
    setPhone(formattedValue)
    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}

    // Validate required fields
    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!phone.trim()) {
      newErrors.phone = "Telefone é obrigatório"
    } else {
      // Validate phone format (should have at least 10 digits)
      const phoneDigits = phone.replace(/\D/g, "")
      if (phoneDigits.length < 10) {
        newErrors.phone = "Telefone deve ter pelo menos 10 dígitos"
      }
    }

    // Validate email format if provided
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = "Formato de email inválido"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setName("")
    setPhone("")
    setEmail("")
    setLastVisitDate(undefined)
    setNotes("")
    setErrors({})
  }

  const handleSaveClient = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error("Usuário não encontrado. Faça login novamente.")
      }

      // Prepare client data
      const clientData = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        last_visit: lastVisitDate ? format(lastVisitDate, "yyyy-MM-dd") : null,
        notes: notes.trim() || null,
      }

      if (isEditing) {
        // Update existing client
        const { error: updateError } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id)

        if (updateError) {
          throw updateError
        }

        toast.success("Cliente atualizado com sucesso!", {
          description: `Os dados de ${name} foram atualizados.`
        })
      } else {
        // Create new client
        const { error: insertError } = await supabase
          .from('clients')
          .insert([{ ...clientData, user_id: user.id }])

        if (insertError) {
          throw insertError
        }

        toast.success("Cliente cadastrado com sucesso!", {
          description: `${name} foi adicionado à sua lista de clientes.`
        })
      }

      // Reset form and close modal
      resetForm()
      setOpen(false)
      
      // Notify parent component to refresh list
      if (onClientSaved) {
        onClientSaved()
      }

    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} client:`, error)
      
      // Show error message
      let errorMessage = `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} cliente. Tente novamente.`
      
      if (error.message?.includes("duplicate key value")) {
        if (error.message.includes("email")) {
          errorMessage = "Este email já está cadastrado para outro cliente."
        } else {
          errorMessage = "Já existe um cliente com essas informações."
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} cliente`, {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !loading) {
      resetForm()
    }
    setOpen(isOpen)
  }

  // Default trigger for new client
  const defaultTrigger = (
    <Button size="sm">
      <PlusCircle className="mr-2 h-4 w-4" />
      Novo Cliente
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize os dados do cliente." 
              : "Preencha os detalhes para adicionar um novo cliente."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
              placeholder="Nome do cliente"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }))
                }
              }}
              className={errors.name ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              placeholder="(99) 99999-9999"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={15}
              className={errors.phone ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="cliente@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }))
                }
              }}
              className={errors.email ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lastVisitDate">Data da última visita</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !lastVisitDate && "text-muted-foreground",
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {lastVisitDate ? format(lastVisitDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={lastVisitDate}
                  onSelect={setLastVisitDate}
                  initialFocus
                  locale={ptBR}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Adicione anotações sobre o cliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveClient}
            disabled={loading}
          >
            {loading 
              ? (isEditing ? "Atualizando..." : "Salvando...") 
              : (isEditing ? "Atualizar cliente" : "Salvar cliente")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Export both the generic modal and a specific new client modal for backward compatibility
export function NewClientModal({ onClientAdded }: { onClientAdded?: () => void }) {
  return <ClientModal onClientSaved={onClientAdded} />
}
