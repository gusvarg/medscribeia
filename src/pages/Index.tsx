import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Stethoscope, 
  Brain, 
  FileText, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Star,
  Users
} from 'lucide-react';

const Index = () => {
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

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Brain,
      title: "IA Médica Avanzada",
      description: "Transcripción automática de consultas con comprensión específica del contexto médico y terminología especializada."
    },
    {
      icon: FileText,
      title: "Documentación Inteligente",
      description: "Genera automáticamente notas SOAP, historias clínicas estructuradas y reportes médicos completos."
    },
    {
      icon: Shield,
      title: "Seguridad HIPAA",
      description: "Cumple con todos los estándares de seguridad médica para proteger la información sensible de pacientes."
    },
    {
      icon: Users,
      title: "Gestión de Pacientes",
      description: "Organiza y accede fácilmente a historiales médicos completos con búsqueda inteligente."
    }
  ];

  const testimonials = [
    {
      name: "Dr. María González",
      specialty: "Medicina Interna",
      content: "MedScribe AI ha revolucionado mi consulta. Ahora puedo enfocarme completamente en mis pacientes mientras la IA documenta todo.",
      rating: 5
    },
    {
      name: "Dr. Carlos Mendoza",
      specialty: "Cardiología",
      content: "La precisión de las transcripciones es impresionante. Ha reducido mi tiempo de documentación en un 70%.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">MedScribe AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Comenzar Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-medical-purple bg-clip-text text-transparent">
            Revoluciona tu Práctica Médica con IA
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transcripción inteligente de consultas, documentación automática y gestión completa de pacientes. 
            Todo potenciado por inteligencia artificial especializada en medicina.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/auth">
                Comenzar Prueba Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Ver Demo en Vivo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✓ Prueba gratuita de 30 días • ✓ Sin tarjeta de crédito • ✓ Configuración en 5 minutos
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Funcionalidades Principales</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Herramientas diseñadas específicamente para profesionales de la salud
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Ahorra Tiempo, Mejora la Atención
              </h2>
              <div className="space-y-4">
                {[
                  "Reduce el tiempo de documentación en hasta 70%",
                  "Mejora la precisión de los registros médicos",
                  "Permite mayor foco en la atención al paciente",
                  "Cumple con estándares de seguridad médica",
                  "Integración fácil con sistemas existentes",
                  "Soporte 24/7 especializado en salud"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-medical-green flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary mb-2">42 horas</div>
                <p className="text-muted-foreground">ahorradas por mes en promedio</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-accent">156</div>
                  <p className="text-sm text-muted-foreground">Transcripciones IA</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-medical-green">98%</div>
                  <p className="text-sm text-muted-foreground">Precisión</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Lo que Dicen los Médicos</h2>
          <p className="text-xl text-muted-foreground">
            Profesionales de la salud confían en MedScribe AI
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <CardContent className="p-0">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-lg mb-4">
                  "{testimonial.content}"
                </blockquote>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.specialty}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            ¿Listo para Transformar tu Consulta?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Únete a miles de médicos que ya están usando MedScribe AI para mejorar su práctica médica
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/auth">
              Comenzar Ahora - Es Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="font-bold">MedScribe AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MedScribe AI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
