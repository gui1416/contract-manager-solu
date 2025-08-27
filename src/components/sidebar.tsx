"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
 FileText,
 LayoutDashboard,
 Search,
 Bell,
 FileSignature,
 Settings,
 HelpCircle,
 ChevronLeft,
 ChevronRight,
 LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"

const menuItems = [
 {
  title: "PRINCIPAL",
  items: [
   { icon: LayoutDashboard, label: "Dashboard", href: "/" },
   { icon: FileText, label: "Contratos", href: "/contracts" },
   { icon: FileSignature, label: "Assinaturas", href: "/signatures" },
   { icon: Bell, label: "Alertas", href: "/alerts" },
  ],
 },
 {
  title: "GESTÃO",
  items: [
   { icon: FileSignature, label: "Templates", href: "/templates" },
   { icon: Search, label: "Pesquisar", href: "/search" },
  ],
 },
 {
  title: "SUPORTE",
  items: [
   { icon: Settings, label: "Configurações", href: "/settings" },
   { icon: HelpCircle, label: "Ajuda", href: "/help" },
  ],
 },
]

interface Profile {
 first_name: string;
 last_name: string;
}

export function Sidebar() {
 const [collapsed, setCollapsed] = useState(false)
 const [user, setUser] = useState<User | null>(null);
 const [profile, setProfile] = useState<Profile | null>(null);
 const pathname = usePathname()
 const router = useRouter()
 const supabase = createClient()

 useEffect(() => {
  const fetchUserData = async () => {
   const { data: { user } } = await supabase.auth.getUser();
   setUser(user);

   if (user) {
    const { data: profileData, error } = await supabase
     .from('profiles')
     .select('first_name, last_name')
     .eq('id', user.id)
     .single();

    if (error) {
     console.error("Erro ao buscar perfil:", error);
    } else {
     setProfile(profileData);
    }
   }
  }
  fetchUserData();
 }, [supabase]);


 const handleSignOut = async () => {
  await supabase.auth.signOut()
  router.push("/auth/login")
 }

 const getInitials = () => {
  if (profile?.first_name && profile?.last_name) {
   return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  }
  if (user?.email) {
   return user.email[0].toUpperCase();
  }
  return 'U';
 }

 return (
  <div
   className={cn(
    "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
    collapsed ? "w-16" : "w-64"
   )}
  >
   <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
    {!collapsed && (
     <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
       <FileText className="w-4 h-4 text-sidebar-primary-foreground" />
      </div>
      <div>
       <h1 className="font-semibold text-sidebar-foreground">ContractApp</h1>
       <p className="text-xs text-sidebar-foreground/60">Gestão de Contratos</p>
      </div>
     </div>
    )}
    <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
     {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
    </Button>
   </div>

   <ScrollArea className="flex-1 px-3 py-4">
    <div className="space-y-6">
     {menuItems.map((section, index) => (
      <div key={index}>
       {!collapsed && (
        <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-2 px-2">
         {section.title}
        </h3>
       )}
       <div className="space-y-1">
        {section.items.map((item, itemIndex) => (
         <Link key={itemIndex} href={item.href}>
          <Button
           variant={pathname === item.href ? "secondary" : "ghost"}
           className={cn(
            "w-full justify-start gap-3 h-9",
            collapsed && "justify-center px-2",
            pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
           )}
          >
           <item.icon className="w-4 h-4 shrink-0" />
           {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
          </Button>
         </Link>
        ))}
       </div>
       {index < menuItems.length - 1 && !collapsed && <Separator className="my-4" />}
      </div>
     ))}
    </div>
   </ScrollArea>

   <div className="p-3 border-t border-sidebar-border">
    <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
     <Avatar className="w-8 h-8">
      <AvatarImage src="/placeholder.svg?height=32&width=32" />
      <AvatarFallback>{getInitials()}</AvatarFallback>
     </Avatar>
     {!collapsed && (
      <div className="flex-1 min-w-0">
       <p className="text-sm font-medium text-sidebar-foreground truncate">
        {profile ? `${profile.first_name} ${profile.last_name}` : (user?.email || 'Usuário')}
       </p>
       <p className="text-xs text-sidebar-foreground/60 truncate">
        {user?.email}
       </p>
      </div>
     )}
     {!collapsed && (
      <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 w-8 p-0">
       <LogOut className="w-4 h-4" />
      </Button>
     )}
    </div>
   </div>
  </div>
 )
}