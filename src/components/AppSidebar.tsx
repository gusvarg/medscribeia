import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Users,
  FileText,
  Mic,
  Calendar,
  Settings,
  Brain,
  BarChart3,
  CreditCard,
  Shield,
  ChevronUp,
  User2,
  LogOut,
  Stethoscope,
  Package,
  DollarSign,
  Building2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Pacientes",
    url: "/patients",
    icon: Users,
  },
  {
    title: "Consultas",
    url: "/consultations",
    icon: FileText,
  },
  {
    title: "Transcripciones",
    url: "/transcriptions",
    icon: Mic,
  },
  {
    title: "Agenda",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "IA Médica",
    url: "/ai-tools",
    icon: Brain,
  },
  {
    title: "Consultorios",
    url: "/consultorios",
    icon: Building2,
  },
];

const adminItems = [
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Usuarios",
    url: "/admin/users",
    icon: Shield,
  },
  {
    title: "Planes",
    url: "/admin/plans",
    icon: Package,
  },
  {
    title: "Métodos de Pago",
    url: "/admin/payment-methods",
    icon: CreditCard,
  },
  {
    title: "Configuración IA",
    url: "/admin/ai-configs",
    icon: Brain,
  },
  {
    title: "Pagos",
    url: "/admin/payments",
    icon: DollarSign,
  },
];

const settingsItems = [
  {
    title: "Configuración",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-bold text-lg">MedScribe AI</h1>
            <p className="text-xs text-muted-foreground">Plataforma Médica</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={isActive(item.url) ? "bg-accent text-accent-foreground" : ""}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={isActive(item.url) ? "bg-accent text-accent-foreground" : ""}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={isActive(item.url) ? "bg-accent text-accent-foreground" : ""}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user?.user_metadata?.first_name?.[0] || 'U'}
                      {user?.user_metadata?.last_name?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    Dr. {user?.user_metadata?.first_name || 'Usuario'}
                  </span>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User2 className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}