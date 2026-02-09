export type CoreStatus = "created" | "updated" | "deleted" | "success";

export interface CoreResponse<T = unknown> {
  status: CoreStatus;
  message: string;
  data?: T;
}

export type CreatedResponse<T> = CoreResponse<T> & {
  status: "created";
  data: T;
};
export type UpdatedResponse<T> = CoreResponse<T> & {
  status: "updated";
  data: T;
};
export type DeletedResponse = CoreResponse<never> & {
  status: "deleted";
  data?: never;
};
export type SuccessResponse<T> = CoreResponse<T> & {
  status: "success";
  data: T;
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DataResponse<T> {
  data: T;
  meta: null;
}
