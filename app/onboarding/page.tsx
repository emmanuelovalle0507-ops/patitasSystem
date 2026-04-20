import { redirect } from "next/navigation";
import { getCurrentUser, hasCompletedOnboarding } from "@/lib/auth";
import { OnboardingForm } from "./form";

export const metadata = { title: "Bienvenido" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (hasCompletedOnboarding(user)) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-background py-10">
      <div className="container max-w-lg">
        <div className="text-center mb-8">
          <div className="text-4xl">🐾</div>
          <h1 className="font-display text-3xl font-bold mt-2">Hola, {user.name}</h1>
          <p className="text-muted-foreground">Personalicemos tu experiencia PatiTas</p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
