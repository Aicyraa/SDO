import { invalid, valid, type Validated } from '../helpers/validation.js';
import { parsePageSize } from './common.validators.js';

const MAX_QUERY_LENGTH = 100;

/** `/students?q=&page=&pageSize=`: each given at most once; `q` is trimmed (blank is "no search"). */
export function parseStudentSearchQuery(query: Record<string, unknown>): Validated<{ q: string | null; page: number; pageSize: number | undefined }> {
  const rawQuery = query.q;
  const rawPage = query.page;
  if ((rawQuery !== undefined && typeof rawQuery !== 'string') || (rawPage !== undefined && typeof rawPage !== 'string')) {
    return invalid('q and page must each be given once.');
  }
  const q = rawQuery?.trim() ? rawQuery.trim() : null;
  if (q !== null && q.length > MAX_QUERY_LENGTH) return invalid(`q is at most ${MAX_QUERY_LENGTH} characters.`);
  if (rawPage !== undefined && !/^[1-9]\d{0,5}$/.test(rawPage)) return invalid('page must be a positive number.');
  const pageSize = parsePageSize(query.pageSize);
  if (!pageSize.ok) return pageSize;
  return valid({ q, page: rawPage === undefined ? 1 : Number(rawPage), pageSize: pageSize.value });
}
