import { PrismaClient, PetKind, PostKind, PostStatus } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Usuario demo (requiere un supabaseId real en producción; aquí dummy)
  const demoUser = await db.user.upsert({
    where: { email: "demo@patitas.mx" },
    update: {},
    create: {
      supabaseId: "demo-supabase-id",
      email: "demo@patitas.mx",
      name: "Usuario Demo",
      favoritePets: [PetKind.DOG, PetKind.CAT],
      notifLat: 19.7167,
      notifLng: -99.0,
      notifRadiusKm: 5,
    },
  });

  const pet = await db.pet.create({
    data: { name: "Firulais", kind: PetKind.DOG, breed: "Mestizo", color: "Café", ageYears: 3, ownerId: demoUser.id },
  });

  await db.post.create({
    data: {
      kind: PostKind.LOST,
      status: PostStatus.LOST,
      authorId: demoUser.id,
      petId: pet.id,
      title: "Se busca Firulais",
      description: "Perro mestizo café, collar rojo. Se perdió cerca del centro de Tecámac.",
      lat: 19.7167,
      lng: -99.0,
      areaLabel: "Centro de Tecámac",
      lostAt: new Date(),
    },
  });

  console.log("Seed completado ✅");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
