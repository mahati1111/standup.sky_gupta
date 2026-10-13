import { ArrowUpRight, MessageSquareText, RotateCw, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getListCommunityPostsQueryKey, useCreateCommunityPost, useListCommunityPosts } from '@workspace/api-client-react';

function relativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const elapsed = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function CommunityBoard() {
  const queryClient = useQueryClient();
  const postsQuery = useListCommunityPosts();
  const createPost = useCreateCommunityPost();
  const posts = postsQuery.data ?? [];
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submitPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess(false);
    createPost.mutate({ data: { author: author.trim(), message: message.trim() } }, {
      onSuccess: () => {
        setAuthor('');
        setMessage('');
        setSuccess(true);
        queryClient.invalidateQueries({ queryKey: getListCommunityPostsQueryKey() });
      },
      onError: () => setError('That note didn’t stick. Give it another try.'),
    });
  };

  return (
    <section className="py-20 md:py-28" id="the-lobby">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow mb-4 text-[var(--theme-accent)]">The lobby, after the show</p>
            <h2 className="serif max-w-sm text-4xl leading-[1.04] sm:text-5xl">The part where we all talk at once.</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 opacity-70">Leave a note for the next person who needed a laugh. A quote, a thought, a suspiciously detailed review of the queue.</p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--theme-ink)_20%,transparent)] px-3 py-2 text-xs opacity-65"><MessageSquareText size={14} /> Community notes are shared with everyone.</div>
            <form className="mt-8 grid gap-3 rounded-2xl bg-[color:color-mix(in_srgb,var(--theme-ink)_5%,var(--theme-paper))] p-5 sm:p-6" onSubmit={submitPost} data-testid="form-community-post">
              <div className="flex items-center justify-between"><p className="serif text-xl">Add your note</p><span className="eyebrow text-[9px] opacity-45">NO ACCOUNT NEEDED</span></div>
              <label className="grid gap-1 text-xs font-semibold">Name<input className="form-input" maxLength={40} required value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="What should we call you?" data-testid="input-community-author" /></label>
              <label className="grid gap-1 text-xs font-semibold">Your note<textarea className="form-input min-h-[98px] resize-y" maxLength={400} required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Keep it kind. Keep it yours." data-testid="input-community-message" /><span className="text-right text-[10px] font-normal opacity-45">{message.length}/400</span></label>
              {error && <p className="text-xs text-red-800" role="alert">{error}</p>}
              {success && <p className="text-xs font-semibold text-[var(--theme-accent)]" role="status" data-testid="status-post-saved">Your note is on the board. Thanks for adding to the noise.</p>}
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--theme-ink)] px-4 py-3 text-sm font-bold text-[var(--theme-paper)] disabled:opacity-50" type="submit" disabled={createPost.isPending || !author.trim() || !message.trim()} data-testid="button-submit-post">{createPost.isPending ? 'Posting…' : 'Pin it to the board'} <Send size={14} /></button>
            </form>
          </div>
          <div className="relative">
            <div className="mb-4 flex items-center justify-between border-b border-[color:color-mix(in_srgb,var(--theme-ink)_20%,transparent)] pb-3"><span className="eyebrow">A few notes from the room</span><span className="mono text-[10px] opacity-45">{posts.length.toString().padStart(2, '0')} NOTES</span></div>
            {postsQuery.isLoading ? (
              <div className="grid gap-3" aria-label="Loading community notes">{[0, 1, 2].map((index) => <div className="h-28 animate-pulse rounded-xl bg-black/5" key={index} />)}</div>
            ) : postsQuery.isError ? (
              <div className="rounded-xl border border-[var(--theme-accent)]/30 p-6" role="alert"><p className="serif text-xl">The board is temporarily offstage.</p><button className="mt-3 inline-flex items-center gap-2 text-xs font-bold" onClick={() => postsQuery.refetch()} data-testid="button-retry-posts"><RotateCw size={13} /> Reload notes</button></div>
            ) : posts.length === 0 ? (
              <div className="poster-dots grid min-h-56 place-items-center rounded-xl border border-dashed border-current/20 p-8 text-center" data-testid="empty-community"><div><MessageSquareText className="mx-auto mb-3 opacity-45" size={24} /><p className="serif text-2xl">First note gets the good seat.</p><p className="mt-2 text-sm opacity-60">Leave one on the board.</p></div></div>
            ) : (
              <div className="grid gap-3">
                {posts.map((post, index) => (
                  <article className="community-note" key={post.id} data-testid={`card-community-post-${post.id}`}>
                    <span className="community-index mono">/{String(index + 1).padStart(2, '0')}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-6">{post.message}</p>
                      <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs font-bold">{post.author}</span><time className="eyebrow text-[9px] opacity-45" dateTime={post.createdAt}>{relativeDate(post.createdAt)}</time></div>
                    </div>
                    <ArrowUpRight className="shrink-0 opacity-25" size={15} />
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
