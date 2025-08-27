"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bell, Shield, Database, Save, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Profile {
 id: string
 first_name: string
 last_name: string
 company: string
 phone: string
}

export default function SettingsPage() {
 const [profile, setProfile] = useState<Profile | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [isSaving, setIsSaving] = useState(false)
 const [user, setUser] = useState<any>(null)
 const router = useRouter()

 const [notifications, setNotifications] = useState({
  email_alerts: true,
  contract_expiry: true,
  renewal_reminders: true,
  system_updates: false,
 })

 useEffect(() => {
  fetchUserData()
 }, [])

 const fetchUserData = async () => {
  const supabase = createClient()
  setIsLoading(true)

  try {
   const {
    data: { user },
    error: userError,
   } = await supabase.auth.getUser()
   if (userError) throw userError

   setUser(user)

   if (user) {
    const { data: profileData, error: profileError } = await supabase
     .from("profiles")
     .select("*")
     .eq("id", user.id)
     .single()

    if (profileError && profileError.code !== "PGRST116") {
     throw profileError
    }

    setProfile(
     profileData || {
      id: user.id,
      first_name: "",
      last_name: "",
      company: "",
      phone: "",
     },
    )
   }
  } catch (error) {
   console.error("Erro ao buscar dados do usuário:", error)
  } finally {
   setIsLoading(false)
  }
 }

 const handleSaveProfile = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!profile) return

  const supabase = createClient()
  setIsSaving(true)

  try {
   const { error } = await supabase.from("profiles").upsert({
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    company: profile.company,
    phone: profile.phone,
   })

   if (error) throw error

   console.log("Perfil salvo com sucesso!")
  } catch (error) {
   console.error("Erro ao salvar perfil:", error)
  } finally {
   setIsSaving(false)
  }
 }

 const handleSignOut = async () => {
  const supabase = createClient()
  await supabase.auth.signOut()
  router.push("/auth/login")
 }

 if (isLoading) {
  return (
   <div className="flex flex-col h-full">
    <div className="flex items-center justify-between p-6 border-b border-border">
     <div>
      <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
      <p className="text-muted-foreground">Gerencie suas preferências e dados pessoais</p>
     </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
     <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando configurações...</p>
     </div>
    </div>
   </div>
  )
 }

 return (
  <div className="flex flex-col h-full">
   <div className="flex items-center justify-between p-6 border-b border-border">
    <div>
     <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
     <p className="text-muted-foreground">Gerencie suas preferências e dados pessoais</p>
    </div>
    <Button variant="outline" onClick={handleSignOut}>
     <LogOut className="w-4 h-4 mr-2" />
     Sair
    </Button>
   </div>

   <div className="flex-1 overflow-auto p-6">
    <div className="max-w-4xl mx-auto space-y-6">
     <Card>
      <CardHeader>
       <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
         <AvatarImage src="/placeholder.svg?height=64&width=64" />
         <AvatarFallback className="text-lg">
          {profile?.first_name?.[0]}
          {profile?.last_name?.[0]}
         </AvatarFallback>
        </Avatar>
        <div>
         <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Perfil Pessoal
         </CardTitle>
         <CardDescription>Atualize suas informações pessoais</CardDescription>
        </div>
       </div>
      </CardHeader>
      <CardContent>
       <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
          <Label htmlFor="first_name">Nome</Label>
          <Input
           id="first_name"
           value={profile?.first_name || ""}
           onChange={(e) => setProfile((prev) => (prev ? { ...prev, first_name: e.target.value } : null))}
          />
         </div>
         <div className="space-y-2">
          <Label htmlFor="last_name">Sobrenome</Label>
          <Input
           id="last_name"
           value={profile?.last_name || ""}
           onChange={(e) => setProfile((prev) => (prev ? { ...prev, last_name: e.target.value } : null))}
          />
         </div>
        </div>

        <div className="space-y-2">
         <Label htmlFor="company">Empresa</Label>
         <Input
          id="company"
          value={profile?.company || ""}
          onChange={(e) => setProfile((prev) => (prev ? { ...prev, company: e.target.value } : null))}
         />
        </div>

        <div className="space-y-2">
         <Label htmlFor="phone">Telefone</Label>
         <Input
          id="phone"
          value={profile?.phone || ""}
          onChange={(e) => setProfile((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
         />
        </div>

        <div className="space-y-2">
         <Label htmlFor="email">Email</Label>
         <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
         <p className="text-xs text-muted-foreground">
          O email não pode ser alterado. Entre em contato com o suporte se necessário.
         </p>
        </div>

        <Button type="submit" disabled={isSaving}>
         <Save className="w-4 h-4 mr-2" />
         {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
       </form>
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Notificações
       </CardTitle>
       <CardDescription>Configure como você deseja receber alertas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
       <div className="flex items-center justify-between">
        <div>
         <Label htmlFor="email_alerts">Alertas por Email</Label>
         <p className="text-sm text-muted-foreground">Receber notificações por email</p>
        </div>
        <Switch
         id="email_alerts"
         checked={notifications.email_alerts}
         onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email_alerts: checked }))}
        />
       </div>

       <Separator />

       <div className="flex items-center justify-between">
        <div>
         <Label htmlFor="contract_expiry">Vencimento de Contratos</Label>
         <p className="text-sm text-muted-foreground">Alertas sobre contratos próximos do vencimento</p>
        </div>
        <Switch
         id="contract_expiry"
         checked={notifications.contract_expiry}
         onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, contract_expiry: checked }))}
        />
       </div>

       <Separator />

       <div className="flex items-center justify-between">
        <div>
         <Label htmlFor="renewal_reminders">Lembretes de Renovação</Label>
         <p className="text-sm text-muted-foreground">Notificações sobre renovações necessárias</p>
        </div>
        <Switch
         id="renewal_reminders"
         checked={notifications.renewal_reminders}
         onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, renewal_reminders: checked }))}
        />
       </div>

       <Separator />

       <div className="flex items-center justify-between">
        <div>
         <Label htmlFor="system_updates">Atualizações do Sistema</Label>
         <p className="text-sm text-muted-foreground">Notificações sobre novas funcionalidades</p>
        </div>
        <Switch
         id="system_updates"
         checked={notifications.system_updates}
         onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, system_updates: checked }))}
        />
       </div>
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Segurança
       </CardTitle>
       <CardDescription>Configurações de segurança da conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
       <div className="flex items-center justify-between">
        <div>
         <Label>Senha</Label>
         <p className="text-sm text-muted-foreground">Última alteração há 30 dias</p>
        </div>
        <Button variant="outline" size="sm">
         Alterar Senha
        </Button>
       </div>

       <Separator />

       <div className="flex items-center justify-between">
        <div>
         <Label>Autenticação de Dois Fatores</Label>
         <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
        </div>
        <Badge variant="outline">Em Breve</Badge>
       </div>
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Database className="w-5 h-5" />
        Dados e Privacidade
       </CardTitle>
       <CardDescription>Gerencie seus dados e configurações de privacidade</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
       <div className="flex items-center justify-between">
        <div>
         <Label>Exportar Dados</Label>
         <p className="text-sm text-muted-foreground">Baixe uma cópia de todos os seus dados</p>
        </div>
        <Button variant="outline" size="sm">
         Exportar
        </Button>
       </div>

       <Separator />

       <div className="flex items-center justify-between">
        <div>
         <Label>Excluir Conta</Label>
         <p className="text-sm text-muted-foreground">Remover permanentemente sua conta e dados</p>
        </div>
        <Button variant="destructive" size="sm">
         Excluir Conta
        </Button>
       </div>
      </CardContent>
     </Card>
    </div>
   </div>
  </div>
 )
}
