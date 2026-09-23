import { createStore } from "@xstate/store";

export const editorStore = createStore({
  // Initial context
  context: { count: 0, name: "David" },
  // Transitions
  on: {
    inc: (context) => ({
      ...context,
      count: context.count + 1,
    }),
    dec: (context) => ({
      ...context,
      count: context.count - 1,
    }),
    add: (context, event: { num: number }) => ({
      ...context,
      count: context.count + event.num,
    }),
    changeName: (context, event: { newName: string }) => ({
      ...context,
      name: event.newName,
    }),
  },
});

type Point = { x: number; y: number };
export type Polygon = {
  id: string;
  points: Point[];
  isClosed: boolean;
  color: string;
  label?: string;
  name?: string;
};

export const LabelStore = createStore({
  context: {
    polygons: [] as Polygon[],
    selectedPolygonId: null as string | null,
    imgScale: 1,
  },
  on: {
    addLabel: (context, event: { newPolygon: Polygon }) => ({
      ...context,
      polygons: [...context.polygons, event.newPolygon],
    }),
    setPolygons: (context, event: { polygons: Polygon[] }) => ({
      ...context,
      polygons: event.polygons,
    }),
    setSelectedPolygon: (context, event: { id: string | null }) => ({
      ...context,
      selectedPolygonId: event.id,
    }),
    changeLabelColor: (context, event: { id: string; color: string }) => ({
      ...context,
      polygons: context.polygons.map((p) =>
        p.id === event.id ? { ...p, color: event.color } : p,
      ),
    }),
    setImgScale: (context, event: { imgScale: number }) => ({
      ...context,
      imgScale: event.imgScale,
    }),
    changeLabelName: (context, event: { id: string; newName: string }) => ({
      ...context,
      polygons: context.polygons.map((p) =>
        p.id === event.id ? { ...p, name: event.newName } : p,
      ),
    }),
    removeLabel: (context, event: { id: string }) => ({
      ...context,
      polygons: context.polygons.filter((p) => p.id !== event.id),
    }),
    reset: (context) => ({
      ...context,
      polygons: [],
    }),
  },
});

export type ImageItem = {
  id: string;
  url: string;
  width: number;
  height: number;
  order: number;
};

export const ImageListStore = createStore({
  context: {
    images: [] as ImageItem[],
    currentImageId: null as string | null,
  },
  on: {
    setImages: (context, event: { images: ImageItem[] }) => ({
      ...context,
      images: event.images,
    }),
    addImage: (context, event: { image: ImageItem }) => ({
      ...context,
      images: [...context.images, event.image],
      currentImageId: event.image.id,
    }),
    replaceImage: (context, event: { image: ImageItem }) => ({
      ...context,
      images: context.images.map((img) =>
        img.id === event.image.id ? event.image : img,
      ),
    }),
    setCurrentImage: (context, event: { id: string | null }) => ({
      ...context,
      currentImageId: event.id,
    }),
  },
});

export const BackgroundImageStore = createStore({
  context: {
    imageUrl: null as string | null,
    imageWidth: 0,
    imageHeight: 0,
    originalImageWidth: 0,
    originalImageHeight: 0,
  },
  on: {
    setImageUrl: (context, event: { imageUrl: string | null }) => ({
      ...context,
      imageUrl: event.imageUrl,
    }),
    setSizeImage: (
      context,
      event: { imageWidth: number; imageHeight: number },
    ) => ({
      ...context,
      imageWidth: event.imageWidth,
      imageHeight: event.imageHeight,
    }),
    setOriginalSizeImage: (
      context,
      event: { originalImageWidth: number; originalImageHeight: number },
    ) => ({
      ...context,
      originalImageWidth: event.originalImageWidth,
      originalImageHeight: event.originalImageHeight,
    }),

    clearImageUrl: (context) => ({
      ...context,
      imageUrl: null,
    }),
  },
});
