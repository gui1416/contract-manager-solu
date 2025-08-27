"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText, Calendar, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SearchResult {
 id: string
 title: string
 description: string
 contract_type: string
 client_name: string
 contract_value: number
 start_date: string
 end_date: string
 status: string
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

export default function SearchPage() {
 const [searchTerm, setSearchTerm] = useState("")
 const [searchResults, setSearchResults] = useState<SearchResult[]>([])
 const [isLoading, setIsLoading] = useState(false)
 const [filters, setFilters] = useState({
  status: "all",
  contract_type: "all",
  date_range: "all",
 })

 const performSearch = async () => {
  if (!searchTerm.trim()) {
   setSearchResults([])
   return
  }

  const supabase = createClient()
  setIsLoading(true)

  try {
   let query = supabase
    .from("contracts")
    .select("*")
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%`)

   if (filters.status !== "all") {
    query = query.eq("status", filters.status)
   }

   if (filters.contract_type !== "all") {
    query = query.eq("contract_type", filters.contract_type)
   }

   if (filters.date_range !== "all") {
    const now = new Date()
    const startDate = new Date()

    switch (filters.date_range) {
     case "last_month":
      startDate.setMonth(now.getMonth() - 1)
      break
     case "last_3_months":
      startDate.setMonth(now.getMonth() - 3)
      break
     case "last_year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
    }

    if (filters.date_range !== "all") {
     query = query.gte("created_at", startDate.toISOString())
    }
   }

   const { data, error } = await query.order("created_at", { ascending: false })

   if (error) throw error
   setSearchResults(data || [])
  } catch (error) {
   console.error("Erro na busca:", error)
  } finally {
   setIsLoading(false)
  }
 }

 useEffect(() => {
  const debounceTimer = setTimeout(() => {
   performSearch()
  }, 500)

  return () => clearTimeout(debounceTimer)
 }, [searchTerm, filters])

 return (
  <div className="flex flex-col h-full">
   <div className="flex items-center justify-between p-6 border-b border-border">
    <div>
     <h1 className="text-2xl font-semibold text-foreground">Pesquisa Avançada</h1>
     <p className="text-muted-foreground">Encontre contratos rapidamente</p>
    </div>
   </div>

   <div className="p-6 border-b border-border bg-muted/30">
    <div className="space-y-4">
     <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
       placeholder="Digite o que você está procurando..."
       className="pl-9 text-base"
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
      />
     </div>

     <div className="flex flex-wrap gap-4">
      <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
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

      <Select
       value={filters.contract_type}
       onValueChange={(value) => setFilters({ ...filters, contract_type: value })}
      >
       <SelectTrigger className="w-48">
        <SelectValue />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Todos os Tipos</SelectItem>
        <SelectItem value="service">Prestação de Serviços</SelectItem>
        <SelectItem value="supply">Fornecimento</SelectItem>
        <SelectItem value="partnership">Parceria</SelectItem>
        <SelectItem value="confidentiality">Confidencialidade</SelectItem>
        <SelectItem value="employment">Trabalho</SelectItem>
        <SelectItem value="other">Outro</SelectItem>
       </SelectContent>
      </Select>

      <Select value={filters.date_range} onValueChange={(value) => setFilters({ ...filters, date_range: value })}>
       <SelectTrigger className="w-48">
        <SelectValue />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="all">Qualquer Data</SelectItem>
        <SelectItem value="last_month">Último Mês</SelectItem>
        <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
        <SelectItem value="last_year">Último Ano</SelectItem>
       </SelectContent>
      </Select>
     </div>
    </div>
   </div>

   <div className="flex-1 overflow-auto p-6">
    {isLoading ? (
     <div className="flex items-center justify-center py-12">
      <div className="text-center">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
       <p className="text-muted-foreground">Buscando...</p>
      </div>
     </div>
    ) : !searchTerm.trim() ? (
     <div className="flex flex-col items-center justify-center py-12 text-center">
      <Search className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Comece sua busca</h3>
      <p className="text-muted-foreground">
       Digite um termo para encontrar contratos, clientes ou informações específicas
      </p>
     </div>
    ) : searchResults.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">Nenhum resultado encontrado</h3>
      <p className="text-muted-foreground">Tente ajustar os termos de busca ou filtros</p>
     </div>
    ) : (
     <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
       <p className="text-sm text-muted-foreground">
        {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} encontrado
        {searchResults.length !== 1 ? "s" : ""}
       </p>
      </div>

      {searchResults.map((result) => (
       <Card key={result.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
         <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
           <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{result.title}</h3>
            {getStatusBadge(result.status)}
           </div>

           {result.description && <p className="text-muted-foreground mb-3">{result.description}</p>}

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
             <FileText className="w-4 h-4 text-muted-foreground" />
             <div>
              <p className="font-medium">Cliente</p>
              <p className="text-muted-foreground">{result.client_name}</p>
             </div>
            </div>

            <div className="flex items-center gap-2">
             <Badge variant="outline" className="text-xs">
              {result.contract_type.replace("_", " ")}
             </Badge>
            </div>

            {result.contract_value > 0 && (
             <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
               <p className="font-medium">Valor</p>
               <p className="text-muted-foreground">{formatCurrency(result.contract_value)}</p>
              </div>
             </div>
            )}

            {result.end_date && (
             <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
               <p className="font-medium">Vencimento</p>
               <p className="text-muted-foreground">{formatDate(result.end_date)}</p>
              </div>
             </div>
            )}
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
