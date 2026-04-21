import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, DollarSign, Users, TrendingUp, Check, Copy } from 'lucide-react';

interface Affiliate {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  codigo_afiliado: string;
  status: string;
  total_indicados: number;
  total_comissao: number;
  criado_em: string;
}

interface Conversion {
  id: string;
  affiliate_id: string;
  plano: string;
  valor_assinatura: number;
  valor_comissao: number;
  status_pagamento: string;
  created_at: string;
}

export default function Affiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [filtered, setFiltered] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Affiliate | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(affiliates); return; }
    const s = search.toLowerCase();
    setFiltered(affiliates.filter(a => a.nome?.toLowerCase().includes(s) || a.email?.toLowerCase().includes(s) || a.codigo_afiliado?.toLowerCase().includes(s)));
  }, [search, affiliates]);

  async function loadData() {
    const [{ data: affs }, { data: convs }] = await Promise.all([
      supabase.from('affiliates').select('*').order('criado_em', { ascending: false }),
      supabase.from('affiliate_conversions').select('*').order('created_at', { ascending: false }),
    ]);
    if (affs) { setAffiliates(affs as Affiliate[]); setFiltered(affs as Affiliate[]); }
    if (convs) setConversions(convs as Conversion[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('affiliates').update({ status }).eq('id', id);
    setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    showToast('Status atualizado!');
  }

  async function markPaid(convId: string) {
    await supabase.from('affiliate_conversions').update({ status_pagamento: 'pago' }).eq('id', convId);
    setConversions(prev => prev.map(c => c.id === convId ? { ...c, status_pagamento: 'pago' } : c));
    showToast('Marcado como pago!');
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    showToast('Código copiado!');
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const totalComissaoPendente = conversions
    .filter(c => c.status_pagamento === 'pendente')
    .reduce((acc, c) => acc + (c.valor_comissao ?? 0), 0);

  const totalPago = conversions
    .filter(c => c.status_pagamento === 'pago')
    .reduce((acc, c) => acc + (c.valor_comissao ?? 0), 0);

  if (loading) return <div className="text-text-muted">Carregando...</div>;

  const selectedConversions = selected ? conversions.filter(c => c.affiliate_id === selected.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Afiliados</h1>
        <p className="text-text-muted text-sm mt-1">{affiliates.length} afiliados cadastrados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-white/5 rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-text-muted text-xs font-black uppercase tracking-widest">
            <Users size={14} /> Total Afiliados
          </div>
          <p className="text-2xl font-black">{affiliates.length}</p>
        </div>
        <div className="bg-surface border border-white/5 rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-black uppercase tracking-widest">
            <DollarSign size={14} /> Comissão Pendente
          </div>
          <p className="text-2xl font-black text-yellow-400">R$ {totalComissaoPendente.toFixed(2).replace('.', ',')}</p>
        </div>
        <div className="bg-surface border border-white/5 rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-success text-xs font-black uppercase tracking-widest">
            <TrendingUp size={14} /> Total Pago
          </div>
          <p className="text-2xl font-black text-success">R$ {totalPago.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Affiliates List */}
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar afiliado..."
              className="w-full bg-surface border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/30"
            />
          </div>

          <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-text-muted text-sm">Nenhum afiliado encontrado.</div>
            )}
            {filtered.map(aff => {
              const affConversions = conversions.filter(c => c.affiliate_id === aff.id);
              const pending = affConversions.filter(c => c.status_pagamento === 'pendente').reduce((a, c) => a + c.valor_comissao, 0);
              return (
                <div
                  key={aff.id}
                  onClick={() => setSelected(selected?.id === aff.id ? null : aff)}
                  className={`p-5 border-b border-white/5 last:border-0 cursor-pointer transition-colors ${selected?.id === aff.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-white/2'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{aff.nome}</p>
                      <p className="text-xs text-text-muted truncate">{aff.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs bg-white/5 px-2 py-0.5 rounded-lg font-mono text-primary">{aff.codigo_afiliado}</code>
                        <button onClick={e => { e.stopPropagation(); copyCode(aff.codigo_afiliado); }} className="text-text-muted hover:text-white transition-colors">
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${aff.status === 'ativo' ? 'bg-success/10 text-success' : 'bg-white/10 text-text-muted'}`}>
                        {aff.status}
                      </span>
                      <p className="text-xs text-text-muted">{affConversions.length} conversões</p>
                      {pending > 0 && <p className="text-xs text-yellow-400 font-bold">R$ {pending.toFixed(2)} pendente</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {aff.status !== 'ativo' && (
                      <button onClick={e => { e.stopPropagation(); updateStatus(aff.id, 'ativo'); }}
                        className="text-[10px] px-2 py-1 bg-success/10 text-success rounded-lg font-black hover:bg-success/20 transition-all">
                        Ativar
                      </button>
                    )}
                    {aff.status !== 'inativo' && (
                      <button onClick={e => { e.stopPropagation(); updateStatus(aff.id, 'inativo'); }}
                        className="text-[10px] px-2 py-1 bg-error/10 text-error rounded-lg font-black hover:bg-error/20 transition-all">
                        Desativar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversions Detail */}
        <div className="space-y-4">
          <h2 className="font-black uppercase tracking-tight text-sm text-text-muted">
            {selected ? `Conversões — ${selected.nome}` : 'Selecione um afiliado'}
          </h2>
          <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden">
            {!selected && (
              <div className="text-center py-12 text-text-muted text-sm">Clique em um afiliado para ver as conversões.</div>
            )}
            {selected && selectedConversions.length === 0 && (
              <div className="text-center py-12 text-text-muted text-sm">Nenhuma conversão ainda.</div>
            )}
            {selectedConversions.map(conv => (
              <div key={conv.id} className="p-4 border-b border-white/5 last:border-0 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-lg ${conv.plano === 'Elite' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-primary/10 text-primary'}`}>
                      {conv.plano}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-lg ${conv.status_pagamento === 'pago' ? 'bg-success/10 text-success' : 'bg-yellow-400/10 text-yellow-400'}`}>
                      {conv.status_pagamento}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Comissão: <span className="text-white font-bold">R$ {conv.valor_comissao?.toFixed(2)}</span>
                    {' · '}
                    {new Date(conv.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {conv.status_pagamento !== 'pago' && (
                  <button
                    onClick={() => markPaid(conv.id)}
                    className="text-[10px] px-3 py-1.5 bg-success/10 text-success rounded-xl font-black hover:bg-success/20 transition-all flex items-center gap-1"
                  >
                    <Check size={11} /> Marcar pago
                  </button>
                )}
              </div>
            ))}
          </div>
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
