import React, { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Consultorio {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export default function Consultorios() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [consultorioName, setConsultorioName] = useState('');
  const queryClient = useQueryClient();

  const { data: consultorios, isLoading } = useQuery({
    queryKey: ['consultorios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultorios' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as unknown) as Consultorio[];
    },
  });

  const createConsultorioMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('consultorios' as any)
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultorios'] });
      setConsultorioName('');
      setIsDialogOpen(false);
      toast.success('Consultorio creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear consultorio: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultorioName.trim()) {
      toast.error('El nombre del consultorio es requerido');
      return;
    }
    createConsultorioMutation.mutate(consultorioName.trim());
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Consultorios</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Consultorio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Consultorio</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Consultorio</Label>
                  <Input
                    id="name"
                    value={consultorioName}
                    onChange={(e) => setConsultorioName(e.target.value)}
                    placeholder="Ej: Centro Médico Calle 49"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createConsultorioMutation.isPending}
                  >
                    {createConsultorioMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lista de Consultorios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Cargando consultorios...</p>
            ) : consultorios?.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No tienes consultorios registrados
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear tu primer consultorio
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            ) : (
              <div className="grid gap-4">
                {consultorios?.map((consultorio) => (
                  <div key={consultorio.id} className="flex items-center p-4 border rounded-lg">
                    <Building2 className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <h3 className="font-semibold">{consultorio.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Creado: {new Date(consultorio.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}