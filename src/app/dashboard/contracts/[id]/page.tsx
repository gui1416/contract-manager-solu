"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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

const formatDate = (dateString: string | null) => {
 if (!dateString) return "N/A"
 const date = new Date(dateString)
 return new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000).toLocaleDateString("pt-BR")
}

const formatCurrency = (value: number | null) => {
 if (value === null || value === undefined) return "N/A"
 return new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
 }).format(value)
}


export default function ContractDetailsPage() {
 const params = useParams()
 const router = useRouter()
 const { id } = params
 const [contract, setContract] = useState<Contract | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const supabase = createClient()

 useEffect(() => {
  const fetchContract = async () => {
   if (typeof id !== 'string') return;
   setIsLoading(true)
   try {
    const { data, error } = await supabase
     .from("contracts")
     .select("*")
     .eq("id", id)
     .single()

    if (error) throw error
    setContract(data)
   } catch (error) {
    console.error("Erro ao buscar contrato:", error)
   } finally {
    setIsLoading(false)
   }
  }

  fetchContract()
 }, [id, supabase])

 if (isLoading) {
  return (
   <div className="flex flex-col h-full">
    <div className="flex items-center gap-4 p-6 border-b border-border">
     <Button onClick={() => router.back()} variant="outline" size="icon" disabled>
      <ArrowLeft className="h-4 w-4" />
     </Button>
     <div>
      <h1 className="text-2xl font-semibold text-foreground">Detalhes do Contrato</h1>
     </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
     <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando contrato...</p>
     </div>
    </div>
   </div>
  )
 }

 if (!contract) {
  return (
   <div className="flex flex-col h-full">
    <div className="flex items-center gap-4 p-6 border-b border-border">
     <Button onClick={() => router.back()} variant="outline" size="icon">
      <ArrowLeft className="h-4 w-4" />
     </Button>
     <div>
      <h1 className="text-2xl font-semibold text-foreground">Detalhes do Contrato</h1>
     </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
     <div className="text-center">
      <h2 className="text-xl font-semibold">Contrato não encontrado</h2>
     </div>
    </div>
   </div>
  );
 }

 return (
  <div className="flex flex-col h-full">
   <div className="flex items-center gap-4 p-6 border-b border-border">
    <Button onClick={() => router.back()} variant="outline" size="icon">
     <ArrowLeft className="h-4 w-4" />
    </Button>
    <div>
     <h1 className="text-2xl font-semibold text-foreground">Detalhes do Contrato</h1>
     <p className="text-muted-foreground">{contract.title}</p>
    </div>
   </div>
   <div className="flex-1 overflow-auto p-6">
    <Card>
     <CardHeader>
      <CardTitle>{contract.title}</CardTitle>
      <CardDescription>ID: {contract.id}</CardDescription>
     </CardHeader>
     <CardContent className="space-y-4">
      <p><strong>Cliente:</strong> {contract.client_name}</p>
      <p><strong>Email do Cliente:</strong> {contract.client_email || 'N/A'}</p>
      <p><strong>Status:</strong> {contract.status}</p>
      <p><strong>Tipo:</strong> {contract.contract_type.replace("_", " ")}</p>
      <p><strong>Valor:</strong> {formatCurrency(contract.contract_value)}</p>
      <p><strong>Data de Início:</strong> {formatDate(contract.start_date)}</p>
      <p><strong>Data de Término:</strong> {formatDate(contract.end_date)}</p>
      <p><strong>Descrição:</strong> {contract.description || 'Sem descrição.'}</p>
      <div><strong>Tags:</strong> {contract.tags && contract.tags.length > 0 ? contract.tags.join(', ') : 'Nenhuma tag'}</div>
     </CardContent>
    </Card>
   </div>
  </div>
 )
}