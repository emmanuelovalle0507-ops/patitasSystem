"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "../actions/profile";
import { toast } from "@/components/ui/toaster";

const PETS = [
  { value: "DOG", label: "🐶 Perros" },
  { value: "CAT", label: "🐱 Gatos" },
  { value: "BIRD", label: "🦜 Aves" },
  { value: "REPTILE", label: "🦎 Reptiles" },
  { value: "RODENT", label: "🐹 Roedores" },
  { value: "OTHER", label: "🐾 Otras" },
];

export function OnboardingForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggle(v: string) {
    setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  }

  async function submit() {
    if (selected.length === 0) { toast("Selecciona al menos una mascota", "error"); return; }
    setLoading(true);
    try {
      await completeOnboarding(selected);
      router.push("/dashboard");
    } catch (e: any) {
      toast(e?.message || "Error", "error");
    } finally { setLoading(false); }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>¿Cuáles son tus mascotas favoritas?</CardTitle>
        <CardDescription>Tu asistente IA te compartirá datos y consejos personalizados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {PETS.map((p) => (
            <label
              key={p.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                selected.includes(p.value) ? "border-brand-500 bg-brand-50" : "hover:bg-accent"
              }`}
            >
              <Checkbox checked={selected.includes(p.value)} onCheckedChange={() => toggle(p.value)} />
              <span className="font-medium">{p.label}</span>
            </label>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={submit} disabled={loading} className="w-full" size="lg">
          {loading ? "Guardando..." : "Continuar"}
        </Button>
      </CardFooter>
    </Card>
  );
}
