import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { streamAssistantReply } from "@/lib/anthropic";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const userId = await requireUser();

  const rate = await checkRateLimit(userId, "chat");
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfterSeconds: rate.retryAfterSeconds },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSeconds),
          "X-RateLimit-Reset": rate.resetAt.toISOString(),
        },
      },
    );
  }

  const { conversationId, message } = (await req.json()) as {
    conversationId?: string;
    message: string;
  };

  let conversation = conversationId
    ? await db.query.conversations.findFirst({
        where: and(eq(conversations.id, conversationId), eq(conversations.createdBy, userId)),
      })
    : undefined;

  if (!conversation) {
    [conversation] = await db
      .insert(conversations)
      .values({
        createdBy: userId,
        title: message.slice(0, 60),
        messages: [],
      })
      .returning();
  }

  const now = new Date().toISOString();
  const history = [
    ...conversation.messages,
    { role: "user" as const, content: message, timestamp: now },
  ];

  const stream = streamAssistantReply(
    history.map(({ role, content }) => ({ role, content })),
  );

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let full = "";
      stream.on("text", (chunk) => {
        full += chunk;
        controller.enqueue(encoder.encode(chunk));
      });
      stream.on("end", async () => {
        await db
          .update(conversations)
          .set({
            messages: [
              ...history,
              { role: "assistant", content: full, timestamp: new Date().toISOString() },
            ],
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, conversation!.id));
        controller.close();
      });
      stream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversation.id,
    },
  });
}
