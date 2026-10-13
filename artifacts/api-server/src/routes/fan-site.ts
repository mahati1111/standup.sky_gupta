import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, bookingRequestsTable, communityPostsTable } from "@workspace/db";
import {
  CreateBookingRequestBody,
  CreateBookingRequestResponse,
  CreateCommunityPostBody,
  CreateCommunityPostResponse,
  ListCommunityPostsResponse,
  ListMerchResponse,
  ListShowsResponse,
  SendChatMessageBody,
  SendChatMessageResponse,
} from "@workspace/api-zod";
import { merch, shows } from "../lib/fan-site-data";
import { readAgentConfig } from "../lib/agent-config";

const router: IRouter = Router();
const showById = new Map(shows.map((show) => [show.id, show]));
const errorPayload = (error: string) => ({ error });

router.get("/shows", (_req, res) => {
  res.json(ListShowsResponse.parse(shows));
});

router.get("/merch", (_req, res) => {
  res.json(ListMerchResponse.parse(merch));
});

router.get("/community/posts", async (req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(communityPostsTable)
    .orderBy(desc(communityPostsTable.createdAt))
    .limit(50);

  res.json(ListCommunityPostsResponse.parse(posts));
});

router.post("/community/posts", async (req, res): Promise<void> => {
  const parsed = CreateCommunityPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorPayload(parsed.error.message));
    return;
  }

  const author = parsed.data.author.trim();
  const message = parsed.data.message.trim();
  if (!author || !message) {
    res.status(400).json(errorPayload("Name and message cannot be blank."));
    return;
  }

  const [post] = await db
    .insert(communityPostsTable)
    .values({ author, message })
    .returning();

  res.status(201).json(CreateCommunityPostResponse.parse(post));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorPayload(parsed.error.message));
    return;
  }

  const show = showById.get(parsed.data.showId);
  if (!show) {
    res.status(404).json(errorPayload("That sample listing is no longer available."));
    return;
  }

  const total = show.priceFrom * parsed.data.quantity;
  const [booking] = await db
    .insert(bookingRequestsTable)
    .values({
      ...parsed.data,
      total,
      currency: show.currency,
      status: "sample_request",
      paid: false,
    })
    .returning();

  res.status(201).json(
    CreateBookingRequestResponse.parse({
      ...booking,
      message: "Sample request saved. This is not a ticket, paid order, or confirmed reservation.",
    }),
  );
});

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(errorPayload(parsed.error.message));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json(errorPayload("The fan assistant is not connected yet."));
    return;
  }

  let agentConfig;
  try {
    agentConfig = await readAgentConfig();
  } catch (error) {
    req.log.error({ error }, "Could not read assistant configuration");
    res.status(503).json(errorPayload("The fan assistant settings are temporarily unavailable."));
    return;
  }

  const empathyGuidance =
    agentConfig.empathy <= 3
      ? "Keep emotional acknowledgement brief and focus on the practical answer."
      : agentConfig.empathy >= 8
        ? "Notice and gently acknowledge the visitor's feelings or preferences without assuming too much."
        : "Acknowledge relevant preferences naturally, then move on without overdoing it.";
  const initiativeGuidance =
    agentConfig.goalOrientation <= 3
      ? "Be mostly responsive. Answer what was asked and avoid pushing extra next steps."
      : agentConfig.goalOrientation >= 8
        ? "Proactively suggest one useful next step when it fits the visitor's goal; never pressure them."
        : "Offer a relevant next step when it helps, while leaving the visitor in control.";

  const systemPrompt = [
    "You are the fan-site front desk, a playful concierge for the Akash Gupta fan community. You are not Akash Gupta and must never claim to be him or speak as him.",
    "Apply the admin-set persona, tone, empathy, and goal-orientation as style guidance only. The factual, booking, privacy, and identity rules below always take priority.",
    `Persona guidance: ${agentConfig.persona}`,
    `Tone guidance: ${agentConfig.tone}`,
    `Empathy scale: ${agentConfig.empathy}/10. ${empathyGuidance}`,
    `Goal-orientation scale: ${agentConfig.goalOrientation}/10. ${initiativeGuidance}`,
    "Be naturally conversational and concise. Do not use emojis. If a visitor taps a meme-sticker quick reply, play along briefly without assuming extra context.",
    "Help visitors discover show listings, browse concept merchandise, and find community features.",
    "These are SAMPLE show listings only, not verified or confirmed real events or current availability. Never present them as confirmed dates. If relevant, clearly call them sample listings.",
    "A booking flow is only a sample unpaid request, not a ticket purchase or confirmed reservation. Never say a ticket was issued or payment completed.",
    "For show requests, ask a useful follow-up until the visitor has chosen one exact city and date. You may mention matching sample dates from the supplied list, but do not open the booking form until you have given the exact sample date and the visitor has explicitly confirmed that specific listing.",
    "If the visitor has not explicitly chosen and confirmed one exact sample listing, set bookingReady to false and showId to null.",
    "Only set bookingReady to true when the visitor has explicitly confirmed one exact listing and the showId matches the supplied show list. If they say they want tickets but have not confirmed a date, ask which city/date they want.",
    "Do not invent show dates, venues, prices, inventory, or product facts. Merchandise is concept/sample catalog only and has no live checkout.",
    "Use the visitor's quiz result when supplied to personalize suggestions, but never treat it as a psychological assessment.",
    `Visitor personality result: ${parsed.data.persona ?? "not taken"}.`,
    `Sample show listings: ${JSON.stringify(shows)}.`,
    `Concept merchandise: ${JSON.stringify(merch)}.`,
    'Return only a JSON object with exactly these fields: {"reply":"your natural-language reply","bookingReady":false,"showId":null}. Use true and a valid show id only after explicit confirmation as described above.',
  ].join("\n");

  const messages = [
    { role: "system", content: systemPrompt },
    ...parsed.data.history.slice(-20).map((message) => ({
      role: message.role,
      content: message.content,
    })),
    { role: "user", content: parsed.data.message },
  ];

  try {
    const providerResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        max_completion_tokens: 8192,
        response_format: { type: "json_object" },
        messages,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!providerResponse.ok) {
      req.log.error({ status: providerResponse.status }, "Chat provider request failed");
      res.status(502).json(errorPayload("The fan assistant is having a moment. Please try again."));
      return;
    }

    const payload = (await providerResponse.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      res.status(502).json(errorPayload("The fan assistant returned an empty reply. Please try again."));
      return;
    }

    let candidate: unknown;
    try {
      candidate = JSON.parse(content);
    } catch {
      req.log.warn("Chat provider returned invalid JSON");
      res.status(502).json(errorPayload("The fan assistant returned an unclear reply. Please try again."));
      return;
    }

    const result = SendChatMessageResponse.safeParse(candidate);
    if (!result.success) {
      req.log.warn({ errors: result.error.message }, "Chat provider response did not match the expected shape");
      res.status(502).json(errorPayload("The fan assistant returned an unclear reply. Please try again."));
      return;
    }

    const selectedShow = result.data.showId ? showById.get(result.data.showId) : undefined;
    const response = {
      ...result.data,
      bookingReady: result.data.bookingReady && !!selectedShow?.isSample,
      showId: result.data.bookingReady && selectedShow?.isSample ? selectedShow.id : null,
    };
    res.json(SendChatMessageResponse.parse(response));
  } catch (error) {
    req.log.error({ error }, "Chat request failed");
    res.status(502).json(errorPayload("The fan assistant is temporarily unavailable. Please try again."));
  }
});

export default router;
