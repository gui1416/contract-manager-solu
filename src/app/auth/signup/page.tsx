"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
 const [email, setEmail] = useState("")
 const [password, setPassword] = useState("")
 const [firstName, setFirstName] = useState("")
 const [lastName, setLastName] = useState("")
 const [company, setCompany] = useState("")
 const [error, setError] = useState<string | null>(null)
 const [isLoading, setIsLoading] = useState(false)
 const router = useRouter()

 const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault()
  const supabase = createClient()
  setIsLoading(true)
  setError(null)

  try {
   const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
     emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
     data: {
      first_name: firstName,
      last_name: lastName,
      company: company,
     },
    },
   })
   if (error) throw error
   router.push("/auth/signup-success")
  } catch (error: unknown) {
   setError(error instanceof Error ? error.message : "Ocorreu um erro")
  } finally {
   setIsLoading(false)
  }
 }

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
      <CardHeader>
       <CardTitle className="text-2xl">Criar Conta</CardTitle>
       <CardDescription>Preencha os dados para criar sua conta</CardDescription>
      </CardHeader>
      <CardContent>
       <form onSubmit={handleSignUp}>
        <div className="flex flex-col gap-4">
         <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
           <Label htmlFor="firstName">Nome</Label>
           <Input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
           />
          </div>
          <div className="grid gap-2">
           <Label htmlFor="lastName">Sobrenome</Label>
           <Input
            id="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
           />
          </div>
         </div>
         <div className="grid gap-2">
          <Label htmlFor="company">Empresa</Label>
          <Input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
         </div>
         <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
           id="email"
           type="email"
           placeholder="seu@email.com"
           required
           value={email}
           onChange={(e) => setEmail(e.target.value)}
          />
         </div>
         <div className="grid gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input
           id="password"
           type="password"
           required
           value={password}
           onChange={(e) => setPassword(e.target.value)}
          />
         </div>
         {error && <p className="text-sm text-destructive">{error}</p>}
         <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Criando conta..." : "Criar conta"}
         </Button>
        </div>
        <div className="mt-4 text-center text-sm">
         Já tem uma conta?{" "}
         <Link href="/auth/login" className="underline underline-offset-4">
          Entrar
         </Link>
        </div>
       </form>
      </CardContent>
     </Card>
    </div>
   </div>
  </div>
 )
}
