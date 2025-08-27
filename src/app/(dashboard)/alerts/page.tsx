"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bell, Search, AlertTriangle, Clock, CheckCircle, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Alert {
 id: string
 contract_id: string
 alert_type: string
 alert_date: string
 message: string
 is_read: boolean
 created_at: string
 contracts: {
  title: string
  client_name: string
 }
}

const getAlertIcon = (type: string) => {
 switch (type) {
  case "expiration":
   return <AlertTriangle className="w-4 h-4 text-red-500" />
  case "renewal":
   return <Clock className="w-4 h-4 text-yellow-500" />
  case "payment":
   return <Calendar className="w-4 h-4 text-blue-500" />
  default:
   return <Bell className="w-4 h-4 text-gray-500" />
 }
}

const getAlertBadge = (type: string) => {
 switch (type) {
  case "expiration":
   return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencimento</Badge>
  case "renewal":
   return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Renovação</Badge>
  case "payment":
   return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pagamento</Badge>
  case "custom":
   return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Personalizado</Badge>
  default:
   return <Badge variant="secondary">Outro</Badge>
 }
}

export default function AlertsPage() {
 const [alerts, setAlerts] = useState<Alert[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState("")

 useEffect(() => {
  fetchAlerts()
 }, [])

 const fetchAlerts = async () => {
  const supabase = createClient()
  setIsLoading(true)

  try {
   const { data, error } = await supabase
    .from("contract_alerts")
    .select(`
          *,
          contracts (
            title,
            client_name
          )
        `)
    .order("alert_date", { ascending: true })

   if (error) throw error
   setAlerts(data || [])
  } catch (error) {
   console.error("Erro ao buscar alertas:", error)
  } finally {
   setIsLoading(false)
  }
 }

 const markAsRead = async (alertId: string) => {
  const supabase = createClient()

  try {
   const { error } = await supabase.from("contract_alerts").update({ is_read: true }).eq("id", alertId)

   if (error) throw error

   setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, is_read: true } : alert)))
  } catch (error) {
   console.error("Erro ao marcar alerta como lido:", error)
  }
 }

 const filteredAlerts = alerts.filter(
  (alert) =>
   alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
   alert.contracts?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
   alert.contracts?.client_name.toLowerCase().includes(searchTerm.toLowerCase()),
 )

 const unreadCount = alerts.filter((alert) => !alert.is_read).length

 if (isLoading) {
  return (
   <div className="flex flex-col h-full">
    <div className="flex items-center justify-between p-6 border-b border-border">
     <div>
      <h1 className="text-2xl font-semibold text-foreground">Alertas</h1>
      <p className="text-muted-foreground">Notificações e lembretes importantes</p>
     </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
     <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando alertas...</p>
     </div>
    </div>
   </div>
  )
 }

 return (
  <div className="flex flex-col h-full">
   {/* Header */}
   <div className="flex items-center justify-between p-6 border-b border-border">
    <div>
     <h1 className="text-2xl font-semibold text-foreground">Alertas</h1>
     <p className="text-muted-foreground">
      Notificações e lembretes importantes
      {unreadCount > 0 && (
       <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-100">{unreadCount} não lidos</Badge>
      )}
     </p>
    </div>
    {unreadCount > 0 && (
     <Button
      variant="outline"
      onClick={() => {
       alerts.forEach((alert) => {
        if (!alert.is_read) markAsRead(alert.id)
       })
      }}
     >
      <CheckCircle className="w-4 h-4 mr-2" />
      Marcar Todos como Lidos
     </Button>
    )}
   </div>

   {/* Search */}
   <div className="flex items-center gap-4 p-6 border-b border-border">
    <div className="relative flex-1 max-w-sm">
     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
     <Input
      placeholder="Buscar alertas..."
      className="pl-9"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
     />
    </div>
   </div>

   {/* Content */}
   <div className="flex-1 overflow-auto p-6">
    {filteredAlerts.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-12 text-center">
      <Bell className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
       {alerts.length === 0 ? "Nenhum alerta encontrado" : "Nenhum resultado encontrado"}
      </h3>
      <p className="text-muted-foreground">
       {alerts.length === 0 ? "Você não possui alertas no momento" : "Tente ajustar os termos de busca"}
      </p>
     </div>
    ) : (
     <div className="space-y-4">
      {filteredAlerts.map((alert) => (
       <Card
        key={alert.id}
        className={`hover:shadow-md transition-shadow cursor-pointer ${!alert.is_read ? "border-l-4 border-l-primary bg-primary/5" : ""
         }`}
        onClick={() => !alert.is_read && markAsRead(alert.id)}
       >
        <CardContent className="p-6">
         <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.alert_type)}</div>
          <div className="flex-1">
           <div className="flex items-center gap-3 mb-2">
            {getAlertBadge(alert.alert_type)}
            {!alert.is_read && (
             <Badge variant="outline" className="text-xs">
              Novo
             </Badge>
            )}
           </div>

           <h3 className="font-medium text-foreground mb-1">{alert.message}</h3>

           {alert.contracts && (
            <p className="text-sm text-muted-foreground mb-2">
             Contrato: {alert.contracts.title} - {alert.contracts.client_name}
            </p>
           )}

           <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Data do alerta: {new Date(alert.alert_date).toLocaleDateString("pt-BR")}</span>
            <span>Criado em: {new Date(alert.created_at).toLocaleDateString("pt-BR")}</span>
           </div>
          </div>
         </div>
        </CardContent>
       </Card>
      ))}
     </div>
    )}
   </div>
  </div>
 )
}
