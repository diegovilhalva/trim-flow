"use client"

import Image from "next/image"
import { Search, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NewClientModal } from "@/components/new-client-modal" // Importar o novo modal

// Dados mockados para a tabela de clientes
const clients = [
  {
    id: "1",
    name: "João Silva",
    phone: "(11) 98765-4321",
    lastCut: "2024-07-10",
    observations: "Gosta de corte degradê.",
  },
  {
    id: "2",
    name: "Maria Souza",
    phone: "(11) 91234-5678",
    lastCut: "2024-07-05",
    observations: "Prefere agendamentos pela manhã.",
  },
  {
    id: "3",
    name: "Pedro Santos",
    phone: "(11) 99876-1234",
    lastCut: "2024-07-12",
    observations: "Cliente novo, veio por indicação.",
  },
  {
    id: "4",
    name: "Ana Costa",
    phone: "(11) 97654-3210",
    lastCut: "2024-06-28",
    observations: "Sempre faz barba e cabelo.",
  },
  {
    id: "5",
    name: "Carlos Oliveira",
    phone: "(11) 96543-2109",
    lastCut: "2024-07-01",
    observations: "Não gosta de esperar.",
  },
]

export default function ClientsPage() {
  const userName = "João" // Placeholder for user name

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Clientes</h1>
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
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl md:text-2xl">Lista de Clientes</h2>
          <NewClientModal /> {/* Usar o componente do modal aqui */}
        </div>
        <div className="relative w-full max-w-md">
          <Label htmlFor="search-client" className="sr-only">
            Buscar cliente por nome...
          </Label>
          <Input id="search-client" type="text" placeholder="Buscar cliente por nome..." className="pl-8" />
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Último Corte</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.lastCut}</TableCell>
                  <TableCell>{client.observations}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </SidebarInset>
  )
}
