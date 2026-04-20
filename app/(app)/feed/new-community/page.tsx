import { CommunityPostForm } from "./form";

export const metadata = { title: "Nueva publicación" };

export default function NewCommunityPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl font-bold mb-4">Nueva publicación de comunidad 🐾</h1>
      <CommunityPostForm />
    </div>
  );
}
