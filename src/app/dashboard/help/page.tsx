"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Mail, MessageCircle, Book, Video, Search } from "lucide-react"
import { useState } from "react"

const faqData = [
  {
    question: "Como criar meu primeiro contrato?",
    answer:
      "Para criar um contrato, vá até a seção 'Contratos' e clique em 'Novo Contrato'. Preencha as informações básicas como título, cliente, tipo de contrato e datas. Você também pode usar um template existente para acelerar o processo.",
  },
  {
    question: "Como configurar alertas de vencimento?",
    answer:
      "Os alertas são configurados automaticamente quando você define uma data de término no contrato. Você pode personalizar os períodos de alerta (30, 15, 5 dias antes) nas configurações de notificações.",
  },
  {
    question: "Posso fazer upload de arquivos PDF?",
    answer:
      "Sim! Você pode fazer upload de contratos em PDF ou Word diretamente na plataforma. Os arquivos ficam armazenados de forma segura e podem ser acessados a qualquer momento.",
  },
  {
    question: "Como funciona a IA para análise de contratos?",
    answer:
      "Nossa IA utiliza o Gemini API para extrair automaticamente informações importantes dos contratos, como valores, datas, partes envolvidas e cláusulas de risco. Isso acelera o processo de cadastro e análise.",
  },
  {
    question: "Os dados estão seguros?",
    answer:
      "Sim, utilizamos criptografia de ponta a ponta e todas as informações são armazenadas de forma segura no Supabase. Implementamos Row Level Security (RLS) para garantir que apenas você tenha acesso aos seus dados.",
  },
  {
    question: "Como criar templates personalizados?",
    answer:
      "Vá até a seção 'Templates' e clique em 'Novo Template'. Você pode criar modelos reutilizáveis com campos dinâmicos usando a sintaxe {{variavel}} para personalizar contratos rapidamente.",
  },
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Formulário de contato enviado:", contactForm)
    setContactForm({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Central de Ajuda</h1>
          <p className="text-muted-foreground">Encontre respostas e obtenha suporte</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Book className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Guia de Início</CardTitle>
                <CardDescription>Aprenda o básico para começar</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Video className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Tutoriais em Vídeo</CardTitle>
                <CardDescription>Assista aos nossos tutoriais</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Chat ao Vivo</CardTitle>
                <CardDescription>Fale conosco em tempo real</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Perguntas Frequentes
              </CardTitle>
              <CardDescription>Encontre respostas para as dúvidas mais comuns</CardDescription>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nas perguntas frequentes..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFAQ.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma pergunta encontrada para &quot;{searchTerm}&quot;</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Entre em Contato
              </CardTitle>
              <CardDescription>Não encontrou o que procurava? Envie-nos uma mensagem</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recursos Adicionais</CardTitle>
              <CardDescription>Outros recursos que podem ajudar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Documentação da API</h4>
                  <p className="text-sm text-muted-foreground">
                    Para desenvolvedores que querem integrar com nossa plataforma
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Status do Sistema</h4>
                  <p className="text-sm text-muted-foreground">Verifique o status dos nossos serviços</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Changelog</h4>
                  <p className="text-sm text-muted-foreground">Veja as últimas atualizações e melhorias</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Comunidade</h4>
                  <p className="text-sm text-muted-foreground">Participe das discussões com outros usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}