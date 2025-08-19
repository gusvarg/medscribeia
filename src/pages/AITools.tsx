
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Settings, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MEDICAL_SPECIALTIES } from '@/constants/medicalSpecialties';

interface AISettings {
  id?: string;
  assistant_name: string;
  model_provider: string;
  model_name: string;
  temperature: number;
  specialty_override: string;
  system_prompt: string;
}

export default function AITools() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AISettings>({
    assistant_name: 'Asistente médico',
    model_provider: 'openai',
    model_name: 'gpt-4o-mini',
    temperature: 0.2,
    specialty_override: '',
    system_prompt: ''
  });

  useEffect(() => {
    if (user) {
      fetchAISettings();
    }
  }, [user]);

  const fetchAISettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching AI settings:', error);
        return;
      }

      if (data) {
        setSettings({
          id: data.id,
          assistant_name: data.assistant_name || 'Asistente médico',
          model_provider: data.model_provider || 'openai',
          model_name: data.model_name || 'gpt-4o-mini',
          temperature: data.temperature || 0.2,
          specialty_override: data.specialty_override || '',
          system_prompt: data.system_prompt || ''
        });
      }
    } catch (error) {
      console.error('Error fetching AI settings:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const settingsData = {
        user_id: user?.id,
        assistant_name: settings.assistant_name,
        model_provider: settings.model_provider,
        model_name: settings.model_name,
        temperature: settings.temperature,
        specialty_override: settings.specialty_override || null,
        system_prompt: settings.system_prompt || null
      };

      const { error } = await supabase
        .from('ai_settings')
        .upsert(settingsData, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "La configuración de IA se ha guardado correctamente.",
      });

      fetchAISettings(); // Refrescar para obtener el ID si es nuevo
    } catch (error: any) {
      console.error('Error saving AI settings:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const modelOptions = {
    openai: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
    ],
    anthropic: [
      { value: 'claude-3-opus', label: 'Claude 3 Opus' },
      { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-haiku', label: 'Claude 3 Haiku' }
    ]
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">IA Médica</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración del Asistente de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="assistant_name">Nombre del Asistente</Label>
                  <Input
                    id="assistant_name"
                    value={settings.assistant_name}
                    onChange={(e) => setSettings({...settings, assistant_name: e.target.value})}
                    placeholder="Ej: Dr. IA, Asistente Médico..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model_provider">Proveedor de IA</Label>
                  <Select 
                    value={settings.model_provider} 
                    onValueChange={(value) => setSettings({...settings, model_provider: value, model_name: modelOptions[value as keyof typeof modelOptions][0].value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model_name">Modelo de IA</Label>
                  <Select value={settings.model_name} onValueChange={(value) => setSettings({...settings, model_name: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions[settings.model_provider as keyof typeof modelOptions].map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Creatividad (Temperatura)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={settings.temperature}
                    onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value) || 0})}
                  />
                  <p className="text-xs text-muted-foreground">
                    0 = Más preciso, 2 = Más creativo
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty_override">Especialidad por Defecto (Opcional)</Label>
                <Select value={settings.specialty_override} onValueChange={(value) => setSettings({...settings, specialty_override: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una especialidad..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin especialidad específica</SelectItem>
                    {MEDICAL_SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt">Prompt del Sistema (Opcional)</Label>
                <Textarea
                  id="system_prompt"
                  value={settings.system_prompt}
                  onChange={(e) => setSettings({...settings, system_prompt: e.target.value})}
                  placeholder="Instrucciones específicas para el asistente de IA médico..."
                  rows={6}
                  className="min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground">
                  Define cómo debe comportarse el asistente de IA en las consultas médicas.
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Herramientas de IA Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-medium">Análisis de Síntomas</h3>
                <p className="text-sm text-muted-foreground">
                  Asistencia en el análisis e interpretación de síntomas reportados por pacientes.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Próximamente
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-medium">Sugerencias Diagnósticas</h3>
                <p className="text-sm text-muted-foreground">
                  Recomendaciones basadas en evidencia para diagnósticos diferenciales.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Próximamente
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-medium">Planes de Tratamiento</h3>
                <p className="text-sm text-muted-foreground">
                  Sugerencias para planes de tratamiento basados en guías clínicas.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Próximamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
