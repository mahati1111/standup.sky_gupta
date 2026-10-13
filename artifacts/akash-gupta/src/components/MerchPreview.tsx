import { Minus, Plus, RotateCw, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useListMerch } from '@workspace/api-client-react';
import type { Persona } from './PersonalityQuiz';

type Props = { persona: Persona | null };

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function MerchPreview({ persona }: Props) {
  const merchQuery = useListMerch();
  const catalog = merchQuery.data ?? [];
  const [cart, setCart] = useState<Record<string, number>>({});
  const totalItems = Object.values(cart).reduce((sum, count) => sum + count, 0);

  const changeCount = (id: string, delta: number) => {
    setCart((current) => {
      const count = Math.max(0, (current[id] ?? 0) + delta);
      const next = { ...current };
      if (count === 0) delete next[id];
      else next[id] = count;
      return next;
    });
  };

  return (
    <section className="bg-[color:color-mix(in_srgb,var(--theme-spot)_24%,var(--theme-paper))] py-20 md:py-28" id="souvenirs">
      <div className="wrap">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-4 text-[var(--theme-accent)]">Little proof you left the house</p>
            <h2 className="serif text-4xl leading-none sm:text-5xl">Souvenirs from the laugh line.</h2>
          </div>
          <div className="rounded-full border border-[color:color-mix(in_srgb,var(--theme-ink)_20%,transparent)] px-4 py-2 text-xs font-semibold" data-testid="text-cart-count"><ShoppingBag className="mr-2 inline" size={14} /> Preview bag · {totalItems}</div>
        </div>
        <div className="mb-7 flex items-start gap-3 rounded-xl bg-[color:color-mix(in_srgb,var(--theme-paper)_76%,white)] px-5 py-4">
          <span className="serif text-2xl text-[var(--theme-accent)]">*</span>
          <p className="text-xs leading-5 opacity-65">A catalog and cart preview only. No checkout, payment, or purchase is available here.</p>
        </div>
        {merchQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((index) => <div className="h-72 animate-pulse rounded-2xl bg-black/5" key={index} />)}</div>
        ) : merchQuery.isError ? (
          <div className="rounded-2xl border border-[var(--theme-accent)]/25 bg-[var(--theme-paper)] p-7" role="alert">
            <p className="serif text-2xl">The souvenir shelf is taking five.</p>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]" onClick={() => merchQuery.refetch()} data-testid="button-retry-merch"><RotateCw size={14} /> Reload catalog</button>
          </div>
        ) : catalog.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-current/20 p-10 text-center" data-testid="empty-merch"><p className="serif text-2xl">Nothing on the shelf yet.</p><p className="mt-2 text-sm opacity-60">The best souvenir is still the thing you tell your friends.</p></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((item, index) => (
              <article className={`merch-card group ${persona && index === 0 ? 'merch-featured' : ''}`} key={item.id} data-testid={`card-merch-${item.id}`}>
                <div className="merch-art poster-dots">
                  {item.image && <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                  <span className="eyebrow absolute left-4 top-4 rounded-full bg-[var(--theme-paper)]/80 px-2.5 py-1 text-[9px] backdrop-blur">{item.category}</span>
                  <span className="merch-mark serif">{item.name.slice(0, 1).toUpperCase()}</span>
                  {persona && index === 0 && <span className="absolute bottom-3 right-3 rounded-full bg-[var(--theme-accent)] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white">Picked for your vibe</span>}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div><h3 className="serif text-xl">{item.name}</h3><p className="mt-1 text-xs leading-5 opacity-60">{item.description}</p></div>
                    <span className="mono whitespace-nowrap text-sm font-medium">{formatPrice(item.price, item.currency)}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="eyebrow text-[9px] opacity-45">CATALOG PREVIEW</span>
                    {(cart[item.id] ?? 0) === 0 ? (
                      <button className="rounded-full border border-current px-4 py-2 text-xs font-bold transition-colors hover:bg-[var(--theme-ink)] hover:text-[var(--theme-paper)]" onClick={() => changeCount(item.id, 1)} data-testid={`button-add-merch-${item.id}`}>Add to preview</button>
                    ) : (
                      <div className="flex items-center gap-2 rounded-full border border-current p-1" aria-label={`Preview quantity ${cart[item.id]}`}>
                        <button className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/5" aria-label={`Remove one ${item.name}`} onClick={() => changeCount(item.id, -1)} data-testid={`button-remove-merch-${item.id}`}><Minus size={13} /></button>
                        <span className="mono min-w-4 text-center text-xs">{cart[item.id]}</span>
                        <button className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/5" aria-label={`Add one ${item.name}`} onClick={() => changeCount(item.id, 1)} data-testid={`button-increase-merch-${item.id}`}><Plus size={13} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {totalItems > 0 && <div className="mt-5 text-right text-xs opacity-60" role="status" data-testid="status-cart-preview">Your preview bag has {totalItems} {totalItems === 1 ? 'item' : 'items'}. It stays right here; there is no checkout.</div>}
      </div>
    </section>
  );
}
