"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileSignature, Plus, Search, MoreHorizontal, Edit, Trash2, Copy, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Template {
  id: string
  name: string
  description: string
  template_type: string
  content: string
  variables: Record<string, unknown>
  is_public: boolean
  created_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<Partial<Template>>({})

  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)

  const supabase = createClient()

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("contract_templates").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error("Erro ao buscar templates:", error)
      toast.error("Falha ao carregar templates.")
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleOpenDialog = (mode: "create" | "edit", template?: Template) => {
    setDialogMode(mode);
    if (mode === 'edit' && template) {
      setSelectedTemplate(template);
      setFormData(template);
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: "",
        description: "",
        template_type: "service",
        content: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const promise = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const templateData = {
        ...formData,
        user_id: user.id,
        variables: {},
        updated_at: new Date().toISOString()
      };

      if (dialogMode === 'create') {
        const { error } = await supabase.from("contract_templates").insert(templateData);
        if (error) throw error;
      } else if (selectedTemplate) {
        const { error } = await supabase.from("contract_templates").update(templateData).eq('id', selectedTemplate.id);
        if (error) throw error;
      }

      setDialogOpen(false);
      fetchTemplates();
    };

    toast.promise(promise, {
      loading: 'Salvando template...',
      success: `Template ${dialogMode === 'create' ? 'criado' : 'atualizado'} com sucesso!`,
      error: 'Erro ao salvar template.'
    });
  }

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    const promise = async () => {
      const { error } = await supabase.from("contract_templates").delete().eq('id', templateToDelete.id);
      if (error) throw error;
      fetchTemplates();
    };

    toast.promise(promise, {
      loading: 'Excluindo template...',
      success: 'Template excluído com sucesso!',
      error: 'Erro ao excluir template.'
    });

    setDeleteAlertOpen(false);
    setTemplateToDelete(null);
  };

  const openDeleteAlert = (template: Template) => {
    setTemplateToDelete(template);
    setDeleteAlertOpen(true);
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Templates</h1>
            <p className="text-muted-foreground">Modelos de contratos reutilizáveis</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando templates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Templates</h1>
          <p className="text-muted-foreground">Modelos de contratos reutilizáveis</p>
        </div>
        <Button onClick={() => handleOpenDialog('create')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="flex items-center gap-4 p-6 border-b border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileSignature className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {templates.length === 0 ? "Nenhum template encontrado" : "Nenhum resultado encontrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {templates.length === 0 ? "Comece criando seu primeiro template" : "Tente ajustar os termos de busca"}
            </p>
            {templates.length === 0 && (
              <Button onClick={() => handleOpenDialog('create')}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Template
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">{template.description || "Sem descrição"}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled><Eye className="w-4 h-4 mr-2" />Visualizar</DropdownMenuItem>
                        <DropdownMenuItem disabled><Copy className="w-4 h-4 mr-2" />Usar Template</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog('edit', template)}><Edit className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteAlert(template)}><Trash2 className="w-4 h-4 mr-2" />Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{template.template_type.replace("_", " ")}</Badge>
                      {template.is_public && <Badge variant="outline">Público</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.content.substring(0, 150)}...
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Criado em {new Date(template.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Criar Novo Template' : 'Editar Template'}</DialogTitle>
            <DialogDescription>Crie ou edite um modelo de contrato reutilizável.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Nome do Template</Label><Input id="name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="template_type">Tipo de Template</Label><Select value={formData.template_type} onValueChange={(value) => setFormData({ ...formData, template_type: value })}><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent><SelectItem value="service">Prestação de Serviços</SelectItem><SelectItem value="supply">Fornecimento</SelectItem><SelectItem value="partnership">Parceria</SelectItem><SelectItem value="confidentiality">Confidencialidade</SelectItem><SelectItem value="employment">Trabalho</SelectItem><SelectItem value="other">Outro</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} /></div>
            <div className="space-y-2"><Label htmlFor="content">Conteúdo do Template</Label><Textarea id="content" value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={12} placeholder="Digite o conteúdo do contrato aqui. Use {{variavel}} para campos dinâmicos." required /></div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Template</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir o template &quot;{templateToDelete?.name}&quot;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button variant="destructive" onClick={handleDeleteTemplate}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}