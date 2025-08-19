import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AITools() {
  const handleConfigureAI = () => {
    toast({
      title: "IA Médica - Configuración",
      description: "Esta será la configuración de asistentes de IA para diagnósticos y análisis médicos.",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">IA Médica</h1>
          <Button onClick={handleConfigureAI}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar IA
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Herramientas de Inteligencia Artificial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí se encontrarán las herramientas de IA para asistencia médica.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}