import { ArrowDown, ArrowRight, Clapperboard, Heart, Mic2, Radio, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { BookingAssistant } from '@/components/BookingAssistant';
import { CommunityBoard } from '@/components/CommunityBoard';
import { MerchPreview } from '@/components/MerchPreview';
import { PersonalityQuiz, personaDescription, type Persona } from '@/components/PersonalityQuiz';
import { ShowListings } from '@/components/ShowListings';
import { SiteHeader } from '@/components/SiteHeader';

const recommendationCopy: Record<Persona, { video: string; live: string; extra: string }> = {
  'The Front-Row Daredevil': {
    video: 'Start with a short room-response clip, if one is available. You seem built for the moment right before the whole room cracks.',
    live: 'The up-close seat is calling. Ask the front desk which city and date you mean before requesting a sample.',
    extra: 'A little souvenir for the story you are definitely going to tell.',
  },
  'The Silent Observer': {
    video: 'Look for a quieter clip with a slow build. The tiny pauses are doing a lot of work.',
    live: 'Pick a seat with a clean view of the room. Every eyebrow raise is part of the evening.',
    extra: 'A low-key memento, for the details only you clocked.',
  },
  'The Meme Archivist': {
    video: 'A quick clip with a crisp callback is your kind of bookmark. Save the line for the group chat.',
    live: 'Bring someone who will remember the exact same detail and disagree about it later.',
    extra: 'Something for the post-show photo dump, should the mood strike.',
  },
  'The Last-Minute Booker': {
    video: 'Keep it short and press play when the plan finally comes together.',
    live: 'No elaborate itinerary needed. Clarify your city and date with the front desk, then see what the sample listing says.',
    extra: 'A tiny victory lap for the plan that made it out of the chat.',
  },
  'The Budget-Savvy Laugh Hunter': {
    video: 'Start with whatever short clip is available. Free preview, excellent return on your attention.',
    live: 'Check the listed from-price, then ask the front desk about that city and date. No payment is involved here.',
    extra: 'Only if it fits the plan. The laughs are the main event.',
  },
};

const videoSearch: Record<Persona, string> = {
  'The Front-Row Daredevil': 'Akash Gupta stand up comedy crowd work',
  'The Silent Observer': 'Akash Gupta stand up comedy storytelling',
  'The Meme Archivist': 'Akash Gupta stand up comedy best bits',
  'The Last-Minute Booker': 'Akash Gupta stand up comedy short clips',
  'The Budget-Savvy Laugh Hunter': 'Akash Gupta stand up comedy full set',
};

function VibeRecommendations({ persona }: { persona: Persona }) {
  const recommendation = recommendationCopy[persona];
  return (
    <section className="wrap pb-20" aria-live="polite" data-testid="persona-recommendations">
      <div className="overflow-hidden rounded-[1.35rem] bg-[var(--theme-ink)] text-[var(--theme-paper)]">
        <div className="grid lg:grid-cols-[.7fr_1.3fr]">
          <div className="relative overflow-hidden p-7 sm:p-9">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10" />
            <div className="absolute -right-1 top-0 h-40 w-40 rounded-full border border-white/10" />
            <p className="eyebrow text-[var(--theme-spot)]">Your version of the night</p>
            <h2 className="serif relative mt-4 text-3xl leading-tight">{persona}</h2>
            <p className="relative mt-3 max-w-sm text-sm leading-6 opacity-65">{personaDescription(persona)}</p>
            <span className="relative mt-7 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-[10px] font-semibold"><Sparkles size={12} className="text-[var(--theme-spot)]" /> YOUR SITE, YOUR COLORS</span>
          </div>
          <div className="grid sm:grid-cols-3">
            <article className="border-t border-white/15 p-6 sm:border-l sm:border-t-0 sm:p-7">
              <Clapperboard size={19} className="mb-5 text-[var(--theme-spot)]" />
              <p className="eyebrow text-[9px] opacity-55">VIDEO MOOD</p>
              <p className="mt-3 text-sm leading-6 opacity-85">{recommendation.video}</p>
              <a
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--theme-spot)]"
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoSearch[persona])}`}
                target="_blank"
                rel="noreferrer"
              >
                Find matching clips <ArrowRight size={12} />
              </a>
            </article>
            <article className="border-t border-white/15 p-6 sm:border-l sm:border-t-0 sm:p-7">
              <Radio size={19} className="mb-5 text-[var(--theme-spot)]" />
              <p className="eyebrow text-[9px] opacity-55">LIVE EXPERIENCE</p>
              <p className="mt-3 text-sm leading-6 opacity-85">{recommendation.live}</p>
            </article>
            <article className="border-t border-white/15 p-6 sm:border-l sm:border-t-0 sm:p-7">
              <Heart size={19} className="mb-5 text-[var(--theme-spot)]" />
              <p className="eyebrow text-[9px] opacity-55">OPTIONAL EXTRA</p>
              <p className="mt-3 text-sm leading-6 opacity-85">{recommendation.extra}</p>
              <a href="#souvenirs" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--theme-spot)]">Browse the catalog <ArrowRight size={12} /></a>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [persona, setPersona] = useState<Persona | null>(null);

  return (
    <main className="site-shell min-h-[100dvh]" data-persona={persona ?? undefined} id="top">
      <SiteHeader />
      <section className="relative overflow-hidden pb-14 pt-10 md:pb-20 md:pt-16">
        <div className="wrap grid items-center gap-9 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative z-10 py-6">
            <p className="eyebrow mb-6 flex items-center gap-2 text-[var(--theme-accent)] reveal"><span className="h-px w-8 bg-current" /> The official unofficial fan home</p>
            <h1 className="serif max-w-[760px] text-[clamp(3.7rem,9vw,7.5rem)] leading-[.88] tracking-[-.065em] reveal reveal-delay">A little<br />too much<br /><span className="relative inline-block text-[var(--theme-accent)]">laughing.</span></h1>
            <div className="mt-7 flex max-w-lg items-start gap-4 reveal reveal-delay-2">
              <span className="mt-1 h-10 w-[3px] shrink-0 bg-[var(--theme-spot)]" />
              <p className="text-base leading-7 opacity-75 sm:text-lg">Akash Gupta, live. Find the room, find your people, and take the long way to a good night.</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 reveal reveal-delay-2">
              <a href="#your-vibe" className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-accent)] px-6 py-3.5 text-sm font-bold text-[#fff8eb] transition-transform hover:-translate-y-0.5" data-testid="link-take-quiz">Find your laugh type <ArrowRight size={16} /></a>
              <a href="#the-show" className="rounded-full border border-[color:color-mix(in_srgb,var(--theme-ink)_28%,transparent)] px-6 py-3.5 text-sm font-bold transition-colors hover:bg-black/5" data-testid="link-browse-shows">I know what I like</a>
            </div>
            <p className="eyebrow mt-5 text-[9px] opacity-45">The quiz is optional, unserious, and never a gate.</p>
          </div>
          <div className="relative mx-auto w-full max-w-[480px] reveal reveal-delay">
            <div className="stage-poster relative aspect-[.91] overflow-hidden rounded-[48%_48%_1.35rem_1.35rem] border border-[color:color-mix(in_srgb,var(--theme-ink)_16%,transparent)]">
              <div className="stage-arch" />
              <div className="stage-curtain stage-curtain-left" />
              <div className="stage-curtain stage-curtain-right" />
              <div className="spotlight-cone" />
              <div className="mic-stand"><span /></div>
              <div className="stage-floor" />
              <div className="absolute inset-x-0 top-[13%] z-10 text-center">
                <p className="eyebrow text-[10px] tracking-[.3em] text-[#f7e8c9]">TONIGHT, THE ROOM IS YOURS</p>
                <p className="serif mt-3 text-4xl leading-none tracking-tight text-[#f7e8c9] sm:text-5xl">AKASH<br />GUPTA</p>
              </div>
              <span className="absolute bottom-[8%] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#f7e8c9]/40 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-[#f7e8c9]">A comedy night, not a personality test</span>
            </div>
            <div className="absolute -left-4 top-[48%] grid h-[84px] w-[84px] -rotate-12 place-items-center rounded-full bg-[var(--theme-spot)] text-center shadow-lg sm:-left-8" aria-hidden="true">
              <span className="eyebrow max-w-[58px] text-[9px] leading-4 text-[var(--theme-ink)]">GOOD EVENING, EVERYONE</span>
            </div>
            <div className="absolute -right-1 top-[28%] hidden -rotate-6 rounded-sm bg-[var(--theme-paper)] px-4 py-3 shadow-xl sm:block">
              <p className="serif text-xl text-[var(--theme-accent)]">Ha.</p><p className="eyebrow text-[8px] opacity-50">YOU HAD TO BE THERE</p>
            </div>
          </div>
        </div>
        <a href="#your-vibe" className="wrap mt-11 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] opacity-45 hover:opacity-80" data-testid="link-scroll-discover">Keep the evening going <ArrowDown size={13} /></a>
      </section>

      <div className="overflow-hidden border-y border-[color:color-mix(in_srgb,var(--theme-ink)_15%,transparent)] py-3">
        <div className="marquee-track flex w-max items-center gap-7 whitespace-nowrap">
          {[0, 1, 2, 3].map((item) => <div className="flex items-center gap-7" key={item} aria-hidden={item > 0}>
            <span className="eyebrow text-[10px]">COME AS YOU ARE</span><span className="ticker-mark" />
            <span className="eyebrow text-[10px]">LEAVE WITH A STORY</span><span className="ticker-mark" />
            <span className="eyebrow text-[10px]">NO TWO ROOMS THE SAME</span><span className="ticker-mark" />
            <span className="eyebrow text-[10px]">MAKE A NIGHT OF IT</span><span className="ticker-mark" />
          </div>)}
        </div>
      </div>

      <section className="wrap grid gap-8 py-16 md:grid-cols-[.6fr_1.4fr] md:py-20">
        <div><p className="eyebrow text-[var(--theme-accent)]">01 / The feeling</p><div className="mt-3 h-px w-10 bg-[var(--theme-accent)]" /></div>
        <div className="grid gap-8 md:grid-cols-[1.15fr_.85fr]">
          <h2 className="serif max-w-2xl text-3xl leading-[1.1] sm:text-4xl">Some nights are a calendar event. Some nights become the story you keep telling.</h2>
          <div className="border-l border-[color:color-mix(in_srgb,var(--theme-ink)_20%,transparent)] pl-5">
            <p className="text-sm leading-7 opacity-70">This is the place to get curious first. Wander through a very unserious quiz, browse sample listings, and talk it out before you ask for anything.</p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold"><span className="inline-flex items-center gap-2"><Users size={15} className="text-[var(--theme-accent)]" /> Bring your people</span><span className="inline-flex items-center gap-2"><Mic2 size={15} className="text-[var(--theme-accent)]" /> Leave room for the unexpected</span></div>
          </div>
        </div>
      </section>

      <PersonalityQuiz onResult={setPersona} onSkip={() => document.getElementById('the-show')?.scrollIntoView({ behavior: 'smooth' })} activePersona={persona} />
      {persona && <VibeRecommendations persona={persona} />}
      <ShowListings />
      <BookingAssistant persona={persona} />
      <MerchPreview persona={persona} />
      <CommunityBoard />
      <footer className="border-t border-[color:color-mix(in_srgb,var(--theme-ink)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--theme-ink)_5%,var(--theme-paper))] py-8">
        <div className="wrap flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><p className="serif text-xl">See you in the room.</p><p className="eyebrow mt-1 text-[9px] opacity-45">AKASH GUPTA LIVE · THE FAN HOME</p></div>
          <p className="max-w-lg text-[10px] leading-5 opacity-50">Sample listings are not confirmed events. Requests are unpaid samples only. The catalog and cart are previews, with no checkout or payment.</p>
          <a href="#top" className="eyebrow inline-flex items-center gap-2 text-[9px] hover:text-[var(--theme-accent)]" data-testid="link-back-top">Back to top <ArrowRight size={13} className="-rotate-90" /></a>
        </div>
      </footer>
    </main>
  );
}
