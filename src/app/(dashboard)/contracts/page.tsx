"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Plus, Search, MoreHorizontal, Download, Edit, Trash2, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Contract {
 id: string
 title: string
 description: string
 contract_type: string
 client_name: string
 client_email: string
 contract_value: number
 start_date: string
 end_date: string
 status: string
 file_url: string
 file_name: string
 created_at: string
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
  case "cancelled":
   return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>
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

export default function ContractsPage() {
 const [contracts, setContracts] = useState<Contract[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState("")
 const [statusFilter, setStatusFilter] = useState("all")
 const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

 // Form states
 const [formData, setFormData] = useState({
  title: "",
  description: "",
  contract_type: "",
  client_name: "",
  client_email: "",
  contract_value: "",
  start_date: "",
  end_date: "",
  status: "draft",
 })

 useEffect(() => {
  fetchContracts()
 }, [])

 const fetchContracts = async () => {
  const supabase = createClient()
  setIsLoading(true)

  try {
   const { data, error } = await supabase.from("contracts").select("*").order("created_at", { ascending: false })

   if (error) throw error
   setContracts(data || [])
  } catch (error) {
   console.error("Erro ao buscar contratos:", error)
  } finally {
   setIsLoading(false)
  }
 }

 const handleCreateContract = async (e: React.FormEvent) => {
  e.preventDefault()
  const supabase = createClient()

  try {
   const {
    data: { user },
   } = await supabase.auth.getUser()
   if (!user) throw new Error("Usuário não autenticado")

   const { error } = await supabase.from("contracts").insert({
    ...formData,
    contract_value: Number.parseFloat(formData.contract_value) || 0,
    user_id: user.id,
   })

   if (error) throw error

   setIsCreateDialogOpen(false)
   setFormData({
    title: "",
    description: "",
    contract_type: "",
    client_name: "",
    client_email: "",
    contract_value: "",
    start_date: "",
    end_date: "",
    status: "draft",
   })
   fetchContracts()
  } catch (error) {
   console.error("Erro ao criar contrato:", error)
  }
 }

 const filteredContracts = contracts.filter((contract) => {
  const matchesSearch =
   contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
   contract.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesStatus = statusFilter === "all" || contract.status === statusFilter
  return matchesSearch && matchesStatus
 })

 if (isLoading) {
  return (
   <div className="flex flex-col h-full">
    <div className="flex items-center justify-between p-6 border-b border-border">
     <div>
      <h1 className="text-2xl font-semibold text-foreground">Contratos</h1>
      <p className="text-muted-foreground">Gerencie todos os seus contratos</p>
     </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
     <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando contratos...</p>
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
     <h1 className="text-2xl font-semibold text-foreground">Contratos</h1>
     <p className="text-muted-foreground">Gerencie todos os seus contratos</p>
    </div>
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
     <DialogTrigger asChild>
      <Button>
       <Plus className="w-4 h-4 mr-2" />
       Novo Contrato
      </Button>
     </DialogTrigger>
     <DialogContent className="max-w-2xl">
      <DialogHeader>
       <DialogTitle>Criar Novo Contrato</DialogTitle>
       <DialogDescription>Preencha as informações básicas do contrato</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleCreateContract} className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
         <Label htmlFor="title">Título do Contrato</Label>
         <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
         />
        </div>
        <div className="space-y-2">
         <Label htmlFor="contract_type">Tipo de Contrato</Label>
         <Select
          value={formData.contract_type}
          onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
         >
          <SelectTrigger>
           <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="service">Prestação de Serviços</SelectItem>
           <SelectItem value="supply">Fornecimento</SelectItem>
           <SelectItem value="partnership">Parceria</SelectItem>
           <SelectItem value="confidentiality">Confidencialidade</SelectItem>
           <SelectItem value="employment">Trabalho</SelectItem>
           <SelectItem value="other">Outro</SelectItem>
          </SelectContent>
         </Select>
        </div>
       </div>

       <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
         id="description"
         value={formData.description}
         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
         rows={3}
        />
       </div>

       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
         <Label htmlFor="client_name">Nome do Cliente</Label>
         <Input
          id="client_name"
          value={formData.client_name}
          onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
          required
         />
        </div>
        <div className="space-y-2">
         <Label htmlFor="client_email">Email do Cliente</Label>
         <Input
          id="client_email"
          type="email"
          value={formData.client_email}
          onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
         />
        </div>
       </div>

       <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
         <Label htmlFor="contract_value">Valor (R$)</Label>
         <Input
          id="contract_value"
          type="number"
          step="0.01"
          value={formData.contract_value}
          onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
         />
        </div>
        <div className="space-y-2">
         <Label htmlFor="start_date">Data de Início</Label>
         <Input
          id="start_date"
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
         />
        </div>
        <div className="space-y-2">
         <Label htmlFor="end_date">Data de Término</Label>
         <Input
          id="end_date"
          type="date"
          value={formData.end_date}
          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
         />
        </div>
       </div>

       <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
         Cancelar
        </Button>
        <Button type="submit">Criar Contrato</Button>
       </div>
      </form>
     </DialogContent>
    </Dialog>
   </div>

   {/* Filters */}
   <div className="flex items-center gap-4 p-6 border-b border-border">
    <div className="relative flex-1 max-w-sm">
     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
     <Input
      placeholder="Buscar contratos..."
      className="pl-9"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
     />
    </div>
    <Select value={statusFilter} onValueChange={setStatusFilter}>
     <SelectTrigger className="w-48">
      <SelectValue />
     </SelectTrigger>
     <SelectContent>
      <SelectItem value="all">Todos os Status</SelectItem>
      <SelectItem value="draft">Rascunho</SelectItem>
      <SelectItem value="active">Ativo</SelectItem>
      <SelectItem value="pending">Pendente</SelectItem>
      <SelectItem value="expired">Vencido</SelectItem>
      <SelectItem value="cancelled">Cancelado</SelectItem>
     </SelectContent>
    </Select>
   </div>

   {/* Content */}
   <div className="flex-1 overflow-auto p-6">
    {filteredContracts.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
       {contracts.length === 0 ? "Nenhum contrato encontrado" : "Nenhum resultado encontrado"}
      </h3>
      <p className="text-muted-foreground mb-4">
       {contracts.length === 0 ? "Comece criando seu primeiro contrato" : "Tente ajustar os filtros de busca"}
      </p>
      {contracts.length === 0 && (
       <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Criar Primeiro Contrato
       </Button>
      )}
     </div>
    ) : (
     <div className="grid gap-4">
      {filteredContracts.map((contract) => (
       <Card key={contract.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
         <div className="flex items-start justify-between">
          <div className="flex-1">
           <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{contract.title}</h3>
            {getStatusBadge(contract.status)}
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
            <div>
             <span className="font-medium">Cliente:</span>
             <p>{contract.client_name}</p>
            </div>
            <div>
             <span className="font-medium">Tipo:</span>
             <p>{contract.contract_type.replace("_", " ")}</p>
            </div>
            {contract.contract_value > 0 && (
             <div>
              <span className="font-medium">Valor:</span>
              <p>{formatCurrency(contract.contract_value)}</p>
             </div>
            )}
            {contract.end_date && (
             <div>
              <span className="font-medium">Vencimento:</span>
              <p>{formatDate(contract.end_date)}</p>
             </div>
            )}
           </div>

           {contract.description && <p className="text-sm text-muted-foreground">{contract.description}</p>}
          </div>

          <DropdownMenu>
           <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
             <MoreHorizontal className="w-4 h-4" />
            </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
            <DropdownMenuItem>
             <Eye className="w-4 h-4 mr-2" />
             Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem>
             <Edit className="w-4 h-4 mr-2" />
             Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
             <Download className="w-4 h-4 mr-2" />
             Baixar PDF
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
             <Trash2 className="w-4 h-4 mr-2" />
             Excluir
            </DropdownMenuItem>
           </DropdownMenuContent>
          </DropdownMenu>
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
