import React, { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Eye, Brain, Mic, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Colombian EPS list
const COLOMBIAN_EPS = [
  'Aliansalud EPS', 'Asociación Mutual La Esperanza', 'Capital Salud EPS', 'Capresoca EPS',
  'Compensar EPS', 'Comfenalco Valle EPS', 'Coomeva EPS', 'EPS Coosalud',
  'EPS Famisanar', 'EPS Sanitas', 'EPS SURA', 'Ferrocarriles', 'Mutual Ser ESS',
  'Nueva EPS', 'Régimen Subsidiado', 'Salud Total EPS', 'Servicio Occidental de Salud EPS SOS'
];

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
  { value: 'DNI', label: 'DNI' },
  { value: 'PP', label: 'Pasaporte' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' }
];

const patientSchema = z.object({
  full_name: z.string().min(1, 'El nombre completo es obligatorio'),
  document_type: z.string().min(1, 'El tipo de documento es obligatorio'),
  document_number: z.string().min(1, 'El número de documento es obligatorio'),
  eps: z.string().min(1, 'La EPS es obligatoria'),
  phone: z.string().min(1, 'El teléfono es obligatorio'),
  email: z.string().email('Email inválido').min(1, 'El correo electrónico es obligatorio'),
  consultorio_id: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function Patients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<'manual' | 'ai'>('manual');

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      full_name: '',
      document_type: '',
      document_number: '',
      eps: '',
      phone: '+57 ',
      email: '',
      consultorio_id: '',
    },
  });

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone, email, document_number, document_type')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: consultorios } = useQuery({
    queryKey: ['consultorios'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('consultorios')
        .select('id, name, address')
        .eq('user_id', user?.id)
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const addPatient = useMutation({
    mutationFn: async (values: PatientFormValues) => {
      if (!user) throw new Error('No autenticado');
      
      // Split full name into first_name and last_name
      const nameParts = values.full_name.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';
      
      const payload = {
        first_name,
        last_name,
        document_type: values.document_type,
        document_number: values.document_number,
        phone: values.phone,
        email: values.email,
        user_id: user.id,
        consultorio_id: values.consultorio_id && values.consultorio_id !== '' ? values.consultorio_id : null,
        // Store EPS in medical_history for now until we add it to schema
        medical_history: `EPS: ${values.eps}`,
      };
      const { data, error } = await supabase
        .from('patients')
        .insert(payload as any)
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      toast({ title: 'Paciente creado', description: 'El paciente se añadió correctamente.' });
      form.reset();
      form.setValue('phone', '+57 ');
      setOpen(false);
      setAiOpen(false);
      await refetch();
    },
    onError: (err: any) => {
      toast({ title: 'Error al crear paciente', description: err.message ?? 'Intenta nuevamente', variant: 'destructive' });
    },
  });

  const onSubmit = (values: PatientFormValues) => addPatient.mutate(values);

  const handleModeChange = (mode: 'manual' | 'ai') => {
    setRegistrationMode(mode);
    if (mode === 'ai') {
      setOpen(false);
      setAiOpen(true);
    } else {
      setAiOpen(false);
      setOpen(true);
    }
  };

  const emptyState = useMemo(() => (
    <div className="text-sm text-muted-foreground">No hay pacientes aún. Agrega el primero con el botón "Nuevo Paciente".</div>
  ), []);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pacientes</h1>

          <div className="flex gap-2">
            <Button onClick={() => handleModeChange('manual')}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Nuevo Paciente Manualmente
            </Button>
            <Button variant="outline" onClick={() => handleModeChange('ai')}>
              <Mic className="h-4 w-4 mr-2" />
              Registrar con IA
            </Button>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div />
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Paciente Manualmente</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre completo del paciente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="document_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Documento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DOCUMENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="document_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número Documento</FormLabel>
                          <FormControl>
                            <Input placeholder="Número sin puntos ni comas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="eps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EPS</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona EPS" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {COLOMBIAN_EPS.map((eps) => (
                              <SelectItem key={eps} value={eps}>
                                {eps}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+57 300 000 0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {consultorios && consultorios.length > 0 && (
                    <FormField
                      control={form.control}
                      name="consultorio_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asignar a Consultorio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona consultorio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {consultorios.map((consultorio) => (
                                <SelectItem key={consultorio.id} value={consultorio.id}>
                                  {consultorio.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={addPatient.isPending}>
                      {addPatient.isPending ? 'Guardando...' : 'Guardar Paciente'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* AI Registration Sheet */}
          <Sheet open={aiOpen} onOpenChange={setAiOpen}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Registrar Paciente con IA
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Habla claramente y menciona cada campo:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Nombre completo:</strong> "Juan Carlos Pérez López"</li>
                    <li>• <strong>Tipo documento:</strong> "Cédula de ciudadanía"</li>
                    <li>• <strong>Número documento:</strong> "12345678"</li>
                    <li>• <strong>EPS:</strong> "EPS Sura"</li>
                    <li>• <strong>Teléfono:</strong> "3001234567"</li>
                    <li>• <strong>Correo:</strong> "juan@ejemplo.com"</li>
                    <li>• <strong>Consultorio:</strong> "Centro Médico Principal"</li>
                  </ul>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Se llenará automáticamente..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="document_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo Documento</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Auto..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DOCUMENT_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="document_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número Documento</FormLabel>
                            <FormControl>
                              <Input placeholder="Auto..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="eps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EPS</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Auto..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[200px]">
                              {COLOMBIAN_EPS.map((eps) => (
                                <SelectItem key={eps} value={eps}>
                                  {eps}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="Auto..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Auto..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {consultorios && consultorios.length > 0 && (
                      <FormField
                        control={form.control}
                        name="consultorio_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asignar a Consultorio</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Auto..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {consultorios.map((consultorio) => (
                                  <SelectItem key={consultorio.id} value={consultorio.id}>
                                    {consultorio.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="pt-4 space-y-2">
                      <Button 
                        type="button" 
                        className="w-full" 
                        variant="outline"
                        size="lg"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Empezar Grabación
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setAiOpen(false)} className="flex-1">
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={addPatient.isPending} className="flex-1">
                          {addPatient.isPending ? 'Guardando...' : 'Guardar Paciente'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Cargando pacientes...</div>
            ) : !patients || patients.length === 0 ? (
              emptyState
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.first_name} {p.last_name}</TableCell>
                        <TableCell>{p.document_type} {p.document_number}</TableCell>
                        <TableCell>{p.phone ?? '-'}</TableCell>
                        <TableCell>{p.email ?? '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/patients/${p.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalle
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/patients/${p.id}?tab=ai-assistant`)}
                            >
                              <Brain className="h-4 w-4 mr-1" />
                              IA Asistente
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
