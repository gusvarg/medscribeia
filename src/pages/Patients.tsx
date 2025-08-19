import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Patients() {
  const handleNewPatient = () => {
    toast({
      title: "Funcionalidad Activada",
      description: "Formulario para nuevo paciente próximamente disponible.",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <Button onClick={handleNewPatient}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí se mostrará la lista de pacientes registrados.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}