"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

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
 tags: string[]
}

interface ContractDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 mode: "create" | "edit"
 contract: Partial<Contract> | null
 onSuccess: () => void
}

export function ContractDialog({ open, onOpenChange, mode, contract, onSuccess }: ContractDialogProps) {
 const [formData, setFormData] = useState<Partial<Contract>>({})
 const [fileToUpload, setFileToUpload] = useState<File | null>(null)
 const fileInputRef = useRef<HTMLInputElement>(null)
 const supabase = createClient()

 useEffect(() => {
  setFormData(contract || {})
 }, [contract])

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
   setFileToUpload(e.target.files[0])
  }
 }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  const promise = async () => {
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
    updated_at: new Date().toISOString(),
    tags: Array.isArray(formData.tags) ? formData.tags : [],
   }

   if (mode === 'create') {
    const { error } = await supabase.from("contracts").insert(contractData)
    if (error) throw error
   } else if (contract) {
    const { error } = await supabase.from("contracts").update(contractData).eq('id', contract.id)
    if (error) throw error
   }

   onOpenChange(false)
   onSuccess()
  };

  toast.promise(promise, {
   loading: 'Salvando contrato...',
   success: `Contrato ${mode === 'create' ? 'criado' : 'atualizado'} com sucesso!`,
   error: 'Erro ao salvar contrato.'
  });
 }

 return (
  <Dialog open={open} onOpenChange={onOpenChange}>
   <DialogContent className="max-w-2xl">
    <DialogHeader>
     <DialogTitle>{mode === 'create' ? 'Criar Novo Contrato' : 'Editar Contrato'}</DialogTitle>
     <DialogDescription>Preencha as informações do contrato.</DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-4">
     <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label htmlFor="title">Título do Contrato</Label><Input id="title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
      <div className="space-y-2"><Label htmlFor="contract_type">Tipo de Contrato</Label><Select value={formData.contract_type} onValueChange={(value) => setFormData({ ...formData, contract_type: value })}><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent><SelectItem value="service">Prestação de Serviços</SelectItem><SelectItem value="supply">Fornecimento</SelectItem><SelectItem value="partnership">Parceria</SelectItem><SelectItem value="confidentiality">Confidencialidade</SelectItem><SelectItem value="employment">Trabalho</SelectItem><SelectItem value="other">Outro</SelectItem></SelectContent></Select></div>
     </div>
     <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
     <div className="space-y-2"><Label htmlFor="tags">Tags (separadas por vírgula)</Label><Input id="tags" value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ''} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(tag => tag.trim()) })} /></div>
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
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
      <Button type="submit">Salvar Contrato</Button>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 )
}