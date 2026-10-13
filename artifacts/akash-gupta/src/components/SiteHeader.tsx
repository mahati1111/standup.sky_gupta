import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:color-mix(in_srgb,var(--theme-ink)_15%,transparent)] bg-[color:color-mix(in_srgb,var(--theme-paper)_94%,transparent)] backdrop-blur-md">
      <div className="wrap flex h-[76px] items-center justify-between gap-6">
        <a href="#top" aria-label="Akash Gupta Live home" className="group flex items-center gap-3 text-[var(--theme-ink)]" data-testid="link-home">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--theme-accent)] font-serif text-lg font-bold text-[#fff7e9]">AG</span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight">AKASH GUPTA</span>
            <span className="eyebrow text-[9px] opacity-65">LIVE, LOUD & A LITTLE LATE</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <a className="nav-link" href="#the-show" data-testid="link-shows">The show</a>
          <a className="nav-link" href="#the-lobby" data-testid="link-lobby">The lobby</a>
          <a className="nav-link" href="#souvenirs" data-testid="link-merch">Souvenirs</a>
        </nav>
        <a className="hidden items-center gap-2 rounded-full bg-[var(--theme-ink)] px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[var(--theme-paper)] transition-transform hover:-translate-y-0.5 md:inline-flex" href="#booking" data-testid="link-find-tickets">
          Find your seat <ArrowUpRight size={15} />
        </a>
        <button className="grid h-11 w-11 place-items-center rounded-full border border-[color:color-mix(in_srgb,var(--theme-ink)_25%,transparent)] md:hidden" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {menuOpen && (
        <nav className="wrap grid gap-1 border-t border-[color:color-mix(in_srgb,var(--theme-ink)_15%,transparent)] pb-4 pt-3 md:hidden" aria-label="Mobile navigation">
          <a className="mobile-nav-link" href="#the-show" onClick={closeMenu} data-testid="link-mobile-shows">The show</a>
          <a className="mobile-nav-link" href="#the-lobby" onClick={closeMenu} data-testid="link-mobile-lobby">The lobby</a>
          <a className="mobile-nav-link" href="#souvenirs" onClick={closeMenu} data-testid="link-mobile-merch">Souvenirs</a>
          <a className="mobile-nav-link font-bold text-[var(--theme-accent)]" href="#booking" onClick={closeMenu} data-testid="link-mobile-book">Find your seat</a>
        </nav>
      )}
    </header>
  );
}
