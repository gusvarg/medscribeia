# MedScribe AI - Plataforma SaaS Médica

## 📋 Índice
- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Configuración Inicial](#configuración-inicial)
- [Flujo de Trabajo con IA](#flujo-de-trabajo-con-ia)
- [Roles y Permisos](#roles-y-permisos)
- [Navegación y Páginas](#navegación-y-páginas)
- [Edge Functions](#edge-functions)
- [Seguridad y Privacidad](#seguridad-y-privacidad)
- [Checklist de Verificación](#checklist-de-verificación)
- [Despliegue](#despliegue)
- [Enlaces Útiles](#enlaces-útiles)
- [Resolución de Problemas](#resolución-de-problemas)
- [Roadmap](#roadmap)

## 🏥 Resumen Ejecutivo

**MedScribe AI** es una plataforma SaaS diseñada para profesionales médicos que automatiza y mejora el proceso de documentación clínica mediante inteligencia artificial.

### ¿Qué hace?
- **Transcripción de voz a texto** para consultas médicas
- **Estructuración automática SOAP** de las transcripciones
- **Análisis de síntomas** con diagnósticos diferenciales y banderas rojas
- **Generación de planes terapéuticos** personalizados
- **Gestión completa de pacientes** y consultas
- **Panel administrativo** para configuración y analytics

### ¿Para quién?
- Médicos generales y especialistas
- Clínicas y consultorios médicos
- Administradores de centros de salud
- Profesionales que buscan optimizar su documentación clínica

### Tecnologías
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **IA**: Google Gemini API
- **Autenticación**: Supabase Auth con RLS
- **Storage**: Supabase Storage (privado, retención 48h)

## 🏗️ Arquitectura del Sistema

<lov-mermaid>
graph TD
    A[Usuario Médico] --> B[React Frontend]
    B --> C[Supabase Auth]
    B --> D[Supabase Database]
    B --> E[Edge Functions]
    B --> F[Supabase Storage]
    
    E --> G[upload-audio]
    E --> H[transcribe-audio]
    E --> I[structure-consultation]
    E --> J[symptom-analysis]
    E --> K[generate-plan]
    E --> L[cleanup-audio]
    
    H --> M[Gemini API]
    I --> M
    J --> M
    K --> M
    
    N[pg_cron] --> L
    
    D --> O[(PostgreSQL)]
    O --> P[RLS Policies]
    
    F --> Q[medscribe-audio bucket]
    Q --> R[48h retention]
</lov-mermaid>

### Componentes Principales

#### Frontend (React)
- **Interfaz de usuario** responsiva con Tailwind CSS
- **Navegación** mediante React Router DOM
- **Estado global** con TanStack Query
- **Componentes UI** basados en shadcn/ui
- **Grabación de audio** nativa del navegador

#### Supabase Backend
- **Base de datos PostgreSQL** con Row Level Security (RLS)
- **Autenticación** con roles (user, admin, super_admin)
- **Edge Functions** para lógica de IA y procesamiento
- **Storage privado** para archivos de audio temporales
- **pg_cron** para limpieza automática diaria

## ⚙️ Configuración Inicial

### Variables Requeridas
```bash
# En tu proyecto Lovable (ya configuradas)
SUPABASE_URL=https://pkmmqwcjwebszfugkmlr.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

### Secretos de Edge Functions
Los siguientes secretos deben estar configurados en Supabase:

| Secreto | Propósito | Estado |
|---------|-----------|--------|
| `GEMINI_API_KEY` | IA para transcripción y análisis | ✅ Configurado |
| `SUPABASE_URL` | URL del proyecto Supabase | ✅ Configurado |
| `SUPABASE_SERVICE_ROLE_KEY` | Acceso admin a la base de datos | ✅ Configurado |
| `SUPABASE_ANON_KEY` | Clave pública para autenticación | ✅ Configurado |
| `SUPABASE_DB_URL` | Conexión directa a PostgreSQL | ✅ Configurado |

### Bucket de Storage
- **Nombre**: `medscribe-audio`
- **Tipo**: Privado
- **RLS**: Habilitado (solo el usuario propietario puede acceder)
- **Retención**: 48 horas (limpieza automática diaria a las 2 AM)

## 🤖 Flujo de Trabajo con IA

<lov-mermaid>
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant E as Edge Functions
    participant G as Gemini API
    participant S as Storage
    participant D as Database
    
    U->>F: 1. Inicia grabación
    F->>F: 2. Captura audio (WebRTC)
    U->>F: 3. Detiene grabación
    F->>E: 4. upload-audio (base64)
    E->>S: 5. Guarda archivo temporal
    E->>D: 6. Registro en audio_recordings
    F->>E: 7. transcribe-audio
    E->>G: 8. Procesa audio → texto
    G->>E: 9. Retorna transcripción
    F->>E: 10. structure-consultation
    E->>G: 11. Texto → SOAP estructurado
    G->>E: 12. Retorna SOAP
    F->>E: 13. symptom-analysis
    E->>G: 14. Análisis de síntomas
    G->>E: 15. Diagnósticos + banderas rojas
    F->>E: 16. generate-plan
    E->>G: 17. Genera plan terapéutico
    G->>E: 18. Plan completo
    
    Note over S,D: Limpieza automática cada 48h
</lov-mermaid>

### Paso a Paso

1. **Grabación** 🎙️
   - El médico presiona "Grabar" en la pestaña "Asistente IA"
   - Se captura audio usando WebRTC del navegador
   - Audio se almacena temporalmente en memoria

2. **Transcripción** 📝
   - Audio se envía a `upload-audio` → `transcribe-audio`
   - Gemini API convierte voz a texto
   - Retorna transcripción limpia

3. **Estructuración SOAP** 🏥
   - `structure-consultation` procesa la transcripción
   - IA organiza el contenido en formato SOAP:
     - **S**ubjetivo: síntomas del paciente
     - **O**bjetivo: examen físico y signos
     - **A**sesment: evaluación y diagnóstico
     - **P**lan: tratamiento y seguimiento

4. **Análisis de Síntomas** 🔍
   - `symptom-analysis` analiza los síntomas reportados
   - Genera diagnósticos diferenciales
   - Identifica banderas rojas y signos de alarma
   - Sugiere estudios complementarios

5. **Generación de Plan** 📋
   - `generate-plan` crea un plan terapéutico completo
   - Incluye tratamiento farmacológico y no farmacológico
   - Añade recomendaciones de seguimiento
   - Considera alergias e interacciones medicamentosas

6. **Limpieza Automática** 🧹
   - `cleanup-audio` se ejecuta diariamente a las 2 AM
   - Elimina archivos de audio > 48 horas
   - Mantiene registros en base de datos para auditoría

## 👥 Roles y Permisos

### Roles Disponibles
- **user**: Médicos regulares (acceso a sus propios datos)
- **admin**: Administradores (acceso a panel admin)
- **super_admin**: Súper administradores (acceso completo)

### Row Level Security (RLS)
Todas las tablas principales tienen RLS habilitado:
- Los usuarios solo pueden ver/modificar sus propios registros
- Los admins tienen acceso ampliado según políticas específicas
- Auditoría completa en `app_usage_logs`

## 🧭 Navegación y Páginas

<lov-mermaid>
graph LR
    A[Dashboard] --> B[Pacientes]
    A --> C[Consultas]
    A --> D[Transcripciones]
    A --> E[Calendario]
    A --> F[Consultorios]
    A --> G[Perfil]
    A --> H[Ajustes]
    
    B --> I[Detalle Paciente]
    I --> J[Asistente IA]
    J --> K[Grabación]
    J --> L[SOAP]
    J --> M[Síntomas]
    J --> N[Plan]
    
    H --> O[Admin Panel]
    O --> P[Analytics]
    O --> Q[Usuarios]
    O --> R[Planes]
    O --> S[Pagos]
    O --> T[Config IA]
</lov-mermaid>

### Páginas Principales

#### 📊 Dashboard (`/`)
- **Resumen** de actividad reciente
- **Métricas** de consultations y transcripciones
- **Accesos rápidos** a funciones principales
- **Notificaciones** del sistema

#### 👨‍⚕️ Pacientes (`/patients`)
- **Lista completa** de pacientes
- **Búsqueda** y filtrado
- **Registro de nuevos pacientes** (manual + IA)
- **Navegación** al detalle de cada paciente

#### 📋 Detalle del Paciente (`/patient/:id`)
- **Información personal** del paciente
- **Historial** de consultas
- **Pestaña "Asistente IA"**: Funcionalidad principal de grabación y análisis

#### 🏥 Consultas (`/consultations`)
- **Historial** de todas las consultas
- **Filtrado** por fecha, paciente, tipo
- **Exportación** de reportes

#### 📝 Transcripciones (`/transcriptions`)
- **Lista** de todas las transcripciones
- **Búsqueda** por contenido
- **Exportación** (texto, WhatsApp, email)

#### 📅 Calendario (`/calendar`)
- **Vista de citas** programadas
- **Gestión** de horarios (próximamente)

#### 🏢 Consultorios (`/consultorios`)
- **Gestión** de consultorios/oficinas
- **Asignación** a pacientes

#### ⚙️ Ajustes (`/settings`)
- **Configuración** personal
- **Preferencias** del usuario

#### 👤 Perfil (`/profile`)
- **Datos personales**
- **Información profesional**

### Panel Administrativo (Solo Admins)

#### 📈 Analytics (`/admin/analytics`)
- **Métricas** de uso de la plataforma
- **Estadísticas** de Edge Functions
- **Reportes** de rendimiento

#### 👥 Usuarios (`/admin/users`)
- **Gestión** de usuarios registrados
- **Asignación** de roles
- **Actividad** de usuarios

#### 💳 Planes (`/admin/plans`)
- **Configuración** de planes de suscripción
- **Precios** y características

#### 💰 Pagos (`/admin/payments`)
- **Historial** de transacciones
- **Estado** de suscripciones

#### 🤖 Config IA (`/admin/ai-configs`)
- **Parámetros** de Gemini API
- **Configuración** de prompts

## ⚡ Edge Functions

### Funciones Disponibles

| Función | Propósito | Autenticación | CORS |
|---------|-----------|---------------|------|
| `upload-audio` | Subir y almacenar archivos de audio | ✅ JWT | ✅ |
| `transcribe-audio` | Convertir audio a texto usando Gemini | ✅ JWT | ✅ |
| `structure-consultation` | Estructurar texto en formato SOAP | ✅ JWT | ✅ |
| `symptom-analysis` | Analizar síntomas y generar diagnósticos | ✅ JWT | ✅ |
| `generate-plan` | Crear planes terapéuticos completos | ✅ JWT | ✅ |
| `patient-chat` | Chat contextual con IA sobre pacientes | ✅ JWT | ✅ |
| `cleanup-audio` | Limpiar archivos antiguos (cron) | 🔓 Público | ✅ |

### Seguridad de Edge Functions
- **Autenticación JWT** requerida para todas las funciones excepto cleanup
- **CORS habilitado** para acceso desde el frontend
- **Validación** de entrada en todas las funciones
- **Logging completo** para auditoría y debugging
- **Rate limiting** implícito por Supabase

## 🔐 Seguridad y Privacidad

### Medidas Implementadas
- ✅ **RLS** en todas las tablas sensibles
- ✅ **Bucket privado** para archivos de audio
- ✅ **Retención limitada** (48 horas) para datos de audio
- ✅ **Autenticación JWT** en Edge Functions
- ✅ **Roles granulares** (user, admin, super_admin)
- ✅ **Logging de auditoría** en `app_usage_logs`
- ✅ **CORS restrictivo** en Edge Functions

### Buenas Prácticas
- 🔑 **Secretos** gestionados via Supabase Secrets
- 🚫 **Sin claves hardcodeadas** en el código
- 🔒 **HTTPS** en todas las comunicaciones
- 📝 **Logs detallados** pero sin datos sensibles
- ⏰ **Limpieza automática** de datos temporales

## ✅ Checklist de Verificación

### Post-Instalación
- [ ] **Autenticación**: Usuario puede registrarse e iniciar sesión
- [ ] **Grabación**: Audio se captura correctamente en el navegador
- [ ] **Transcripción**: Audio se convierte a texto sin errores
- [ ] **SOAP**: Transcripción se estructura correctamente
- [ ] **Síntomas**: Análisis genera diagnósticos y banderas rojas
- [ ] **Plan**: Se genera plan terapéutico completo
- [ ] **Storage**: Archivos de audio se almacenan en bucket privado
- [ ] **Limpieza**: Cron job elimina archivos antiguos (verificar logs)
- [ ] **Admin**: Panel administrativo accesible para admins
- [ ] **RLS**: Usuarios solo ven sus propios datos

### Verificación de Logs
```bash
# Verificar limpieza automática en logs de Edge Functions
# Buscar: "Cleaned up X old recordings" en cleanup-audio logs
```

## 🚀 Despliegue

### Lovable Deployment
1. Haz clic en **"Publish"** en la esquina superior derecha
2. Tu aplicación estará disponible en: `[tu-proyecto].lovable.app`

### Dominio Personalizado
1. Ve a **Project > Settings > Domains** en Lovable
2. Conecta tu dominio personalizado
3. Requiere plan de pago de Lovable

### Configuración de Producción
- ✅ Todas las variables ya están configuradas
- ✅ Edge Functions se despliegan automáticamente
- ✅ Base de datos y storage listos para producción
- ✅ Cron jobs configurados y funcionando

## 🔗 Enlaces Útiles

### Supabase Dashboard (Project: pkmmqwcjwebszfugkmlr)
- [🏠 Dashboard Principal](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr)
- [⚡ Edge Functions](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/functions)
- [🔐 Secretos](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/settings/functions)
- [👥 Usuarios](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/auth/users)
- [🗃️ SQL Editor](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/sql/new)
- [💾 Storage](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/storage/buckets)

### Logs de Edge Functions
- [upload-audio logs](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/functions/upload-audio/logs)
- [transcribe-audio logs](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/functions/transcribe-audio/logs)
- [structure-consultation logs](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/functions/structure-consultation/logs)
- [symptom-analysis logs](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/functions/symptom-analysis/logs)
- [generate-plan logs](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/functions/generate-plan/logs)
- [cleanup-audio logs](https://supabase.com/dashboard/project/pkmmqwcjwebszfugkmlr/functions/cleanup-audio/logs)

### Documentación
- [Lovable Docs](https://docs.lovable.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)

## 🛠️ Resolución de Problemas

### Errores Comunes

#### 🎙️ Grabación de Audio
```
Error: "MediaRecorder not supported"
Solución: Verificar que el navegador soporte WebRTC y tenga permisos de micrófono
```

#### 🔑 Autenticación
```
Error: "JWT expired" o "Invalid token"
Solución: Recargar página o volver a iniciar sesión
```

#### 🤖 Edge Functions
```
Error: "Function timeout" o "Internal server error"
Solución: Verificar logs en Supabase Dashboard y estado de Gemini API
```

#### 💾 Storage
```
Error: "Bucket not found" o "Access denied"
Solución: Verificar que bucket 'medscribe-audio' existe y tiene RLS configurado
```

### Debugging
1. **Consola del navegador**: Revisar errores de JavaScript
2. **Network tab**: Verificar llamadas a Edge Functions
3. **Supabase logs**: Revisar logs específicos de cada función
4. **RLS policies**: Verificar permisos en SQL Editor

### Contacto y Soporte
- 📧 Para issues técnicos: revisar logs de Edge Functions
- 🐛 Para bugs: usar herramientas de debugging del navegador
- 💡 Para nuevas funciones: implementar paso a paso

## 🚧 Roadmap

### Próximas Mejoras
- [ ] **Persistencia de configuración IA**: Guardar ajustes de prompts en base de datos
- [ ] **Vinculación recording-consultation**: Conectar `recordingId` con consultas específicas
- [ ] **Analytics reales**: Dashboard con métricas de uso real
- [ ] **Notificaciones push**: Alertas en tiempo real
- [ ] **Internacionalización**: Soporte multi-idioma
- [ ] **API REST pública**: Para integraciones externas
- [ ] **Mobile app**: Aplicación nativa para iOS/Android
- [ ] **Integración EMR**: Conectores con sistemas hospitalarios
- [ ] **Firma digital**: Validación legal de documentos médicos
- [ ] **Telemedicina**: Videollamadas integradas

### Optimizaciones Técnicas
- [ ] **Caching inteligente**: Reducir llamadas a Gemini API
- [ ] **Compresión de audio**: Optimizar tamaño de archivos
- [ ] **Batch processing**: Procesar múltiples audios simultáneamente
- [ ] **Edge computing**: Distribución geográfica de funciones
- [ ] **Monitoring avanzado**: Alertas automáticas de sistema

---

**MedScribe AI** - Revolucionando la documentación médica con IA 🚀

*Versión: 1.0 | Última actualización: 2025*