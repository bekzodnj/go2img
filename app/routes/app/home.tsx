import { getAnnotationsByUser } from "~/models/annotation.server";
import { requireUserIdWithRedirect } from "~/session.server";
import { Route } from "./+types/home";
import { Link } from "react-router";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireUserIdWithRedirect(request);
  const annotations = await getAnnotationsByUser({ userId: user.id });
  return { annotations };
};

const COLORS = [
  "bg-indigo-50 border-indigo-200 text-indigo-700",
  "bg-emerald-50 border-emerald-200 text-emerald-700",
  "bg-amber-50 border-amber-200 text-amber-700",
  "bg-rose-50 border-rose-200 text-rose-700",
  "bg-sky-50 border-sky-200 text-sky-700",
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const { annotations } = loaderData;

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Create a new annotation or continue working on an existing one
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Big + card */}
        <Link
          to="/editor"
          className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition hover:border-gray-400 hover:text-gray-600"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl font-light">+</span>
            <span className="text-sm font-medium">New Project</span>
          </div>
        </Link>

        {/* Existing annotations */}
        {annotations.map((annotation, index) => {
          const colorClass = COLORS[index % COLORS.length];

          return (
            <Link
              key={annotation.id}
              to={`/editor/${annotation.id}`}
              className={`flex h-48 flex-col justify-between rounded-xl border p-4 transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClass}`}
            >
              <div>
                <h3 className="text-sm font-medium">Annotation</h3>
                <p className="mt-1 text-xs opacity-70">
                  ID: {annotation.id.slice(0, 8)}…
                </p>
              </div>

              <div className="text-xs opacity-70">
                Updated {new Date(annotation.updatedAt).toLocaleDateString()}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state fallback (optional) */}
      {annotations.length === 0 ? (
        <div className="mt-12 text-center text-sm text-gray-500">
          No annotations yet. Create your first one ✨
        </div>
      ) : null}
    </div>
  );
}
