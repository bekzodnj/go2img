import type { User, Library, Material, Category } from "@prisma/client";
import { prisma } from "~/db.server";

type MaterialWithCategory = Material & {
  category: { name: string };
};

export function getMaterial({
  id,
  userId,
}: Pick<Material, "id"> & { userId: User["id"] }) {
  return prisma.material.findFirst({
    where: {
      id,
      OR: [{ authorId: userId }, { savedBy: { some: { userId } } }],
    },
    select: {
      title: true,
      url: true,
      description: true,
      filePath: true,
      category: { select: { name: true } },
    },
  });
}

export function getMaterialListItems({ userId }: { userId: User["id"] }) {
  return prisma.material.findMany({
    where: { authorId: userId },
    select: {
      id: true,
      title: true,
      url: true,
      description: true,
      filePath: true,
      category: { select: { name: true } },
      createdAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export function createMaterial({
  title,
  description,
  categoryId,
  url,
  userId,
  filePath,
}: Pick<Material, "title" | "description" | "url"> & {
  userId: User["id"];
  categoryId: Category["id"];
  filePath?: string | null;
}) {
  return prisma.material.create({
    data: {
      title,
      description,
      url,
      filePath,
      category: {
        connect: { id: categoryId },
      },
      author: {
        connect: { id: userId },
      },
    },
  });
}

export function updateMaterial({
  id,
  userId,
  ...data
}: Partial<Material> & {
  id: Material["id"];
  userId: User["id"];
}) {
  return prisma.material.updateMany({
    where: { id, authorId: userId },
    data,
  });
}

export function deleteMaterial({
  id,
  userId,
}: Pick<Material, "id"> & { userId: User["id"] }) {
  return prisma.material.deleteMany({
    where: { id, authorId: userId },
  });
}

// Library Operations
export function getLibraryItems({ userId }: { userId: User["id"] }) {
  return prisma.library.findMany({
    where: { userId },
    select: {
      id: true,
      notes: true,
      material: {
        select: {
          id: true,
          title: true,
          description: true,
          category: { select: { name: true } },
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function addToLibrary({
  materialId,
  userId,
  notes,
}: Pick<Library, "materialId" | "notes"> & {
  userId: User["id"];
}) {
  return prisma.library.create({
    data: {
      material: {
        connect: { id: materialId },
      },
      user: {
        connect: { id: userId },
      },
      notes,
    },
  });
}

export function removeFromLibrary({
  materialId,
  userId,
}: Pick<Library, "materialId"> & {
  userId: User["id"];
}) {
  return prisma.library.deleteMany({
    where: { materialId, userId },
  });
}

// Category Operations
export function getCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { name: "asc" },
  });
}
