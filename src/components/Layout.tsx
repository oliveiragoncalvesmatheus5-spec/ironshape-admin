import { useState } from 'react';
import { LayoutDashboard, Users, MessageSquare, Dumbbell, UserCheck, LogOut, Shield, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../App';

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  userEmail: string;
  children: React.ReactNode;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
  { id: 'users',      label: 'Usuários',   icon: <Users size={18} /> },
  { id: 'community',  label: 'Comunidade', icon: <MessageSquare size={18} /> },
  { id: 'workouts',   label: 'Treinos',    icon: <Dumbbell size={18} /> },
  { id: 'affiliates', label: 'Afiliados',  icon: <UserCheck size={18} /> },
];

export default function Layout({ page, setPage, userEmail, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function navigate(p: Page) {
    setPage(p);
    setMobileOpen(false);
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-widest">IronShape</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
              page === item.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-text-muted hover:text-text-primary hover:bg-white/5'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-text-muted truncate min-w-0">{userEmail}</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="p-2 rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-all shrink-0"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 bg-surface border-r border-white/5 flex-col fixed h-full z-10">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-surface border-r border-white/5 z-30 flex flex-col transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:bg-white/5"
        >
          <X size={20} />
        </button>
        {sidebar}
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-4 p-4 bg-surface border-b border-white/5 sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-text-muted hover:bg-white/5"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-primary" />
            </div>
            <p className="font-black text-sm uppercase tracking-widest">IronShape</p>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
