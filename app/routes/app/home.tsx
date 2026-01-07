import {
  deleteAnnotation,
  getAnnotationsByUser,
} from "~/models/annotation.server";
import { requireUserIdWithRedirect } from "~/session.server";
import { Route } from "./+types/home";
import { Link, useFetcher } from "react-router";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireUserIdWithRedirect(request);
  const annotations = await getAnnotationsByUser({ userId: user.id });
  return { annotations };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const annotationId = formData.get("annotationId") as string;

  await deleteAnnotation({ id: annotationId });

  return null;
};

// Thumbnailable color palette
const THUMBNAIL_COLORS = [
  "bg-violet-200 border-violet-300",

  "bg-rose-200 border-rose-300",
  "bg-amber-200 border-amber-300",
  "bg-lime-200 border-lime-300",
  "bg-cyan-200 border-cyan-300",
  "bg-emerald-200 border-emerald-300",
  "bg-sky-200 border-sky-300",

  "bg-orange-200 border-orange-300",
  "bg-teal-200 border-teal-300",
];

// Deterministic random color generator for thumbnails
function getThumbnailColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  const idx = hash % THUMBNAIL_COLORS.length;
  return THUMBNAIL_COLORS[idx];
}

const COLORS = [
  "bg-indigo-50 border-indigo-200 text-indigo-700",
  "bg-emerald-50 border-emerald-200 text-emerald-700",
  "bg-amber-50 border-amber-200 text-amber-700",
  "bg-rose-50 border-rose-200 text-rose-700",
  "bg-sky-50 border-sky-200 text-sky-700",
];
const formatDate = (date: Date) => {
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getPolygonCount = (polygonsJson: string) => {
  if (!polygonsJson) return 0;
  try {
    return JSON.parse(polygonsJson).length;
  } catch {
    return 0;
  }
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const { annotations } = loaderData;

  const fetcher = useFetcher();
  const handleDelete = (annotationId: any) => {
    if (confirm("Delete this annotation?")) {
      // setAnnotations(prev => prev.filter(a => a.id !== annotationId));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-normal tracking-tight text-black">
            Annotations
          </h1>
          <p className="mt-3 text-neutral-500">
            {annotations.length}{" "}
            {annotations.length === 1 ? "project" : "projects"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/editor">
            <div className="group relative flex h-52 flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white transition-all hover:border-neutral-400 hover:bg-neutral-50">
              <div className="flex flex-col items-center gap-2">
                <div className="text-5xl font-light text-neutral-400 transition-colors group-hover:text-neutral-600">
                  +
                </div>
                <span className="text-sm font-medium text-neutral-600">
                  New project
                </span>
              </div>
            </div>
          </Link>

          {annotations.map((annotation) => (
            <Link to={`/editor/${annotation.id}`} key={annotation.id}>
              <div
                key={annotation.id}
                className="group relative flex h-52 cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-sm"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    fetcher.submit(
                      { annotationId: annotation.id },
                      { method: "post" },
                    );
                    handleDelete(annotation.id);
                  }}
                  className="absolute right-2 top-2 z-10 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-400 opacity-0 shadow-sm transition-opacity hover:text-red-600 group-hover:opacity-100"
                >
                  Delete
                </button>

                {/* Single thumbnail color block */}
                <div className="h-32 w-full overflow-hidden p-3">
                  <div
                    className={`h-full w-full rounded-md ${getThumbnailColor(annotation.id)}`}
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="font-medium text-black">Annotation</h3>
                    <p className="mt-1 font-mono text-xs text-neutral-400">
                      {annotation.id.slice(0, 8)}
                    </p>
                    {annotation.imageWidth && annotation.imageHeight && (
                      <p className="mt-1 text-xs text-neutral-400">
                        {annotation.imageWidth} × {annotation.imageHeight}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{formatDate(annotation.updatedAt)}</span>
                    {getPolygonCount(annotation.polygons) > 0 && (
                      <span>
                        {getPolygonCount(annotation.polygons)} polygons
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {annotations.length === 0 && (
          <div className="mt-24 text-center">
            <p className="text-neutral-500">No annotations yet</p>
            <p className="mt-1 text-sm text-neutral-400">
              Create your first project to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
