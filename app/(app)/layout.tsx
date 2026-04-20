import { redirect } from "next/navigation";
import { getCurrentUser, hasCompletedOnboarding } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar, BottomNav } from "@/components/layout/navbar";
import { ServiceWorkerRegister } from "@/components/layout/sw-register";
import { SkipLink } from "@/components/layout/skip-link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasCompletedOnboarding(user)) redirect("/onboarding");

  const unread = await db.notification.count({ where: { userId: user.id, readAt: null } });

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <SkipLink />
      <Navbar userName={user.name} avatarUrl={user.avatarUrl} unread={unread} />
      <main id="main-content" tabIndex={-1} className="container py-4 md:py-8 focus:outline-none">
        {children}
      </main>
      <BottomNav />
      <ServiceWorkerRegister />
    </div>
  );
}
