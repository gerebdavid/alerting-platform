import { AlertCategory, Role } from "@app/shared";
import { prisma } from "../src/db/prisma.js";
import { hashPassword } from "../src/lib/password.js";

const categories: Array<{ code: AlertCategory; label: string }> = [
  { code: AlertCategory.BREAKING_NEWS, label: "Breaking News" },
  { code: AlertCategory.MARKETS, label: "Markets" },
  { code: AlertCategory.NATURAL_DISASTERS, label: "Natural Disasters" },
];

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "Admin123!";

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { code: category.code },
      update: { label: category.label },
      create: category,
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: { email: ADMIN_EMAIL, passwordHash, role: Role.ADMIN },
  });
  console.log(`Seeded admin user (${ADMIN_EMAIL} / ${ADMIN_PASSWORD}).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
