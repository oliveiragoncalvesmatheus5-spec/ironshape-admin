import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, ChevronDown, Check, UserCheck, UserX } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: string;
  PRO: boolean;
  points: number;
  streak: number;
  criado_em: string;
}

const statusColor: Record<string, string> = {
  active: 'bg-primary/10 text-primary border border-primary/20',
  inactive: 'bg-white/10 text-text-muted',
};

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    let list = users;
    if (search) list = list.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter === 'Ativos') list = list.filter(u => u.subscriptionStatus === 'active');
    if (statusFilter === 'Inativos') list = list.filter(u => u.subscriptionStatus !== 'active');
    setFiltered(list);
  }, [search, statusFilter, users]);

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('criado_em', { ascending: false });
    if (data) { setUsers(data as Profile[]); setFiltered(data as Profile[]); }
    setLoading(false);
  }

  async function toggleStatus(userId: string, currentStatus: string) {
    setUpdating(userId);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('profiles')
      .update({ subscriptionStatus: newStatus })
      .eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionStatus: newStatus } : u));
      showToast('Status atualizado!');
    }
    setUpdating(null);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  if (loading) return <div className="text-text-muted">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Usuários</h1>
        <p className="text-text-muted text-sm mt-1">{users.length} usuários cadastrados</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full bg-surface border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-surface border border-white/5 rounded-2xl px-4 py-3 text-sm appearance-none pr-8 focus:outline-none focus:border-primary/30 cursor-pointer"
          >
            <option>Todos</option>
            <option>Ativos</option>
            <option>Inativos</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Usuário</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Pontos</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Sequência</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Cadastro</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center font-black text-sm text-primary">
                        {(user.name || user.email)?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{user.name || 'Sem nome'}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase ${statusColor[user.subscriptionStatus] || 'bg-white/10 text-text-muted'}`}>
                      {user.subscriptionStatus === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold">{user.points ?? 0}</td>
                  <td className="p-4 text-sm text-text-muted">{user.streak ?? 0} dias</td>
                  <td className="p-4 text-xs text-text-muted">
                    {user.criado_em ? new Date(user.criado_em).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(user.id, user.subscriptionStatus)}
                      disabled={updating === user.id}
                      className={`p-2 rounded-xl transition-all disabled:opacity-40 ${user.subscriptionStatus === 'active' ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                      title={user.subscriptionStatus === 'active' ? 'Desativar' : 'Ativar'}
                    >
                      {user.subscriptionStatus === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">Nenhum usuário encontrado.</div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-success text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-2 z-50">
          <Check size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
