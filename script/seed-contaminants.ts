import { PATRIOTS_CONTAMINANTS } from "@/lib/constants";
import prisma from "@/lib/prisma";

async function main() {
  const PATRIOTS_CONTAMINANTS_ARRAY = Object.entries(PATRIOTS_CONTAMINANTS).map(([name, data]) => ({
    name,
    ...data,
  }));
  type Contaminant = (typeof PATRIOTS_CONTAMINANTS_ARRAY)[number];
  console.log(PATRIOTS_CONTAMINANTS_ARRAY);

  const Seeded = await prisma.contaminant.createMany({
    data: PATRIOTS_CONTAMINANTS_ARRAY,
    skipDuplicates: true,
  });
  console.log(Seeded);
}

main();
