"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Mail, Loader2, ArrowLeft, MailCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(email.trim());
  }

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
          <MailCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold">Te enviamos el enlace</h1>
          <p className="text-sm text-muted-foreground">
            Si existe una cuenta con <strong className="text-foreground">{sent}</strong>, recibirás un correo con instrucciones para crear una nueva contraseña.
          </p>
        </div>

        <ul className="rounded-xl border bg-muted/30 p-4 space-y-2 text-left text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
            Revisa <strong className="text-foreground">Spam o Promociones</strong> si no lo ves.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
            El enlace expira en <strong className="text-foreground">1 hora</strong>.
          </li>
        </ul>

        <div className="flex flex-col gap-2 pt-2">
          <Button asChild className="w-full h-11 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white font-semibold">
            <Link href="/login">Volver a inicio de sesión</Link>
          </Button>
          <button
            type="button"
            onClick={() => setSent(null)}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Usar otro correo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver al inicio de sesión
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          ¿Olvidaste tu contraseña? <span className="inline-block">🔑</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          No te preocupes — ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900/50 p-3 text-sm"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="text-rose-800 dark:text-rose-200">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="tu@correo.com"
              className="h-11 pl-9 rounded-lg focus-visible:ring-brand-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !email.includes("@")}
          className="w-full h-11 gap-2 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white font-semibold shadow-md shadow-brand-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar enlace de recuperación"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Recordaste tu contraseña?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
