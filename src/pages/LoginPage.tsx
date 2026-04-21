import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError('Email ou senha incorretos.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-[28px] flex items-center justify-center mx-auto">
            <Shield size={36} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">IronShape</h1>
            <p className="text-primary text-xs font-black uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
          <p className="text-text-muted text-sm">Acesso restrito ao administrador.</p>
        </div>

        <div className="bg-surface border border-white/5 rounded-3xl p-8 space-y-4">
          {error && (
            <div className="flex items-center gap-3 bg-error/10 border border-error/20 rounded-2xl p-4 text-sm text-error">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@email.com"
                required
                className="w-full bg-background border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-background border border-white/5 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-primary/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted">
            Apenas administradores têm acesso.
          </p>
        </div>
      </div>
    </div>
  );
}
