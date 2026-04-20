import { getCurrentUser } from "@/lib/auth";
import { openai, AI_MODEL, buildAssistantSystemPrompt } from "@/lib/ai";
import { applyRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

type IncomingMessage = { role: "user" | "assistant" | "system"; content: string };

/**
 * Streaming de OpenAI hacia el cliente. Persistencia:
 *   - Si no se manda `threadId`, se crea un AiThread nuevo.
 *   - Se guarda el último mensaje de usuario y la respuesta assistant completa.
 *   - Se devuelve `x-thread-id` en el header para que el cliente lo guarde.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const limited = applyRateLimit(req, "aiChat", user.id);
  if (limited) return limited;

  let body: { messages?: IncomingMessage[]; threadId?: string | null };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  const { messages, threadId: providedThreadId } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages requerido" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  if (messages.length > 50) {
    return new Response(JSON.stringify({ error: "Demasiados mensajes en el hilo" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const normalized: IncomingMessage[] = messages
    .filter((m) => m && typeof m.content === "string" && ["user", "assistant", "system"].includes(m.role))
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!normalized.length) {
    return new Response(JSON.stringify({ error: "messages inválidos" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const system = buildAssistantSystemPrompt({
    userName: user.name,
    favoritePets: user.favoritePets as any,
  });

  // Asegura thread y persiste el último mensaje del usuario
  const lastUserMsg = [...normalized].reverse().find((m) => m.role === "user");
  let threadId = providedThreadId ?? null;
  try {
    if (!threadId) {
      const title = lastUserMsg?.content.slice(0, 60) || "Conversación";
      const thread = await db.aiThread.create({ data: { userId: user.id, title } });
      threadId = thread.id;
    } else {
      const existing = await db.aiThread.findUnique({ where: { id: threadId }, select: { userId: true } });
      if (!existing || existing.userId !== user.id) {
        return new Response(JSON.stringify({ error: "Thread no encontrado" }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
    }
    if (lastUserMsg) {
      await db.aiMessage.create({ data: { threadId, role: "user", content: lastUserMsg.content } });
    }
  } catch (err) {
    logger.error({ err, userId: user.id }, "ai thread persistence failed");
    // seguimos sin persistencia — mejor responder que caer
    threadId = threadId ?? null;
  }

  const encoder = new TextEncoder();
  let fullResponse = "";
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await openai.chat.completions.create({
          model: AI_MODEL,
          max_tokens: 1024,
          stream: true,
          messages: [{ role: "system", content: system }, ...normalized],
        });
        for await (const chunk of response) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            fullResponse += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
      } catch (err) {
        logger.error({ err, userId: user.id, threadId }, "ai chat stream failed");
        controller.enqueue(encoder.encode("\n\n[Error: no pude responder, intenta de nuevo.]"));
      } finally {
        controller.close();
        if (threadId && fullResponse) {
          db.aiMessage.create({ data: { threadId, role: "assistant", content: fullResponse } })
            .catch((err) => logger.warn({ err, threadId }, "persist assistant message failed"));
        }
      }
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
  };
  if (threadId) headers["x-thread-id"] = threadId;
  return new Response(stream, { headers });
}
