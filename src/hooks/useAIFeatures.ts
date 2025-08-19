import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface DifferentialDiagnosis {
  diagnosis: string;
  probability: 'alta' | 'media' | 'baja';
  justification: string;
}

export interface RedFlag {
  symptom: string;
  implication: string;
}

export interface PhysicalExam {
  system: string;
  specificTests: string;
  lookFor: string;
}

export interface InitialWorkup {
  category: string;
  test: string;
  indication: string;
}

export interface SymptomAnalysis {
  differentialDiagnoses: DifferentialDiagnosis[];
  redFlags: RedFlag[];
  physicalExam: PhysicalExam[];
  initialWorkup: InitialWorkup[];
}

export interface PharmacologicalTreatment {
  medication: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface NonPharmacological {
  category: string;
  intervention: string;
  instructions: string;
}

export interface FollowUp {
  nextAppointment: string;
  monitoringParameters: string[];
  improvementCriteria: string;
}

export interface PatientEducation {
  topic: string;
  content: string;
  warningSigns: string[];
}

export interface Referral {
  specialty: string;
  reason: string;
  urgency: 'urgente' | 'rutinaria' | 'electiva';
}

export interface DrugInteraction {
  interaction: string;
  severity: 'leve' | 'moderada' | 'severa';
  recommendation: string;
}

export interface TreatmentPlan {
  pharmacologicalTreatment: PharmacologicalTreatment[];
  nonPharmacological: NonPharmacological[];
  followUp: FollowUp;
  patientEducation: PatientEducation[];
  referrals: Referral[];
  drugInteractions: DrugInteraction[];
}

export const useAIFeatures = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const analyzeSymptoms = async (params: {
    symptoms: string;
    patientAge?: number;
    patientGender?: string;
    medicalHistory?: string;
    currentMedications?: string;
  }): Promise<SymptomAnalysis | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('symptom-analysis', {
        body: params
      });

      if (error) {
        console.error('Symptom analysis error:', error);
        toast({
          title: "Error en análisis de síntomas",
          description: error.message || "No se pudo analizar los síntomas",
          variant: "destructive",
        });
        return null;
      }

      if (!data.success) {
        toast({
          title: "Error en análisis",
          description: data.error || "No se pudo completar el análisis",
          variant: "destructive",
        });
        return null;
      }

      return data.analysis;
    } catch (error) {
      console.error('Symptom analysis error:', error);
      toast({
        title: "Error inesperado",
        description: "No se pudo analizar los síntomas",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateTreatmentPlan = async (params: {
    symptoms?: string;
    assessment?: string;
    diagnosisSummary?: string;
    patientAge?: number;
    patientGender?: string;
    medicalHistory?: string;
    currentMedications?: string;
    allergies?: string;
  }): Promise<TreatmentPlan | null> => {
    setIsGeneratingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-plan', {
        body: params
      });

      if (error) {
        console.error('Treatment plan error:', error);
        toast({
          title: "Error generando plan",
          description: error.message || "No se pudo generar el plan de tratamiento",
          variant: "destructive",
        });
        return null;
      }

      if (!data.success) {
        toast({
          title: "Error en plan",
          description: data.error || "No se pudo completar el plan",
          variant: "destructive",
        });
        return null;
      }

      return data.plan;
    } catch (error) {
      console.error('Treatment plan error:', error);
      toast({
        title: "Error inesperado",
        description: "No se pudo generar el plan de tratamiento",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const uploadAudio = async (params: {
    audioBlob: string;
    fileName?: string;
    consultationId?: string;
  }): Promise<{ recordingId: string; filePath: string } | null> => {
    setIsUploadingAudio(true);
    try {
      const { data, error } = await supabase.functions.invoke('upload-audio', {
        body: params
      });

      if (error) {
        console.error('Audio upload error:', error);
        toast({
          title: "Error subiendo audio",
          description: error.message || "No se pudo guardar el audio",
          variant: "destructive",
        });
        return null;
      }

      if (!data.success) {
        toast({
          title: "Error en carga",
          description: data.error || "No se pudo guardar el audio",
          variant: "destructive",
        });
        return null;
      }

      return {
        recordingId: data.recordingId,
        filePath: data.filePath
      };
    } catch (error) {
      console.error('Audio upload error:', error);
      toast({
        title: "Error inesperado",
        description: "No se pudo guardar el audio",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingAudio(false);
    }
  };

  return {
    analyzeSymptoms,
    generateTreatmentPlan,
    uploadAudio,
    isAnalyzing,
    isGeneratingPlan,
    isUploadingAudio,
  };
};