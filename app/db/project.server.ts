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

export async function createEmptyProject({ userId }: { userId: string }) {
  return prisma.project.create({
    data: { userId },
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
  // max + 1 rather than a count, which would repeat an order after a delete
  const last = await prisma.image.aggregate({
    where: { projectId },
    _max: { order: true },
  });
  const nextOrder = order ?? (last._max.order ?? -1) + 1;

  return prisma.image.create({
    data: {
      projectId,
      url: imageUrl,
      width: imageWidth,
      height: imageHeight,
      order: nextOrder,
    },
  });
}

export async function updateImage({
  id,
  imageUrl,
  imageWidth,
  imageHeight,
}: {
  id: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}) {
  return prisma.image.update({
    where: { id },
    data: {
      url: imageUrl,
      width: imageWidth,
      height: imageHeight,
    },
  });
}

// Scoped through the project's owner, so one user can't delete another's image;
// its polygons go with it (onDelete: Cascade)
export async function deleteImage({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  return prisma.image.deleteMany({
    where: { id, project: { userId } },
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
    include: {
      images: {
        include: { polygons: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function countProjectsByUser({ userId }: { userId: string }) {
  return prisma.project.count({ where: { userId } });
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
    include: {
      images: {
        include: { polygons: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
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
