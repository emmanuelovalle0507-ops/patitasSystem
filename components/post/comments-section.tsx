"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment, deleteComment } from "@/app/actions/posts";
import { relativeTime } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

type Comment = {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  author: { name: string; avatarUrl: string | null };
};

type Props = {
  postId: string;
  comments: Comment[];
  canComment: boolean;
  currentUserId: string | null;
  canModerate: boolean;
};

export function CommentsSection({ postId, comments, canComment, currentUserId, canModerate }: Props) {
  const [list, setList] = useState(comments);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function submit() {
    if (!text.trim() || !currentUserId) return;
    const body = text.trim();
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Comment = {
      id: tempId,
      body,
      createdAt: new Date(),
      authorId: currentUserId,
      author: { name: "Tú", avatarUrl: null },
    };
    setList((l) => [...l, optimistic]);
    setText("");
    start(async () => {
      try {
        const res = await addComment(postId, body);
        setList((l) => l.map((c) => (c.id === tempId ? { ...c, id: res.id } : c)));
      } catch (e: any) {
        setList((l) => l.filter((c) => c.id !== tempId));
        setText(body);
        toast(e?.message || "Error", "error");
      }
    });
  }

  async function handleDelete(id: string) {
    if (deletingId) return;
    if (!confirm("¿Borrar este comentario?")) return;
    setDeletingId(id);
    try {
      await deleteComment(id);
      setList((l) => l.filter((c) => c.id !== id));
    } catch (e: any) {
      toast(e?.message || "No se pudo borrar", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-bold">Comentarios ({list.length})</h2>
      <div className="space-y-3">
        {list.map((c) => {
          const canDelete = !!currentUserId && (c.authorId === currentUserId || canModerate);
          return (
            <div key={c.id} className="flex gap-3 group">
              <Avatar className="h-8 w-8">
                {c.author.avatarUrl && <AvatarImage src={c.author.avatarUrl} />}
                <AvatarFallback>{c.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{c.author.name}</span>
                  <span>{relativeTime(c.createdAt)}</span>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="ml-auto p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      aria-label="Borrar comentario"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm mt-1">{c.body}</p>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-sm text-muted-foreground">Sé el primero en comentar.</p>}
      </div>
      {canComment && (
        <div className="space-y-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un comentario..." rows={2} />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={pending || !text.trim()}>Comentar</Button>
          </div>
        </div>
      )}
    </section>
  );
}
