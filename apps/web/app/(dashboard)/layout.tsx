import Link from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileSignature, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Stethoscope
} from 'lucide-react';
import React from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'New Prescription', href: '/prescription/new', icon: FileSignature },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
            <Stethoscope className="h-6 w-6" />
            <span>Prescriply</span>
          </Link>
        </div>

        {/* Doctor Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {profile?.full_name?.substring(0, 2).toUpperCase() || 'Dr'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate text-gray-900">{profile?.full_name || 'Doctor'}</h4>
              <p className="text-xs text-gray-500 truncate">{profile?.bmdc_reg || 'No Reg'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 transition"
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-200">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col flex-1 w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-900">Clinical Suite</h1>
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-semibold">
              {profile?.subscription_tier?.toUpperCase() || 'FREE'} PLAN
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
