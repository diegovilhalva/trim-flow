"use client"

import * as React from "react"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Pencil, Trash2, PlusCircle } from "lucide-react"

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

// Dados mockados para agendamentos
const allAppointments = [
  {
    id: "a1",
    date: "2024-07-15", // Hoje
    time: "10:00",
    clientName: "João Silva",
    service: "Corte Masculino",
    observations: "Cliente pontual.",
  },
  {
    id: "a2",
    date: "2024-07-15", // Hoje
    time: "11:30",
    clientName: "Maria Souza",
    service: "Corte Feminino e Hidratação",
    observations: "",
  },
  {
    id: "a3",
    date: "2024-07-15", // Hoje
    time: "14:00",
    clientName: "Pedro Santos",
    service: "Barba e Sobrancelha",
    observations: "Gosta de toalha quente.",
  },
  {
    id: "a4",
    date: "2024-07-16", // Amanhã
    time: "09:00",
    clientName: "Ana Costa",
    service: "Corte Masculino",
    observations: "Primeiro agendamento.",
  },
  {
    id: "a5",
    date: "2024-07-17", // Depois de amanhã
    time: "16:00",
    clientName: "Carlos Oliveira",
    service: "Corte e Barba",
    observations: "",
  },
]

export default function SchedulePage() {
  const userName = "João" // Placeholder for user name
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  // Filtra os agendamentos com base na data selecionada
  const filteredAppointments = React.useMemo(() => {
    if (!date) return []
    const formattedDate = format(date, "yyyy-MM-dd")
    return allAppointments.filter((appt) => appt.date === formattedDate)
  }, [date])

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
            <Button className="ml-auto sm:ml-0" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold">{appointment.clientName}</CardTitle>
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
                  {appointment.observations && (
                    <CardDescription className="text-sm text-muted-foreground mt-2">
                      Obs: {appointment.observations}
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
      </main>
    </SidebarInset>
  )
}
