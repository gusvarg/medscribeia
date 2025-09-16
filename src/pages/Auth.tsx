import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Brain, FileText, Sun, Moon, Shield, UserCheck, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { MEDICAL_SPECIALTIES } from '@/constants/medicalSpecialties';
import SliderCaptcha from '@/components/SliderCaptcha';

export default function Auth() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    especialidad: '',
    telefono: '',
    numeroLicencia: ''
  });

  const [captchaCompleted, setCaptchaCompleted] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Update theme class and localStorage when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('HandleSignIn - captchaCompleted:', captchaCompleted);
    
    if (!captchaCompleted) {
      console.log('Captcha no completado - bloqueando envío');
      toast({
        title: "Verificación requerida",
        description: "Por favor, completa la verificación deslizando el control hacia la derecha.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Intentando login con captcha completado');
      await signIn(formData.email, formData.password);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      // Reset captcha after successful login
      setCaptchaCompleted(false);
    } catch (error) {
      console.log('Error en login, reseteando captcha');
      toast({
        title: "Error",
        description: "Credenciales inválidas. Por favor, verifica tu email y contraseña.",
        variant: "destructive",
      });
      // Reset captcha after failed login
      setCaptchaCompleted(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(formData.email, formData.password, formData.nombre, '', formData.especialidad);
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al crear tu cuenta. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const navigateHome = () => {
    window.location.href = '/';
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-neutral-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]' 
            : 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),rgba(255,255,255,0))]'
        }`}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={navigateHome}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`p-2 rounded-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-blue-600 to-purple-700' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            } shadow-lg backdrop-blur-sm`}>
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                MedScribe AI
              </h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Inteligencia médica avanzada
              </p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`rounded-full ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Branding & Features */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-6">
              <motion.h2 
                className={`text-4xl lg:text-5xl font-bold leading-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Revoluciona tu 
                <span className={`block ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                }`}>
                  práctica médica
                </span>
              </motion.h2>

              <motion.p 
                className={`text-xl ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                } leading-relaxed`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Únete a miles de profesionales que ya utilizan inteligencia artificial 
                para mejorar la precisión diagnóstica y optimizar el tiempo de consulta.
              </motion.p>
            </div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div 
                className={`p-6 rounded-2xl border ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-lg' 
                    : 'bg-white/70 border-gray-200/50 backdrop-blur-lg'
                } shadow-xl`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`p-3 rounded-xl w-fit mb-4 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                } shadow-lg`}>
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className={`font-semibold text-lg mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Diagnóstico Inteligente
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Análisis avanzado de síntomas con sugerencias diagnósticas precisas
                </p>
              </motion.div>

              <motion.div 
                className={`p-6 rounded-2xl border ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-lg' 
                    : 'bg-white/70 border-gray-200/50 backdrop-blur-lg'
                } shadow-xl`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`p-3 rounded-xl w-fit mb-4 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700' 
                    : 'bg-gradient-to-br from-purple-500 to-purple-600'
                } shadow-lg`}>
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className={`font-semibold text-lg mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Transcripción Automática
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Convierte consultas de voz a texto estructurado instantáneamente
                </p>
              </motion.div>
            </motion.div>

            {/* Texto Regresar al Inicio */}
            <motion.div
              className="flex justify-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div
                className={`cursor-pointer text-center transition-all duration-300 ${
                  isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'
                }`}
                onClick={navigateHome}
              >
                <span className={`text-lg font-semibold ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ← Regresar al inicio
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className={`${
              isDarkMode 
                ? 'bg-gray-800/30 border-gray-700/30 backdrop-blur-xl shadow-2xl' 
                : 'bg-white/30 border-gray-200/30 backdrop-blur-xl shadow-2xl'
            } rounded-3xl overflow-hidden`}>
              <CardHeader className="space-y-4 pb-8">
                <div className="flex items-center justify-center space-x-2">
                  <Shield className={`h-8 w-8 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <CardTitle className={`text-2xl font-bold text-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Acceso Médico Seguro
                </CardTitle>
                <CardDescription className={`text-center text-lg ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Inicia sesión o crea tu cuenta profesional
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8">
                <Tabs defaultValue="signin" className="space-y-6">
                  <TabsList className={`grid w-full grid-cols-2 p-1 rounded-2xl ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600/50' 
                      : 'bg-gray-100/80 border-gray-200/50'
                  } backdrop-blur-sm`}>
                    <TabsTrigger 
                      value="signin" 
                      className={`rounded-xl font-medium transition-all ${
                        isDarkMode 
                          ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300' 
                          : 'data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700'
                      }`}
                    >
                      Iniciar Sesión
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className={`rounded-xl font-medium transition-all ${
                        isDarkMode 
                          ? 'data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300' 
                          : 'data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-700'
                      }`}
                    >
                      Crear Cuenta
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="space-y-4">
                    <motion.form 
                      onSubmit={handleSignIn} 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Email Profesional
                        </Label>
                        <Input
                          id="signin-email"
                          name="email"
                          type="email"
                          placeholder="doctor@ejemplo.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`h-12 px-4 rounded-xl border-2 transition-all ${
                            isDarkMode 
                              ? 'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:bg-gray-700/70' 
                              : 'bg-white/70 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white/90'
                          } backdrop-blur-sm shadow-sm focus:shadow-md`}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Contraseña
                        </Label>
                        <Input
                          id="signin-password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`h-12 px-4 rounded-xl border-2 transition-all ${
                            isDarkMode 
                              ? 'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:bg-gray-700/70' 
                              : 'bg-white/70 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white/90'
                          } backdrop-blur-sm shadow-sm focus:shadow-md`}
                          required
                        />
                      </div>

                      {/* Slider Captcha */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-shrink-0">
                            <Label className={`text-sm font-medium ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              Verificación de Seguridad
                            </Label>
                          </div>
                          <div className="flex-1 max-w-xs">
                            <SliderCaptcha
                              onSuccess={() => {
                                console.log('Captcha completado');
                                setCaptchaCompleted(true);
                              }}
                              onReset={() => {
                                console.log('Captcha reseteado');
                                setCaptchaCompleted(false);
                              }}
                              isDarkMode={isDarkMode}
                            />
                          </div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading || !captchaCompleted}
                        className={`w-full h-14 rounded-xl font-bold text-lg transition-all duration-300 ${
                          loading || !captchaCompleted
                            ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                            : isDarkMode 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/25' 
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-lg shadow-blue-500/25'
                        } text-white ${(!loading && captchaCompleted) ? 'hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]' : ''}`}
                        onClick={(e) => {
                          if (!captchaCompleted) {
                            e.preventDefault();
                            toast({
                              title: "Verificación requerida",
                              description: "Completa la verificación deslizando el control hacia la derecha.",
                              variant: "destructive",
                            });
                            return false;
                          }
                        }}
                        title={!captchaCompleted ? "Completa la verificación deslizando el control" : ""}
                      >
                        <span className="flex items-center justify-center space-x-3">
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Iniciando sesión...
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-5 h-5" />
                              <span>Iniciar Sesión</span>
                            </>
                          )}
                        </span>
                      </Button>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <motion.form 
                      onSubmit={handleSignUp} 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-nombre" className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            Nombre Completo
                          </Label>
                          <Input
                            id="signup-nombre"
                            name="nombre"
                            type="text"
                            placeholder="Dr. Juan Pérez"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className={`h-12 px-4 rounded-xl border-2 transition-all ${
                              isDarkMode 
                                ? 'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:bg-gray-700/70' 
                                : 'bg-white/70 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white/90'
                            } backdrop-blur-sm shadow-sm focus:shadow-md`}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-especialidad" className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            Especialidad
                          </Label>
                          <Select onValueChange={(value) => handleSelectChange('especialidad', value)}>
                            <SelectTrigger className={`h-12 rounded-xl border-2 transition-all ${
                              isDarkMode 
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-purple-500 focus:bg-gray-700/70' 
                                : 'bg-white/70 border-gray-300 text-gray-900 focus:border-purple-500 focus:bg-white/90'
                            } backdrop-blur-sm shadow-sm focus:shadow-md`}>
                              <SelectValue placeholder="Selecciona especialidad" />
                            </SelectTrigger>
                            <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                              {MEDICAL_SPECIALTIES.map((specialty) => (
                                <SelectItem key={specialty} value={specialty}>
                                  {specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Email Profesional
                        </Label>
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder="doctor@ejemplo.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`h-12 px-4 rounded-xl border-2 transition-all ${
                            isDarkMode 
                              ? 'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:bg-gray-700/70' 
                              : 'bg-white/70 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white/90'
                          } backdrop-blur-sm shadow-sm focus:shadow-md`}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-telefono" className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            Teléfono
                          </Label>
                          <Input
                            id="signup-telefono"
                            name="telefono"
                            type="tel"
                            placeholder="+1 234 567 8900"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            className={`h-12 px-4 rounded-xl border-2 transition-all ${
                              isDarkMode 
                                ? 'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:bg-gray-700/70' 
                                : 'bg-white/70 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white/90'
                            } backdrop-blur-sm shadow-sm focus:shadow-md`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-licencia" className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            Número de Licencia
                          </Label>
                          <Input
                            id="signup-licencia"
                            name="numeroLicencia"
                            type="text"
                            placeholder="123456"
                            value={formData.numeroLicencia}
                            onChange={handleInputChange}
                            className={`h-12 px-4 rounded-xl border-2 transition-all ${
                              isDarkMode 
                                ? 'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:bg-gray-700/70' 
                                : 'bg-white/70 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white/90'
                            } backdrop-blur-sm shadow-sm focus:shadow-md`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Contraseña
                        </Label>
                        <Input
                          id="signup-password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`h-12 px-4 rounded-xl border-2 transition-all ${
                            isDarkMode 
                              ? 'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:bg-gray-700/70' 
                              : 'bg-white/70 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white/90'
                          } backdrop-blur-sm shadow-sm focus:shadow-md`}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full h-14 rounded-xl font-bold text-lg transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-lg shadow-purple-500/25' 
                            : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-lg shadow-purple-500/25'
                        } text-white hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]`}
                      >
                        <span className="flex items-center justify-center space-x-3">
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Creando cuenta...</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-5 h-5" />
                              <span>Crear Cuenta</span>
                            </>
                          )}
                        </span>
                      </Button>
                    </motion.form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer 
        className={`relative z-10 py-8 px-6 border-t ${
          isDarkMode 
            ? 'border-gray-800/50 bg-gray-900/30' 
            : 'border-gray-200/50 bg-white/30'
        } backdrop-blur-sm`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            © 2024 MedScribe AI. Todos los derechos reservados.
          </p>
          <p className={`text-xs mt-1 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Desarrollado con ❤️ por{' '}
            <a 
              href="https://krezco.digital" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`font-medium hover:underline ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Krezco Digital
            </a>
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
