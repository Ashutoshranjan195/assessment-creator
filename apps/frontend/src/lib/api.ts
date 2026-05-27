import axios from 'axios';
import type { AssignmentDocument, AssignmentInput } from '@vedaai/shared';

const isServer = typeof window === 'undefined';
const baseURL = isServer
  ? process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
  : process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_INTERNAL_URL || '';

export const api = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15_000,
});

export interface CreateAssignmentResponse {
  assignmentId: string;
  jobId: string;
}

export async function createAssignment(payload: AssignmentInput): Promise<CreateAssignmentResponse> {
  const { data } = await api.post('/api/assignments', payload);
  return data;
}

export async function fetchAssignment(id: string): Promise<AssignmentDocument> {
  const { data } = await api.get(`/api/assignments/${id}`);
  return data;
}

export interface ListResponse {
  items: AssignmentDocument[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listAssignments(page = 1, pageSize = 20): Promise<ListResponse> {
  const { data } = await api.get('/api/assignments', { params: { page, pageSize } });
  return data;
}

export async function regenerate(id: string): Promise<CreateAssignmentResponse> {
  const { data } = await api.post(`/api/assignments/${id}/regenerate`);
  return data;
}

export function pdfUrl(id: string): string {
  return `${baseURL}/api/assignments/${id}/pdf`;
}
