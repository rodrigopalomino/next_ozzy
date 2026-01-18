import Link from "next/link";

export default function CategorySidebar({
  title = "Filtrar",
  current,
  items,
  baseHref = "",
}: {
  title?: string;
  current: string;
  items: string[];
  baseHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="text-sm font-semibold text-neutral-900">{title}</div>

      <div className="mt-3 flex flex-col gap-1">
        {items.map((label) => {
          const active = label === current;
          const href = `${baseHref}${encodeURIComponent(label)}`;

          return (
            <Link
              key={label}
              href={href}
              className={[
                "relative flex items-center rounded-xl px-3 py-2 text-sm transition-all",
                active
                  ? "bg-brand text-white font-semibold shadow-sm ring-1 ring-brand/40"
                  : "text-neutral-900 font-semibold hover:bg-neutral-100",
              ].join(" ")}
            >
              <span
                className={[
                  "mr-3 h-5 w-1 rounded-full transition-all",
                  active ? "bg-white" : "bg-neutral-300",
                ].join(" ")}
                aria-hidden="true"
              />
              <span className="leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
