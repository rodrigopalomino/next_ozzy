import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm text-neutral-600">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((c, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={`${c.label}-${idx}`} className="flex items-center gap-2">
              {c.href && !last ? (
                <Link href={c.href} className="hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span className={last ? "text-neutral-900" : ""}>
                  {c.label}
                </span>
              )}
              {!last && <span className="text-neutral-400">{">"}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
