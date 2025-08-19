
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, User, Calendar, Brain, FileText, Filter, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [selectedPatientForSearch, setSelectedPatientForSearch] = useState<string>('');
  const [showInsightsDialog, setShowInsightsDialog] = useState(false);
  const [insights, setInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPatients();
      fetchConsultations();
    }
  }, [user]);

  useEffect(() => {
    filterConsultations();
  }, [consultations, searchTerm, dateFilter, selectedStartDate, selectedEndDate]);

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

  const filterConsultations = () => {
    let filtered = [...consultations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(consultation => 
        consultation.patients.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.patients.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.chief_complaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.assessment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(consultation => 
            new Date(consultation.consultation_date) >= startOfToday
          );
          break;
        case 'week':
          const weekAgo = new Date(startOfToday);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(consultation => 
            new Date(consultation.consultation_date) >= weekAgo
          );
          break;
        case 'month':
          const monthAgo = new Date(startOfToday);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filtered = filtered.filter(consultation => 
            new Date(consultation.consultation_date) >= monthAgo
          );
          break;
        case 'custom':
          if (selectedStartDate && selectedEndDate) {
            filtered = filtered.filter(consultation => {
              const consultationDate = new Date(consultation.consultation_date);
              return consultationDate >= new Date(selectedStartDate) && 
                     consultationDate <= new Date(selectedEndDate + 'T23:59:59');
            });
          }
          break;
      }
    }

    setFilteredConsultations(filtered);
  };

  const handlePatientSelect = () => {
    if (!selectedPatientForSearch) {
      toast({
        title: "Error",
        description: "Selecciona un paciente",
        variant: "destructive"
      });
      return;
    }
    
    setShowPatientDialog(false);
    navigate(`/patients/${selectedPatientForSearch}?tab=ai-assistant`);
  };

  const generateInsights = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      toast({
        title: "Error",
        description: "Selecciona un rango de fechas para generar insights",
        variant: "destructive"
      });
      return;
    }

    setInsightsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('consultations-insights', {
        body: { 
          startDate: selectedStartDate,
          endDate: selectedEndDate
        }
      });

      if (error) throw error;

      setInsights(data.insights || 'No se pudo generar el análisis.');
      setShowInsightsDialog(true);
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el análisis: " + error.message,
        variant: "destructive"
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Panel de Consultas</h1>
          
          <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Buscar Paciente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seleccionar Paciente</DialogTitle>
                <DialogDescription>
                  Selecciona un paciente para acceder a su asistente IA
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Select value={selectedPatientForSearch} onValueChange={setSelectedPatientForSearch}>
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
                <div className="flex gap-2 pt-4">
                  <Button onClick={handlePatientSelect}>
                    <Brain className="h-4 w-4 mr-2" />
                    Ir al Asistente IA
                  </Button>
                  <Button variant="outline" onClick={() => setShowPatientDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Búsqueda y Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Buscar</Label>
                <Input
                  placeholder="Buscar por paciente, motivo o diagnóstico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Filtrar por fecha</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                    <SelectItem value="custom">Rango personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Insights IA</Label>
                <Button 
                  onClick={generateInsights}
                  disabled={insightsLoading}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {insightsLoading ? 'Analizando...' : 'Generar Análisis'}
                </Button>
              </div>
            </div>

            {dateFilter === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha inicio</Label>
                  <Input
                    type="date"
                    value={selectedStartDate}
                    onChange={(e) => setSelectedStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha fin</Label>
                  <Input
                    type="date"
                    value={selectedEndDate}
                    onChange={(e) => setSelectedEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights Dialog */}
        <Dialog open={showInsightsDialog} onOpenChange={setShowInsightsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Análisis IA de Consultas
              </DialogTitle>
              <DialogDescription>
                Insights generados por IA para el período seleccionado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm">{insights}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Consultations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Consultas ({filteredConsultations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredConsultations.length === 0 ? (
              <p className="text-muted-foreground">
                {consultations.length === 0 
                  ? "No hay consultas registradas." 
                  : "No se encontraron consultas con los filtros aplicados."
                }
              </p>
            ) : (
              <div className="space-y-4">
                {filteredConsultations.map((consultation) => (
                  <div key={consultation.id} className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {consultation.patients.first_name} {consultation.patients.last_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(consultation.consultation_date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
