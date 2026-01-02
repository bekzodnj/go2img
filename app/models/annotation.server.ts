import { prisma } from "~/db.server";
import type { User, Annotation } from "../../prisma/generated/prisma/client";

export function createAnnotation({
  content,
  imageUrl,
  metadata,
  userId,
}: Pick<Annotation, "content" | "imageUrl" | "metadata"> & {
  userId: User["id"];
}) {
  return prisma.annotation.create({
    data: {
      content,
      imageUrl,
      metadata,
      user: {
        connect: { id: userId },
      },
    },
  });
}

export function getAnnotationsByUser({ userId }: { userId: User["id"] }) {
  return prisma.annotation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function deleteAnnotation({
  id,
  userId,
}: Pick<Annotation, "id"> & { userId: User["id"] }) {
  return prisma.annotation.deleteMany({
    where: { id, userId },
  });
}
