import { Badge } from "@/components/ui/badge";
import type { PostStatus } from "@prisma/client";

const LABEL: Record<PostStatus, string> = {
  LOST: "Perdido",
  FOUND: "Encontrado ❤️",
  IN_PROGRESS: "En proceso",
  ACTIVE: "Publicación",
};

const VARIANT: Record<PostStatus, "lost" | "found" | "progress" | "secondary"> = {
  LOST: "lost",
  FOUND: "found",
  IN_PROGRESS: "progress",
  ACTIVE: "secondary",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
