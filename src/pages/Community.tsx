import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Heart, Calendar, Check } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  authorName: string;
  authorUid: string;
  createdAt: string;
  likes: string[];
  imageUrl?: string;
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data } = await supabase.from('posts').select('*').order('createdAt', { ascending: false });
    if (data) setPosts(data as Post[]);
    setLoading(false);
  }

  async function deletePost(id: string) {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    setDeleting(id);
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== id));
      showToast('Post excluído!');
    }
    setDeleting(null);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  if (loading) return <div className="text-text-muted">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Comunidade</h1>
        <p className="text-text-muted text-sm mt-1">{posts.length} posts publicados</p>
      </div>

      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="text-center py-20 text-text-muted">Nenhum post na comunidade.</div>
        )}
        {posts.map(post => (
          <div key={post.id} className="bg-surface border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-black text-sm text-primary">
                  {post.authorName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="font-bold text-sm">{post.authorName}</p>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Calendar size={11} />
                    {new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deletePost(post.id)}
                disabled={deleting === post.id}
                className="p-2 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-all disabled:opacity-40 shrink-0"
                title="Excluir post"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">{post.content}</p>

            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full max-h-64 object-cover rounded-2xl border border-white/5"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}

            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Heart size={13} className="text-error" />
              <span>{post.likes?.length ?? 0} curtidas</span>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-success text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-2 z-50">
          <Check size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
