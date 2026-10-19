/**
 * ============================================================================
 * ARCHIVO: cancha.types.ts
 * CAPA: Tipos / Modelos del Frontend (Canchas)
 * ============================================================================
 */

export interface Cancha {
    id_cancha: number;
    nombre: string;
    disciplina: string;
    precio_hora: number;
    capacidad: number | null;
    estado: string;
    ubicacion: string;
    largo: number | null;
    ancho: number | null;
    hora_apertura: string;
    hora_cierre: string;
}

export interface CanchaFormData {
  nombre: string;
  disciplina: string;
  capacidad: string | number;
  precio_hora: string | number;
  estado: string;
  ubicacion: string;
  largo: string | number;
  ancho: string | number;
  hora_apertura: string;
  hora_cierre: string;
}

export interface DisciplinaOption {
    id: string;
    label: string;
    icon: string;
}
