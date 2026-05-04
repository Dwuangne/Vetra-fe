export type PagedListQuery = {
  keyword?: string;
  page?: number;
  size?: number;
};

export type PaginatedResult<T> = {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: T[];
};
