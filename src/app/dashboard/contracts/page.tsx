"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ContractDialog } from "@/components/ContractDialog"
import { DeleteContractDialog } from "@/components/DeleteContractDialog"

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
  created_at: string
  tags: string[]
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
  const [selectedContract, setSelectedContract] = useState<Partial<Contract> | null>(null)

  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null)

  const supabase = createClient()

  const fetchContracts = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("contracts").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setContracts(data || [])
    } catch (error) {
      console.error("Erro ao buscar contratos:", error)
      toast.error('Falha ao carregar contratos.')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  const handleOpenDialog = (mode: "create" | "edit", contract?: Contract) => {
    setDialogMode(mode)
    setSelectedContract(contract || null)
    setDialogOpen(true)
  }

  const handleDeleteContract = async () => {
    if (!contractToDelete) return

    const promise = async () => {
      const { error } = await supabase.from("contracts").delete().eq('id', contractToDelete.id)
      if (error) throw error
      fetchContracts()
    }

    toast.promise(promise, {
      loading: 'Excluindo contrato...',
      success: 'Contrato excluído com sucesso!',
      error: 'Erro ao excluir contrato.'
    });

    setDeleteAlertOpen(false)
    setContractToDelete(null)
  }

  const openDeleteAlert = (contract: Contract) => {
    setContractToDelete(contract)
    setDeleteAlertOpen(true)
  }

  const filteredContracts = contracts.filter((contract) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      contract.title.toLowerCase().includes(searchTermLower) ||
      contract.client_name.toLowerCase().includes(searchTermLower) ||
      (Array.isArray(contract.tags) && contract.tags.some(tag => tag.toLowerCase().includes(searchTermLower)));
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                      <div className="flex flex-wrap gap-2 mt-4">
                        {Array.isArray(contract.tags) && contract.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled><Eye className="w-4 h-4 mr-2" />Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog('edit', contract)}><Edit className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
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

      <ContractDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        contract={selectedContract}
        onSuccess={fetchContracts}
      />

      <DeleteContractDialog
        open={isDeleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        contractName={contractToDelete?.title}
        onConfirm={handleDeleteContract}
      />
    </div>
  )
}