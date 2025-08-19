
import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Users, Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Calendar() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Agenda</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
        
        <Card className="border-2 border-dashed border-muted">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
              Próximamente
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground text-lg">
              El sistema de agenda médica estará disponible próximamente
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">📅 Gestión de Citas</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Programación automática de citas</li>
                  <li>• Vista de calendario mensual y semanal</li>
                  <li>• Recordatorios por SMS/Email</li>
                  <li>• Gestión de disponibilidad médica</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">⏰ Funciones Avanzadas</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Reprogramación automática</li>
                  <li>• Lista de espera inteligente</li>
                  <li>• Sincronización con calendarios externos</li>
                  <li>• Reportes de ocupación y tiempos</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 pt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Optimización de horarios</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">Gestión de pacientes</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bell className="h-4 w-4" />
                <span className="text-sm">Notificaciones automáticas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
