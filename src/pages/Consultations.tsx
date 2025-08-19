
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Calendar, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface Consultation {
  id: string;
  consultation_date: string;
  chief_complaint: string | null;
  history_present_illness: string | null;
  physical_examination: string | null;
  assessment: string | null;
  plan: string | null;
  notes: string | null;
  patients: {
    first_name: string;
    last_name: string;
  };
}

export default function Consultations() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [formData, setFormData] = useState({
    chief_complaint: '',
    history_present_illness: '',
    physical_examination: '',
    assessment: '',
    plan: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchPatients();
      fetchConsultations();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .eq('user_id', user?.id)
        .order('first_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          id,
          consultation_date,
          chief_complaint,
          history_present_illness,
          physical_examination,
          assessment,
          plan,
          notes,
          patients (
            first_name,
            last_name
          )
        `)
        .eq('user_id', user?.id)
        .order('consultation_date', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast({
        title: "Error",
        description: "Selecciona un paciente",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('consultations')
        .insert({
          user_id: user?.id,
          patient_id: selectedPatientId,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "Consulta creada",
        description: "La consulta médica se ha registrado correctamente.",
      });

      setIsOpen(false);
      setSelectedPatientId('');
      setFormData({
        chief_complaint: '',
        history_present_illness: '',
        physical_examination: '',
        assessment: '',
        plan: '',
        notes: ''
      });
      fetchConsultations();
    } catch (error: any) {
      console.error('Error creating consultation:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la consulta: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Consultas</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva Consulta Médica</DialogTitle>
                <DialogDescription>
                  Registra una nueva consulta médica con el historial del paciente.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chief_complaint">Motivo de Consulta</Label>
                  <Textarea
                    id="chief_complaint"
                    value={formData.chief_complaint}
                    onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})}
                    placeholder="Describe el motivo principal de la consulta..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="history_present_illness">Historia de la Enfermedad Actual</Label>
                  <Textarea
                    id="history_present_illness"
                    value={formData.history_present_illness}
                    onChange={(e) => setFormData({...formData, history_present_illness: e.target.value})}
                    placeholder="Describe la evolución y síntomas actuales..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="physical_examination">Examen Físico</Label>
                  <Textarea
                    id="physical_examination"
                    value={formData.physical_examination}
                    onChange={(e) => setFormData({...formData, physical_examination: e.target.value})}
                    placeholder="Hallazgos del examen físico..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assessment">Evaluación/Diagnóstico</Label>
                  <Textarea
                    id="assessment"
                    value={formData.assessment}
                    onChange={(e) => setFormData({...formData, assessment: e.target.value})}
                    placeholder="Diagnóstico e impresión clínica..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Plan de Tratamiento</Label>
                  <Textarea
                    id="plan"
                    value={formData.plan}
                    onChange={(e) => setFormData({...formData, plan: e.target.value})}
                    placeholder="Tratamiento y seguimiento recomendado..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Crear Consulta'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lista de Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consultations.length === 0 ? (
              <p className="text-muted-foreground">
                No hay consultas registradas. Crea tu primera consulta médica.
              </p>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {consultation.patients.first_name} {consultation.patients.last_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(consultation.consultation_date).toLocaleDateString()}
                      </div>
                    </div>
                    {consultation.chief_complaint && (
                      <p className="text-sm"><strong>Motivo:</strong> {consultation.chief_complaint}</p>
                    )}
                    {consultation.assessment && (
                      <p className="text-sm"><strong>Diagnóstico:</strong> {consultation.assessment}</p>
                    )}
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
