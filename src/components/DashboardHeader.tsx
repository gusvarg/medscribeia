import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <SidebarTrigger />
        
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pacientes, consultas..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notificaciones</h3>
              </div>
              <div className="max-h-96 overflow-auto">
                <DropdownMenuItem className="flex-col items-start p-4">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-medium">Nueva transcripción</span>
                    <span className="text-xs text-muted-foreground">2 min</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consulta de María González transcrita exitosamente
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-col items-start p-4">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-medium">Recordatorio</span>
                    <span className="text-xs text-muted-foreground">15 min</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consulta programada a las 3:00 PM
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-col items-start p-4">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-medium">Sistema</span>
                    <span className="text-xs text-muted-foreground">1 hora</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Actualización de IA disponible
                  </p>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}