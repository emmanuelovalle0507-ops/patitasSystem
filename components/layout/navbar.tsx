"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Home, LogOut, PawPrint, PlusCircle, Settings, Sparkles, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = { userName: string; avatarUrl: string | null; unread: number };

export function Navbar({ userName, avatarUrl, unread }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/dashboard", icon: Home, label: "Inicio", highlight: false },
    { href: "/feed", icon: PawPrint, label: "Feed", highlight: false },
    { href: "/posts/new", icon: PlusCircle, label: "Reportar", highlight: false },
    { href: "/assistant", icon: Sparkles, label: "Patitas AI", highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur safe-top">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-2" aria-label="Ir al inicio de PatiTas">
          <span className="text-2xl" aria-hidden>🐾</span>
          <span className="font-display text-lg font-bold text-brand-600">PatiTas</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            if (l.highlight) {
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition",
                    active
                      ? "bg-gradient-to-r from-brand-500 to-orange-500 text-white shadow-sm shadow-brand-500/30"
                      : "bg-gradient-to-r from-brand-500/10 to-orange-500/10 text-brand-700 hover:from-brand-500/20 hover:to-orange-500/20 ring-1 ring-brand-200"
                  )}
                >
                  <l.icon className={cn("h-4 w-4", !active && "text-brand-600")} />
                  {l.label}
                </Link>
              );
            }
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                  active && "bg-accent text-brand-600"
                )}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/notifications" className="relative rounded-md p-2 hover:bg-accent" aria-label="Notificaciones">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link href="/settings" aria-label="Ajustes">
            <Avatar className="h-8 w-8">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={userName} /> : null}
              <AvatarFallback>{userName.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Cerrar sesión" className="hidden md:inline-flex">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", icon: Home, label: "Inicio" },
    { href: "/feed", icon: PawPrint, label: "Feed" },
    { href: "/posts/new", icon: PlusCircle, label: "Reportar" },
    { href: "/assistant", icon: Sparkles, label: "IA", highlight: true },
    { href: "/settings", icon: User, label: "Perfil", highlight: false },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden safe-bottom" aria-label="Navegación inferior">
      <ul className="grid grid-cols-5">
        {items.map((i) => {
          const active = pathname.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground",
                  active && (i.highlight ? "text-brand-600" : "text-brand-600")
                )}
              >
                {i.highlight ? (
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full transition",
                      active
                        ? "bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-md shadow-brand-500/30"
                        : "bg-gradient-to-br from-brand-500/10 to-orange-500/10 text-brand-600 ring-1 ring-brand-200"
                    )}
                  >
                    <i.icon className="h-4 w-4" />
                  </span>
                ) : (
                  <i.icon className="h-5 w-5" />
                )}
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
