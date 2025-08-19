
import React, { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const consultorioSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  address: z.string().optional(),
});

type ConsultorioFormValues = z.infer<typeof consultorioSchema>;

interface Consultorio {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export default function Consultorios() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingConsultorio, setEditingConsultorio] = useState<Consultorio | null>(null);

  const form = useForm<ConsultorioFormValues>({
    resolver: zodResolver(consultorioSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  const { data: consultorios = [], isLoading, refetch } = useQuery({
    queryKey: ['consultorios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultorios')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Consultorio[];
    },
  });

  const addConsultorio = useMutation({
    mutationFn: async (values: ConsultorioFormValues) => {
      if (!user) throw new Error('No autenticado');
      const { error } = await supabase
        .from('consultorios')
        .insert({
          name: values.name,
          address: values.address || null,
          user_id: user.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Consultorio creado', description: 'El consultorio se añadió correctamente.' });
      form.reset();
      setOpen(false);
      refetch();
    },
    onError: (err: any) => {
      toast({ 
        title: 'Error al crear consultorio', 
        description: err.message.includes('consultorios_user_name_unique') 
          ? 'Ya tienes un consultorio con ese nombre' 
          : 'Intenta nuevamente', 
        variant: 'destructive' 
      });
    },
  });

  const updateConsultorio = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ConsultorioFormValues }) => {
      const { error } = await supabase
        .from('consultorios')
        .update({
          name: values.name,
          address: values.address || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Consultorio actualizado', description: 'Los cambios se guardaron correctamente.' });
      form.reset();
      setEditingConsultorio(null);
      setOpen(false);
      refetch();
    },
    onError: (err: any) => {
      toast({ 
        title: 'Error al actualizar consultorio', 
        description: err.message.includes('consultorios_user_name_unique') 
          ? 'Ya tienes un consultorio con ese nombre' 
          : 'Intenta nuevamente', 
        variant: 'destructive' 
      });
    },
  });

  const deleteConsultorio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('consultorios')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Consultorio eliminado', description: 'El consultorio se eliminó correctamente.' });
      refetch();
    },
    onError: (err: any) => {
      toast({ title: 'Error al eliminar consultorio', description: err.message, variant: 'destructive' });
    },
  });

  const onSubmit = (values: ConsultorioFormValues) => {
    if (editingConsultorio) {
      updateConsultorio.mutate({ id: editingConsultorio.id, values });
    } else {
      addConsultorio.mutate(values);
    }
  };

  const handleEdit = (consultorio: Consultorio) => {
    setEditingConsultorio(consultorio);
    form.setValue('name', consultorio.name);
    form.setValue('address', consultorio.address || '');
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingConsultorio(null);
    form.reset();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Consultorios</h1>

          <Dialog open={open} onOpenChange={handleCloseDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Consultorio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingConsultorio ? 'Editar consultorio' : 'Agregar nuevo consultorio'}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del consultorio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Consultorio Centro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Dirección completa del consultorio"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={addConsultorio.isPending || updateConsultorio.isPending}>
                      {addConsultorio.isPending || updateConsultorio.isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Mis Consultorios ({consultorios.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Cargando consultorios...</div>
            ) : consultorios.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No tienes consultorios registrados. Agrega el primero con el botón "Nuevo Consultorio".
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Fecha de creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultorios.map((consultorio) => (
                    <TableRow key={consultorio.id}>
                      <TableCell className="font-medium">{consultorio.name}</TableCell>
                      <TableCell>{consultorio.address || '-'}</TableCell>
                      <TableCell>
                        {new Date(consultorio.created_at).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(consultorio)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteConsultorio.mutate(consultorio.id)}
                            disabled={deleteConsultorio.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
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
