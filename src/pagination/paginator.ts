import { SelectQueryBuilder } from 'typeorm';

// Define the options for pagination.
export interface PaginateOptions {
  limit: number; // The number of records to retrieve per page.
  currentPage: number; // The current page number.
  total?: boolean; // Whether to retrieve the total number of records.
}

// Define the structure of the pagination result.
export interface PaginationResult<T> {
  first: number; // The index of the first record in the current page.
  last: number; // The index of the last record in the current page.
  limit: number; // The number of records to retrieve per page.
  total?: number; // The total number of records. Optional if not requested.
  data: T[]; // The data retrieved for the current page.
}

// Define the pagination function.
export async function paginate<T>(
  qb: SelectQueryBuilder<T>, // The query builder for the database table.
  options: PaginateOptions = {
    limit: 10,
    currentPage: 1,
  },
): Promise<PaginationResult<T>> {
  const offset = (options.currentPage - 1) * options.limit; // Calculate the offset for the current page.
  const data = await qb.limit(options.limit).offset(offset).getMany(); // Retrieve the data for the current page.

  return {
    first: offset + 1, // Calculate the index of the first record in the current page.
    last: offset + data.length, // Calculate the index of the last record in the current page.
    limit: options.limit, // The number of records to retrieve per page.
    total: options.total ? await qb.getCount() : null, // If requested, retrieve the total number of records.
    data, // The data retrieved for the current page.
  };
}
