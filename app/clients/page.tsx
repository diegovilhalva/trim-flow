"use client"

import * as React from "react"
import Image from "next/image"
import { Search, Pencil, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { NewClientModal, ClientModal } from "@/components/new-client-modal"
import { supabase } from "@/lib/supabase"

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  last_visit: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface DeleteClientDialogProps {
  client: Client
  onClientDeleted: () => void
}

function DeleteClientDialog({ client, onClientDeleted }: DeleteClientDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleDeleteClient = async () => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id)

      if (error) {
        throw error
      }

      toast.success("Cliente excluído com sucesso!", {
        description: `${client.name} foi removido da sua lista.`
      })

      setOpen(false)
      onClientDeleted()

    } catch (error: any) {
      console.error('Error deleting client:', error)
      toast.error("Erro ao excluir cliente", {
        description: error.message || "Tente novamente em alguns instantes."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Excluir cliente">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Excluir</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o cliente <strong>"{client.name}"</strong>?
            <br />
            Esta ação não pode ser desfeita. Todos os dados do cliente serão removidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteClient}
            disabled={loading}
                                    className="bg-destructive hover:bg-destructive/90 focus:ring-destructive"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Cliente
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = React.useState<Client[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [refreshing, setRefreshing] = React.useState(false)

  // Filter clients based on search term
  const filteredClients = React.useMemo(() => {
    if (!searchTerm.trim()) return clients
    
    const term = searchTerm.toLowerCase()
    return clients.filter(client => 
      client.name.toLowerCase().includes(term) ||
      client.phone?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term)
    )
  }, [clients, searchTerm])

  const fetchClients = React.useCallback(async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error("Erro de autenticação", {
          description: "Faça login novamente para continuar."
        })
        return
      }

      // Fetch clients for the current user
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setClients(data || [])
      
    } catch (error: any) {
      console.error('Error fetching clients:', error)
      toast.error("Erro ao carregar clientes", {
        description: error.message || "Tente novamente em alguns instantes."
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchClients()
    setRefreshing(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return "-"
    return phone
  }

  // Load clients on component mount
  React.useEffect(() => {
    fetchClients()
  }, [fetchClients])

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
          <div>
            <h2 className="font-semibold text-xl md:text-2xl">Lista de Clientes</h2>
            <p className="text-muted-foreground text-sm">
              {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <NewClientModal onClientAdded={fetchClients} />
          </div>
        </div>
        
        <div className="relative w-full max-w-md">
          <Label htmlFor="search-client" className="sr-only">
            Buscar cliente por nome, telefone ou email...
          </Label>
          <Input 
            id="search-client" 
            type="text" 
            placeholder="Buscar cliente por nome, telefone ou email..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Última Visita</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Carregando clientes...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm ? (
                      <div>
                        <p className="text-muted-foreground">
                          Nenhum cliente encontrado para "{searchTerm}"
                        </p>
                        <Button 
                          variant="link" 
                          onClick={() => setSearchTerm("")}
                          className="text-sm"
                        >
                          Limpar busca
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground mb-2">
                          Nenhum cliente cadastrado ainda
                        </p>
                        <NewClientModal onClientAdded={fetchClients} />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{formatPhone(client.phone)}</TableCell>
                    <TableCell>
                      {client.email ? (
                        <a 
                          href={`mailto:${client.email}`}
                          className="text-primary hover:underline"
                        >
                          {client.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {client.last_visit ? (
                        <Badge variant="outline">
                          {formatDate(client.last_visit)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {client.notes ? (
                        <span className="text-sm truncate block" title={client.notes}>
                          {client.notes}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <ClientModal
                        client={client}
                        onClientSaved={fetchClients}
                        trigger={
                          <Button variant="ghost" size="icon" title="Editar cliente">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        }
                      />
                      <DeleteClientDialog
                        client={client}
                        onClientDeleted={fetchClients}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </SidebarInset>
  )
}
