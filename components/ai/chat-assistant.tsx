"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, Plus, Trash2, History, Info, ShieldCheck, PawPrint, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";

type Msg = { role: "user" | "assistant"; content: string };
type Thread = { id: string; title: string; createdAt: string; _count: { messages: number } };

const QUICK_PROMPTS = [
  { emoji: "🔍", text: "¿Qué hago si acabo de perder a mi mascota?" },
  { emoji: "📝", text: "Ayúdame a redactar un buen reporte" },
  { emoji: "💉", text: "¿Qué vacunas básicas necesita mi perro?" },
  { emoji: "🐱", text: "¿Cómo calmo a un gato asustado?" },
  { emoji: "🍗", text: "¿Qué alimentos son tóxicos para perros?" },
  { emoji: "🦴", text: "Datos curiosos sobre mi mascota favorita" },
];

export function ChatAssistant({ initialQuery }: { initialQuery: string | null }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (initialQuery && !didInit.current) {
      didInit.current = true;
      send(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function loadThreads() {
    try {
      const res = await fetch("/api/ai/threads");
      if (!res.ok) return;
      const data = await res.json();
      setThreads(data.items ?? []);
    } catch {}
  }

  async function openThread(id: string) {
    if (streaming || loadingThread) return;
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/ai/threads/${id}`);
      if (!res.ok) throw new Error("No se pudo cargar el hilo");
      const data = await res.json();
      setThreadId(id);
      setMessages(
        (data.messages ?? [])
          .filter((m: any) => m.role === "user" || m.role === "assistant")
          .map((m: any) => ({ role: m.role, content: m.content }))
      );
      setSidebarOpen(false);
    } catch (e: any) {
      toast(e?.message || "Error", "error");
    } finally {
      setLoadingThread(false);
    }
  }

  function newChat() {
    if (streaming) return;
    setThreadId(null);
    setMessages([]);
    setInput("");
    setSidebarOpen(false);
  }

  async function deleteThread(id: string) {
    if (streaming) return;
    try {
      const res = await fetch("/api/ai/threads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("No se pudo borrar");
      setThreads((t) => t.filter((x) => x.id !== id));
      if (threadId === id) newChat();
    } catch (e: any) {
      toast(e?.message || "Error", "error");
    }
  }

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, threadId }),
      });
      if (!res.ok || !res.body) throw new Error("Error al conectar con IA");
      const newThreadId = res.headers.get("x-thread-id");
      if (newThreadId && newThreadId !== threadId) setThreadId(newThreadId);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      loadThreads();
    } catch (e: any) {
      toast(e?.message || "Error", "error");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  const isEmpty = messages.length === 0 && !loadingThread;

  return (
    <div className="flex gap-3 h-[calc(100vh-14rem)] min-h-[480px]">
      <aside
        className={cn(
          "w-64 shrink-0 flex-col rounded-2xl border bg-card overflow-hidden",
          sidebarOpen ? "absolute inset-y-0 left-0 z-30 flex shadow-2xl md:relative md:shadow-none" : "hidden md:flex"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <History className="h-4 w-4 text-brand-600" />
            Historial
          </div>
          <Button size="sm" variant="ghost" onClick={newChat} className="h-7 gap-1 text-xs" aria-label="Nueva conversación">
            <Plus className="h-3.5 w-3.5" /> Nuevo
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-4 text-center">
              <PawPrint className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">Aún no tienes conversaciones.</p>
            </div>
          ) : (
            <ul className="p-1.5">
              {threads.map((t) => (
                <li key={t.id} className="group relative">
                  <button
                    onClick={() => openThread(t.id)}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-lg text-sm hover:bg-accent truncate pr-8 transition",
                      threadId === t.id && "bg-brand-50 text-brand-900 font-medium"
                    )}
                    title={t.title}
                  >
                    {t.title}
                  </button>
                  <button
                    onClick={() => deleteThread(t.id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition"
                    aria-label={`Borrar conversación ${t.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-2 md:hidden">
          <Button size="sm" variant="outline" onClick={() => setSidebarOpen((s) => !s)} className="gap-1">
            <History className="h-4 w-4" /> Historial
          </Button>
          <Button size="sm" variant="outline" onClick={newChat} className="gap-1">
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        </div>

        <Card className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-brand-50/40 via-background to-background">
          {loadingThread && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {isEmpty && <EmptyWelcome onPick={send} />}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-sm mt-1">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                  m.role === "user"
                    ? "bg-brand-600 text-white rounded-tr-sm shadow-sm"
                    : "bg-card border rounded-tl-sm shadow-sm"
                )}
              >
                {m.role === "user" ? (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                ) : m.content ? (
                  <Markdown>{m.content}</Markdown>
                ) : streaming && i === messages.length - 1 ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce" />
                    </span>
                    <span className="text-xs">pensando...</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </Card>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          Patitas AI solo responde sobre mascotas. Para salud, siempre consulta un veterinario.
        </div>

        <form onSubmit={handleSubmit} className="mt-2 flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Pregúntame sobre cuidados, salud, comportamiento..."
              rows={1}
              disabled={streaming}
              className="min-h-[48px] max-h-[160px] resize-none pr-3 rounded-xl"
            />
          </div>
          <Button type="submit" disabled={streaming || !input.trim()} size="icon" className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 shadow-md">
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

function EmptyWelcome({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-orange-500 rounded-full blur-xl opacity-40" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-lg">
          <Sparkles className="h-8 w-8" />
        </div>
      </div>
      <h2 className="font-display text-2xl font-bold mb-1">Hola, soy Patitas AI 🐾</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-5">
        Tu asistente experto <strong className="text-foreground">exclusivamente en mascotas</strong>.
        Pregúntame sobre cuidados, salud, comportamiento o cómo crear un reporte efectivo.
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.text}
            type="button"
            onClick={() => onPick(p.text)}
            className="group flex items-center gap-2.5 rounded-xl border bg-background p-3 text-left text-sm hover:border-brand-400 hover:shadow-sm hover:-translate-y-0.5 transition"
          >
            <span className="text-xl">{p.emoji}</span>
            <span className="flex-1 text-muted-foreground group-hover:text-foreground">{p.text}</span>
          </button>
        ))}
      </div>

      <div className="w-full max-w-2xl rounded-xl border bg-amber-50/60 dark:bg-amber-950/20 p-3.5 text-left">
        <div className="flex items-start gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            <Info className="h-3.5 w-3.5" />
          </div>
          <div className="text-xs space-y-1 flex-1">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              Qué tener en cuenta
              <HelpCircle className="h-3 w-3 text-muted-foreground" />
            </div>
            <ul className="text-muted-foreground space-y-0.5 leading-relaxed">
              <li>• Solo responde temas <strong className="text-foreground">sobre mascotas</strong> — otras preguntas serán rechazadas.</li>
              <li>• <strong className="text-foreground">No sustituye</strong> a un veterinario. Para diagnósticos, acude siempre a un profesional.</li>
              <li>• Cita <strong className="text-foreground">fuentes confiables</strong> cuando aporta datos factuales.</li>
              <li>• Si no está seguro, te lo dirá: <em className="text-foreground">no inventa</em> información.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
