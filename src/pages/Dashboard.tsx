import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Mic, 
  Calendar,
  TrendingUp,
  Clock,
  Activity,
  Brain
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
  return <Navigate to="/login" replace />;
  }

  const quickStats = [
    {
      title: "Pacientes Registrados",
      value: "127",
      change: "+12%",
      icon: Users,
      color: "medical-blue"
    },
    {
      title: "Consultas del Mes",
      value: "89",
      change: "+8%",
      icon: Calendar,
      color: "medical-green"
    },
    {
      title: "Transcripciones IA",
      value: "156",
      change: "+23%",
      icon: Brain,
      color: "medical-purple"
    },
    {
      title: "Tiempo Ahorrado",
      value: "42h",
      change: "+15%",
      icon: Clock,
      color: "medical-orange"
    }
  ];

  const recentActivities = [
    {
      type: "consultation",
      patient: "María González",
      action: "Consulta transcrita",
      time: "Hace 2 horas",
      status: "completed"
    },
    {
      type: "patient",
      patient: "Carlos Rodríguez",
      action: "Nuevo paciente registrado",
      time: "Hace 4 horas",
      status: "new"
    },
    {
      type: "transcription",
      patient: "Ana López",
      action: "Transcripción procesada",
      time: "Hace 6 horas",
      status: "processed"
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            ¡Bienvenido de vuelta, Dr. {user.user_metadata?.first_name || 'Usuario'}!
          </h1>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de tu actividad médica reciente
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 text-${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-medical-green">{stat.change}</span> desde el mes pasado
                </p>
              </CardContent>
              <div className={`absolute bottom-0 left-0 h-1 w-full bg-${stat.color} opacity-20`} />
            </Card>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones principales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Mic className="mr-2 h-4 w-4" />
                Nueva Transcripción
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Registrar Paciente
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Programar Consulta
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Ver Reportes
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimas acciones en tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    activity.status === 'completed' ? 'bg-medical-green' :
                    activity.status === 'new' ? 'bg-primary' : 'bg-medical-orange'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      Paciente: {activity.patient}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI Features Preview */}
        <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-medical-purple/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Funciones de IA Disponibles
            </CardTitle>
            <CardDescription>
              Aprovecha el poder de la inteligencia artificial para optimizar tu práctica médica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <Mic className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Transcripción Automática</h3>
                <p className="text-sm text-muted-foreground">
                  Convierte audio a texto con precisión médica
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <FileText className="h-8 w-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Notas SOAP</h3>
                <p className="text-sm text-muted-foreground">
                  Genera automáticamente documentación estructurada
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <Brain className="h-8 w-8 text-medical-purple mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Análisis Inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  Obtén insights automáticos de patrones médicos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;