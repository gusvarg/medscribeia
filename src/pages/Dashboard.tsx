
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Calendar, FileText, Building2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch patients count
  const { data: patientsCount = 0 } = useQuery({
    queryKey: ['patientsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch consultations count
  const { data: consultationsCount = 0 } = useQuery({
    queryKey: ['consultationsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch appointments count
  const { data: appointmentsCount = 0 } = useQuery({
    queryKey: ['appointmentsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch consultorios count
  const { data: consultoriosCount = 0 } = useQuery({
    queryKey: ['consultoriosCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('consultorios')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch recent consultations
  const { data: recentConsultations = [] } = useQuery({
    queryKey: ['recentConsultations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          id,
          consultation_date,
          chief_complaint,
          patients (first_name, last_name),
          consultorios (name)
        `)
        .order('consultation_date', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Panel Principal</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/patients')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientsCount}</div>
              <p className="text-xs text-muted-foreground">Total de pacientes registrados</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/consultations')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{consultationsCount}</div>
              <p className="text-xs text-muted-foreground">Total de consultas realizadas</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/calendar')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentsCount}</div>
              <p className="text-xs text-muted-foreground">Citas programadas</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/consultorios')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultorios</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{consultoriosCount}</div>
              <p className="text-xs text-muted-foreground">Consultorios registrados</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/consultorios');
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Gestionar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Consultas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentConsultations.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay consultas recientes</p>
              ) : (
                <div className="space-y-4">
                  {recentConsultations.map((consultation: any) => (
                    <div key={consultation.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                      <div>
                        <p className="font-medium">
                          {consultation.patients.first_name} {consultation.patients.last_name}
                        </p>
                        {consultation.chief_complaint && (
                          <p className="text-sm text-muted-foreground">{consultation.chief_complaint}</p>
                        )}
                        {consultation.consultorios && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {consultation.consultorios.name}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(consultation.consultation_date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
