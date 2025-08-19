import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AIConsultationAssistant } from '@/components/AIConsultationAssistant';
import { ArrowLeft, User, Calendar, Brain, MessageSquare, Send, Plus, Save, Stethoscope, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatConsultationForExport, copyToClipboard, shareViaWhatsApp, shareViaEmail, exportToNotepad } from '@/utils/exportUtils';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  medical_history: string | null;
  allergies: string | null;
  current_medications: string | null;
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
}

interface ConsultationFormData {
  chief_complaint: string;
  history_present_illness: string;
  physical_examination: string;
  assessment: string;
  plan: string;
  notes: string;
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // New consultation form
  const [showNewConsultation, setShowNewConsultation] = useState(false);
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [consultationForm, setConsultationForm] = useState<ConsultationFormData>({
    chief_complaint: '',
    history_present_illness: '',
    physical_examination: '',
    assessment: '',
    plan: '',
    notes: ''
  });
  const [savingConsultation, setSavingConsultation] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchPatientData();
      fetchConsultations();
    }
  }, [id, user]);

  const fetchPatientData = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (error: any) {
      console.error('Error fetching patient:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del paciente",
        variant: "destructive"
      });
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', id)
        .eq('user_id', user?.id)
        .order('consultation_date', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error: any) {
      console.error('Error fetching consultations:', error);
    }
  };

  const handleAIChat = async (question: string) => {
    if (!question.trim() || !id) return;

    setChatLoading(true);
    setChatMessages(prev => [...prev, { type: 'user', message: question }]);

    try {
      const { data, error } = await supabase.functions.invoke('patient-chat', {
        body: {
          patientId: id,
          question: question,
          provider: 'gemini'
        }
      });

      if (error) throw error;

      if (data.success) {
        setChatMessages(prev => [...prev, { type: 'ai', message: data.response }]);
      } else {
        throw new Error(data.error || 'Error en el chat con IA');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        message: 'Lo siento, no pude procesar tu pregunta. Intenta nuevamente.' 
      }]);
    } finally {
      setChatLoading(false);
      setChatInput('');
    }
  };

  const handleConsultationStructured = (data: any) => {
    setConsultationForm({
      chief_complaint: data.subjetivo || '',
      history_present_illness: data.objetivo || '',
      physical_examination: data.examenFisico || '',
      assessment: data.impresionDiagnostica || '',
      plan: data.plan || '',
      notes: data.analisisDelCaso || ''
    });
    setShowNewConsultation(true);
    setActiveTab('new-consultation');
    setShowMethodDialog(false);
  };

  const handleManualConsultation = () => {
    setActiveTab('new-consultation');
    setShowMethodDialog(false);
  };

  const handleAIConsultation = () => {
    setActiveTab('ai-assistant');
    setShowMethodDialog(false);
  };

  const saveConsultation = async () => {
    if (!id || !user) return;

    setSavingConsultation(true);
    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert({
          patient_id: id,
          user_id: user.id,
          consultation_date: new Date().toISOString(),
          ...consultationForm
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Consulta guardada",
        description: "La nueva consulta se registró correctamente",
      });

      // Reset form and refresh data
      setConsultationForm({
        chief_complaint: '',
        history_present_illness: '',
        physical_examination: '',
        assessment: '',
        plan: '',
        notes: ''
      });
      setShowNewConsultation(false);
      setActiveTab('consultations');
      await fetchConsultations();
    } catch (error: any) {
      console.error('Error saving consultation:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la consulta: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSavingConsultation(false);
    }
  };

  const exportConsultation = (consultation: Consultation, format: 'copy' | 'notepad' | 'whatsapp' | 'email') => {
    const formattedConsultation = formatConsultationForExport(consultation, patient);
    const filename = `consulta_${patient?.first_name}_${new Date(consultation.consultation_date).toISOString().split('T')[0]}`;

    switch (format) {
      case 'copy':
        copyToClipboard(formattedConsultation).then(success => {
          toast({
            title: success ? "Copiado" : "Error",
            description: success ? "Consulta copiada al portapapeles" : "No se pudo copiar",
            variant: success ? "default" : "destructive"
          });
        });
        break;
      case 'notepad':
        exportToNotepad(formattedConsultation, filename);
        break;
      case 'whatsapp':
        shareViaWhatsApp(formattedConsultation);
        break;
      case 'email':
        shareViaEmail(
          `Consulta Médica - ${patient?.first_name} ${patient?.last_name}`,
          formattedConsultation
        );
        break;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando información del paciente...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!patient) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p>Paciente no encontrado</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pacientes
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-muted-foreground">
              Información completa y asistente IA
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <User className="h-4 w-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger value="consultations">
              <Calendar className="h-4 w-4 mr-2" />
              Consultas ({consultations.length})
            </TabsTrigger>
            <TabsTrigger value="ai-assistant">
              <Brain className="h-4 w-4 mr-2" />
              Asistente IA
            </TabsTrigger>
            <TabsTrigger value="new-consultation" onClick={(e) => {
              e.preventDefault();
              setShowMethodDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Consulta
            </TabsTrigger>
          </TabsList>

          {/* Patient Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Nombre:</strong> {patient.first_name} {patient.last_name}</div>
                  <div><strong>Fecha de Nacimiento:</strong> {patient.date_of_birth || 'No especificada'}</div>
                  <div><strong>Género:</strong> {patient.gender || 'No especificado'}</div>
                  <div><strong>Teléfono:</strong> {patient.phone || 'No especificado'}</div>
                  <div><strong>Email:</strong> {patient.email || 'No especificado'}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información Médica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong>Antecedentes:</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      {patient.medical_history || 'No especificados'}
                    </p>
                  </div>
                  <div>
                    <strong>Alergias:</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      {patient.allergies || 'Ninguna conocida'}
                    </p>
                  </div>
                  <div>
                    <strong>Medicaciones Actuales:</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      {patient.current_medications || 'Ninguna'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Consultations History */}
          <TabsContent value="consultations" className="space-y-4">
            <div className="space-y-4">
              {consultations.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      No hay consultas registradas para este paciente.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={() => setActiveTab('ai-assistant')} 
                        variant="default"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Crear con IA
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('new-consultation')} 
                        variant="outline"
                      >
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Crear Manual
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                consultations.map((consultation) => (
                  <Card key={consultation.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Consulta - {new Date(consultation.consultation_date).toLocaleDateString()}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => exportConsultation(consultation, 'copy')}>
                            Copiar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => exportConsultation(consultation, 'notepad')}>
                            Bloc de Notas
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => exportConsultation(consultation, 'whatsapp')}>
                            WhatsApp
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => exportConsultation(consultation, 'email')}>
                            Email
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {consultation.chief_complaint && (
                        <div>
                          <Badge variant="secondary" className="mb-1">Motivo de Consulta</Badge>
                          <p className="text-sm">{consultation.chief_complaint}</p>
                        </div>
                      )}
                      {consultation.assessment && (
                        <div>
                          <Badge variant="secondary" className="mb-1">Evaluación</Badge>
                          <p className="text-sm">{consultation.assessment}</p>
                        </div>
                      )}
                      {consultation.plan && (
                        <div>
                          <Badge variant="secondary" className="mb-1">Plan</Badge>
                          <p className="text-sm">{consultation.plan}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* AI Assistant */}
          <TabsContent value="ai-assistant" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Consultation Assistant */}
              <AIConsultationAssistant
                patientId={id!}
                onConsultationStructured={handleConsultationStructured}
              />

              {/* AI Chat */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chat con IA - Análisis de Historial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chat messages */}
                  <div className="h-64 overflow-y-auto space-y-2 p-3 bg-muted rounded-lg">
                    {chatMessages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center">
                        Pregúntale a la IA sobre el historial médico de este paciente
                      </p>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div key={index} className={`p-2 rounded ${
                          msg.type === 'user' ? 'bg-primary text-primary-foreground ml-4' : 'bg-background mr-4'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))
                    )}
                    {chatLoading && (
                      <div className="bg-background mr-4 p-2 rounded">
                        <p className="text-sm text-muted-foreground">IA está analizando...</p>
                      </div>
                    )}
                  </div>

                  {/* Chat input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Pregunta sobre el historial del paciente..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAIChat(chatInput)}
                      disabled={chatLoading}
                    />
                    <Button
                      onClick={() => handleAIChat(chatInput)}
                      disabled={chatLoading || !chatInput.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Consultation Form */}
          <TabsContent value="new-consultation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Nueva Consulta Médica
                  <Button 
                    onClick={saveConsultation}
                    disabled={savingConsultation}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingConsultation ? 'Guardando...' : 'Guardar Consulta'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Motivo de Consulta (Subjetivo)</Label>
                    <Textarea
                      value={consultationForm.chief_complaint}
                      onChange={(e) => setConsultationForm(prev => ({
                        ...prev,
                        chief_complaint: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Historia de la Enfermedad Actual (Objetivo)</Label>
                    <Textarea
                      value={consultationForm.history_present_illness}
                      onChange={(e) => setConsultationForm(prev => ({
                        ...prev,
                        history_present_illness: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Examen Físico</Label>
                    <Textarea
                      value={consultationForm.physical_examination}
                      onChange={(e) => setConsultationForm(prev => ({
                        ...prev,
                        physical_examination: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Evaluación/Diagnóstico</Label>
                    <Textarea
                      value={consultationForm.assessment}
                      onChange={(e) => setConsultationForm(prev => ({
                        ...prev,
                        assessment: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Plan de Tratamiento</Label>
                    <Textarea
                      value={consultationForm.plan}
                      onChange={(e) => setConsultationForm(prev => ({
                        ...prev,
                        plan: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notas Adicionales</Label>
                    <Textarea
                      value={consultationForm.notes}
                      onChange={(e) => setConsultationForm(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Method Selection Dialog */}
        <Dialog open={showMethodDialog} onOpenChange={setShowMethodDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Seleccionar Método de Consulta</DialogTitle>
              <DialogDescription>
                Elige cómo quieres crear la nueva consulta médica
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Button 
                onClick={handleAIConsultation}
                className="flex items-center justify-start gap-3 h-16"
                variant="default"
              >
                <Mic className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-medium">Con Asistente IA</div>
                  <div className="text-sm opacity-90">Graba audio y estructura automáticamente</div>
                </div>
              </Button>
              <Button 
                onClick={handleManualConsultation}
                className="flex items-center justify-start gap-3 h-16"
                variant="outline"
              >
                <Stethoscope className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-medium">Manual</div>
                  <div className="text-sm text-muted-foreground">Completa los campos manualmente</div>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}