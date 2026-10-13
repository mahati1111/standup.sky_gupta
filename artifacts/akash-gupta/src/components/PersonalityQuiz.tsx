import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';

export const personas = [
  'The Front-Row Daredevil',
  'The Silent Observer',
  'The Meme Archivist',
  'The Last-Minute Booker',
  'The Budget-Savvy Laugh Hunter',
] as const;

export type Persona = (typeof personas)[number];

type Question = {
  prompt: string;
  note: string;
  choices: { label: string; persona: Persona }[];
};

const questions: Question[] = [
  {
    prompt: 'The room goes quiet. You…',
    note: 'There are no wrong answers. There are only suspiciously specific ones.',
    choices: [
      { label: 'Make eye contact. Hold the line.', persona: 'The Front-Row Daredevil' },
      { label: 'Become one with the chair.', persona: 'The Silent Observer' },
      { label: 'Mentally caption the moment.', persona: 'The Meme Archivist' },
      { label: 'Check if the show started yet.', persona: 'The Last-Minute Booker' },
      { label: 'Wonder if the quiet bit is included.', persona: 'The Budget-Savvy Laugh Hunter' },
    ],
  },
  {
    prompt: 'Your ideal comedy-night arrival?',
    note: 'This is a vibe check, not a personality assessment. We are not your therapist.',
    choices: [
      { label: 'Front row. No notes.', persona: 'The Front-Row Daredevil' },
      { label: 'A good view, a little room.', persona: 'The Silent Observer' },
      { label: 'Early enough to document the fit.', persona: 'The Meme Archivist' },
      { label: 'Just before the lights go down.', persona: 'The Last-Minute Booker' },
      { label: 'When the deal is right.', persona: 'The Budget-Savvy Laugh Hunter' },
    ],
  },
  {
    prompt: 'The group chat says “we should go.”',
    note: 'Your answer will not follow you around the internet. Probably.',
    choices: [
      { label: 'I have already picked seats.', persona: 'The Front-Row Daredevil' },
      { label: 'I will react with a thoughtful thumbs-up.', persona: 'The Silent Observer' },
      { label: 'Saving this for the eventual recap.', persona: 'The Meme Archivist' },
      { label: 'Ask what time. At 7:42.', persona: 'The Last-Minute Booker' },
      { label: 'Ask what it costs before I ask where.', persona: 'The Budget-Savvy Laugh Hunter' },
    ],
  },
  {
    prompt: 'Pick your post-show souvenir.',
    note: 'A tiny, extremely unserious field guide to your evening.',
    choices: [
      { label: 'A story that starts “so he picked me…”', persona: 'The Front-Row Daredevil' },
      { label: 'The exact quote I will quietly repeat.', persona: 'The Silent Observer' },
      { label: 'A perfectly timed photo dump.', persona: 'The Meme Archivist' },
      { label: 'The ticket I bought seven minutes ago.', persona: 'The Last-Minute Booker' },
      { label: 'A great night with change left over.', persona: 'The Budget-Savvy Laugh Hunter' },
    ],
  },
];

type PersonalityQuizProps = {
  onResult: (persona: Persona | null) => void;
  onSkip: () => void;
  activePersona?: Persona | null;
};

