"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
 DialogFooter,
 DialogClose,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Plus, Search, MoreHorizontal, Download, Edit, Trash2, Eye, Upload } from "lucide-react"
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
 if (!dateString) return "N/A"
 const date = new Date(dateString)
 const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000)
 return adjustedDate.toLocaleDateString("pt-BR")
}

export default function ContractsPage() {
 const [contracts, setContracts] = useState<Contract[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState("")
 const [statusFilter, setStatusFilter] = useState("all")

 const [dialogOpen, setDialogOpen] = useState(false)
 const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
 const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
 const [formData, setFormData] = useState<Partial<Contract>>({})
 const [fileToUpload, setFileToUpload] = useState<File | null>(null)
 const fileInputRef = useRef<HTMLInputElement>(null)

 const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

 const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false)
 const [contractToDelete, setContractToDelete] = useState<Contract | null>(null)

 const supabase = createClient()

 useEffect(() => {
  fetchContracts()
 }, [])

 const fetchContracts = async () => {
  setIsLoading(true)
  try {
   const { data, error } = await supabase.from("contracts").select("*").order("created_at", { ascending: false })
   if (error) throw error
   setContracts(data || [])
  } catch (error) {
   console.error("Erro ao buscar contratos:", error)
   setFeedbackMessage({ type: 'error', text: 'Falha ao carregar contratos.' })
  } finally {
   setIsLoading(false)
  }
 }

 const handleOpenDialog = (mode: "create" | "edit", contract?: Contract) => {
  setDialogMode(mode)
  setFeedbackMessage(null)
  if (mode === 'edit' && contract) {
   setSelectedContract(contract)
   setFormData(contract)
  } else {
   setSelectedContract(null)
   setFormData({
    title: "",
    description: "",
    contract_type: "service",
    client_name: "",
    client_email: "",
    contract_value: 0,
    start_date: "",
    end_date: "",
    status: "draft",
   })
  }
  setFileToUpload(null)
  setDialogOpen(true)
 }

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
   setFileToUpload(e.target.files[0])
  }
 }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setFeedbackMessage(null)

  try {
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) throw new Error("Usuário não autenticado")

   let file_url = formData.file_url || null
   let file_name = formData.file_name || null

   if (fileToUpload) {
    const filePath = `${user.id}/${Date.now()}_${fileToUpload.name}`
    const { error: uploadError } = await supabase.storage.from('contracts').upload(filePath, fileToUpload)
    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage.from('contracts').getPublicUrl(filePath)
    file_url = publicUrlData.publicUrl
    file_name = fileToUpload.name
   }

   const contractData = {
    ...formData,
    file_url,
    file_name,
    user_id: user.id,
    contract_value: Number(formData.contract_value) || 0,
    updated_at: new Date().toISOString()
   }

   if (dialogMode === 'create') {
    const { error } = await supabase.from("contracts").insert(contractData)
    if (error) throw error
    setFeedbackMessage({ type: 'success', text: 'Contrato criado com sucesso!' })
   } else if (selectedContract) {
    const { error } = await supabase.from("contracts").update(contractData).eq('id', selectedContract.id)
    if (error) throw error
    setFeedbackMessage({ type: 'success', text: 'Contrato atualizado com sucesso!' })
   }

   setDialogOpen(false)
   fetchContracts()
  } catch (error: any) {
   console.error("Erro ao salvar contrato:", error)
   setFeedbackMessage({ type: 'error', text: `Erro ao salvar contrato: ${error.message}` })
  }
 }

 const handleDeleteContract = async () => {
  if (!contractToDelete) return

  try {
   if (contractToDelete.file_url) {
    const filePath = new URL(contractToDelete.file_url).pathname.split('/contracts/')[1]
    await supabase.storage.from('contracts').remove([filePath])
   }

   const { error } = await supabase.from("contracts").delete().eq('id', contractToDelete.id)
   if (error) throw error

   setFeedbackMessage({ type: 'success', text: 'Contrato excluído com sucesso!' })
   fetchContracts()
  } catch (error: any) {
   console.error("Erro ao excluir contrato:", error)
   setFeedbackMessage({ type: 'error', text: `Erro ao excluir contrato: ${error.message}` })
  } finally {
   setDeleteAlertOpen(false)
   setContractToDelete(null)
  }
 }

 const openDeleteAlert = (contract: Contract) => {
  setContractToDelete(contract)
  setDeleteAlertOpen(true)
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
   <div className="flex items-center justify-between p-6 border-b border-border">
    <div>
     <h1 className="text-2xl font-semibold text-foreground">Contratos</h1>
     <p className="text-muted-foreground">Gerencie todos os seus contratos</p>
    </div>
    <Button onClick={() => handleOpenDialog('create')}>
     <Plus className="w-4 h-4 mr-2" />
     Novo Contrato
    </Button>
   </div>

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
    {feedbackMessage && (
     <div className={`text-sm ${feedbackMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
      {feedbackMessage.text}
     </div>
    )}
   </div>

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
       <Button onClick={() => handleOpenDialog('create')}>
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
            <div><span className="font-medium">Cliente:</span><p>{contract.client_name}</p></div>
            <div><span className="font-medium">Tipo:</span><p>{contract.contract_type.replace("_", " ")}</p></div>
            {contract.contract_value > 0 && <div><span className="font-medium">Valor:</span><p>{formatCurrency(contract.contract_value)}</p></div>}
            {contract.end_date && <div><span className="font-medium">Vencimento:</span><p>{formatDate(contract.end_date)}</p></div>}
           </div>
           {contract.description && <p className="text-sm text-muted-foreground">{contract.description}</p>}
          </div>
          <DropdownMenu>
           <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
            <DropdownMenuItem disabled><Eye className="w-4 h-4 mr-2" />Ver Detalhes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenDialog('edit', contract)}><Edit className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
            {contract.file_url && <DropdownMenuItem asChild><a href={contract.file_url} target="_blank" rel="noopener noreferrer"><Download className="w-4 h-4 mr-2" />Baixar PDF</a></DropdownMenuItem>}
            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteAlert(contract)}>
             <Trash2 className="w-4 h-4 mr-2" />Excluir
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

   <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <DialogContent className="max-w-2xl">
     <DialogHeader>
      <DialogTitle>{dialogMode === 'create' ? 'Criar Novo Contrato' : 'Editar Contrato'}</DialogTitle>
      <DialogDescription>Preencha as informações do contrato.</DialogDescription>
     </DialogHeader>
     <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
       <div className="space-y-2"><Label htmlFor="title">Título do Contrato</Label><Input id="title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
       <div className="space-y-2"><Label htmlFor="contract_type">Tipo de Contrato</Label><Select value={formData.contract_type} onValueChange={(value) => setFormData({ ...formData, contract_type: value })}><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent><SelectItem value="service">Prestação de Serviços</SelectItem><SelectItem value="supply">Fornecimento</SelectItem><SelectItem value="partnership">Parceria</SelectItem><SelectItem value="confidentiality">Confidencialidade</SelectItem><SelectItem value="employment">Trabalho</SelectItem><SelectItem value="other">Outro</SelectItem></SelectContent></Select></div>
      </div>
      <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
      <div className="grid grid-cols-2 gap-4">
       <div className="space-y-2"><Label htmlFor="client_name">Nome do Cliente</Label><Input id="client_name" value={formData.client_name || ''} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} required /></div>
       <div className="space-y-2"><Label htmlFor="client_email">Email do Cliente</Label><Input id="client_email" type="email" value={formData.client_email || ''} onChange={(e) => setFormData({ ...formData, client_email: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
       <div className="space-y-2"><Label htmlFor="contract_value">Valor (R$)</Label><Input id="contract_value" type="number" step="0.01" value={formData.contract_value || ''} onChange={(e) => setFormData({ ...formData, contract_value: Number(e.target.value) })} /></div>
       <div className="space-y-2"><Label htmlFor="start_date">Data de Início</Label><Input id="start_date" type="date" value={formData.start_date || ''} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} /></div>
       <div className="space-y-2"><Label htmlFor="end_date">Data de Término</Label><Input id="end_date" type="date" value={formData.end_date || ''} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="active">Ativo</SelectItem><SelectItem value="pending">Pendente</SelectItem><SelectItem value="expired">Vencido</SelectItem><SelectItem value="cancelled">Cancelado</SelectItem></SelectContent></Select></div>
      <div className="space-y-2">
       <Label htmlFor="file">Arquivo do Contrato</Label>
       <Input id="file" type="file" ref={fileInputRef} onChange={handleFileChange} />
       {(fileToUpload || formData.file_name) && <p className="text-sm text-muted-foreground">Arquivo selecionado: {fileToUpload?.name || formData.file_name}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-4">
       <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
       <Button type="submit">Salvar Contrato</Button>
      </div>
     </form>
    </DialogContent>
   </Dialog>

   <Dialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
    <DialogContent>
     <DialogHeader>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogDescription>
       Você tem certeza que deseja excluir o contrato "{contractToDelete?.title}"? Esta ação não pode ser desfeita.
      </DialogDescription>
     </DialogHeader>
     <DialogFooter>
      <DialogClose asChild>
       <Button variant="outline">Cancelar</Button>
      </DialogClose>
      <Button variant="destructive" onClick={handleDeleteContract}>Excluir</Button>
     </DialogFooter>
    </DialogContent>
   </Dialog>
  </div>
 )
}