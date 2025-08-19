import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AudioRecorder } from '@/components/AudioRecorder'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useAIFeatures, type SymptomAnalysis, type TreatmentPlan } from '@/hooks/useAIFeatures'
import { Brain, FileText, Stethoscope, AlertTriangle, Pill, Calendar, Users, Loader2, CheckCircle } from 'lucide-react'

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
  patientAge?: number;
  patientGender?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  onConsultationStructured: (data: ConsultationData & { transcription: string }) => void;
}

export const AIConsultationAssistant = ({ 
  patientId, 
  patientAge,
  patientGender, 
  medicalHistory, 
  currentMedications,
  allergies,
  onConsultationStructured 
}: AIConsultationAssistantProps) => {
  const { toast } = useToast()
  const { analyzeSymptoms, generateTreatmentPlan, uploadAudio, isAnalyzing, isGeneratingPlan, isUploadingAudio } = useAIFeatures()
  
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isStructuring, setIsStructuring] = useState(false)
  const [structuredData, setStructuredData] = useState<ConsultationData | null>(null)
  const [saveAudio, setSaveAudio] = useState(false)
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [symptomAnalysis, setSymptomAnalysis] = useState<SymptomAnalysis | null>(null)
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null)

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result.split(',')[1]) // Remove data:audio/webm;base64, prefix
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    setIsRecording(false)
    
    let uploadedRecordingId: string | null = null;
    
    // Upload audio if user chose to save it
    if (saveAudio) {
      const base64Audio = await blobToBase64(blob);
      const uploadResult = await uploadAudio({
        audioBlob: base64Audio,
        fileName: `consultation-${Date.now()}.webm`
      });
      if (uploadResult) {
        uploadedRecordingId = uploadResult.recordingId;
        setRecordingId(uploadedRecordingId);
      }
    }
    
    await handleTranscribe(blob, uploadedRecordingId)
  }, [saveAudio, uploadAudio])

  const handleTranscribe = async (blob: Blob, uploadedRecordingId?: string | null) => {
    setIsTranscribing(true)
    setStep(2)
    try {
      const base64Audio = await blobToBase64(blob)
      
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { 
          audio: base64Audio,
          provider: 'gemini',
          recordingId: uploadedRecordingId
        }
      })

      if (error) {
        console.error('Transcription error:', error)
        toast({
          title: "Error de transcripción",
          description: "No se pudo transcribir el audio. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        return
      }

      if (data.transcription) {
        setTranscription(data.transcription)
        toast({
          title: "Transcripción completada",
          description: `Audio transcrito usando ${data.provider}.`,
        })
      }
    } catch (error) {
      console.error('Transcription error:', error)
      toast({
        title: "Error inesperado",
        description: "No se pudo procesar el audio.",
        variant: "destructive",
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleStructure = async (transcriptionText: string) => {
    setIsStructuring(true)
    setStep(3)
    try {
      const { data, error } = await supabase.functions.invoke('structure-consultation', {
        body: { 
          transcription: transcriptionText,
          provider: 'gemini'
        }
      })

      if (error) {
        console.error('Structure error:', error)
        toast({
          title: "Error de estructuración",
          description: "No se pudo estructurar la consulta. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        return
      }

      if (data.structuredData || data.structured) {
        const structured = data.structuredData || data.structured
        setStructuredData(structured)
        toast({
          title: "Consulta estructurada",
          description: `Consulta estructurada usando ${data.provider}.`,
        })
      }
    } catch (error) {
      console.error('Structure error:', error)
      toast({
        title: "Error inesperado",
        description: "No se pudo estructurar la consulta.",
        variant: "destructive",
      })
    } finally {
      setIsStructuring(false)
    }
  }

  const handleAnalyzeSymptoms = async () => {
    if (!transcription && !structuredData?.subjetivo) {
      toast({
        title: "Sin síntomas",
        description: "Necesitas una transcripción o información subjetiva para analizar síntomas.",
        variant: "destructive",
      })
      return
    }

    const symptomsText = structuredData?.subjetivo || transcription
    const analysis = await analyzeSymptoms({
      symptoms: symptomsText,
      patientAge,
      patientGender,
      medicalHistory,
      currentMedications
    })
    
    if (analysis) {
      setSymptomAnalysis(analysis)
      toast({
        title: "Análisis completado",
        description: "Se generaron diagnósticos diferenciales y recomendaciones.",
      })
    }
  }

  const handleGeneratePlan = async () => {
    if (!transcription && !structuredData && !symptomAnalysis) {
      toast({
        title: "Sin información clínica",
        description: "Necesitas información clínica para generar un plan de tratamiento.",
        variant: "destructive",
      })
      return
    }

    const plan = await generateTreatmentPlan({
      symptoms: structuredData?.subjetivo || transcription,
      assessment: structuredData?.impresionDiagnostica,
      diagnosisSummary: symptomAnalysis?.differentialDiagnoses?.[0]?.diagnosis,
      patientAge,
      patientGender,
      medicalHistory,
      currentMedications,
      allergies
    })
    
    if (plan) {
      setTreatmentPlan(plan)
      toast({
        title: "Plan generado",
        description: "Se creó un plan de tratamiento personalizado.",
      })
    }
  }

  const handleUseStructuredData = () => {
    if (structuredData && transcription) {
      onConsultationStructured({
        ...structuredData,
        transcription
      })
    }
  }

  const resetAssistant = () => {
    setStep(1)
    setTranscription('')
    setStructuredData(null)
    setSymptomAnalysis(null)
    setTreatmentPlan(null)
    setRecordingId(null)
    setIsRecording(false)
    setIsTranscribing(false)
    setIsStructuring(false)
  }

  const insertAnalysisIntoConsultation = () => {
    if (!symptomAnalysis) return
    
    const analysisText = `DIAGNÓSTICOS DIFERENCIALES:\n${symptomAnalysis.differentialDiagnoses.map(d => 
      `• ${d.diagnosis} (${d.probability}): ${d.justification}`).join('\n')}\n\nSEÑALES DE ALARMA:\n${symptomAnalysis.redFlags.map(r => 
      `• ${r.symptom}: ${r.implication}`).join('\n')}\n\nEXAMEN FÍSICO SUGERIDO:\n${symptomAnalysis.physicalExam.map(e => 
      `• ${e.system}: ${e.specificTests} - ${e.lookFor}`).join('\n')}`
    
    // Update structured data with analysis
    const updatedData = {
      ...structuredData,
      impresionDiagnostica: (structuredData?.impresionDiagnostica || '') + '\n\n' + analysisText
    }
    
    setStructuredData(updatedData)
    toast({
      title: "Análisis insertado",
      description: "El análisis de síntomas se añadió a la impresión diagnóstica.",
    })
  }

  const insertPlanIntoConsultation = () => {
    if (!treatmentPlan) return
    
    const planText = `TRATAMIENTO FARMACOLÓGICO:\n${treatmentPlan.pharmacologicalTreatment.map(t => 
      `• ${t.medication} ${t.dosage} ${t.route}, ${t.frequency} por ${t.duration}\n  ${t.instructions}`).join('\n')}\n\nMEDIDAS NO FARMACOLÓGICAS:\n${treatmentPlan.nonPharmacological.map(n => 
      `• ${n.category}: ${n.intervention}\n  ${n.instructions}`).join('\n')}\n\nSEGUIMIENTO:\n• Próxima cita: ${treatmentPlan.followUp.nextAppointment}\n• Monitorear: ${treatmentPlan.followUp.monitoringParameters.join(', ')}\n• Criterios de mejoría: ${treatmentPlan.followUp.improvementCriteria}`
    
    // Update structured data with plan
    const updatedData = {
      ...structuredData,
      plan: (structuredData?.plan || '') + '\n\n' + planText
    }
    
    setStructuredData(updatedData)
    toast({
      title: "Plan insertado",
      description: "El plan de tratamiento se añadió a la consulta.",
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎤 Asistente de IA para Consultas
          <div className="flex gap-2 ml-auto">
            <Badge variant={step >= 1 ? 'default' : 'secondary'}>
              1. Grabar
            </Badge>
            <Badge variant={step >= 2 ? 'default' : 'secondary'}>
              2. Transcribir
            </Badge>
            <Badge variant={step >= 3 ? 'default' : 'secondary'}>
              3. Estructurar
            </Badge>
          </div>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Switch
              id="save-audio"
              checked={saveAudio}
              onCheckedChange={setSaveAudio}
              disabled={isRecording || step > 1}
            />
            <Label htmlFor="save-audio">Guardar audio por 48 horas</Label>
          </div>
          <span>• Consultas típicas: 7-10 minutos</span>
          <span>• Usa Gemini AI</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="mb-4">
                Presiona el botón para comenzar a grabar tu consulta médica.
                {saveAudio && (
                  <span className="block text-sm text-muted-foreground mt-2">
                    📁 El audio se guardará de forma segura por 48 horas y luego se eliminará automáticamente.
                  </span>
                )}
              </p>
              <AudioRecorder 
                onRecordingComplete={handleRecordingComplete}
                className="mx-auto"
              />
              <div className="mt-4 text-xs text-muted-foreground">
                <p>🔒 Tu privacidad es importante:</p>
                <p>• Solo tú puedes acceder a tus grabaciones</p>
                <p>• El audio se procesa de forma segura</p>
                <p>• Tienes control total sobre tus datos</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {isTranscribing ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Transcribiendo audio con Gemini AI...</p>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✓ Audio transcrito correctamente</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Transcripción (puedes editarla si es necesario):
                  </label>
                  <Textarea 
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    placeholder="La transcripción aparecerá aquí..."
                    className="min-h-[200px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleStructure(transcription)}
                    disabled={!transcription}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Estructurar SOAP
                  </Button>
                  <Button 
                    onClick={handleAnalyzeSymptoms}
                    disabled={!transcription || isAnalyzing}
                    variant="outline"
                    className="flex-1"
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    {isAnalyzing ? 'Analizando...' : 'Analizar Síntomas'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {isStructuring ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Estructurando consulta en formato SOAP...</p>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✓ Consulta estructurada correctamente</p>
                </div>
                
                {structuredData && (
                  <div className="space-y-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Subjetivo (Motivo de consulta):</h5>
                      <p className="text-sm whitespace-pre-wrap">{structuredData.subjetivo}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Objetivo (Historia):</h5>
                      <p className="text-sm whitespace-pre-wrap">{structuredData.objetivo}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Examen Físico:</h5>
                      <p className="text-sm whitespace-pre-wrap">{structuredData.examenFisico}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Impresión Diagnóstica:</h5>
                      <p className="text-sm whitespace-pre-wrap">{structuredData.impresionDiagnostica}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Plan:</h5>
                      <p className="text-sm whitespace-pre-wrap">{structuredData.plan}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Análisis del Caso:</h5>
                      <p className="text-sm whitespace-pre-wrap">{structuredData.analisisDelCaso}</p>
                    </div>

                    {/* AI Analysis and Plan Generation */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={handleAnalyzeSymptoms}
                        disabled={isAnalyzing}
                        variant="outline"
                        size="sm"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        {isAnalyzing ? 'Analizando...' : 'Generar Diagnósticos'}
                      </Button>
                      <Button 
                        onClick={handleGeneratePlan}
                        disabled={isGeneratingPlan}
                        variant="outline"
                        size="sm"
                      >
                        <Pill className="w-4 h-4 mr-2" />
                        {isGeneratingPlan ? 'Generando...' : 'Plan Inteligente'}
                      </Button>
                    </div>

                    {/* Symptom Analysis Results */}
                    {symptomAnalysis && (
                      <Card className="mt-4">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Análisis de Síntomas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h6 className="font-medium text-sm mb-2">Diagnósticos Diferenciales:</h6>
                            <ul className="text-sm space-y-1">
                              {symptomAnalysis.differentialDiagnoses.map((dx, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Badge variant="outline" className="text-xs">{dx.probability}</Badge>
                                  <span><strong>{dx.diagnosis}:</strong> {dx.justification}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {symptomAnalysis.redFlags.length > 0 && (
                            <div>
                              <h6 className="font-medium text-sm mb-2 text-red-600">Señales de Alarma:</h6>
                              <ul className="text-sm space-y-1">
                                {symptomAnalysis.redFlags.map((flag, idx) => (
                                  <li key={idx}><strong>{flag.symptom}:</strong> {flag.implication}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <Button
                            onClick={insertAnalysisIntoConsultation}
                            size="sm"
                            variant="secondary"
                            className="w-full"
                          >
                            Insertar en Consulta
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* Treatment Plan Results */}
                    {treatmentPlan && (
                      <Card className="mt-4">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Pill className="w-5 h-5 text-blue-500" />
                            Plan de Tratamiento Inteligente
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {treatmentPlan.pharmacologicalTreatment.length > 0 && (
                            <div>
                              <h6 className="font-medium text-sm mb-2">Tratamiento Farmacológico:</h6>
                              <ul className="text-sm space-y-2">
                                {treatmentPlan.pharmacologicalTreatment.map((med, idx) => (
                                  <li key={idx} className="bg-blue-50 p-2 rounded">
                                    <strong>{med.medication}</strong> - {med.dosage} {med.route}, {med.frequency} por {med.duration}
                                    <br />
                                    <span className="text-muted-foreground">{med.instructions}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {treatmentPlan.drugInteractions.length > 0 && (
                            <div>
                              <h6 className="font-medium text-sm mb-2 text-amber-600">⚠️ Interacciones Medicamentosas:</h6>
                              <ul className="text-sm space-y-1">
                                {treatmentPlan.drugInteractions.map((interaction, idx) => (
                                  <li key={idx} className="bg-amber-50 p-2 rounded">
                                    <Badge variant="outline" className={interaction.severity === 'severa' ? 'border-red-500' : 'border-amber-500'}>
                                      {interaction.severity}
                                    </Badge>
                                    <span className="ml-2">{interaction.interaction}</span>
                                    <br />
                                    <strong>Recomendación:</strong> {interaction.recommendation}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <Button
                            onClick={insertPlanIntoConsultation}
                            size="sm"
                            variant="secondary"
                            className="w-full"
                          >
                            Insertar en Consulta
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleUseStructuredData} className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Usar Esta Estructura
                      </Button>
                      <Button variant="outline" onClick={resetAssistant}>
                        Empezar de Nuevo
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}