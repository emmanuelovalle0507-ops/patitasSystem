import { openai, AI_MODEL, MODERATION_SYSTEM_PROMPT } from "./ai";
import { logger } from "./logger";

export type ModerationResult = {
  isPet: boolean;
  confidence: number;
  label: string;
  reason: string;
  passed: boolean;
};

const THRESHOLD = 0.7;

/**
 * Modera una imagen usando OpenAI Vision.
 * Lanza si la IA está caída — el caller decide la política (rechazar o marcar
 * como `pending_review`). No fallamos abierto silenciosamente.
 */
export async function moderatePetImage(imageUrl: string): Promise<ModerationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: MODERATION_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Clasifica esta imagen." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Respuesta no JSON");
    const parsed = JSON.parse(match[0]) as Omit<ModerationResult, "passed">;
    const passed = parsed.isPet && parsed.confidence >= THRESHOLD;
    return { ...parsed, passed };
  } catch (err) {
    logger.error({ err, imageUrl }, "moderation vision failed");
    throw err instanceof Error ? err : new Error("moderation failed");
  }
}

export type TextModerationResult = {
  passed: boolean;
  reason?: string;
  /** "heuristic" si solo se usaron reglas locales; "openai" si se consultó el modelo. */
  source: "heuristic" | "openai";
  categories?: Record<string, boolean>;
};

const BANNED_PATTERNS: RegExp[] = [
  /https?:\/\/\S+\.(xxx|casino|bet)/i,
  /\b(viagra|casino|porn|xxx)\b/i,
];

/**
 * Moderación de texto:
 *   1. Validaciones rápidas (longitud, patrones obvios).
 *   2. OpenAI Moderation API (gratis) para contenido abusivo/sexual/violento.
 *   3. Si la API falla, usamos la heurística local como fallback.
 */
export async function moderateText(text: string): Promise<TextModerationResult> {
  const trimmed = text.trim();
  if (trimmed.length < 3) return { passed: false, reason: "Texto muy corto", source: "heuristic" };
  if (trimmed.length > 5000) return { passed: false, reason: "Texto demasiado largo", source: "heuristic" };
  if (BANNED_PATTERNS.some((r) => r.test(trimmed))) {
    return { passed: false, reason: "Contenido no permitido", source: "heuristic" };
  }

  try {
    const res = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: trimmed,
    });
    const result = res.results[0];
    if (result?.flagged) {
      const flagged = Object.entries(result.categories as any)
        .filter(([, v]) => v === true)
        .map(([k]) => k);
      return {
        passed: false,
        reason: flagged.length ? `Contenido flagged: ${flagged.join(", ")}` : "Contenido no permitido",
        source: "openai",
        categories: result.categories as any,
      };
    }
    return { passed: true, source: "openai", categories: result?.categories as any };
  } catch (err) {
    logger.warn({ err }, "openai moderation unavailable, falling back to heuristic");
    return { passed: true, source: "heuristic" };
  }
}
