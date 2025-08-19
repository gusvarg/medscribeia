import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Stethoscope, FileSearch, Lightbulb, ArrowLeft, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AITools() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">IA Médica</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
        
        <Card className="border-2 border-dashed border-muted">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Brain className="h-8 w-8 text-muted-foreground" />
              Laboratorio de Herramientas IA
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground text-lg">
              Funcionalidades de inteligencia artificial médica en desarrollo
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="border rounded-lg p-6 space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-center justify-center">
                  <Stethoscope className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Asistente por Voz</h3>
                <p className="text-sm text-muted-foreground">
                  Dicta consultas médicas y recibe sugerencias en tiempo real durante la atención al paciente
                </p>
                <Button variant="outline" size="sm" disabled className="w-full">
                  <Mic className="h-4 w-4 mr-2" />
                  Próximamente
                </Button>
              </div>
              
              <div className="border rounded-lg p-6 space-y-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="flex items-center justify-center">
                  <FileSearch className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Análisis de Síntomas</h3>
                <p className="text-sm text-muted-foreground">
                  Procesamiento inteligente de síntomas para sugerir diagnósticos diferenciales basados en evidencia
                </p>
                <Button variant="outline" size="sm" disabled className="w-full">
                  Próximamente
                </Button>
              </div>
              
              <div className="border rounded-lg p-6 space-y-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                <div className="flex items-center justify-center">
                  <Lightbulb className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Planes Inteligentes</h3>
                <p className="text-sm text-muted-foreground">
                  Generación automática de planes de tratamiento personalizados según guías clínicas actualizadas
                </p>
                <Button variant="outline" size="sm" disabled className="w-full">
                  Próximamente
                </Button>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-6 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">🔬 En el Laboratorio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-medium mb-2">Capacidades Avanzadas</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Reconocimiento de voz médica especializada</li>
                    <li>• Integración con bases de datos médicas</li>
                    <li>• Análisis de patrones en historiales clínicos</li>
                    <li>• Alertas de interacciones medicamentosas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Seguridad y Privacidad</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cumplimiento con normativas HIPAA</li>
                    <li>• Procesamiento local de datos sensibles</li>
                    <li>• Auditoría completa de acciones IA</li>
                    <li>• Control total del médico sobre sugerencias</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}