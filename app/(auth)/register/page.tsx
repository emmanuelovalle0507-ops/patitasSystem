"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength, scorePassword } from "@/components/auth/password-strength";
import { Mail, User, Loader2, ArrowRight, AlertCircle, MailCheck, CheckCircle2 } from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.9 9.5-8.7 0-.6-.1-1.1-.2-1.6H12z"/>
      <path fill="#4285F4" d="M21.3 11.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.2 1-.8 2.1-2 2.9l3.1 2.4c1.8-1.7 2.7-4.1 2.7-7.6z"/>
      <path fill="#FBBC05" d="M6 14.3c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7L2.9 8.6C2.2 9.9 1.8 11.4 1.8 13s.4 3.1 1.1 4.4L6 14.3z"/>
      <path fill="#34A853" d="M12 21.5c2.7 0 4.9-.9 6.6-2.4l-3.1-2.4c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3L3 15.7c1.5 3.5 5 5.8 9 5.8z"/>
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accept, setAccept] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const pwScore = scorePassword(password);
  const pwMismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = name.trim().length >= 2 && email.includes("@") && pwScore >= 2 && !pwMismatch && accept;

  function translateError(message: string): string {
    const m = message.toLowerCase();
    if (m.includes("already registered") || m.includes("user already")) {
      return "Ya existe una cuenta con ese correo. Intenta iniciar sesión.";
    }
    if (m.includes("password") && m.includes("short")) {
      return "La contraseña es muy corta.";
    }
    if (m.includes("rate limit")) {
      return "Demasiados intentos. Espera un momento.";
    }
    return message;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (pwScore < 2) {
      setError("La contraseña es muy débil. Añade mayúsculas, números o un símbolo.");
      return;
    }
    if (pwMismatch) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!accept) {
      setError("Acepta los Términos y la Política de Privacidad para continuar.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setError(translateError(error.message));
      return;
    }
    if (data.session) {
      toast("Cuenta creada 🐾", "success");
      router.push("/onboarding");
      router.refresh();
    } else {
      setSent(email.trim());
    }
  }

  async function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    setError(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    if (error) {
      setGoogleLoading(false);
      setError(translateError(error.message));
    }
  }

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
          <MailCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold">Revisa tu correo</h1>
          <p className="text-sm text-muted-foreground">
            Enviamos un enlace de confirmación a <strong className="text-foreground">{sent}</strong>. Haz clic para activar tu cuenta.
          </p>
        </div>

        <ul className="rounded-xl border bg-muted/30 p-4 space-y-2 text-left text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
            Si no lo ves en bandeja de entrada, revisa <strong className="text-foreground">Spam o Promociones</strong>.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
            El enlace es válido por <strong className="text-foreground">24 horas</strong>.
          </li>
        </ul>

        <div className="flex flex-col gap-2 pt-2">
          <Button asChild className="w-full h-11 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white font-semibold">
            <Link href="/login">Ir al inicio de sesión</Link>
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
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Crea tu cuenta <span className="inline-block">🐶</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Únete a la comunidad PatiTas. Solo toma un minuto y es gratis.
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
        Registrarme con Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-background px-3 text-muted-foreground">o con tu correo</span>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">Nombre completo</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="María López"
              className="h-11 pl-9 rounded-lg focus-visible:ring-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="tu@correo.com"
              className="h-11 pl-9 rounded-lg focus-visible:ring-brand-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
          <PasswordInput
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
          />
          <PasswordStrength password={password} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-sm font-medium">Confirma tu contraseña</Label>
          <PasswordInput
            id="confirm"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="Repítela"
            showCapsLockHint={false}
          />
          {pwMismatch && (
            <p className="flex items-center gap-1 text-[11px] text-rose-600">
              <AlertCircle className="h-3 w-3" />
              Las contraseñas no coinciden.
            </p>
          )}
        </div>

        <label className="flex items-start gap-2 cursor-pointer select-none">
          <Checkbox
            checked={accept}
            onCheckedChange={(c) => setAccept(c === true)}
            id="accept"
            className="h-4 w-4 mt-0.5"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            Acepto los{" "}
            <Link href="/legal/terms" className="font-medium text-brand-600 hover:underline">Términos de uso</Link>
            {" "}y la{" "}
            <Link href="/legal/privacy" className="font-medium text-brand-600 hover:underline">Política de privacidad</Link>.
          </span>
        </label>

        <Button
          type="submit"
          disabled={loading || googleLoading || !canSubmit}
          className="w-full h-11 gap-2 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white font-semibold shadow-md shadow-brand-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              Crear cuenta
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
