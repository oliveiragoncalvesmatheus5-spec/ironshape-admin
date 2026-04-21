import { useEffect, useState } from 'react';
import { supabase, ADMIN_EMAIL } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Community from './pages/Community';
import Workouts from './pages/Workouts';
import Affiliates from './pages/Affiliates';

export type Page = 'dashboard' | 'users' | 'community' | 'workouts' | 'affiliates';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!user || !isAdmin) {
    return <LoginPage />;
  }

  return (
    <Layout page={page} setPage={setPage} userEmail={user.email!}>
      {page === 'dashboard' && <Dashboard />}
      {page === 'users' && <Users />}
      {page === 'community' && <Community />}
      {page === 'workouts' && <Workouts />}
      {page === 'affiliates' && <Affiliates />}
    </Layout>
  );
}
