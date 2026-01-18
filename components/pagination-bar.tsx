import Link from "next/link";

export default function PaginationBar({
  current,
  totalPages,
}: {
  current: number;
  totalPages: number;
}) {
  const pages = Array.from({ length: totalPages }).map((_, i) => i + 1);

  return (
    <div className="flex items-center gap-2">
      {pages.map((p) => {
        const active = p === current;
        return (
          <Link
            key={p}
            href="#"
            className={[
              "grid h-8 w-8 place-items-center rounded text-sm",
              active
                ? "bg-pink-500 text-white"
                : "border border-neutral-300 hover:bg-black/5",
            ].join(" ")}
          >
            {p}
          </Link>
        );
      })}
    </div>
  );
}
