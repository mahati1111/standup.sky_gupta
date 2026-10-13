import { ArrowUpRight, CalendarDays, MapPin, RotateCw } from 'lucide-react';
import { useListShows } from '@workspace/api-client-react';

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export function ShowListings() {
  const showsQuery = useListShows();
  const shows = showsQuery.data ?? [];

  return (
    <section className="bg-[color:color-mix(in_srgb,var(--theme-ink)_5%,var(--theme-paper))] py-20 md:py-28" id="the-show">
      <div className="wrap">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-4 text-[var(--theme-accent)]">A night out, pending your city</p>
            <h2 className="serif text-4xl leading-none sm:text-5xl">The show, near-ish you.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 opacity-65">The listings below are sample dates for browsing only, not confirmed events. Ask the assistant to clarify a city and date before any request controls appear.</p>
        </div>
        {showsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2" aria-label="Loading sample dates">
            {[0, 1].map((item) => <div className="h-40 animate-pulse rounded-2xl bg-[color:color-mix(in_srgb,var(--theme-ink)_9%,transparent)]" key={item} />)}
          </div>
        ) : showsQuery.isError ? (
          <div className="rounded-2xl border border-[var(--theme-accent)]/30 bg-[var(--theme-paper)] p-7" role="alert">
            <p className="serif text-2xl">Couldn’t load the sample listings.</p>
            <p className="mt-2 text-sm opacity-65">Give it another go when the stagehand finds the cable.</p>
            <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--theme-ink)] px-4 py-2.5 text-sm font-bold text-[var(--theme-paper)]" onClick={() => showsQuery.refetch()} data-testid="button-retry-shows"><RotateCw size={14} /> Try again</button>
          </div>
        ) : shows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:color-mix(in_srgb,var(--theme-ink)_25%,transparent)] p-10 text-center" data-testid="empty-shows">
            <CalendarDays className="mx-auto mb-3 opacity-45" size={25} />
            <p className="serif text-2xl">No sample dates to browse just yet.</p>
            <p className="mt-2 text-sm opacity-60">The assistant is still here to help you figure out what to ask for.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {shows.map((show, index) => (
              <article className="group relative overflow-hidden rounded-2xl border border-[color:color-mix(in_srgb,var(--theme-ink)_16%,transparent)] bg-[var(--theme-paper)] p-6 transition-transform hover:-translate-y-1 sm:p-7" key={show.id} data-testid={`card-show-${show.id}`}>
                <span className="eyebrow absolute right-6 top-6 rounded-full border border-[var(--theme-accent)]/35 px-2.5 py-1 text-[9px] text-[var(--theme-accent)]">SAMPLE LISTING</span>
                <span className="serif block text-5xl leading-none text-[var(--theme-accent)]/75">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="serif mt-5 max-w-[75%] text-3xl">{show.city}</h3>
                <p className="mt-1 text-sm font-semibold">{show.venue}</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs opacity-70">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {show.dateLabel}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> From {money(show.priceFrom, show.currency)}</span>
                </div>
                <a href="#booking" className="mt-6 inline-flex items-center gap-2 border-b border-current pb-1 text-sm font-bold transition-colors hover:text-[var(--theme-accent)]" data-testid={`link-ask-about-${show.id}`}>Talk through this date <ArrowUpRight size={14} /></a>
              </article>
            ))}
          </div>
        )}
        <div className="mt-7 rounded-lg bg-[var(--theme-accent)] px-5 py-4 text-[var(--theme-paper)]">
          <p className="eyebrow">Small print, big honesty</p>
          <p className="mt-1 text-sm leading-6 opacity-90">These are sample listings, not confirmed events. Any booking submission is an unpaid sample request only. No ticket is issued and no payment is taken.</p>
        </div>
      </div>
    </section>
  );
}
