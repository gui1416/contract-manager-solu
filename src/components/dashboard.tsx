"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
 FileText,
 AlertTriangle,
 CheckCircle,
 Clock,
 Plus,
 Download,
 Search,
 Filter,
 MoreHorizontal,
 DollarSign,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Contract {
 id: string
 title: string
 client_name: string
 contract_type: string
 contract_value: number
 end_date: string
 status: string
 created_at: string
}

interface DashboardStats {
 totalContracts: number
 activeContracts: number
 expiringContracts: number
 pendingContracts: number
 totalValue: number
}

const getStatusBadge = (status: string) => {
 switch (status) {
  case "active":
   return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
  case "pending":
   return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>
  case "expired":
   return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vencido</Badge>
  case "draft":
   return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Rascunho</Badge>
  default:
   return <Badge variant="secondary">Desconhecido</Badge>
 }
}

const formatCurrency = (value: number) => {
 return new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
 }).format(value)
}

const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString("pt-BR")
}

export function Dashboard() {
 const [contracts, setContracts] = useState<Contract[]>([])
 const [stats, setStats] = useState<DashboardStats>({
  totalContracts: 0,
  activeContracts: 0,
  expiringContracts: 0,
  pendingContracts: 0,
  totalValue: 0,
 })
 const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
  fetchDashboardData()
 }, [])

 const fetchDashboardData = async () => {
  const supabase = createClient()
  setIsLoading(true)

  try {
   const { data: contractsData, error } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

   if (error) throw error

   const contracts = contractsData || []
   setContracts(contracts)

   // Calculate stats
   const now = new Date()
   const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

   const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter((c) => c.status === "active").length,
    expiringContracts: contracts.filter((c) => {
     if (!c.end_date) return false
     const endDate = new Date(c.end_date)
     return endDate <= thirtyDaysFromNow && endDate >= now
    }).length,
    pendingContracts: contracts.filter((c) => c.status === "pending").length,
    totalValue: contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0),
   }

   setStats(stats)
  } catch (error) {
   console.error("Erro ao buscar dados do dashboard:", error)
  } finally {
   setIsLoading(false)
  }
 }

 if (isLoading) {
  return (
   <div className="flex flex-col h-full">
    <div className="flex items-center justify-between p-6 border-b border-border">
     <div>
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground">Visão geral dos seus contratos</p>
     </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
     <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando dashboard...</p>
     </div>
    </div>
   </div>
  )
 }

 const statsCards = [
  {
   title: "Total de Contratos",
   value: stats.totalContracts.toString(),
   description: "Contratos cadastrados",
   icon: FileText,
   trend: "+12% este mês",
  },
  {
   title: "Vencendo em 30 dias",
   value: stats.expiringContracts.toString(),
   description: "Requer atenção",
   icon: AlertTriangle,
   trend: stats.expiringContracts > 0 ? `${stats.expiringContracts} críticos` : "Nenhum crítico",
  },
  {
   title: "Contratos Ativos",
   value: stats.activeContracts.toString(),
   description: "Em vigência",
   icon: CheckCircle,
   trend: "+3 este mês",
  },
  {
   title: "Aguardando Assinatura",
   value: stats.pendingContracts.toString(),
   description: "Pendentes",
   icon: Clock,
   trend: stats.pendingContracts > 0 ? `${stats.pendingContracts} urgentes` : "Nenhum pendente",
  },
 ]

 return (
  <div className="flex flex-col h-full">
   {/* Header */}
   <div className="flex items-center justify-between p-6 border-b border-border">
    <div>
     <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
     <p className="text-muted-foreground">Visão geral dos seus contratos</p>
    </div>
    <div className="flex items-center gap-3">
     <Button variant="outline" size="sm">
      <Download className="w-4 h-4 mr-2" />
      Exportar Dados
     </Button>
     <Link href="/contracts">
      <Button size="sm">
       <Plus className="w-4 h-4 mr-2" />
       Novo Contrato
      </Button>
     </Link>
    </div>
   </div>

   {/* Content */}
   <div className="flex-1 overflow-auto p-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
     {statsCards.map((stat, index) => (
      <Card key={index}>
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
        <stat.icon className="w-4 h-4 text-muted-foreground" />
       </CardHeader>
       <CardContent>
        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
        <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
       </CardContent>
      </Card>
     ))}
    </div>

    {/* Value Summary */}
    {stats.totalValue > 0 && (
     <Card className="mb-8">
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <DollarSign className="w-5 h-5" />
        Valor Total dos Contratos
       </CardTitle>
      </CardHeader>
      <CardContent>
       <div className="text-3xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</div>
       <p className="text-sm text-muted-foreground mt-1">Soma de todos os contratos ativos</p>
      </CardContent>
     </Card>
    )}

    {/* Recent Contracts */}
    <Card>
     <CardHeader>
      <div className="flex items-center justify-between">
       <div>
        <CardTitle>Contratos Recentes</CardTitle>
        <CardDescription>Seus últimos contratos cadastrados</CardDescription>
       </div>
       <div className="flex items-center gap-2">
        <div className="relative">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
         <Input placeholder="Buscar contratos..." className="pl-9 w-64" />
        </div>
        <Button variant="outline" size="sm">
         <Filter className="w-4 h-4 mr-2" />
         Filtros
        </Button>
       </div>
      </div>
     </CardHeader>
     <CardContent>
      {contracts.length === 0 ? (
       <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Nenhum contrato encontrado</h3>
        <p className="text-muted-foreground mb-4">Comece criando seu primeiro contrato</p>
        <Link href="/contracts">
         <Button>
          <Plus className="w-4 h-4 mr-2" />
          Criar Primeiro Contrato
         </Button>
        </Link>
       </div>
      ) : (
       <div className="space-y-4">
        {contracts.map((contract) => (
         <div
          key={contract.id}
          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
         >
          <div className="flex items-center gap-4">
           <Avatar className="w-10 h-10">
            <AvatarFallback>
             <FileText className="w-5 h-5" />
            </AvatarFallback>
           </Avatar>
           <div className="space-y-1">
            <h4 className="font-medium text-foreground">{contract.title}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <span>{contract.client_name}</span>
             <span>•</span>
             <span>{contract.contract_type.replace("_", " ")}</span>
            </div>
           </div>
          </div>
          <div className="flex items-center gap-4">
           <div className="text-right">
            {contract.contract_value > 0 && (
             <p className="font-medium text-foreground">{formatCurrency(contract.contract_value)}</p>
            )}
            {contract.end_date && (
             <p className="text-sm text-muted-foreground">Vence em {formatDate(contract.end_date)}</p>
            )}
           </div>
           {getStatusBadge(contract.status)}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
             </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
             <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
             <DropdownMenuItem>Editar</DropdownMenuItem>
             <DropdownMenuItem>Baixar PDF</DropdownMenuItem>
             <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
            </DropdownMenuContent>
           </DropdownMenu>
          </div>
         </div>
        ))}
        <div className="pt-4 text-center">
         <Link href="/contracts">
          <Button variant="outline">Ver Todos os Contratos</Button>
         </Link>
        </div>
       </div>
      )}
     </CardContent>
    </Card>
   </div>
  </div>
 )
}
