"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Phone, Mail, UserCircle, ExternalLink, Copy } from "lucide-react";
import { toast } from "@/components/ui/toaster";

type Author = {
  name: string;
  avatarUrl: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  showPhone: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
};

type Props = {
  author: Author;
  petName: string | null;
};

export function ContactOwnerModal({ author, petName }: Props) {
  const hasWhatsapp = author.showWhatsapp && author.whatsapp;
  const hasPhone = author.showPhone && author.phone;
  const hasEmail = author.showEmail;
  const hasAny = hasWhatsapp || hasPhone || hasEmail;

  const waMessage = encodeURIComponent(
    `Hola ${author.name}, vi tu publicación sobre "${petName ?? "tu mascota"}" en PatiTas y quiero ayudarte.`
  );

  function copyPhone() {
    navigator.clipboard.writeText(author.phone!);
    toast("Teléfono copiado", "success");
  }
  function copyEmail() {
    navigator.clipboard.writeText(author.email);
    toast("Correo copiado", "success");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto" size="lg">
          <Phone className="h-4 w-4" />
          Contactar al dueño
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contactar al dueño</DialogTitle>
          <DialogDescription>
            Comunícate con {author.name} para ayudar a encontrar a {petName ?? "su mascota"}.
          </DialogDescription>
        </DialogHeader>

        {/* Profile card */}
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 sm:gap-4 sm:p-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20 sm:h-14 sm:w-14">
            {author.avatarUrl && <AvatarImage src={author.avatarUrl} />}
            <AvatarFallback className="text-base sm:text-lg bg-primary/10 text-primary">
              {author.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm sm:text-base truncate">{author.name}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1">
              <UserCircle className="h-3 w-3 shrink-0" /> Dueño de {petName ?? "la mascota"}
            </p>
          </div>
        </div>

        {hasAny ? (
          <div className="space-y-3">
            {/* WhatsApp - Primary CTA */}
            {hasWhatsapp && (
              <a
                href={`https://wa.me/${author.whatsapp!.replace(/\D/g, "")}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border-2 border-green-200 bg-green-50 p-4 text-green-800 hover:bg-green-100 transition-colors group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">WhatsApp</p>
                  <p className="text-xs text-green-600 truncate">{author.whatsapp}</p>
                </div>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            )}

            {/* Teléfono */}
            {hasPhone && (
              <div className="flex items-center gap-3 rounded-xl border p-4 hover:bg-accent/50 transition-colors">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Teléfono</p>
                  <p className="text-xs text-muted-foreground truncate">{author.phone}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" className="h-8 px-2.5" onClick={copyPhone}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 px-2.5" asChild>
                    <a href={`tel:${author.phone}`}>
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Email */}
            {hasEmail && (
              <div className="flex items-center gap-3 rounded-xl border p-4 hover:bg-accent/50 transition-colors">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Correo electrónico</p>
                  <p className="text-xs text-muted-foreground truncate">{author.email}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" className="h-8 px-2.5" onClick={copyEmail}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 px-2.5" asChild>
                    <a href={`mailto:${author.email}?subject=${encodeURIComponent(`Sobre ${petName ?? "tu mascota"} en PatiTas`)}`}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <UserCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Sin datos de contacto</p>
            <p className="text-xs text-muted-foreground">
              El dueño no ha compartido información de contacto. Deja un comentario en la publicación para comunicarte.
            </p>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center pt-1">
          Sé respetuoso y específico al comunicarte. Incluye dónde y cuándo viste a la mascota.
        </p>
      </DialogContent>
    </Dialog>
  );
}
