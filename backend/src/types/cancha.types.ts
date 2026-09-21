/**
 * ============================================================================
 * ARCHIVO: cancha.types.ts
 * CAPA: Tipos / Modelos (Types/)
 * 
 * PROPÓSITO:
 * Centralizar todas las definiciones de tipos e interfaces TypeScript relacionadas
 * con el módulo de 'Canchas'. Esto garantiza autocompletado, seguridad de tipos
 * y consistencia en el servicio, controlador y rutas.
 * ============================================================================
 */

// 1. Interfaz principal: Refleja exactamente la tabla 'cancha' de PostgreSQL
export interface Cancha {
  id_cancha: number;
  nombre: string;
  disciplina: string | null;
  capacidad: number | null;
  precio_hora: number;
  estado: 'disponible' | 'mantenimiento' | 'ocupada' | 'inactiva' | string;
  ubicacion: string | null;
  largo: number | null;
  ancho: number | null;
  hora_apertura: string | null; // Formato HH:mm o HH:mm:ss
  hora_cierre: string | null;   // Formato HH:mm o HH:mm:ss
}

// 2. DTO (Data Transfer Object) para crear una Cancha (POST /api/canchas)
export interface CreateCanchaDTO {
  nombre: string;
  disciplina?: string | null | undefined;
  capacidad?: number | null | undefined;
  precio_hora: number;
  estado?: string | undefined;
  ubicacion?: string | null | undefined;
  largo?: number | null | undefined;
  ancho?: number | null | undefined;
  hora_apertura?: string | null | undefined;
  hora_cierre?: string | null | undefined;
}

// 3. DTO para actualizar una Cancha (PATCH /api/canchas/:id)
export interface UpdateCanchaDTO {
  nombre?: string | undefined;
  disciplina?: string | null | undefined;
  capacidad?: number | null | undefined;
  precio_hora?: number | undefined;
  estado?: string | undefined;
  ubicacion?: string | null | undefined;
  largo?: number | null | undefined;
  ancho?: number | null | undefined;
  hora_apertura?: string | null | undefined;
  hora_cierre?: string | null | undefined;
}

// 4. Parámetros de consulta para filtrar listados (GET /api/canchas?disciplina=futbol&estado=disponible)
export interface CanchaFilters {
  disciplina?: string | undefined;
  estado?: string | undefined;
  search?: string | undefined;
}