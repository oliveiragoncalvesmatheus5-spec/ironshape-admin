import { LayoutDashboard, Users, MessageSquare, Dumbbell, UserCheck, LogOut, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../App';

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  userEmail: string;
  children: React.ReactNode;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',   label: 'Dashboard',   icon: <LayoutDashboard size={18} /> },
  { id: 'users',       label: 'Usuários',    icon: <Users size={18} /> },
  { id: 'community',   label: 'Comunidade',  icon: <MessageSquare size={18} /> },
  { id: 'workouts',    label: 'Treinos',     icon: <Dumbbell size={18} /> },
  { id: 'affiliates',  label: 'Afiliados',   icon: <UserCheck size={18} /> },
];

export default function Layout({ page, setPage, userEmail, children }: Props) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-white/5 flex flex-col fixed h-full z-10">
        {/* Logo */}
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

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
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

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] text-text-muted truncate">{userEmail}</p>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-all shrink-0"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
