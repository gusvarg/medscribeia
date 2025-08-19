
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Plus, Mic, MicOff, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Colombian EPS list
const COLOMBIAN_EPS = [
  'EPS SURA',
  'Nueva EPS',
  'Salud Total',
  'Compensar',
  'Famisanar',
  'Sanitas',
  'Coomeva',
  'Aliansalud',
  'Medimás',
  'Cruz Blanca',
  'Golden Group',
  'Servicio Occidental de Salud SOS',
  'Coosalud',
  'Comfenalco Valle',
  'Cafesalud',
  'Régimen Subsidiado',
  'Otra'
];

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'DNI', label: 'DNI' },
  { value: 'PP', label: 'Pasaporte' },
  { value: 'CE', label: 'Cédula de Extranjería' }
];

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  document_type: string | null;
  document_number: string | null;
  eps: string | null;
  phone: string | null;
  email: string | null;
  consultorio_id: string | null;
  created_at: string;
}

interface Consultorio {
  id: string;
  name: string;
}

export default function Patients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    documentType: '',
    documentNumber: '',
    eps: '',
    phone: '+57',
    email: '',
    consultorioId: ''
  });

  // Fetch patients
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Patient[];
    },
    enabled: !!user
  });

  // Fetch consultorios
  const { data: consultorios } = useQuery({
    queryKey: ['consultorios'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('consultorios')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');
      
      if (error) throw error;
      return data as Consultorio[];
    },
    enabled: !!user
  });

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const nameParts = patientData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { data, error } = await supabase
        .from('patients')
        .insert([{
          user_id: user?.id,
          first_name: firstName,
          last_name: lastName,
          document_type: patientData.documentType,
          document_number: patientData.documentNumber,
          eps: patientData.eps,
          phone: patientData.phone,
          email: patientData.email,
          consultorio_id: patientData.consultorioId || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      resetForm();
      setIsDialogOpen(false);
      toast.success('Paciente creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear paciente: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      documentType: '',
      documentNumber: '',
      eps: '',
      phone: '+57',
      email: '',
      consultorioId: ''
    });
    setIsAIMode(false);
    setIsRecording(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast.error('El nombre completo es requerido');
      return;
    }
    
    if (!formData.documentType) {
      toast.error('El tipo de documento es requerido');
      return;
    }
    
    if (!formData.documentNumber.trim()) {
      toast.error('El número de documento es requerido');
      return;
    }

    createPatientMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording logic
    toast.info(isRecording ? 'Grabación detenida' : 'Iniciando grabación...');
  };

  const filteredPatients = patients?.filter(patient => 
    patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.document_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pacientes</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Nuevo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
              </DialogHeader>

              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={!isAIMode ? "default" : "outline"}
                  onClick={() => setIsAIMode(false)}
                  className="flex-1"
                >
                  Manualmente
                </Button>
                <Button
                  type="button"
                  variant={isAIMode ? "default" : "outline"}
                  onClick={() => setIsAIMode(true)}
                  className="flex-1"
                >
                  Con IA
                </Button>
              </div>

              <div className="flex gap-6">
                <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nombre Completo *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Nombre completo del paciente"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="documentType">Tipo Documento *</Label>
                    <Select value={formData.documentType} onValueChange={(value) => handleInputChange('documentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="documentNumber">Número Documento *</Label>
                    <Input
                      id="documentNumber"
                      value={formData.documentNumber}
                      onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                      placeholder="Número del documento sin puntos ni comas"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="eps">EPS</Label>
                    <Select value={formData.eps} onValueChange={(value) => handleInputChange('eps', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar EPS" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOMBIAN_EPS.map((eps) => (
                          <SelectItem key={eps} value={eps}>
                            {eps}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Número de contacto del paciente"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Correo electrónico del paciente"
                    />
                  </div>

                  {consultorios && consultorios.length > 0 && (
                    <div>
                      <Label htmlFor="consultorio">Asignar a Consultorio</Label>
                      <Select value={formData.consultorioId} onValueChange={(value) => handleInputChange('consultorioId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar consultorio" />
                        </SelectTrigger>
                        <SelectContent>
                          {consultorios.map((consultorio) => (
                            <SelectItem key={consultorio.id} value={consultorio.id}>
                              {consultorio.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createPatientMutation.isPending}
                    >
                      {createPatientMutation.isPending ? 'Guardando...' : 'Guardar Paciente'}
                    </Button>
                  </div>
                </form>

                {isAIMode && (
                  <div className="w-80 bg-muted/30 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Registro con IA</h3>
                        <Button
                          type="button"
                          variant={isRecording ? "destructive" : "default"}
                          size="sm"
                          onClick={toggleRecording}
                        >
                          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>Diga en voz alta la información del paciente:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>"Tipo de documento: Cédula de ciudadanía"</li>
                          <li>"Número de documento: 12345678"</li>
                          <li>"Nombre completo: Juan Pérez García"</li>
                          <li>"EPS: EPS SURA"</li>
                          <li>"Teléfono: 3001234567"</li>
                          <li>"Correo: juan@email.com"</li>
                        </ul>
                      </div>
                      
                      {isRecording && (
                        <div className="text-center">
                          <div className="animate-pulse text-red-500">
                            🔴 Grabando...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pacientes por nombre, documento, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Lista de Pacientes ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Cargando pacientes...</p>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {patients?.length === 0 ? "No tienes pacientes registrados" : "No se encontraron pacientes"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPatients.map((patient) => (
                  <div 
                    key={patient.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <User className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {patient.document_type && patient.document_number && (
                            <p>{DOCUMENT_TYPES.find(t => t.value === patient.document_type)?.label}: {patient.document_number}</p>
                          )}
                          {patient.eps && <p>EPS: {patient.eps}</p>}
                          {patient.phone && <p>Tel: {patient.phone}</p>}
                          {patient.email && <p>Email: {patient.email}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(patient.created_at).toLocaleDateString()}
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
