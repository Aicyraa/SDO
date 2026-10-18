import type { StaffStudentListResponse, StaffStudentRecord } from '@shared/types';
import { get, post } from './client';

export const studentsApi = {
  students: (query: { q?: string; page?: number; pageSize?: number } = {}) => {
    const params: Record<string, string | number> = {};
    if (query.q) params.q = query.q;
    if (query.page) params.page = query.page;
    if (query.pageSize) params.pageSize = query.pageSize;
    return get<StaffStudentListResponse>('/students', params);
  },
  student: (studentId: string) => get<StaffStudentRecord>(`/students/${encodeURIComponent(studentId)}`),
  resetStudentPassword: (studentId: string) =>
    post<{ tempPassword: string }>(`/staff/students/${encodeURIComponent(studentId)}/reset-password`),
};
