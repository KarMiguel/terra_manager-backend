import { Paginate } from './types';

export function calculatePagination(
  paginate?: Paginate,
): { skip?: number; take?: number } {
  if (!paginate) return {};

  const { page, pageSize } = paginate;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return { skip, take };
}
