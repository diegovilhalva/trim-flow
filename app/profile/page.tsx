"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function ProfilePage() {
  const userName = "João" // Placeholder for user name

  // Dados mockados do usuário
  const [fullName, setFullName] = useState("João Silva")
  const [email, setEmail] = useState("joao.silva@example.com")
  const [phone, setPhone] = useState("(11) 98765-4321")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

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
  }

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(false) // Resetar mensagem de sucesso

    // Simulação de validação e salvamento
    if (newPassword && newPassword !== confirmNewPassword) {
      alert("A nova senha e a confirmação de senha não coincidem.")
      return
    }
    if (newPassword && !currentPassword) {
      alert("Por favor, insira sua senha atual para alterar a senha.")
      return
    }

    // Em um cenário real, você enviaria os dados atualizados para o backend
    console.log("Dados do perfil atualizados:", {
      fullName,
      email,
      phone,
      newPassword: newPassword || "Não alterada",
    })

    // Simular sucesso
    setSaveSuccess(true)
    // Limpar campos de senha após salvar
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")

    // Opcional: Esconder mensagem de sucesso após alguns segundos
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleLogout = () => {
    // Lógica para sair da conta
    alert("Saindo da conta... (Simulado)")
    // Redirecionar para a página de login
    // window.location.href = "/login";
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Meu Perfil</h1>
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
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Meu Perfil</CardTitle>
            <CardDescription>Atualize suas informações pessoais e de segurança.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveChanges} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="text" value={phone} onChange={handlePhoneChange} maxLength={15} required />
              </div>
              <Separator className="my-4" />
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmNewPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>
              {saveSuccess && <p className="text-sm text-green-500 text-center">Alterações salvas com sucesso!</p>}
              <Button type="submit" className="w-full">
                Salvar alterações
              </Button>
            </form>
          </CardContent>
        </Card>
        <Button variant="outline" className="mt-8 w-full max-w-md bg-transparent" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair da conta
        </Button>
      </main>
    </SidebarInset>
  )
}
