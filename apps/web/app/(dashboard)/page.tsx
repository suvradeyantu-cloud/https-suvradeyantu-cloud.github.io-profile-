import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@prescriply/ui';
import { 
  Users, 
  FileText, 
  Layers, 
  DollarSign, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch counts parallelly
  const [
    { count: patientCount },
    { count: visitCount },
    { count: draftCount },
    { data: chambers }
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('doctor_id', user!.id),
    supabase.from('visits').select('*', { count: 'exact', head: true }).eq('doctor_id', user!.id),
    supabase.from('visits').select('*', { count: 'exact', head: true }).eq('doctor_id', user!.id).eq('status', 'draft'),
    supabase.from('chambers').select('*').eq('doctor_id', user!.id)
  ]);

  // Fetch recent visits
  const { data: recentVisits } = await supabase
    .from('visits')
    .select('id, visit_date, status, patients(name_encrypted)')
    .eq('doctor_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-blue-600 text-white rounded-xl p-6 shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Welcome back to Prescriply!</h2>
          <p className="mt-1 opacity-90">Manage patients, write prescriptions, and review analytics smoothly.</p>
        </div>
        <a 
          href="/prescription/new" 
          className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-blue-50 transition"
        >
          <Plus className="h-5 w-5" />
          <span>New Prescription</span>
        </a>
      </div>

      {/* Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm text-gray-500 font-medium">Total Patients</span>
              <h3 className="text-3xl font-bold text-gray-900">{patientCount || 0}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm text-gray-500 font-medium">Prescriptions Written</span>
              <h3 className="text-3xl font-bold text-gray-900">{visitCount || 0}</h3>
            </div>
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm text-gray-500 font-medium">Draft Prescriptions</span>
              <h3 className="text-3xl font-bold text-gray-900">{draftCount || 0}</h3>
            </div>
            <div className="h-12 w-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm text-gray-500 font-medium">Active Chambers</span>
              <h3 className="text-3xl font-bold text-gray-900">{chambers?.length || 0}</h3>
            </div>
            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Split layout for recent visits & clinics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Recent Prescriptions</span>
            </CardTitle>
            <CardDescription>Review or finalise your latest prescription visits.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentVisits && recentVisits.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentVisits.map((visit) => (
                  <div key={visit.id} className="py-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-950">Patient ID: {visit.id.substring(0, 8)}</h4>
                      <p className="text-sm text-gray-500">{new Date(visit.visit_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        visit.status === 'final' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {visit.status}
                      </span>
                      <a href={`/prescription/${visit.id}`} className="text-blue-600 hover:text-blue-700 transition">
                        <ArrowRight className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">No recent visits. Write your first prescription!</p>
            )}
          </CardContent>
        </Card>

        {/* Chambers Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Chambers / Clinics</CardTitle>
            <CardDescription>Setup chambers in settings to tie consultations to invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chambers && chambers.length > 0 ? (
              chambers.map((chamber) => (
                <div key={chamber.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">{chamber.name}</h4>
                    <p className="text-xs text-gray-500">{chamber.address || 'No Address'}</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    ৳{chamber.consultation_fee}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">No chambers found.</p>
                <a href="/settings" className="mt-2 inline-block text-xs text-blue-600 hover:underline">
                  Add a chamber +
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
