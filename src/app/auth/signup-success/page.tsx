import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
 return (
  <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
   <div className="w-full max-w-sm">
    <div className="flex flex-col gap-6">
     {/* Logo */}
     <div className="flex items-center justify-center gap-2 mb-6">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
       <FileText className="w-4 h-4 text-primary-foreground" />
      </div>
      <h1 className="text-xl font-semibold">ContractApp</h1>
     </div>

     <Card>
      <CardHeader className="text-center">
       <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <Mail className="w-6 h-6 text-green-600" />
       </div>
       <CardTitle className="text-2xl">Conta criada com sucesso!</CardTitle>
       <CardDescription>Verifique seu email para confirmar sua conta</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
       <p className="text-sm text-muted-foreground mb-4">
        Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta e fazer login.
       </p>
       <Link href="/auth/login" className="text-sm text-primary hover:underline">
        Voltar para o login
       </Link>
      </CardContent>
     </Card>
    </div>
   </div>
  </div>
 )
}
