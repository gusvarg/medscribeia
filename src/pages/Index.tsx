import React, { useState, useEffect } from 'react';
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
  Users,
  Moon,
  Sun
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Index = () => {
  const { user, loading } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 dark:bg-teal-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-20 w-96 h-96 bg-purple-500/10 dark:bg-blue-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-gray-200/50 dark:border-slate-800/50 shadow-xl transition-colors duration-300"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Stethoscope className="h-10 w-10 text-cyan-500 dark:text-cyan-400 drop-shadow-lg" />
                <div className="absolute inset-0 h-10 w-10 bg-cyan-400/20 rounded-full filter blur-md animate-pulse"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                MedScribe AI
              </span>
            </motion.div>
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="p-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 transition-all duration-300"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  asChild
                  className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 transition-all duration-300"
                >
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-cyan-400/50 transition-all duration-300"
                >
                  <Link to="/login">
                    Comenzar Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 flex items-center justify-center min-h-screen">
        <div className="container mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <motion.h1 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
            >
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent animate-pulse">
                Revoluciona
              </span>
              <br />
              <span className="text-gray-800 dark:text-slate-100">tu Práctica</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-blue-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Médica con IA
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Transcripción inteligente de consultas, documentación automática y gestión completa de pacientes. 
              <span className="text-cyan-600 dark:text-teal-400 font-semibold">Todo potenciado por inteligencia artificial especializada en medicina.</span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  asChild
                  className="text-lg px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-2xl hover:shadow-cyan-500/50 backdrop-blur-sm border border-cyan-400/50 transition-all duration-300"
                >
                  <Link to="/login">
                    Comenzar Prueba Gratuita
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-4 bg-white/80 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/70 backdrop-blur-sm border-2 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 text-gray-700 dark:text-slate-200 hover:text-gray-800 dark:hover:text-white shadow-xl transition-all duration-300"
                >
                  Ver Demo en Vivo
                  <motion.div 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-2"
                  >
                    ▶
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-sm text-gray-500 dark:text-white/60 mt-8 flex items-center justify-center gap-6 flex-wrap"
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Prueba gratuita de 30 días
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Sin tarjeta de crédito
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Configuración en 5 minutos
              </span>
            </motion.p>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <motion.div 
          animate={{ y: [-20, 20, -20] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute top-1/4 left-10 w-4 h-4 bg-cyan-400 rounded-full opacity-60"
        />
        <motion.div 
          animate={{ y: [20, -20, 20] }}
          transition={{ repeat: Infinity, duration: 4, delay: 1 }}
          className="absolute top-1/3 right-20 w-6 h-6 bg-teal-400 rounded-full opacity-60"
        />
        <motion.div 
          animate={{ y: [-15, 15, -15] }}
          transition={{ repeat: Infinity, duration: 5, delay: 2 }}
          className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-blue-400 rounded-full opacity-60"
        />
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              Funcionalidades Principales
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
              Herramientas diseñadas específicamente para profesionales de la salud
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group"
              >
                <Card className="text-center h-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-lg border border-gray-200/50 dark:border-slate-600/50 shadow-xl hover:shadow-2xl hover:bg-white/90 dark:hover:bg-slate-800/70 transition-all duration-500">
                  <CardHeader className="pb-4">
                    <motion.div 
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 dark:from-teal-400/20 dark:to-cyan-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-cyan-400/30 dark:border-teal-400/50 shadow-lg"
                    >
                      <feature.icon className="h-10 w-10 text-cyan-600 dark:text-teal-400 drop-shadow-lg" />
                    </motion.div>
                    <CardTitle className="text-2xl text-gray-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600 dark:text-slate-300 group-hover:text-gray-700 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 dark:backdrop-blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Ahorra Tiempo, Mejora la Atención
              </h2>
              <div className="space-y-6">
                {[
                  "Reduce el tiempo de documentación en hasta 70%",
                  "Mejora la precisión de los registros médicos",
                  "Permite mayor foco en la atención al paciente",
                  "Cumple con estándares de seguridad médica",
                  "Integración fácil con sistemas existentes",
                  "Soporte 24/7 especializado en salud"
                ].map((benefit, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-4 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0 drop-shadow-lg" />
                    </motion.div>
                    <span className="text-lg md:text-xl text-gray-700 dark:text-white/90 group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-300">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="backdrop-blur-lg bg-white/80 dark:bg-white/10 rounded-3xl p-10 shadow-2xl border border-gray-200/50 dark:border-white/20 hover:bg-white/90 dark:hover:bg-white/15 transition-all duration-500"
            >
              <div className="text-center mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent mb-4"
                >
                  42 horas
                </motion.div>
                <p className="text-gray-600 dark:text-white/70 text-lg">ahorradas por mes en promedio</p>
              </div>
              <div className="grid grid-cols-2 gap-6 text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-400/10 border border-cyan-200 dark:border-cyan-400/20"
                >
                  <div className="text-3xl md:text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">156</div>
                  <p className="text-sm text-gray-600 dark:text-white/60">Transcripciones IA</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-4 rounded-xl bg-green-50 dark:bg-green-400/10 border border-green-200 dark:border-green-400/20"
                >
                  <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">98%</div>
                  <p className="text-sm text-gray-600 dark:text-white/60">Precisión</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Lo que Dicen los Médicos
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-white/70">
              Profesionales de la salud confían en MedScribe AI
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group"
              >
                <Card className="p-8 h-full backdrop-blur-lg bg-white/80 dark:bg-slate-900/50 border border-gray-200/50 dark:border-slate-600/50 shadow-xl hover:shadow-2xl hover:bg-white/90 dark:hover:bg-slate-800/70 transition-all duration-500">
                  <CardContent className="p-0">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="flex mb-6"
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.2 }}
                        >
                          <Star className="h-6 w-6 fill-yellow-500 text-yellow-500 drop-shadow-lg" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <blockquote className="text-lg md:text-xl mb-8 text-gray-700 dark:text-slate-300 italic leading-relaxed group-hover:text-gray-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
                      <div className="font-semibold text-xl text-gray-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors duration-300 mt-1">
                        {testimonial.specialty}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white drop-shadow-2xl">
              ¿Listo para Transformar
              <br />
              <span className="bg-gradient-to-r from-teal-200 to-cyan-200 bg-clip-text text-transparent">
                tu Consulta?
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Únete a miles de médicos que ya están usando MedScribe AI para mejorar su práctica médica
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                asChild
                className="text-xl px-12 py-6 bg-white text-slate-900 hover:bg-white/90 shadow-2xl hover:shadow-white/50 backdrop-blur-sm transition-all duration-300 font-semibold"
              >
                <Link to="/login">
                  Comenzar Ahora - Es Gratis
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20 }}
          className="absolute top-20 left-10 w-32 h-32 border-2 border-white/30 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 25 }}
          className="absolute bottom-20 right-10 w-40 h-40 border-2 border-white/30 rounded-full"
        />
      </section>

      {/* Footer Krezco Digital */}
      <section className="w-full py-12 bg-gray-50 dark:bg-slate-950 backdrop-blur-lg border-t border-gray-200 dark:border-slate-700 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <span className="text-gray-600 dark:text-slate-300 text-lg">
              Hecho con mucha IA y Amor por <a href="https://krezco.digital" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-teal-400 font-semibold hover:text-cyan-700 dark:hover:text-teal-300 transition-colors duration-300 hover:underline">Krezco Digital</a>
            </span>
          </div>
        </div>
      </section>

      {/* Footer legal */}
      <footer className="bg-white dark:bg-slate-950 backdrop-blur-lg border-t border-gray-200 dark:border-slate-700 py-16 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <Stethoscope className="h-8 w-8 text-cyan-600 dark:text-teal-400" />
              <span className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">MedScribe AI</span>
            </motion.div>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              © 2024 MedScribe AI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
