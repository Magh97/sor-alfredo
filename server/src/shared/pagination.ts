export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export function paginate(query: { page?: string; pageSize?: string }): PaginationParams {
  const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize ?? '20', 10) || 20));
  return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
}

export function paginatedResponse<T>(data: T[], totalItems: number, params: PaginationParams): PaginatedResponse<T> {
  return {
    data,
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / params.pageSize),
    },
  };
}
