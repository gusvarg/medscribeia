// Export utilities for transcriptions and medical notes

export const exportToNotepad = (content: string, filename: string = 'transcripcion') => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = `${filename}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const exportToJSON = (data: any, filename: string = 'consulta') => {
  const element = document.createElement('a');
  const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  element.href = URL.createObjectURL(file);
  element.download = `${filename}.json`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const shareViaWhatsApp = (text: string) => {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
};

export const shareViaEmail = (subject: string, body: string, to: string = '') => {
  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
};

export const formatTranscriptionForExport = (transcription: any): string => {
  const date = new Date(transcription.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const patientName = `${transcription.consultations?.patients?.first_name || 'N/A'} ${transcription.consultations?.patients?.last_name || ''}`.trim();
  const chiefComplaint = transcription.consultations?.chief_complaint || 'No especificado';
  const content = transcription.transcription || '';

  return `TRANSCRIPCIÓN MÉDICA
========================

Paciente: ${patientName}
Fecha: ${date}
Motivo de Consulta: ${chiefComplaint}
Duración: ${transcription.duration ? `${transcription.duration} segundos` : 'No especificada'}

CONTENIDO:
------------------------
${content}

========================
Generado por MedScribe AI
`;
};

export const formatConsultationForExport = (consultation: any, patient?: any): string => {
  const date = new Date(consultation.consultation_date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'N/A';

  return `NOTA CLÍNICA - FORMATO SOAP
===============================

INFORMACIÓN DEL PACIENTE:
Nombre: ${patientName}
Fecha de Consulta: ${date}

SUBJETIVO (S):
${consultation.chief_complaint || 'No especificado'}

OBJETIVO (O):
Historia de la Enfermedad Actual:
${consultation.history_present_illness || 'No especificado'}

EXAMEN FÍSICO:
${consultation.physical_examination || 'No especificado'}

EVALUACIÓN/DIAGNÓSTICO (A):
${consultation.assessment || 'No especificado'}

PLAN (P):
${consultation.plan || 'No especificado'}

NOTAS ADICIONALES:
${consultation.notes || 'Ninguna'}

===============================
Generado por MedScribe AI
`;
};