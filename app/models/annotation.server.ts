import { prisma } from "~/db.server";
import type { User, Annotation } from "../../prisma/generated/prisma/client";

export function createAnnotation({
  polygons,
  imageUrl,
  imageWidth,
  imageHeight,
  userId,
}: Pick<Annotation, "polygons" | "imageUrl" | "imageWidth" | "imageHeight"> & {
  userId: User["id"];
}) {
  return prisma.annotation.create({
    data: {
      imageUrl,
      imageWidth,
      imageHeight,
      polygons,
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

export function getAnnotationById({
  id,
  userId,
}: Pick<Annotation, "id"> & { userId: User["id"] }) {
  return prisma.annotation.findFirst({
    where: { id, userId },
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
