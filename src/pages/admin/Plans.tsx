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
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: string;
  features: string[];
  is_active: boolean;
  stripe_price_id?: string;
  paypal_plan_id?: string;
  mercadopago_plan_id?: string;
  created_at: string;
}

export default function Plans() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    billing_cycle: 'monthly',
    features: '',
    is_active: true,
    stripe_price_id: '',
    paypal_plan_id: '',
    mercadopago_plan_id: ''
  });

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'super_admin') {
      fetchPlans();
    }
  }, [userRole]);

  const fetchPlans = async () => {
    try {
      // TODO: Replace with actual database call once tables are created
      const mockPlans: Plan[] = [
        {
          id: '1',
          name: 'Plan Básico',
          description: 'Plan básico para consultorios pequeños',
          price: 99000,
          currency: 'COP',
          billing_cycle: 'monthly',
          features: ['5 consultas por mes', 'Transcripción básica', 'Soporte por email'],
          is_active: true,
          stripe_price_id: 'price_basic_cop',
          paypal_plan_id: '',
          mercadopago_plan_id: 'MP-BASIC-001',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Plan Profesional',
          description: 'Plan profesional para consultorios medianos',
          price: 199000,
          currency: 'COP',
          billing_cycle: 'monthly',
          features: ['50 consultas por mes', 'IA avanzada', 'Análisis detallado', 'Soporte prioritario'],
          is_active: true,
          stripe_price_id: 'price_pro_cop',
          paypal_plan_id: '',
          mercadopago_plan_id: 'MP-PRO-001',
          created_at: new Date().toISOString()
        }
      ];
      setPlans(mockPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const planData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        billing_cycle: formData.billing_cycle,
        features: formData.features.split('\n').filter(f => f.trim()),
        is_active: formData.is_active,
        stripe_price_id: formData.stripe_price_id || null,
        paypal_plan_id: formData.paypal_plan_id || null,
        mercadopago_plan_id: formData.mercadopago_plan_id || null
      };

      // TODO: Replace with actual database operations once tables are created
      console.log('Mock save operation:', planData);
      // Simulate success for now

      toast({
        title: editingPlan ? "Plan actualizado" : "Plan creado",
        description: `El plan ha sido ${editingPlan ? 'actualizado' : 'creado'} correctamente.`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el plan.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      currency: plan.currency,
      billing_cycle: plan.billing_cycle,
      features: plan.features.join('\n'),
      is_active: plan.is_active,
      stripe_price_id: plan.stripe_price_id || '',
      paypal_plan_id: plan.paypal_plan_id || '',
      mercadopago_plan_id: plan.mercadopago_plan_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan?')) return;

    try {
      // TODO: Replace with actual database operation once tables are created
      console.log('Mock delete operation:', planId);

      toast({
        title: "Plan eliminado",
        description: "El plan ha sido eliminado correctamente.",
      });

      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan.",
        variant: "destructive"
      });
    }
  };

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      // TODO: Replace with actual database operation once tables are created
      console.log('Mock toggle operation:', planId, !isActive);

      toast({
        title: isActive ? "Plan desactivado" : "Plan activado",
        description: `El plan ha sido ${isActive ? 'desactivado' : 'activado'} correctamente.`,
      });

      fetchPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del plan.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      billing_cycle: 'monthly',
      features: '',
      is_active: true,
      stripe_price_id: '',
      paypal_plan_id: '',
      mercadopago_plan_id: ''
    });
    setEditingPlan(null);
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
        <h1 className="text-3xl font-bold">Gestión de Planes</h1>
        <div className="flex gap-3">
          <Badge variant="secondary">
            <Package className="h-4 w-4 mr-2" />
            {plans.length} planes
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Plan</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="billing_cycle">Ciclo de Facturación</Label>
                    <Select value={formData.billing_cycle} onValueChange={(value) => setFormData({...formData, billing_cycle: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="annually">Anual</SelectItem>
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
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="features">Características (una por línea)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    rows={4}
                    placeholder="Característica 1&#10;Característica 2&#10;Característica 3"
                  />
                </div>

                <div className="space-y-3">
                  <Label>IDs de Plataformas de Pago</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
                      <Input
                        id="stripe_price_id"
                        value={formData.stripe_price_id}
                        onChange={(e) => setFormData({...formData, stripe_price_id: e.target.value})}
                        placeholder="price_1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paypal_plan_id">PayPal Plan ID</Label>
                      <Input
                        id="paypal_plan_id"
                        value={formData.paypal_plan_id}
                        onChange={(e) => setFormData({...formData, paypal_plan_id: e.target.value})}
                        placeholder="P-1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mercadopago_plan_id">MercadoPago Plan ID</Label>
                      <Input
                        id="mercadopago_plan_id"
                        value={formData.mercadopago_plan_id}
                        onChange={(e) => setFormData({...formData, mercadopago_plan_id: e.target.value})}
                        placeholder="MP-1234567890"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Plan activo</Label>
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
                    {editingPlan ? 'Actualizar' : 'Crear'} Plan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabla de planes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Planes</CardTitle>
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
                  <TableHead>Plan</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Plataformas</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {plan.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {plan.features.length} características
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {plan.price} {plan.currency}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {plan.billing_cycle === 'monthly' ? 'Mensual' :
                         plan.billing_cycle === 'quarterly' ? 'Trimestral' : 'Anual'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                          {plan.is_active ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {plan.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Switch
                          checked={plan.is_active}
                          onCheckedChange={() => togglePlanStatus(plan.id, plan.is_active)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {plan.stripe_price_id && (
                          <Badge variant="outline" className="text-xs">Stripe</Badge>
                        )}
                        {plan.paypal_plan_id && (
                          <Badge variant="outline" className="text-xs">PayPal</Badge>
                        )}
                        {plan.mercadopago_plan_id && (
                          <Badge variant="outline" className="text-xs">MercadoPago</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(plan.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(plan.id)}
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