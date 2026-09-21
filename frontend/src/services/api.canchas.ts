/**
 * ============================================================================
 * ARCHIVO: api.canchas.ts
 * CAPA: Conexión API Frontend -> Backend (Canchas)
 * 
 * PROPÓSITO:
 * Usar axios con interceptores de autenticación para operaciones de canchas.
 * ============================================================================
 */

import api from './api';

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

export const canchaApi = {
  getAll: async (params?: { disciplina?: string; estado?: string; search?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await api.get(`/canchas${query}`);
    return response.data || response;
  },

  getById: async (id: number) => {
    const response = await api.get(`/canchas/${id}`);
    return response.data || response;
  },

  create: async (body: any) => {
    const response = await api.post('/canchas', body);
    return response.data || response;
  },

  update: async (id: number, body: any) => {
    const response = await api.patch(`/canchas/${id}`, body);
    return response.data || response;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/canchas/${id}`);
    return response.data || response;
  }
};
