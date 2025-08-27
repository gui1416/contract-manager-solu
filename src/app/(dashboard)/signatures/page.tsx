"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, FileSignature, User, Mail, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Signature {
 id: string
 signatory_name: string
 signatory_email: string
 signed_at: string
 contracts: {
  title: string
  client_name: string
 }[]
}

const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleString("pt-BR")
}

export default function SignaturesPage() {
 const [signatures, setSignatures] = useState<Signature[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState("")

 useEffect(() => {
  fetchSignatures()
 }, [])

 const fetchSignatures = async () => {
  const supabase = createClient()
  setIsLoading(true)
  try {
   const { data, error } = await supabase
    .from("signatures")
    .select(`
          id,
          signatory_name,
          signatory_email,
          signed_at,
          contracts (
            title,
            client_name
          )
        `)
    .order("signed_at", { ascending: false })

   if (error) throw error
   setSignatures((data as unknown as Signature[]) || [])
  } catch (error) {
   console.error("Erro ao buscar assinaturas:", error)
  } finally {
   setIsLoading(false)
  }
 }

 const filteredSignatures = signatures.filter(
  (signature) =>
   signature.signatory_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
   signature.signatory_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
   signature.contracts[0]?.title.toLowerCase().includes(searchTerm.toLowerCase())
 )

 if (isLoading) {
  return (
   <div className="flex flex-col h-full">
    <div className="flex items-center justify-between p-6 border-b border-border">
     <div>
      <h1 className="text-2xl font-semibold text-foreground">Assinaturas</h1>
      <p className="text-muted-foreground">Gerencie as assinaturas dos seus contratos</p>
     </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
     <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando assinaturas...</p>
     </div>
    </div>
   </div>
  )
 }

 return (
  <div className="flex flex-col h-full">
   <div className="flex items-center justify-between p-6 border-b border-border">
    <div>
     <h1 className="text-2xl font-semibold text-foreground">Assinaturas</h1>
     <p className="text-muted-foreground">Gerencie as assinaturas dos seus contratos</p>
    </div>
   </div>

   <div className="flex items-center gap-4 p-6 border-b border-border">
    <div className="relative flex-1 max-w-sm">
     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
     <Input
      placeholder="Buscar por nome, email ou contrato..."
      className="pl-9"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
     />
    </div>
   </div>

   <div className="flex-1 overflow-auto p-6">
    {filteredSignatures.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileSignature className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
       {signatures.length === 0 ? "Nenhuma assinatura encontrada" : "Nenhum resultado encontrado"}
      </h3>
      <p className="text-muted-foreground">
       {signatures.length === 0 ? "Ainda não há assinaturas registradas" : "Tente ajustar os termos de busca"}
      </p>
     </div>
    ) : (
     <div className="space-y-4">
      {filteredSignatures.map((signature) => (
       <Card key={signature.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
         <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
           <div className="flex items-center gap-3">
            <Badge variant="secondary">Assinatura Digital</Badge>
            <p className="text-sm text-muted-foreground">ID: {signature.id.substring(0, 8)}</p>
           </div>
           <div>
            <h3 className="font-semibold text-foreground">{signature.contracts[0]?.title}</h3>
            <p className="text-sm text-muted-foreground">Cliente: {signature.contracts[0]?.client_name}</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /> <p>{signature.signatory_name}</p></div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> <p>{signature.signatory_email}</p></div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /> <p>Assinado em: {formatDate(signature.signed_at)}</p></div>
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