export const GLOBAL_SEARCH_LIMIT = 10;

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface ValidatedPaginationParams {
  limit: number;
  offset: number;
}

export function validatePagination(
  params: PaginationParams = {},
): ValidatedPaginationParams {
  const { limit, offset } = params;

  if (!limit) {
    throw new Error(
      `Limit is required and must be between 1 and ${GLOBAL_SEARCH_LIMIT}`,
    );
  }

  if (limit < 1 || limit > GLOBAL_SEARCH_LIMIT) {
    throw new Error(`Limit must be between 1 and ${GLOBAL_SEARCH_LIMIT}`);
  }

  return {
    limit,
    offset: offset || 0,
  };
}
