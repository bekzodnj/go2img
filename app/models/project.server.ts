import { prisma } from "~/db.server";
import type { User, Project } from "../../prisma/generated/prisma/client";

export function createProject({
  polygons,
  imageUrl,
  imageWidth,
  imageHeight,
  userId,
}: Pick<Project, "polygons" | "imageUrl" | "imageWidth" | "imageHeight"> & {
  userId: User["id"];
}) {
  return prisma.project.create({
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

export function updateProject({
  id,
  polygons,
  imageUrl,
  imageWidth,
  imageHeight,
  userId,
}: Pick<
  Project,
  "id" | "polygons" | "imageUrl" | "imageWidth" | "imageHeight"
> & {
  userId: User["id"];
}) {
  return prisma.project.update({
    where: { id, userId },
    data: {
      imageUrl,
      imageWidth,
      imageHeight,
      polygons,
    },
  });
}

export function getProjectsByUser({ userId }: { userId: User["id"] }) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function getProjectById({
  id,
  userId,
}: Pick<Project, "id"> & { userId: User["id"] }) {
  return prisma.project.findFirst({
    where: { id, userId },
  });
}

export function deleteProject({
  id,
  userId,
}: Pick<Project, "id"> & { userId: User["id"] }) {
  return prisma.project.deleteMany({
    where: { id, userId },
  });
}
