import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Calendar() {
  const handleNewAppointment = () => {
    toast({
      title: "Funcionalidad Activada",
      description: "Programación de nueva cita médica próximamente disponible.",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Agenda</h1>
          <Button onClick={handleNewAppointment}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendario de Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí se mostrará el calendario con las citas programadas.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}