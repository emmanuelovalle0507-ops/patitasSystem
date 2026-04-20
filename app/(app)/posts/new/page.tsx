import { NewPostForm } from "./form";

export const metadata = { title: "Reportar mascota perdida" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Reportar mascota perdida 🐾</h1>
        <p className="text-muted-foreground">Entre más detalles compartas, más probable es encontrarla.</p>
      </div>
      <NewPostForm />
    </div>
  );
}
