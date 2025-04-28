import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class BlockedResources {
  static async getBlockedValues(): Promise<string[]> {
    const resources = await prisma.blockedResource.findMany({
      select: {
        value: true,
      },
    });
    return resources.map((resource) => resource.value);
  }

  static async addBlockedValues(values: string[]) {
    const data = values.map((value) => ({ value }));
    await prisma.blockedResource.createMany({ data, skipDuplicates: true });
  }
}