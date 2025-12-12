import { createStore } from "@xstate/store";
import { P } from "node_modules/better-auth/dist/shared/better-auth.6BOIvSei";

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
    changeLabelColor: (context, event: { id: string; color: string }) => ({
      ...context,
      polygons: context.polygons.map((p) =>
        p.id === event.id ? { ...p, color: event.color } : p,
      ),
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
