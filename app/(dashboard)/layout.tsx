import type React from "react"
import { cookies } from "next/headers"
import { Inter } from "next/font/google"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"

import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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