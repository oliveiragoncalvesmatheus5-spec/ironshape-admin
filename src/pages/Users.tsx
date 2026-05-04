import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, ChevronDown, Check, UserCheck, UserX, Crown, Zap, User } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: string;
  PRO: boolean;
  plano: string;
  points: number;
  streak: number;
  criado_em: string;
}

const statusColor: Record<string, string> = {
  active: 'bg-primary/10 text-primary border border-primary/20',
  inactive: 'bg-white/10 text-text-muted border border-white/10',
};

const planConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Elite:     { label: 'Elite',     color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', icon: <Crown size={11} /> },
  Pro:       { label: 'Pro',       color: 'bg-primary/10 text-primary border border-primary/20',          icon: <Zap size={11} /> },
  Iniciante: { label: 'Iniciante', color: 'bg-white/10 text-text-muted border border-white/10',           icon: <User size={11} /> },
};

export default function Users() {
  const [users, setUsers]           = useState<Profile[]>([]);
  const [filtered, setFiltered]     = useState<Profile[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [planFilter, setPlanFilter] = useState('Todos');
  const [updating, setUpdating]     = useState<string | null>(null);
  const [toast, setToast]           = useState('');
  const [confirmModal, setConfirmModal] = useState<{ userId: string; name: string; newPlan: string } | null>(null);

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    let list = users;
    if (search)
      list = list.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      );
    if (statusFilter === 'Ativos')   list = list.filter(u => u.subscriptionStatus === 'active');
    if (statusFilter === 'Inativos') list = list.filter(u => u.subscriptionStatus !== 'active');
    if (planFilter !== 'Todos')      list = list.filter(u => (u.plano || 'Iniciante') === planFilter);
    setFiltered(list);
  }, [search, statusFilter, planFilter, users]);

  async function loadUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('criado_em', { ascending: false });
    if (data) { setUsers(data as Profile[]); setFiltered(data as Profile[]); }
    setLoading(false);
  }

  async function toggleStatus(userId: string, currentStatus: string) {
    setUpdating(userId + '_status');
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

  async function confirmChangePlan() {
    if (!confirmModal) return;
    const { userId, newPlan } = confirmModal;
    setConfirmModal(null);
    setUpdating(userId + '_plan');
    const { error } = await supabase
      .from('profiles')
      .update({ plano: newPlan })
      .eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plano: newPlan } : u));
      showToast(`Plano alterado para ${newPlan}!`);
    } else {
      showToast('Erro ao alterar plano.');
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

      {/* Filtros */}
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

        <div className="relative">
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="bg-surface border border-white/5 rounded-2xl px-4 py-3 text-sm appearance-none pr-8 focus:outline-none focus:border-primary/30 cursor-pointer"
          >
            <option>Todos</option>
            <option>Iniciante</option>
            <option>Pro</option>
            <option>Elite</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Usuário</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Plano</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Pontos</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Sequência</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Cadastro</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const plano = user.plano || 'Iniciante';
                const plan = planConfig[plano] ?? planConfig['Iniciante'];
                const isUpdatingPlan   = updating === user.id + '_plan';
                const isUpdatingStatus = updating === user.id + '_status';

                return (
                  <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">

                    {/* Usuário */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center font-black text-sm text-primary flex-shrink-0">
                          {(user.name || user.email)?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{user.name || 'Sem nome'}</p>
                          <p className="text-xs text-text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase ${statusColor[user.subscriptionStatus] ?? 'bg-white/10 text-text-muted'}`}>
                        {user.subscriptionStatus === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Plano */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase border ${plan.color}`}>
                        {plan.icon}
                        {plan.label}
                      </span>
                    </td>

                    {/* Pontos */}
                    <td className="p-4 text-sm font-bold">{user.points ?? 0}</td>

                    {/* Sequência */}
                    <td className="p-4 text-sm text-text-muted">{user.streak ?? 0} dias</td>

                    {/* Cadastro */}
                    <td className="p-4 text-xs text-text-muted">
                      {user.criado_em ? new Date(user.criado_em).toLocaleDateString('pt-BR') : '—'}
                    </td>

                    {/* Ações */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">

                        {/* Liberar Pro */}
                        {plano !== 'Pro' && plano !== 'Elite' && (
                          <button
                            onClick={() => setConfirmModal({ userId: user.id, name: user.name || user.email, newPlan: 'Pro' })}
                            disabled={isUpdatingPlan}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-[11px] font-black uppercase transition-all disabled:opacity-40"
                            title="Liberar Pro"
                          >
                            <Zap size={11} /> Pro
                          </button>
                        )}

                        {/* Liberar Elite */}
                        {plano !== 'Elite' && (
                          <button
                            onClick={() => setConfirmModal({ userId: user.id, name: user.name || user.email, newPlan: 'Elite' })}
                            disabled={isUpdatingPlan}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 text-[11px] font-black uppercase transition-all disabled:opacity-40"
                            title="Liberar Elite"
                          >
                            <Crown size={11} /> Elite
                          </button>
                        )}

                        {/* Rebaixar para Iniciante */}
                        {plano !== 'Iniciante' && (
                          <button
                            onClick={() => setConfirmModal({ userId: user.id, name: user.name || user.email, newPlan: 'Iniciante' })}
                            disabled={isUpdatingPlan}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 text-text-muted hover:bg-white/10 border border-white/10 text-[11px] font-black uppercase transition-all disabled:opacity-40"
                            title="Rebaixar para Iniciante"
                          >
                            <User size={11} /> Básico
                          </button>
                        )}

                        {/* Ativar / Desativar */}
                        <button
                          onClick={() => toggleStatus(user.id, user.subscriptionStatus)}
                          disabled={isUpdatingStatus}
                          className={`p-2 rounded-xl transition-all disabled:opacity-40 ${user.subscriptionStatus === 'active' ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                          title={user.subscriptionStatus === 'active' ? 'Desativar' : 'Ativar'}
                        >
                          {isUpdatingStatus
                            ? <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin block" />
                            : user.subscriptionStatus === 'active'
                              ? <UserX size={14} />
                              : <UserCheck size={14} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">Nenhum usuário encontrado.</div>
          )}
        </div>
      </div>

      {/* Modal de confirmação */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface border border-white/10 rounded-3xl p-8 w-full max-w-sm space-y-5 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-xl font-black">Confirmar alteração</h2>
              <p className="text-text-muted text-sm">
                Alterar plano de <span className="text-white font-bold">{confirmModal.name}</span> para{' '}
                <span className={`font-black ${confirmModal.newPlan === 'Elite' ? 'text-yellow-400' : confirmModal.newPlan === 'Pro' ? 'text-primary' : 'text-text-muted'}`}>
                  {confirmModal.newPlan}
                </span>?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 rounded-2xl bg-white/5 text-text-muted hover:bg-white/10 font-black text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmChangePlan}
                className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all text-white ${
                  confirmModal.newPlan === 'Elite'
                    ? 'bg-yellow-500 hover:bg-yellow-400'
                    : confirmModal.newPlan === 'Pro'
                    ? 'bg-primary hover:bg-primary/80'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-success text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-2 z-50">
          <Check size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
