import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AudioRecorder } from './AudioRecorder';
import { Brain, Mic, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConsultationData {
  subjetivo: string;
  objetivo: string;
  examenFisico: string;
  impresionDiagnostica: string;
  plan: string;
  analisisDelCaso: string;
}

interface AIConsultationAssistantProps {
  patientId: string;
  onConsultationStructured: (data: ConsultationData & { transcription: string }) => void;
  className?: string;
}

export const AIConsultationAssistant: React.FC<AIConsultationAssistantProps> = ({
  patientId,
  onConsultationStructured,
  className
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [structuredData, setStructuredData] = useState<ConsultationData | null>(null);
  const [loading, setLoading] = useState(false);

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:audio/webm;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    setStep(2);
    
    // Automatically start transcription
    await handleTranscribe(blob);
  };

  const handleTranscribe = async (blob: Blob) => {
    setLoading(true);
    try {
      const base64Audio = await convertBlobToBase64(blob);
      
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { 
          audio: base64Audio,
          provider: 'gemini' 
        }
      });

      if (error) throw error;

      if (data.success) {
        setTranscription(data.transcription);
        toast({
          title: "Transcripción completada",
          description: "El audio se transcribió correctamente con IA",
        });
        setStep(3);
        
        // Automatically start structuring
        await handleStructure(data.transcription);
      } else {
        throw new Error(data.error || 'Error en transcripción');
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: "Error en transcripción",
        description: error.message || "No se pudo transcribir el audio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStructure = async (transcriptionText: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('structure-consultation', {
        body: { 
          transcription: transcriptionText,
          provider: 'gemini' 
        }
      });

      if (error) throw error;

      if (data.success) {
        setStructuredData(data.structured);
        toast({
          title: "Consulta estructurada",
          description: "La IA organizó la consulta en formato SOAP",
        });
      } else {
        throw new Error(data.error || 'Error en estructuración');
      }
    } catch (error: any) {
      console.error('Structuring error:', error);
      toast({
        title: "Error en estructuración",
        description: error.message || "No se pudo estructurar la consulta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseStructuredData = () => {
    if (structuredData && transcription) {
      onConsultationStructured({
        ...structuredData,
        transcription
      });
    }
  };

  const resetAssistant = () => {
    setStep(1);
    setAudioBlob(null);
    setTranscription('');
    setStructuredData(null);
    setLoading(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Asistente IA de Consulta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Steps indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={step >= 1 ? "default" : "secondary"}>
              <Mic className="h-3 w-3 mr-1" />
              1. Grabar
            </Badge>
            <div className="w-8 h-px bg-border" />
            <Badge variant={step >= 2 ? "default" : "secondary"}>
              <FileText className="h-3 w-3 mr-1" />
              2. Transcribir
            </Badge>
            <div className="w-8 h-px bg-border" />
            <Badge variant={step >= 3 ? "default" : "secondary"}>
              <Brain className="h-3 w-3 mr-1" />
              3. Estructurar
            </Badge>
          </div>
        </div>

        {/* Step 1: Recording */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Paso 1: Grabar Consulta</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Graba la conversación médico-paciente para que la IA la transcriba y estructure
              </p>
            </div>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        )}

        {/* Step 2: Transcription */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Paso 2: Transcribiendo Audio</h3>
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    La IA está transcribiendo tu grabación...
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <p className="text-sm">Transcripción completada</p>
                </div>
              )}
            </div>

            {transcription && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Transcripción:</h4>
                <Textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  rows={6}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Puedes editar la transcripción si es necesario
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Structured Consultation */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Paso 3: Consulta Estructurada</h3>
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    La IA está estructurando la consulta en formato SOAP...
                  </p>
                </div>
              ) : structuredData ? (
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <p className="text-sm">Consulta estructurada correctamente</p>
                </div>
              ) : null}
            </div>

            {structuredData && (
              <div className="space-y-3">
                <div className="grid gap-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Subjetivo (Motivo de consulta):</h5>
                    <p className="text-sm">{structuredData.subjetivo}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Objetivo (Historia):</h5>
                    <p className="text-sm">{structuredData.objetivo}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Examen Físico:</h5>
                    <p className="text-sm">{structuredData.examenFisico}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Impresión Diagnóstica:</h5>
                    <p className="text-sm">{structuredData.impresionDiagnostica}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Plan:</h5>
                    <p className="text-sm">{structuredData.plan}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Análisis del Caso:</h5>
                    <p className="text-sm">{structuredData.analisisDelCaso}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUseStructuredData} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Usar Esta Estructura
                  </Button>
                  <Button variant="outline" onClick={resetAssistant}>
                    Empezar de Nuevo
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};