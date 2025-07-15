import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TrimFlow Dashboard",
  description: "Dashboard para o CRM de barbearias TrimFlow",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          {children}
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  )
}
