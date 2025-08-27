import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const supabase = await createClient()

 const {
  data: { user },
  error,
 } = await supabase.auth.getUser()

 if (error || !user) {
  redirect("/auth/login")
 }

 return (
  <div className="flex h-screen bg-background">
   <Sidebar />
   <main className="flex-1 overflow-hidden">{children}</main>
  </div>
 )
}
