import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Brain, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MEDICAL_SPECIALTIES } from '@/constants/medicalSpecialties';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const specialty = formData.get('specialty') as string;

    const { error } = await signUp(email, password, firstName, lastName, specialty);

    if (error) {
      toast({
        title: "Error al crear cuenta",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Stethoscope className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold text-foreground">MedScribe AI</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Revoluciona tu práctica médica con transcripción inteligente y documentación asistida por IA
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Features Section */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">IA Médica Avanzada</h3>
                  <p className="text-muted-foreground">
                    Transcripción automática de consultas con comprensión del contexto médico
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Documentación Inteligente</h3>
                  <p className="text-muted-foreground">
                    Genera automáticamente notas SOAP y historias clínicas estructuradas
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-medical-green/10 p-3 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-medical-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Gestión de Pacientes</h3>
                  <p className="text-muted-foreground">
                    Organiza y accede fácilmente a historiales médicos completos
                  </p>
                </div>
              </div>
            </div>

            {/* Auth Form */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Acceso a la Plataforma</CardTitle>
                <CardDescription>
                  Inicia sesión o crea tu cuenta para comenzar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                    <TabsTrigger value="signup">Registrarse</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          name="email"
                          type="email"
                          placeholder="doctor@ejemplo.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Contraseña</Label>
                        <Input
                          id="signin-password"
                          name="password"
                          type="password"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Nombre</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="Juan"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Apellido</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Pérez"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidad Médica</Label>
                        <Select name="specialty" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu especialidad" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {MEDICAL_SPECIALTIES.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder="doctor@ejemplo.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Contraseña</Label>
                        <Input
                          id="signup-password"
                          name="password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;