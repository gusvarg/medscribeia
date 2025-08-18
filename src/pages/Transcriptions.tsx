import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Plus } from 'lucide-react';

export default function Transcriptions() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Transcripciones</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transcripción
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Lista de Transcripciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aquí se mostrarán las transcripciones de audio médicas.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}