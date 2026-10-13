import { ArrowRight, Bot, Check, MessageCircle, RotateCw, Send, Ticket, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useCreateBookingRequest, useListShows, useSendChatMessage } from '@workspace/api-client-react';
import type { ChatHistoryMessage, Show } from '@workspace/api-client-react';
import type { Persona } from './PersonalityQuiz';

type Message = ChatHistoryMessage & { id: number };
type Props = { persona: Persona | null };

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export function BookingAssistant({ persona }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: 'Hey, welcome in. Are you thinking about a particular city or date? Tell me a little and we’ll figure it out together.', },
  ]);
  const [draft, setDraft] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [quantity, setQuantity] = useState('2');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);
  const [readyShowId, setReadyShowId] = useState<string | null>(null);
  const sendChat = useSendChatMessage();
  const createBooking = useCreateBookingRequest();
  const showsQuery = useListShows();
  const shows = showsQuery.data ?? [];
  const readyShow = shows.find((show) => show.id === readyShowId);
  const controlsReady = Boolean(sendChat.data?.bookingReady && readyShowId && readyShow);

  const submitChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sendChat.isPending) return;
    const nextMessages: Message[] = [...messages, { id: Date.now(), role: 'user', content: message }];
    setMessages(nextMessages);
    setDraft('');
    setBookingOpen(false);
    setReadyShowId(null);
    setSubmittedFor(null);
    sendChat.mutate({
      data: {
        message,
        history: messages.slice(-20).map(({ role, content }) => ({ role, content })),
        persona: persona ?? undefined,
      },
    }, {
      onSuccess: (reply) => {
        setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', content: reply.reply }]);
        if (reply.bookingReady && reply.showId) setReadyShowId(reply.showId);
      },
    });
  };

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!controlsReady || !readyShowId) return;
    setBookingError('');
    createBooking.mutate({
      data: {
        showId: readyShowId,
        name: bookingName.trim(),
        email: bookingEmail.trim(),
        quantity: Number(quantity),
      },
    }, {
      onSuccess: () => setSubmittedFor(readyShowId),
      onError: () => setBookingError('That request didn’t make it through. Please try again.'),
    });
  };

  const resetChat = () => {
    setMessages([{ id: Date.now(), role: 'assistant', content: 'Fresh start. Which city and date are you curious about?' }]);
    setReadyShowId(null);
    setBookingOpen(false);
    setSubmittedFor(null);
  };

  return (
    <section className="wrap py-20 md:py-28" id="booking">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <div className="pt-2">
          <p className="eyebrow mb-4 text-[var(--theme-accent)]">No chatbot maze. Just a conversation.</p>
          <h2 className="serif max-w-sm text-4xl leading-[1.04] sm:text-5xl">Let’s figure out your night.</h2>
          <p className="mt-5 max-w-sm text-sm leading-7 opacity-70">Ask about a city, a date, or what the room is like. We’ll get the details straight before any sample request appears.</p>
          <div className="mt-8 flex items-center gap-3 text-xs opacity-60"><span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--theme-accent)] text-white"><MessageCircle size={15} /></span> Real assistant, real API. Human-size conversation.</div>
          <div className="mt-8 border-l-2 border-[var(--theme-spot)] pl-4 text-xs leading-5 opacity-60">Booking requests are unpaid samples, not tickets or confirmed reservations. Nothing is charged.</div>
        </div>
        <div className="overflow-hidden rounded-[1.35rem] border border-[color:color-mix(in_srgb,var(--theme-ink)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--theme-paper)_58%,white)] shadow-[0_22px_60px_-42px_rgba(42,27,20,.45)]">
          <div className="flex items-center justify-between border-b border-[color:color-mix(in_srgb,var(--theme-ink)_14%,transparent)] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--theme-ink)] text-[var(--theme-paper)]"><Bot size={17} /></span>
              <div><p className="text-sm font-bold">The front desk</p><p className="eyebrow mt-0.5 text-[9px] opacity-50">AKASH GUPTA LIVE</p></div>
            </div>
            <button className="rounded-full p-2 opacity-55 hover:bg-black/5 hover:opacity-100" onClick={resetChat} aria-label="Start a new conversation" data-testid="button-reset-chat"><RotateCw size={15} /></button>
          </div>
          <div className="flex max-h-[370px] min-h-[255px] flex-col gap-3 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite" data-testid="chat-transcript">
            {messages.map((message) => (
              <div key={message.id} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto rounded-br-sm bg-[var(--theme-accent)] text-white' : 'mr-auto rounded-bl-sm bg-[color:color-mix(in_srgb,var(--theme-ink)_7%,var(--theme-paper))]'}`} data-testid={`chat-message-${message.id}`}>
                {message.content}
              </div>
            ))}
            {sendChat.isPending && <div className="mr-auto flex gap-1 rounded-2xl bg-[color:color-mix(in_srgb,var(--theme-ink)_7%,var(--theme-paper))] px-4 py-4" aria-label="Assistant is replying"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-40" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-40 [animation-delay:150ms]" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-40 [animation-delay:300ms]" /></div>}
            {sendChat.isError && <div className="rounded-xl border border-red-800/20 bg-red-900/5 p-3 text-xs text-red-900" role="alert">The front desk lost the thread. Try sending that again.</div>}
          </div>
          {controlsReady && readyShow && (
            <div className="mx-4 mb-3 rounded-xl border border-[var(--theme-accent)]/25 bg-[color:color-mix(in_srgb,var(--theme-accent)_7%,var(--theme-paper))] p-4 sm:mx-6" data-testid="booking-ready">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0"><p className="eyebrow text-[var(--theme-accent)]">Assistant matched a sample listing</p><p className="mt-1 truncate text-sm font-bold">{readyShow.city} · {readyShow.dateLabel}</p><p className="mt-1 text-xs opacity-60">{readyShow.venue} · from {money(readyShow.priceFrom, readyShow.currency)}</p></div>
                <button className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--theme-accent)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50" onClick={() => setBookingOpen(!bookingOpen)} data-testid="button-open-booking" disabled={!controlsReady}><Ticket size={14} /> {bookingOpen ? 'Close request' : 'Request sample seats'}</button>
              </div>
              <p className="mt-3 text-[10px] leading-4 opacity-55">Sample listing only. This is an unpaid request, not a ticket or confirmed event.</p>
            </div>
          )}
          {bookingOpen && controlsReady && readyShow && !submittedFor && (
            <form className="mx-4 mb-4 grid gap-3 rounded-xl border border-[color:color-mix(in_srgb,var(--theme-ink)_16%,transparent)] bg-[var(--theme-paper)] p-4 sm:mx-6 sm:grid-cols-2" onSubmit={submitBooking} data-testid="form-booking-request">
              <label className="grid gap-1 text-xs font-semibold">Your name<input className="form-input" required maxLength={100} value={bookingName} onChange={(event) => setBookingName(event.target.value)} data-testid="input-booking-name" /></label>
              <label className="grid gap-1 text-xs font-semibold">Email<input className="form-input" type="email" required maxLength={254} value={bookingEmail} onChange={(event) => setBookingEmail(event.target.value)} data-testid="input-booking-email" /></label>
              <label className="grid gap-1 text-xs font-semibold sm:col-span-2">How many (1–8)<select className="form-input" value={quantity} onChange={(event) => setQuantity(event.target.value)} data-testid="select-booking-quantity">{[1, 2, 3, 4, 5, 6, 7, 8].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'person' : 'people'}</option>)}</select></label>
              {bookingError && <p className="text-xs text-red-800 sm:col-span-2" role="alert">{bookingError}</p>}
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--theme-ink)] px-4 py-3 text-sm font-bold text-[var(--theme-paper)] disabled:opacity-50 sm:col-span-2" type="submit" disabled={createBooking.isPending} data-testid="button-submit-booking">{createBooking.isPending ? 'Sending request…' : 'Send unpaid sample request'} <ArrowRight size={15} /></button>
              <p className="text-[10px] leading-4 opacity-55 sm:col-span-2">No payment details, no charge, no ticket. This only saves a sample request.</p>
            </form>
          )}
          {submittedFor && (
            <div className="mx-4 mb-4 flex items-start gap-3 rounded-xl bg-[color:color-mix(in_srgb,var(--theme-accent)_10%,var(--theme-paper))] p-4 sm:mx-6" role="status" data-testid="status-booking-request">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--theme-accent)] text-white"><Check size={15} /></span>
              <div><p className="text-sm font-bold">Sample request saved.</p><p className="mt-1 text-xs leading-5 opacity-65">This is not a ticket or confirmed booking. No payment was taken.</p></div>
              <button className="ml-auto p-1 opacity-50 hover:opacity-100" aria-label="Dismiss confirmation" onClick={() => { setSubmittedFor(null); setBookingOpen(false); }} data-testid="button-dismiss-booking"><X size={15} /></button>
            </div>
          )}
          <form className="flex items-center gap-2 border-t border-[color:color-mix(in_srgb,var(--theme-ink)_14%,transparent)] p-3 sm:p-4" onSubmit={submitChat}>
            <label className="sr-only" htmlFor="chat-message">Message the front desk</label>
            <input id="chat-message" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:opacity-45 focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]" placeholder="A city, a date, or anything you’re wondering…" maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)} data-testid="input-chat-message" />
            <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--theme-ink)] text-[var(--theme-paper)] transition-transform hover:scale-105 disabled:opacity-40" aria-label="Send message" type="submit" disabled={!draft.trim() || sendChat.isPending} data-testid="button-send-chat"><Send size={16} /></button>
          </form>
          <div className="px-5 pb-4 text-center text-[10px] opacity-45">Be specific if you can. City + date helps us get to the good part.</div>
        </div>
      </div>
    </section>
  );
}
