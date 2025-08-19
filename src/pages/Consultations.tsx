
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, User, Calendar, Brain, FileText, Filter, CalendarIcon } from 'lucide-react';
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
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  document_number?: string;
  phone?: string;
  email?: string;
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
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  const [smartSearchQuery, setSmartSearchQuery] = useState('');
  const [smartSearchResults, setSmartSearchResults] = useState<Patient[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPatients();
      fetchConsultations();
    }
  }, [user]);

  useEffect(() => {
    filterConsultations();
  }, [consultations, searchTerm, dateRange]);

  // Smart search effect
  useEffect(() => {
    if (smartSearchQuery.length >= 2) {
      searchPatients(smartSearchQuery);
    } else {
      setSmartSearchResults([]);
    }
  }, [smartSearchQuery]);

  // Keyboard shortcut for smart search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSmartSearchOpen(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, document_number, phone, email')
        .eq('user_id', user?.id)
        .order('first_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const searchPatients = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, document_number, phone, email')
        .eq('user_id', user?.id)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,document_number.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
        .order('first_name')
        .limit(10);

      if (error) throw error;
      setSmartSearchResults(data || []);
    } catch (error) {
      console.error('Error searching patients:', error);
      setSmartSearchResults([]);
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
        consultation.assessment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.history_present_illness?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter
    if (dateRange?.from) {
      filtered = filtered.filter(consultation => {
        const consultationDate = new Date(consultation.consultation_date);
        const startOfDay = new Date(dateRange.from!);
        startOfDay.setHours(0, 0, 0, 0);
        
        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          return consultationDate >= startOfDay && consultationDate <= endOfDay;
        } else {
          return consultationDate >= startOfDay;
        }
      });
    }

    setFilteredConsultations(filtered);
  };

  const handleSmartSearch = () => {
    setSmartSearchOpen(true);
  };

  const handlePatientSelect = (patientId: string) => {
    setSmartSearchOpen(false);
    setSmartSearchQuery('');
    navigate(`/patients/${patientId}?tab=ai-assistant`);
  };

  const clearDateRange = () => {
    setDateRange(undefined);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Panel de Consultas</h1>
          
          <Button variant="outline" onClick={handleSmartSearch}>
            <Search className="h-4 w-4 mr-2" />
            Buscar Paciente
            <span className="ml-2 text-xs opacity-60">⌘K</span>
          </Button>
        </div>

        {/* Smart Search Command Dialog */}
        <CommandDialog open={smartSearchOpen} onOpenChange={setSmartSearchOpen}>
          <CommandInput 
            placeholder="Buscar por nombre, documento, teléfono o email..."
            value={smartSearchQuery}
            onValueChange={setSmartSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {smartSearchQuery.length < 2 ? 'Escribe al menos 2 caracteres para buscar...' : 'No se encontraron pacientes.'}
            </CommandEmpty>
            <CommandGroup heading="Pacientes">
              {smartSearchResults.map((patient) => (
                <CommandItem
                  key={patient.id}
                  onSelect={() => handlePatientSelect(patient.id)}
                  className="flex items-center gap-3 p-3"
                >
                  <User className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {patient.first_name} {patient.last_name}
                    </span>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {patient.document_number && (
                        <span>Doc: {patient.document_number}</span>
                      )}
                      {patient.phone && (
                        <span>Tel: {patient.phone}</span>
                      )}
                      {patient.email && (
                        <span>{patient.email}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Búsqueda y Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buscar en consultas</Label>
                <Input
                  placeholder="Buscar por paciente, motivo, diagnóstico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Filtrar por fecha</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd MMM yyyy", { locale: es })} -{" "}
                            {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                          </>
                        ) : (
                          format(dateRange.from, "dd MMM yyyy", { locale: es })
                        )
                      ) : (
                        "Seleccionar fechas"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDateRange({ from: new Date(), to: new Date() })}
                        >
                          Hoy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDateRange({ 
                            from: addDays(new Date(), -7), 
                            to: new Date() 
                          })}
                        >
                          Última semana
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDateRange({ 
                            from: addDays(new Date(), -30), 
                            to: new Date() 
                          })}
                        >
                          Último mes
                        </Button>
                      </div>
                    </div>
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={es}
                      className={cn("p-3 pointer-events-auto")}
                    />
                    <div className="p-3 border-t flex justify-end">
                      <Button variant="outline" size="sm" onClick={clearDateRange}>
                        Limpiar
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        
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
