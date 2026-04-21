import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, DollarSign, Crown, Zap, UserCheck, UserX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Stats {
  total: number;
  active: number;
  inactive: number;
  pro: number;
}

function StatCard({ icon, label, value, sub, color = 'text-primary' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-surface border border-white/5 rounded-3xl p-6 space-y-4">
      <div className={`w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black">{value}</p>
        <p className="text-text-muted text-sm font-bold mt-1">{label}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, pro: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: profiles } = await supabase.from('profiles').select('subscriptionStatus, PRO');

      if (profiles) {
        const active = profiles.filter(p => p.subscriptionStatus === 'active').length;
        const inactive = profiles.filter(p => p.subscriptionStatus !== 'active').length;
        const pro = profiles.filter(p => p.PRO === true).length;
        setStats({ total: profiles.length, active, inactive, pro });
      }
      setLoading(false);
    }
    load();
  }, []);

  const receita = stats.active * 19.90;

  const chartData = [
    { name: 'Ativos', value: stats.active, color: '#FF6A00' },
    { name: 'Inativos', value: stats.inactive, color: '#6F6F6F' },
  ];

  if (loading) return <div className="text-text-muted">Carregando...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Visão geral do IronShape</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Total de Usuários" value={stats.total} color="text-white" />
        <StatCard icon={<UserCheck size={20} />} label="Usuários Ativos" value={stats.active} sub="Assinatura ativa" color="text-primary" />
        <StatCard icon={<UserX size={20} />} label="Usuários Inativos" value={stats.inactive} sub="Sem assinatura" color="text-text-muted" />
        <StatCard icon={<DollarSign size={20} />} label="Receita Estimada" value={`R$ ${receita.toFixed(2).replace('.', ',')}`} sub="mensal" color="text-success" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-surface border border-white/5 rounded-3xl p-6 space-y-6">
          <h2 className="font-black uppercase tracking-tight">Usuários por Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={60}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6F6F6F', fontSize: 12, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6F6F6F', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#121212', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-white/5 rounded-3xl p-6 space-y-4">
          <h2 className="font-black uppercase tracking-tight">Resumo</h2>
          <div className="space-y-3">
            {[
              { label: 'Ativos', value: stats.active, color: 'bg-primary' },
              { label: 'Inativos', value: stats.inactive, color: 'bg-white/10' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-sm text-text-secondary flex-1">{item.label}</span>
                <span className="font-black text-sm">{item.value}</span>
                <span className="text-xs text-text-muted w-12 text-right">
                  {stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
