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
};

export const LabelStore = createStore({
  context: {
    polygons: [] as Polygon[],
    selectedPolygonId: null as string | null,
  },
  on: {
    addLabel: (context, event: { newPolygon: Polygon }) => ({
      ...context,
      polygons: [...context.polygons, event.newPolygon],
    }),
    setLabels: (context, event: { polygons: Polygon[] }) => ({
      ...context,
      polygons: event.polygons,
    }),
    setSelectedLabel: (context, event: { id: string | null }) => ({
      ...context,
      selectedPolygonId: event.id,
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
