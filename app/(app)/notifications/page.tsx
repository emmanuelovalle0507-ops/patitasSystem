import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listNotifications, markRead } from "@/lib/queries/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Heart, MessageCircle, PawPrint } from "lucide-react";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Notificaciones" };

export default async function NotificationsPage({ searchParams }: { searchParams: { cursor?: string } }) {
  const user = await requireUser();
  const { items, nextCursor } = await listNotifications(user.id, { cursor: searchParams.cursor ?? null, take: 20 });

  const unreadIds = items.filter((n) => !n.readAt).map((n) => n.id);
  await markRead(user.id, unreadIds);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold mb-4">Notificaciones</h1>
      {items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Bell className="mx-auto h-10 w-10 mb-2 opacity-40" />
          No tienes notificaciones todavía.
        </CardContent></Card>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((n) => {
              const Icon = n.type === "NEW_LOST_NEARBY" ? PawPrint : n.type === "COMMENT" ? MessageCircle : n.type === "LIKE" ? Heart : Bell;
              const content = (
                <Card className={n.readAt ? "" : "border-brand-300 bg-brand-50/30"}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">{relativeTime(n.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
              return (
                <li key={n.id}>
                  {n.postId ? <Link href={`/posts/${n.postId}`}>{content}</Link> : content}
                </li>
              );
            })}
          </ul>
          {nextCursor && (
            <div className="mt-4 text-center">
              <Link href={`/notifications?cursor=${nextCursor}`} className="text-sm text-brand-600 hover:underline">
                Ver más
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
