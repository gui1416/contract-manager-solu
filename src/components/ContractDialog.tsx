"use client"

import React, { useEffect } from "react"
// Adiciona tipo para manipulação de arquivo
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
 DialogFooter,
 DialogClose,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contractSchema } from "@/lib/validators"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Contract {
 id: string
 title: string
 description: string | null
 contract_type: string
 client_name: string
 client_email: string | null
 contract_value: number | null
 start_date: string | null
 end_date: string | null
 status: string
 created_at: string
 tags: string[] | null
}

interface ContractDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 mode: "create" | "edit"
 contract: Partial<Contract> | null
 onSuccess: () => void
}

type ContractFormInput = {
 title: string;
 description?: string | null;
 contract_type: string;
 client_name: string;
 client_email?: string | null;
 contract_value?: number | null;
 start_date?: Date | null;
 end_date?: Date | null;
 status: string;
 tags?: string;
};

export function ContractDialog({ open, onOpenChange, mode, contract, onSuccess }: ContractDialogProps) {
 const {
  register,
  handleSubmit,
  control,
  reset,
  formState: { errors },
 } = useForm({
  resolver: zodResolver(contractSchema),
  defaultValues: {
   title: "",
   description: "",
   contract_type: "service",
   client_name: "",
   client_email: "",
   contract_value: 0,
   status: "draft",
   tags: "",
  },
 })

 const supabase = createClient()

 useEffect(() => {
  // ...nenhuma lógica de arquivo...
  if (open) {
   if (mode === 'edit' && contract) {
    const formValues: ContractFormInput = {
     title: contract.title || '',
     description: contract.description || '',
     contract_type: contract.contract_type || 'service',
     client_name: contract.client_name || '',
     client_email: contract.client_email || '',
     contract_value: contract.contract_value || 0,
     status: contract.status || 'draft',
     tags: Array.isArray(contract.tags) ? contract.tags.join(', ') : '',
     start_date: contract.start_date ? new Date(contract.start_date) : undefined,
     end_date: contract.end_date ? new Date(contract.end_date) : undefined,
    };
    reset(formValues);
   } else {
    reset({
     title: "",
     description: "",
     contract_type: "service",
     client_name: "",
     client_email: "",
     contract_value: 0,
     status: "draft",
     tags: "",
     start_date: undefined,
     end_date: undefined,
    });
   }
  }
 }, [open, mode, contract, reset]);

 const onSubmit = async (data: any) => {
  const promise = async () => {
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) throw new Error("Usuário não autenticado")

   // Converter tags string para array de strings
   const tagsArray = data.tags
    ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
    : []

   const contractData = {
    ...data,
    user_id: user.id,
    contract_value: Number(data.contract_value) || null,
    updated_at: new Date().toISOString(),
    start_date: data.start_date ? data.start_date.toISOString() : null,
    end_date: data.end_date ? data.end_date.toISOString() : null,
    tags: tagsArray,
   }

   if (mode === "create") {
    const { error } = await supabase.from("contracts").insert(contractData)
    if (error) throw error
   } else if (contract?.id) {
    const { error } = await supabase.from("contracts").update(contractData).eq("id", contract.id)
    if (error) throw error
   }

   onOpenChange(false)
   onSuccess()
  }

  toast.promise(promise, {
   loading: "Salvando contrato...",
   success: `Contrato ${mode === "create" ? "criado" : "atualizado"} com sucesso!`,
   error: "Erro ao salvar contrato.",
  })
 }

 return (
  <Dialog open={open} onOpenChange={onOpenChange}>
   <DialogContent className="max-w-2xl max-h-[90vh] grid grid-rows-[auto_1fr_auto] p-0">
    <DialogHeader className="p-6 pb-4 border-b">
     <DialogTitle>{mode === "create" ? "Criar Novo Contrato" : "Editar Contrato"}</DialogTitle>
     <DialogDescription>Preencha as informações do contrato.</DialogDescription>
    </DialogHeader>

    <div className="overflow-y-auto">
     <form id="contract-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div className="space-y-2">
        <Label htmlFor="title">Título do Contrato</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
       </div>
       <div className="space-y-2">
        <Label htmlFor="contract_type">Tipo de Contrato</Label>
        <Controller
         name="contract_type"
         control={control}
         render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
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
         )}
        />
       </div>
      </div>
      <div className="space-y-2">
       <Label htmlFor="description">Descrição</Label>
       <Textarea id="description" {...register("description")} rows={3} />
      </div>
      <div className="space-y-2">
       <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
       <Input id="tags" {...register("tags")} />
      </div>
      {/* Campo de arquivo removido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div className="space-y-2">
        <Label htmlFor="client_name">Nome do Cliente</Label>
        <Input id="client_name" {...register("client_name")} />
        {errors.client_name && <p className="text-sm text-destructive">{errors.client_name.message}</p>}
       </div>
       <div className="space-y-2">
        <Label htmlFor="client_email">Email do Cliente</Label>
        <Input id="client_email" type="email" {...register("client_email")} />
        {errors.client_email && <p className="text-sm text-destructive">{errors.client_email.message}</p>}
       </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <div className="space-y-2">
        <Label htmlFor="contract_value">Valor (R$)</Label>
        <Input id="contract_value" type="number" step="0.01" {...register("contract_value")} />
       </div>
       <div className="space-y-2">
        <Label htmlFor="start_date">Data de Início</Label>
        <Controller
         name="start_date"
         control={control}
         render={({ field }) => (
          <Popover>
           <PopoverTrigger asChild>
            <Button
             variant={"outline"}
             className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
            >
             <CalendarIcon className="mr-2 h-4 w-4" />
             {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>DD/MM/YYYY</span>}
            </Button>
           </PopoverTrigger>
           <PopoverContent className="w-auto p-0">
            <Calendar
             mode="single"
             selected={field.value ?? undefined}
             onSelect={field.onChange}
             initialFocus
            />
           </PopoverContent>
          </Popover>
         )}
        />
       </div>
       <div className="space-y-2">
        <Label htmlFor="end_date">Data de Término</Label>
        <Controller
         name="end_date"
         control={control}
         render={({ field }) => (
          <Popover>
           <PopoverTrigger asChild>
            <Button
             variant={"outline"}
             className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
            >
             <CalendarIcon className="mr-2 h-4 w-4" />
             {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>DD/MM/YYYY</span>}
            </Button>
           </PopoverTrigger>
           <PopoverContent className="w-auto p-0">
            <Calendar
             mode="single"
             selected={field.value ?? undefined}
             onSelect={field.onChange}
             initialFocus
            />
           </PopoverContent>
          </Popover>
         )}
        />
       </div>
      </div>
      <div className="space-y-2">
       <Label htmlFor="status">Status</Label>
       <Controller
        name="status"
        control={control}
        render={({ field }) => (
         <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
           <SelectValue />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="draft">Rascunho</SelectItem>
           <SelectItem value="active">Ativo</SelectItem>
           <SelectItem value="pending">Pendente</SelectItem>
           <SelectItem value="expired">Vencido</SelectItem>
           <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
         </Select>
        )}
       />
      </div>
     </form>
    </div>

    <DialogFooter className="p-6 pt-4 border-t">
     <DialogClose asChild>
      <Button type="button" variant="outline">
       Cancelar
      </Button>
     </DialogClose>
     <Button type="submit" form="contract-form">
      Salvar Contrato
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 )
}