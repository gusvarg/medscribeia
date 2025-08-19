
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Plus, FileText, User, Copy, Share, Download, Mail } from 'lucide-react';
import { formatTranscriptionForExport, copyToClipboard, shareViaWhatsApp, shareViaEmail, exportToNotepad } from '@/utils/exportUtils';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Consultation {
  id: string;
  consultation_date: string;
  chief_complaint: string | null;
  patients: {
    first_name: string;
    last_name: string;
  };
}

interface Transcription {
  id: string;
  transcription: string | null;
  created_at: string;
  duration: number | null;
  consultations: {
    consultation_date: string;
    chief_complaint: string | null;
    patients: {
      first_name: string;
      last_name: string;
    };
  };
}

export default function Transcriptions() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string>('');
  const [transcriptionText, setTranscriptionText] = useState('');

  useEffect(() => {
    if (user) {
      fetchConsultations();
      fetchTranscriptions();
    }
  }, [user]);

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          id,
          consultation_date,
          chief_complaint,
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

  const fetchTranscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('audio_recordings')
        .select(`
          id,
          transcription,
          created_at,
          duration,
          consultations (
            consultation_date,
            chief_complaint,
            patients (
              first_name,
              last_name
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTranscriptions(data || []);
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultationId || !transcriptionText.trim()) {
      toast({
        title: "Error",
        description: "Selecciona una consulta y escribe la transcripción",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('audio_recordings')
        .insert({
          user_id: user?.id,
          consultation_id: selectedConsultationId,
          file_path: 'manual://entry',
          transcription: transcriptionText,
          transcription_status: 'completed',
          duration: Math.ceil(transcriptionText.length / 10) // Estimación basada en longitud
        });

      if (error) throw error;

      toast({
        title: "Transcripción guardada",
        description: "La transcripción se ha registrado correctamente.",
      });

      setIsOpen(false);
      setSelectedConsultationId('');
      setTranscriptionText('');
      fetchTranscriptions();
    } catch (error: any) {
      console.error('Error creating transcription:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la transcripción: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportTranscription = (transcription: any, format: 'copy' | 'notepad' | 'whatsapp' | 'email') => {
    const formattedTranscription = formatTranscriptionForExport(transcription);
    const patientName = `${transcription.consultations?.patients?.first_name || 'Paciente'}_${transcription.consultations?.patients?.last_name || ''}`.replace(/\s+/g, '_');
    const date = new Date(transcription.created_at).toISOString().split('T')[0];
    const filename = `transcripcion_${patientName}_${date}`;

    switch (format) {
      case 'copy':
        copyToClipboard(formattedTranscription).then(success => {
          toast({
            title: success ? "Copiado" : "Error",
            description: success ? "Transcripción copiada al portapapeles" : "No se pudo copiar",
            variant: success ? "default" : "destructive"
          });
        });
        break;
      case 'notepad':
        exportToNotepad(formattedTranscription, filename);
        break;
      case 'whatsapp':
        shareViaWhatsApp(formattedTranscription);
        break;
      case 'email':
        const subject = `Transcripción Médica - ${transcription.consultations?.patients?.first_name || 'Paciente'} ${transcription.consultations?.patients?.last_name || ''}`;
        shareViaEmail(subject, formattedTranscription);
        break;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Transcripciones</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Transcripción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nueva Transcripción</DialogTitle>
                <DialogDescription>
                  Registra una transcripción de audio médico asociada a una consulta.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="consultation">Consulta Relacionada</Label>
                  <Select value={selectedConsultationId} onValueChange={setSelectedConsultationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una consulta" />
                    </SelectTrigger>
                    <SelectContent>
                      {consultations.map((consultation) => (
                        <SelectItem key={consultation.id} value={consultation.id}>
                          {consultation.patients.first_name} {consultation.patients.last_name} - {' '}
                          {new Date(consultation.consultation_date).toLocaleDateString()}
                          {consultation.chief_complaint && ` (${consultation.chief_complaint.substring(0, 50)}...)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transcription">Transcripción</Label>
                  <Textarea
                    id="transcription"
                    value={transcriptionText}
                    onChange={(e) => setTranscriptionText(e.target.value)}
                    placeholder="Escribe o pega aquí la transcripción del audio médico..."
                    rows={8}
                    className="min-h-[200px]"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Transcripción'}
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
              <Mic className="h-5 w-5" />
              Lista de Transcripciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transcriptions.length === 0 ? (
              <p className="text-muted-foreground">
                No hay transcripciones registradas. Crea tu primera transcripción médica.
              </p>
            ) : (
              <div className="space-y-4">
                {transcriptions.map((transcription) => (
                  <div key={transcription.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {transcription.consultations.patients.first_name} {transcription.consultations.patients.last_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(transcription.created_at).toLocaleDateString()}
                        </div>
                        {/* Export buttons */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => exportTranscription(transcription, 'copy')}
                            title="Copiar al portapapeles"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => exportTranscription(transcription, 'notepad')}
                            title="Descargar como .txt"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => exportTranscription(transcription, 'whatsapp')}
                            title="Compartir por WhatsApp"
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => exportTranscription(transcription, 'email')}
                            title="Enviar por email"
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {transcription.consultations.chief_complaint && (
                      <p className="text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 inline mr-1" />
                        {transcription.consultations.chief_complaint}
                      </p>
                    )}
                    {transcription.transcription && (
                      <div className="bg-muted p-3 rounded text-sm">
                        <p className="font-medium mb-1">Transcripción:</p>
                        <p>{transcription.transcription.substring(0, 200)}
                          {transcription.transcription.length > 200 && '...'}
                        </p>
                      </div>
                    )}
                    {transcription.duration && (
                      <p className="text-xs text-muted-foreground">
                        Duración estimada: {transcription.duration} segundos
                      </p>
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
