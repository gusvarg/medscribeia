import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus,
  Edit,
  Trash2,
  Brain,
  Settings,
  CheckCircle,
  XCircle,
  Globe,
  Zap,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIConfig {
  id: string;
  name: string;
  provider: string;
  model: string;
  description: string;
  is_active: boolean;
  country_code: string;
  config: {
    api_key?: string;
    base_url?: string;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    timeout?: number;
    system_prompt?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function AIConfigs() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [aiConfigs, setAIConfigs] = useState<AIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConfig, setTestingConfig] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    model: '',
    description: '',
    is_active: true,
    country_code: 'CO',
    api_key: '',
    base_url: '',
    max_tokens: '4096',
    temperature: '0.7',
    top_p: '1.0',
    frequency_penalty: '0.0',
    presence_penalty: '0.0',
    timeout: '30',
    system_prompt: ''
  });

  const aiProviders = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
    { value: 'google', label: 'Google (Gemini)' },
    { value: 'cohere', label: 'Cohere' },
    { value: 'huggingface', label: 'Hugging Face' },
    { value: 'azure-openai', label: 'Azure OpenAI' },
    { value: 'ollama', label: 'Ollama (Local)' },
    { value: 'custom', label: 'API Personalizada' }
  ];

  const models = {
    openai: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'gpt-4'
    ],
    anthropic: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ],
    google: [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro'
    ],
    cohere: [
      'command',
      'command-light',
      'command-nightly'
    ]
  };

  const countries = [
    { value: 'CO', label: 'Colombia' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'MX', label: 'México' },
    { value: 'AR', label: 'Argentina' },
    { value: 'BR', label: 'Brasil' },
    { value: 'CL', label: 'Chile' },
    { value: 'PE', label: 'Perú' },
    { value: 'ES', label: 'España' },
    { value: 'GLOBAL', label: 'Global' }
  ];

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'super_admin') {
      fetchAIConfigs();
    }
  }, [userRole]);

  const fetchAIConfigs = async () => {
    try {
      // TODO: Replace with actual database call once tables are created
      const mockConfigs: AIConfig[] = [
        {
          id: '1',
          name: 'OpenAI GPT-4 Colombia',
          provider: 'openai',
          model: 'gpt-4',
          description: 'Configuración principal para Colombia',
          is_active: true,
          country_code: 'CO',
          config: {
            api_key: '••••••••••••••••',
            base_url: 'https://api.openai.com/v1',
            max_tokens: 4000,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            system_prompt: 'Eres un asistente médico especializado en Colombia.'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setAIConfigs(mockConfigs);
    } catch (error) {
      console.error('Error fetching AI configs:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de IA.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testAIConnection = async (configId: string) => {
    setTestingConfig(configId);
    try {
      const { data, error } = await supabase.functions.invoke('test-ai-connection', {
        body: { config_id: configId }
      });

      if (error) throw error;

      toast({
        title: "Conexión exitosa",
        description: "La conexión con la IA ha sido probada correctamente.",
      });
    } catch (error) {
      console.error('Error testing AI connection:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con la IA. Verifica la configuración.",
        variant: "destructive"
      });
    } finally {
      setTestingConfig(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const configData = {
        name: formData.name,
        provider: formData.provider,
        model: formData.model,
        description: formData.description,
        is_active: formData.is_active,
        country_code: formData.country_code,
        config: {
          api_key: formData.api_key || undefined,
          base_url: formData.base_url || undefined,
          max_tokens: parseInt(formData.max_tokens),
          temperature: parseFloat(formData.temperature),
          top_p: parseFloat(formData.top_p),
          frequency_penalty: parseFloat(formData.frequency_penalty),
          presence_penalty: parseFloat(formData.presence_penalty),
          timeout: parseInt(formData.timeout),
          system_prompt: formData.system_prompt || undefined
        }
      };

      // TODO: Replace with actual database operations once tables are created
      console.log('Mock save operation:', configData);
      // Simulate success for now

      toast({
        title: editingConfig ? "Configuración actualizada" : "Configuración creada",
        description: `La configuración de IA ha sido ${editingConfig ? 'actualizada' : 'creada'} correctamente.`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchAIConfigs();
    } catch (error) {
      console.error('Error saving AI config:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de IA.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (config: AIConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      provider: config.provider,
      model: config.model,
      description: config.description,
      is_active: config.is_active,
      country_code: config.country_code,
      api_key: config.config.api_key || '',
      base_url: config.config.base_url || '',
      max_tokens: config.config.max_tokens?.toString() || '4096',
      temperature: config.config.temperature?.toString() || '0.7',
      top_p: config.config.top_p?.toString() || '1.0',
      frequency_penalty: config.config.frequency_penalty?.toString() || '0.0',
      presence_penalty: config.config.presence_penalty?.toString() || '0.0',
      timeout: config.config.timeout?.toString() || '30',
      system_prompt: config.config.system_prompt || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta configuración de IA?')) return;

    try {
      // TODO: Replace with actual database operation once tables are created
      console.log('Mock delete operation:', configId);

      toast({
        title: "Configuración eliminada",
        description: "La configuración de IA ha sido eliminada correctamente.",
      });

      fetchAIConfigs();
    } catch (error) {
      console.error('Error deleting AI config:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la configuración de IA.",
        variant: "destructive"
      });
    }
  };

  const toggleConfigStatus = async (configId: string, isActive: boolean) => {
    try {
      // TODO: Replace with actual database operation once tables are created
      console.log('Mock toggle operation:', configId, !isActive);

      toast({
        title: isActive ? "Configuración desactivada" : "Configuración activada",
        description: `La configuración de IA ha sido ${isActive ? 'desactivada' : 'activada'} correctamente.`,
      });

      fetchAIConfigs();
    } catch (error) {
      console.error('Error toggling AI config status:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la configuración.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      model: '',
      description: '',
      is_active: true,
      country_code: 'CO',
      api_key: '',
      base_url: '',
      max_tokens: '4096',
      temperature: '0.7',
      top_p: '1.0',
      frequency_penalty: '0.0',
      presence_penalty: '0.0',
      timeout: '30',
      system_prompt: ''
    });
    setEditingConfig(null);
  };

  return (
    <AdminLayout requireAdmin={true}>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configuración de IA</h1>
        <div className="flex gap-3">
          <Badge variant="secondary">
            <Brain className="h-4 w-4 mr-2" />
            {aiConfigs.length} configuraciones
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Configuración
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingConfig ? 'Editar Configuración de IA' : 'Crear Nueva Configuración de IA'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider">Proveedor</Label>
                    <Select value={formData.provider} onValueChange={(value) => setFormData({...formData, provider: value, model: ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {aiProviders.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="model">Modelo</Label>
                    <Select value={formData.model} onValueChange={(value) => setFormData({...formData, model: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.provider && models[formData.provider as keyof typeof models] ? 
                          models[formData.provider as keyof typeof models].map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          )) : 
                          <SelectItem value="custom">Modelo personalizado</SelectItem>
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="country_code">País/Región</Label>
                    <Select value={formData.country_code} onValueChange={(value) => setFormData({...formData, country_code: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Configuración de API</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="api_key">API Key</Label>
                      <Input
                        id="api_key"
                        type="password"
                        value={formData.api_key}
                        onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                        placeholder="••••••••••••••••"
                      />
                    </div>
                    <div>
                      <Label htmlFor="base_url">Base URL (opcional)</Label>
                      <Input
                        id="base_url"
                        value={formData.base_url}
                        onChange={(e) => setFormData({...formData, base_url: e.target.value})}
                        placeholder="https://api.example.com/v1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Parámetros del Modelo</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="max_tokens">Max Tokens</Label>
                      <Input
                        id="max_tokens"
                        type="number"
                        value={formData.max_tokens}
                        onChange={(e) => setFormData({...formData, max_tokens: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={formData.temperature}
                        onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeout">Timeout (s)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={formData.timeout}
                        onChange={(e) => setFormData({...formData, timeout: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="system_prompt">System Prompt (opcional)</Label>
                  <Textarea
                    id="system_prompt"
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                    rows={3}
                    placeholder="Eres un asistente médico especializado..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Configuración activa</Label>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingConfig ? 'Actualizar' : 'Crear'} Configuración
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabla de configuraciones de IA */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Configuraciones de IA</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Configuración</TableHead>
                  <TableHead>Proveedor/Modelo</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Parámetros</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aiConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{config.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {config.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {aiProviders.find(p => p.value === config.provider)?.label || config.provider}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {config.model}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {countries.find(c => c.value === config.country_code)?.label || config.country_code}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.is_active ? 'default' : 'secondary'}>
                          {config.is_active ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {config.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Switch
                          checked={config.is_active}
                          onCheckedChange={() => toggleConfigStatus(config.id, config.is_active)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div>Tokens: {config.config.max_tokens}</div>
                        <div>Temp: {config.config.temperature}</div>
                        <div>Timeout: {config.config.timeout}s</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testAIConnection(config.id)}
                          disabled={testingConfig === config.id}
                        >
                          {testingConfig === config.id ? (
                            <Zap className="h-3 w-3 animate-spin" />
                          ) : (
                            <TestTube className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(config.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}