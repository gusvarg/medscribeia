import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
  CreditCard,
  Settings,
  CheckCircle,
  XCircle,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  description: string;
  is_active: boolean;
  country_code: string;
  config: {
    api_key?: string;
    client_id?: string;
    client_secret?: string;
    public_key?: string;
    access_token?: string;
    webhook_url?: string;
    environment?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function PaymentMethods() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    is_active: true,
    country_code: 'CO',
    api_key: '',
    client_id: '',
    client_secret: '',
    public_key: '',
    access_token: '',
    webhook_url: '',
    environment: 'sandbox'
  });

  const paymentTypes = [
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'mercadopago', label: 'MercadoPago' },
    { value: 'wompi', label: 'Wompi (Colombia)' },
    { value: 'payu', label: 'PayU (Colombia)' },
    { value: 'epayco', label: 'ePayco (Colombia)' }
  ];

  const countries = [
    { value: 'CO', label: 'Colombia' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'MX', label: 'México' },
    { value: 'AR', label: 'Argentina' },
    { value: 'BR', label: 'Brasil' },
    { value: 'CL', label: 'Chile' },
    { value: 'PE', label: 'Perú' }
  ];

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'super_admin') {
      fetchPaymentMethods();
    }
  }, [userRole]);

  const fetchPaymentMethods = async () => {
    try {
      // TODO: Replace with actual database call once tables are created
      const mockMethods: PaymentMethod[] = [
        {
          id: '1',
          name: 'MercadoPago Colombia',
          type: 'mercadopago',
          description: 'Configuración principal de MercadoPago para Colombia',
          is_active: true,
          country_code: 'CO',
          config: {
            access_token: '••••••••••••••••',
            public_key: '••••••••••••••••',
            webhook_url: 'https://tudominio.com/webhook/mercadopago',
            environment: 'sandbox'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'PayPal Colombia',
          type: 'paypal',
          description: 'Configuración de PayPal para pagos internacionales',
          is_active: false,
          country_code: 'CO',
          config: {
            client_id: '••••••••••••••••',
            client_secret: '••••••••••••••••',
            webhook_url: 'https://tudominio.com/webhook/paypal',
            environment: 'sandbox'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setPaymentMethods(mockMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los métodos de pago.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const methodData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        is_active: formData.is_active,
        country_code: formData.country_code,
        config: {
          api_key: formData.api_key || undefined,
          client_id: formData.client_id || undefined,
          client_secret: formData.client_secret || undefined,
          public_key: formData.public_key || undefined,
          access_token: formData.access_token || undefined,
          webhook_url: formData.webhook_url || undefined,
          environment: formData.environment
        }
      };

      // TODO: Replace with actual database operations once tables are created
      console.log('Mock save operation:', methodData);
      // Simulate success for now

      toast({
        title: editingMethod ? "Método actualizado" : "Método creado",
        description: `El método de pago ha sido ${editingMethod ? 'actualizado' : 'creado'} correctamente.`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el método de pago.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      description: method.description,
      is_active: method.is_active,
      country_code: method.country_code,
      api_key: method.config.api_key || '',
      client_id: method.config.client_id || '',
      client_secret: method.config.client_secret || '',
      public_key: method.config.public_key || '',
      access_token: method.config.access_token || '',
      webhook_url: method.config.webhook_url || '',
      environment: method.config.environment || 'sandbox'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este método de pago?')) return;

    try {
      // TODO: Replace with actual database operation once tables are created
      console.log('Mock delete operation:', methodId);

      toast({
        title: "Método eliminado",
        description: "El método de pago ha sido eliminado correctamente.",
      });

      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el método de pago.",
        variant: "destructive"
      });
    }
  };

  const toggleMethodStatus = async (methodId: string, isActive: boolean) => {
    try {
      // TODO: Replace with actual database operation once tables are created
      console.log('Mock toggle operation:', methodId, !isActive);

      toast({
        title: isActive ? "Método desactivado" : "Método activado",
        description: `El método de pago ha sido ${isActive ? 'desactivado' : 'activado'} correctamente.`,
      });

      fetchPaymentMethods();
    } catch (error) {
      console.error('Error toggling payment method status:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del método de pago.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      is_active: true,
      country_code: 'CO',
      api_key: '',
      client_id: '',
      client_secret: '',
      public_key: '',
      access_token: '',
      webhook_url: '',
      environment: 'sandbox'
    });
    setEditingMethod(null);
  };

  const getConfigFields = (type: string) => {
    switch (type) {
      case 'stripe':
        return ['api_key', 'public_key', 'webhook_url'];
      case 'paypal':
        return ['client_id', 'client_secret', 'webhook_url'];
      case 'mercadopago':
        return ['access_token', 'public_key', 'webhook_url'];
      case 'wompi':
        return ['public_key', 'api_key', 'webhook_url'];
      case 'payu':
        return ['api_key', 'client_id', 'webhook_url'];
      case 'epayco':
        return ['public_key', 'api_key', 'webhook_url'];
      default:
        return ['api_key', 'webhook_url'];
    }
  };

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Acceso Denegado</h2>
          <p className="text-muted-foreground mt-2">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Métodos de Pago</h1>
        <div className="flex gap-3">
          <Badge variant="secondary">
            <CreditCard className="h-4 w-4 mr-2" />
            {paymentMethods.length} métodos
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Método
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMethod ? 'Editar Método de Pago' : 'Crear Nuevo Método de Pago'}
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
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country_code">País</Label>
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
                  <div>
                    <Label htmlFor="environment">Entorno</Label>
                    <Select value={formData.environment} onValueChange={(value) => setFormData({...formData, environment: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox/Test</SelectItem>
                        <SelectItem value="production">Producción</SelectItem>
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

                {formData.type && (
                  <div className="space-y-3">
                    <Label>Configuración</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {getConfigFields(formData.type).map((field) => (
                        <div key={field}>
                          <Label htmlFor={field}>
                            {field === 'api_key' ? 'API Key' :
                             field === 'client_id' ? 'Client ID' :
                             field === 'client_secret' ? 'Client Secret' :
                             field === 'public_key' ? 'Public Key' :
                             field === 'access_token' ? 'Access Token' :
                             field === 'webhook_url' ? 'Webhook URL' : field}
                          </Label>
                          <Input
                            id={field}
                            type={field.includes('secret') || field.includes('key') ? 'password' : 'text'}
                            value={formData[field as keyof typeof formData] as string}
                            onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                            placeholder={
                              field === 'webhook_url' ? 'https://tu-dominio.com/webhook' :
                              field.includes('key') ? '••••••••••••••••' : ''
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Método activo</Label>
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
                    {editingMethod ? 'Actualizar' : 'Crear'} Método
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabla de métodos de pago */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Métodos de Pago</CardTitle>
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
                  <TableHead>Método</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Entorno</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Configuración</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {method.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {paymentTypes.find(t => t.value === method.type)?.label || method.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {countries.find(c => c.value === method.country_code)?.label || method.country_code}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={method.config.environment === 'production' ? 'default' : 'secondary'}>
                        {method.config.environment === 'production' ? 'Producción' : 'Sandbox'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={method.is_active ? 'default' : 'secondary'}>
                          {method.is_active ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {method.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Switch
                          checked={method.is_active}
                          onCheckedChange={() => toggleMethodStatus(method.id, method.is_active)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        <span className="text-xs">
                          {Object.keys(method.config).filter(key => method.config[key as keyof typeof method.config]).length} configurados
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(method)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(method.id)}
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
  );
}