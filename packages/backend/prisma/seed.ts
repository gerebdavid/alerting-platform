import { AlertCategory } from "@app/shared";
import { prisma } from "../src/db/prisma.js";

const categories: Array<{ code: AlertCategory; label: string }> = [
  { code: AlertCategory.BREAKING_NEWS, label: "Breaking News" },
  { code: AlertCategory.MARKETS, label: "Markets" },
  { code: AlertCategory.NATURAL_DISASTERS, label: "Natural Disasters" },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { code: category.code },
      update: { label: category.label },
      create: category,
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
