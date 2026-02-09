type FilterPrimitive = string | number | boolean;

export type FilterValue =
  | FilterPrimitive
  | null
  | undefined
  | Array<FilterPrimitive>
  | Record<string, unknown>;

export type Filters = Record<string, FilterValue>;

export type QueryOptions = {
  page?: number;
  limit?: number;
  sortBy?: string | string[];
  order?: "asc" | "desc" | ("asc" | "desc")[];
  filtros?: Filters;
  include?: string[];
  globalKeys?: string[]; // ✅ NUEVO
};

type BuildResult = {
  searchParams: URLSearchParams;
  queryKey: (string | number | undefined)[]; // si quieres, luego lo hacemos mejor
};

export const buildQueryOptions = (
  key: string,
  options: QueryOptions = {}
): BuildResult => {
  const {
    page,
    limit,
    sortBy,
    order,
    filtros = {},
    include = [],
    globalKeys,
  } = options;

  const searchParams = new URLSearchParams();

  if (page) searchParams.set("page", String(page));
  if (limit) searchParams.set("limit", String(limit));

  // ✅ Multi-sort: sortBy
  if (sortBy) {
    const sortArr = Array.isArray(sortBy) ? sortBy : [sortBy];
    sortArr.forEach((s) => searchParams.append("sortBy", s));
  }

  // ✅ Multi-sort: order
  if (order) {
    const orderArr = Array.isArray(order) ? order : [order];
    orderArr.forEach((o) => searchParams.append("order", o));
  }

  // ✅ include
  include.forEach((item) => searchParams.append("include", item));

  // ✅ filtros
  // ✅ filtros (soporta anidados)
  const appendNestedFilters = (
    params: URLSearchParams,
    prefix: string,
    value: unknown
  ) => {
    if (value === undefined || value === null || value === "") return;

    // ✅ arrays
    if (Array.isArray(value)) {
      value.forEach((val) => {
        if (val === undefined || val === null || val === "") return;
        params.append(prefix, String(val));
      });
      return;
    }

    // ✅ objetos anidados
    if (typeof value === "object") {
      Object.entries(value).forEach(([key, val]) => {
        appendNestedFilters(params, `${prefix}[${key}]`, val);
      });
      return;
    }

    // ✅ primitivo
    params.set(prefix, String(value));
  };

  Object.entries(filtros).forEach(([k, v]) => {
    appendNestedFilters(searchParams, `filtros[${k}]`, v);
  });

  // ✅ GLOBAL KEYS (para búsqueda OR dinámica en backend)
  if (globalKeys?.length) {
    searchParams.set("filtros[globalKeys]", globalKeys.join(","));
  }

  // ✅ queryKey estable para caching
  const sortKey = Array.isArray(sortBy) ? sortBy.join(",") : sortBy;
  const orderKey = Array.isArray(order) ? order.join(",") : order;

  const queryKey: (string | number | undefined)[] = [
    key,
    page,
    limit,
    sortKey,
    orderKey,
    JSON.stringify(filtros),
    include.join(","),
    globalKeys?.join(","),
  ];

  return { searchParams, queryKey };
};
