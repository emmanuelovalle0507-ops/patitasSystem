/**
 * Logger estructurado minimal (sin dependencias externas).
 * Emite JSON por línea en prod para que Vercel/Cloud providers los parseen.
 * En dev usa texto legible.
 *
 * Uso:
 *   logger.info({ route: "/api/upload", userId }, "upload ok");
 *   logger.error({ err, route: "/api/ai/chat" }, "openai failed");
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10, info: 20, warn: 30, error: 40,
};

const MIN_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";
const IS_PROD = process.env.NODE_ENV === "production";

function serializeErr(err: unknown) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { message: String(err) };
}

function emit(level: LogLevel, ctx: Record<string, unknown> | undefined, msg: string) {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[MIN_LEVEL]) return;
  const payload: Record<string, unknown> = {
    level,
    time: new Date().toISOString(),
    msg,
    ...(ctx || {}),
  };
  if (ctx?.err) payload.err = serializeErr(ctx.err);

  if (IS_PROD) {
    console.log(JSON.stringify(payload));
  } else {
    const { time, level: _, msg: __, err, ...rest } = payload;
    const parts = [`[${level.toUpperCase()}]`, msg];
    if (Object.keys(rest).length) parts.push(JSON.stringify(rest));
    if (err) parts.push(`\n  ${(err as any).stack || (err as any).message}`);
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(parts.join(" "));
  }
}

export const logger = {
  debug: (ctx: Record<string, unknown> | string, msg?: string) =>
    typeof ctx === "string" ? emit("debug", undefined, ctx) : emit("debug", ctx, msg || ""),
  info: (ctx: Record<string, unknown> | string, msg?: string) =>
    typeof ctx === "string" ? emit("info", undefined, ctx) : emit("info", ctx, msg || ""),
  warn: (ctx: Record<string, unknown> | string, msg?: string) =>
    typeof ctx === "string" ? emit("warn", undefined, ctx) : emit("warn", ctx, msg || ""),
  error: (ctx: Record<string, unknown> | string, msg?: string) =>
    typeof ctx === "string" ? emit("error", undefined, ctx) : emit("error", ctx, msg || ""),
};
