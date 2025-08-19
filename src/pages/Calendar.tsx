
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, User } from 'lucide-react';
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

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  status: string;
  start_time: string;
  end_time: string;
  patient: {
    first_name: string;
    last_name: string;
  };
}

export default function Calendar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    title: '',
    description: '',
    location: '',
    start_date: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    if (user) {
      fetchPatients();
      fetchAppointments();
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

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          title,
          description,
          location,
          status,
          start_time,
          end_time,
          patients!inner (
            first_name,
            last_name
          )
        `)
        .eq('user_id', user?.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time');

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedAppointments = (data || []).map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        location: appointment.location,
        status: appointment.status,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        patient: {
          first_name: appointment.patients.first_name,
          last_name: appointment.patients.last_name
        }
      }));

      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.title || !formData.start_date || !formData.start_time || !formData.end_time) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.start_date}T${formData.end_time}`);

    if (endDateTime <= startDateTime) {
      toast({
        title: "Error",
        description: "La hora de fin debe ser posterior a la hora de inicio",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user?.id,
          patient_id: formData.patient_id,
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Cita programada",
        description: "La cita médica se ha programado correctamente.",
      });

      setIsOpen(false);
      setFormData({
        patient_id: '',
        title: '',
        description: '',
        location: '',
        start_date: '',
        start_time: '',
        end_time: ''
      });
      fetchAppointments();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "No se pudo programar la cita: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Agenda</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Programar Nueva Cita</DialogTitle>
                <DialogDescription>
                  Programa una nueva cita médica con un paciente.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select value={formData.patient_id} onValueChange={(value) => setFormData({...formData, patient_id: value})}>
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
                  <Label htmlFor="title">Título de la Cita *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ej: Consulta de seguimiento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detalles adicionales sobre la cita..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Ej: Consultorio 1, Clínica Central"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Hora Inicio *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Hora Fin *</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Programando...' : 'Programar Cita'}
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
              <CalendarIcon className="h-5 w-5" />
              Próximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-muted-foreground">
                No hay citas programadas. Programa tu primera cita médica.
              </p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {appointment.patient.first_name} {appointment.patient.last_name}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                        {appointment.status === 'scheduled' ? 'Programada' : appointment.status}
                      </span>
                    </div>
                    
                    <h3 className="font-medium">{appointment.title}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(appointment.start_time).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(appointment.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {new Date(appointment.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      {appointment.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {appointment.location}
                        </div>
                      )}
                    </div>
                    
                    {appointment.description && (
                      <p className="text-sm text-muted-foreground">{appointment.description}</p>
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
