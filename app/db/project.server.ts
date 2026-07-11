import { prisma } from "~/db.server";
import type { Prisma } from "../../prisma/generated/prisma/client";

export async function createProject({
  userId,
  imageUrl,
  imageWidth,
  imageHeight,
}: {
  userId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}) {
  return prisma.project.create({
    data: {
      userId,
      images: {
        create: [
          { url: imageUrl, width: imageWidth, height: imageHeight, order: 0 },
        ],
      },
    },
    include: { images: true },
  });
}

export async function addImageToProject({
  projectId,
  imageUrl,
  imageWidth,
  imageHeight,
  order,
}: {
  projectId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  order?: number;
}) {
  return prisma.image.create({
    data: {
      projectId,
      url: imageUrl,
      width: imageWidth,
      height: imageHeight,
      order: order ?? 0,
    },
  });
}

export async function upsertPolygons({
  imageId,
  polygons,
}: {
  imageId: string;
  polygons: {
    id?: string;
    label: string;
    color: string;
    points: unknown;
    order: number;
  }[];
}) {
  return prisma.$transaction([
    prisma.polygon.deleteMany({ where: { imageId } }),
    prisma.polygon.createMany({
      data: polygons.map((p) => ({
        ...p,
        imageId,
        points: p.points as Prisma.InputJsonValue,
      })),
    }),
  ]);
}

export async function getProjectsByUser({ userId }: { userId: string }) {
  return prisma.project.findMany({
    where: { userId },
    include: { images: { include: { polygons: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectById({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  return prisma.project.findFirst({
    where: { id, userId },
    include: { images: { include: { polygons: true } } },
  });
}

export async function deleteProject({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  return prisma.project.deleteMany({
    where: { id, userId },
  });
}