export function PersonalityQuiz({ onResult, onSkip, activePersona }: PersonalityQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Persona[]>([]);
  const [result, setResult] = useState<Persona | null>(activePersona ?? null);
  const touchStartX = useRef<number | null>(null);

  const choose = (persona: Persona) => {
    const nextAnswers = [...answers.slice(0, step), persona];
    setAnswers(nextAnswers);
    if (step < questions.length - 1) return;
    const counts = new Map<Persona, number>();
    nextAnswers.forEach((answer) => counts.set(answer, (counts.get(answer) ?? 0) + 1));
    const winner = personas.find((item) => counts.get(item) === Math.max(...personas.map((entry) => counts.get(entry) ?? 0))) ?? 'The Silent Observer';
    setResult(winner);
    onResult(winner);
  };

  const reset = () => {
    setAnswers([]);
    setResult(null);
    setStep(0);
    onResult(null);
  };

  const current = questions[step];

  return (
    <section className="wrap py-20 md:py-28" id="your-vibe" aria-labelledby="quiz-heading">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div className="max-w-md">
          <p className="eyebrow mb-4 text-[var(--theme-accent)]">A very unserious field study</p>
          <h2 className="serif text-4xl leading-[1.02] tracking-tight sm:text-5xl" id="quiz-heading">What kind of<br />laugher are you?</h2>
          <p className="mt-5 max-w-sm text-[15px] leading-7 opacity-75">Four quick picks. One highly unofficial result. Find a little more of your kind of night around here.</p>
          <p className="eyebrow mt-7 max-w-sm leading-6 opacity-55">For fun only. Not psychological advice, diagnosis, or evidence that you need to sit in the front row.</p>
          <button className="mt-8 text-sm font-semibold underline decoration-[var(--theme-accent)] decoration-2 underline-offset-4 opacity-75 transition-opacity hover:opacity-100" onClick={onSkip} data-testid="button-skip-quiz">Skip the quiz and browse</button>
        </div>
        <div className="relative min-h-[395px] overflow-hidden rounded-[1.5rem] border border-[color:color-mix(in_srgb,var(--theme-ink)_17%,transparent)] bg-[color:color-mix(in_srgb,var(--theme-paper)_62%,white)] p-6 shadow-[0_20px_50px_-36px_rgba(42,27,20,.35)] sm:p-9" aria-live="polite" data-testid="quiz-card" onTouchStart={(event) => { touchStartX.current = event.changedTouches[0]?.clientX ?? null; }} onTouchEnd={(event) => {
          if (touchStartX.current === null || result) return;
          const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
          if (delta < -55 && answers[step]) setStep((currentStep) => Math.min(questions.length - 1, currentStep + 1));
          if (delta > 55) setStep((currentStep) => Math.max(0, currentStep - 1));
          touchStartX.current = null;
        }}>
          <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-[var(--theme-spot)] opacity-20" />
          {result ? (
            <div className="relative flex min-h-[335px] flex-col justify-center">
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[var(--theme-accent)] text-white"><Sparkles size={21} /></span>
              <p className="eyebrow text-[var(--theme-accent)]">Your completely unofficial result</p>
              <h3 className="serif mt-3 max-w-lg text-4xl leading-tight sm:text-5xl" data-testid="text-quiz-result">{result}</h3>
              <p className="mt-4 max-w-lg text-sm leading-6 opacity-75">{personaDescription(result)} Your corner of the site has taken on your colors. Have a look around.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#the-show" className="rounded-full bg-[var(--theme-accent)] px-5 py-3 text-sm font-bold text-white" data-testid="link-persona-shows">See your kind of night</a>
                <button className="inline-flex items-center gap-2 rounded-full border border-current px-5 py-3 text-sm font-semibold" onClick={reset} data-testid="button-retake-quiz"><RotateCcw size={14} /> Retake for absolutely no reason</button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-9 flex items-center justify-between">
                <span className="eyebrow text-[var(--theme-accent)]">The unofficial laugh census</span>
                <span className="mono text-xs opacity-60" data-testid="text-quiz-progress">0{step + 1} / 04</span>
              </div>
              <div key={step} className="relative reveal">
                <div className="mb-3 flex gap-1.5" aria-label={`Question ${step + 1} of 4`}>
                  {questions.map((question, index) => <span key={question.prompt} className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-[var(--theme-accent)]' : 'bg-[color:color-mix(in_srgb,var(--theme-ink)_12%,transparent)]'}`} />)}
                </div>
                <h3 className="serif mb-2 text-3xl leading-tight sm:text-4xl">{current.prompt}</h3>
                <p className="mb-6 text-sm opacity-60">{current.note}</p>
                <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Choose an answer">
                  {current.choices.map((choice, index) => (
                    <button className={`group flex min-h-[58px] items-center justify-between gap-3 rounded-xl border border-[color:color-mix(in_srgb,var(--theme-ink)_16%,transparent)] bg-[var(--theme-paper)] px-4 py-3 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-[var(--theme-accent)] hover:bg-[color:color-mix(in_srgb,var(--theme-accent)_7%,var(--theme-paper))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] ${answers[step] === choice.persona ? 'border-[var(--theme-accent)] bg-[color:color-mix(in_srgb,var(--theme-accent)_10%,var(--theme-paper))]' : ''}`} key={choice.label} onClick={() => choose(choice.persona)} aria-pressed={answers[step] === choice.persona} onKeyDown={(event) => {
                      if (event.key === 'ArrowRight' && index < current.choices.length - 1) (event.currentTarget.parentElement?.children[index + 1] as HTMLButtonElement)?.focus();
                      if (event.key === 'ArrowLeft' && index > 0) (event.currentTarget.parentElement?.children[index - 1] as HTMLButtonElement)?.focus();
                    }} data-testid={`button-quiz-answer-${step}-${index}`}>
                      <span>{choice.label}</span>
                      <ArrowRight className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" size={15} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative mt-5 flex min-h-8 justify-between">
                <button className="inline-flex items-center gap-1 text-xs font-semibold opacity-55 hover:opacity-100 disabled:invisible" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))} data-testid="button-quiz-back"><ArrowLeft size={13} /> Back</button>
                <span className="eyebrow self-center opacity-35">Choose, then swipe or tap next</span>
                {answers[step] && <button className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--theme-accent)]" onClick={() => setStep(Math.min(questions.length - 1, step + 1))} data-testid="button-quiz-next">Next <ArrowRight size={13} /></button>}
              </div>
            </>
          )}
          <div className="pointer-events-none absolute bottom-4 right-5 opacity-25"><Check size={14} /></div>
        </div>
      </div>
    </section>
  );
}

export function personaDescription(persona: Persona) {
  const copy: Record<Persona, string> = {
    'The Front-Row Daredevil': 'You came for the jokes and might accidentally become one. We admire the commitment.',
    'The Silent Observer': 'You catch the tiny details, the sideways glance, the bit everyone else laughed over.',
    'The Meme Archivist': 'You know the best part of a night out is having the perfect callback on Monday.',
    'The Last-Minute Booker': 'The calendar is a suggestion. The best plans are made while putting on shoes.',
    'The Budget-Savvy Laugh Hunter': 'You know a good night is measured in laughs, not how much you spent getting them.',
  };
  return copy[persona];
}
