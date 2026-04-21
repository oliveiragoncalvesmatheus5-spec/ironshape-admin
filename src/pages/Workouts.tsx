import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Dumbbell, Calendar } from 'lucide-react';

interface WorkoutLog {
  id: string;
  userUid: string;
  workoutName: string;
  completedAt: string;
  duration: number;
  userName?: string;
  userEmail?: string;
}

export default function Workouts() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [filtered, setFiltered] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(logs); return; }
    const s = search.toLowerCase();
    setFiltered(logs.filter(l =>
      l.workoutName?.toLowerCase().includes(s) ||
      l.userName?.toLowerCase().includes(s) ||
      l.userEmail?.toLowerCase().includes(s)
    ));
  }, [search, logs]);

  async function loadLogs() {
    const { data: logData } = await supabase
      .from('workout_logs')
      .select('*')
      .order('completedAt', { ascending: false })
      .limit(200);

    if (!logData) { setLoading(false); return; }

    // Fetch user profiles
    const uids = [...new Set(logData.map(l => l.userUid))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', uids);

    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));

    const enriched = logData.map(l => ({
      ...l,
      userName: profileMap[l.userUid]?.name ?? 'Desconhecido',
      userEmail: profileMap[l.userUid]?.email ?? '',
    }));

    setLogs(enriched);
    setFiltered(enriched);
    setLoading(false);
  }

  if (loading) return <div className="text-text-muted">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Histórico de Treinos</h1>
        <p className="text-text-muted text-sm mt-1">{logs.length} treinos concluídos</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por usuário ou treino..."
          className="w-full bg-surface border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-colors"
        />
      </div>

      {/* List */}
      <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Usuário</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Treino</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Duração</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-widest text-text-muted">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center font-black text-xs text-primary">
                        {log.userName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{log.userName}</p>
                        <p className="text-xs text-text-muted">{log.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Dumbbell size={14} className="text-primary shrink-0" />
                      {log.workoutName}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-text-muted">{log.duration} min</td>
                  <td className="p-4 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(log.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted">Nenhum treino encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
