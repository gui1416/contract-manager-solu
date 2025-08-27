import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield, Bell, Search, Brain, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">ContractApp</h1>
          <p className="text-xl text-muted-foreground mb-8">Gerencie seus contratos de forma inteligente e segura</p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signup">Criar Conta</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Gestão de Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Organize e gerencie todos os seus contratos em um só lugar</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Alertas Automáticos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Receba notificações sobre vencimentos e renovações</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 text-primary mb-2" />
              <CardTitle>IA Integrada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Análise automática de contratos e chat inteligente</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Search className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Busca Avançada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Encontre rapidamente qualquer contrato ou informação</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Templates Inteligentes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Modelos de contratos personalizáveis e reutilizáveis</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Segurança Total</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Seus dados protegidos com criptografia de ponta</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Pronto para começar?</CardTitle>
              <CardDescription>Explore todas as funcionalidades do sistema de gestão de contratos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/auth/signup">Começar Agora</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}