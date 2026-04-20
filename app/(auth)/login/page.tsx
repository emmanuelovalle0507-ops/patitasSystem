"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { PasswordInput } from "@/components/auth/password-input";
import { Mail, Loader2, ArrowRight, AlertCircle } from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.9 9.5-8.7 0-.6-.1-1.1-.2-1.6H12z"/>
      <path fill="#34A853" d="M3.9 7.6l3.2 2.3c.9-2.2 2.9-3.8 4.9-3.8 1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 8.2 2.5 4.9 4.6 3.9 7.6z" opacity=".001"/>
      <path fill="#4285F4" d="M21.3 11.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.2 1-.8 2.1-2 2.9l3.1 2.4c1.8-1.7 2.7-4.1 2.7-7.6z"/>
      <path fill="#FBBC05" d="M6 14.3c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7L2.9 8.6C2.2 9.9 1.8 11.4 1.8 13s.4 3.1 1.1 4.4L6 14.3z"/>
      <path fill="#34A853" d="M12 21.5c2.7 0 4.9-.9 6.6-2.4l-3.1-2.4c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3L3 15.7c1.5 3.5 5 5.8 9 5.8z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function translateError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("invalid login credentials") || m.includes("invalid_credentials")) {
      return "Correo o contraseña incorrectos. Verifica tus datos.";
    }
    if (m.includes("email not confirmed")) {
      return "Confirma tu correo antes de iniciar sesión. Revisa tu bandeja.";
    }
    if (m.includes("rate limit") || m.includes("too many")) {
      return "Demasiados intentos. Espera un momento e intenta de nuevo.";
    }
    return message;
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(translateError(error.message));
      return;
    }
    toast("¡Bienvenido de vuelta! 🐾", "success");
    router.push(next);
    router.refresh();
  }

  async function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    setError(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setGoogleLoading(false);
      setError(translateError(error.message));
    }
    // En éxito, Supabase redirige; mantenemos loading activo.
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Bienvenid@ de vuelta <span className="inline-block">🐾</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Inicia sesión para seguir ayudando a mascotas de tu zona.
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

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full h-11 gap-2.5 border-2 hover:bg-accent/50 font-medium"
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="h-4 w-4" />
        )}
        Continuar con Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-background px-3 text-muted-foreground">o con tu correo</span>
        </div>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              ¿La olvidaste?
            </Link>
          </div>
          <PasswordInput
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Tu contraseña"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox
            checked={remember}
            onCheckedChange={(c) => setRemember(c === true)}
            id="remember"
            className="h-4 w-4"
          />
          <span className="text-sm text-muted-foreground">Mantenerme conectado</span>
        </label>

        <Button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-11 gap-2 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white font-semibold shadow-md shadow-brand-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}
