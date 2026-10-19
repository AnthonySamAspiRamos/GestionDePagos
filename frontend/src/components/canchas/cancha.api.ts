/**
 * ============================================================================
 * ARCHIVO: cancha.api.ts
 * CAPA: Capa de Servicios de Canchas (Frontend)
 * ============================================================================
 */

import api from '../../services/api';
import type { Cancha, CanchaFormData } from './cancha.types';

// Datos de demostración locales en caso de que el backend o docker aún no esté iniciado
export const DEMO_CANCHAS: Cancha[] = [
  {
    id_cancha: 1,
    nombre: 'Cancha Central de Fútbol 11',
    disciplina: 'futbol',
    capacidad: 22,
    precio_hora: 120.0,
    estado: 'disponible',
    ubicacion: 'Sector A - Principal',
    largo: 105.0,
    ancho: 68.0,
    hora_apertura: '07:00:00',
    hora_cierre: '23:00:00',
  },
  {
    id_cancha: 2,
    nombre: 'Cancha de Pádel Pro 1',
    disciplina: 'padel',
    capacidad: 4,
    precio_hora: 80.0,
    estado: 'disponible',
    ubicacion: 'Bloque B - Cristales',
    largo: 20.0,
    ancho: 10.0,
    hora_apertura: '06:00:00',
    hora_cierre: '23:30:00',
  },
  {
    id_cancha: 3,
    nombre: 'Coliseo de Básquetbol',
    disciplina: 'basquet',
    capacidad: 10,
    precio_hora: 70.0,
    estado: 'disponible',
    ubicacion: 'Pabellón Cubierto 2',
    largo: 28.0,
    ancho: 15.0,
    hora_apertura: '08:00:00',
    hora_cierre: '22:00:00',
  },
  {
    id_cancha: 4,
    nombre: 'Cancha de Futsal Sintético',
    disciplina: 'futsal',
    capacidad: 10,
    precio_hora: 65.0,
    estado: 'mantenimiento',
    ubicacion: 'Sector C - Lateral',
    largo: 40.0,
    ancho: 20.0,
    hora_apertura: '07:30:00',
    hora_cierre: '22:30:00',
  },
  {
    id_cancha: 5,
    nombre: 'Cancha de Tenis Polvo de Ladrillo',
    disciplina: 'tenis',
    capacidad: 4,
    precio_hora: 90.0,
    estado: 'disponible',
    ubicacion: 'Sector Tenis 1',
    largo: 23.77,
    ancho: 10.97,
    hora_apertura: '07:00:00',
    hora_cierre: '21:00:00',
  },
  {
    id_cancha: 6,
    nombre: 'Cancha de Voleibol Arena',
    disciplina: 'voley',
    capacidad: 12,
    precio_hora: 50.0,
    estado: 'disponible',
    ubicacion: 'Sector Playa',
    largo: 18.0,
    ancho: 9.0,
    hora_apertura: '08:00:00',
    hora_cierre: '20:00:00',
  },
];

export const canchaApi = {
  async getAll(disciplina?: string): Promise<{ data: Cancha[]; isLive: boolean }> {
    try {
      const endpoint = disciplina && disciplina !== 'todas'
        ? `/canchas?disciplina=${encodeURIComponent(disciplina)}`
        : '/canchas';
      
      const res = await api.get(endpoint);
      const canchas = res.data?.data || res.data || [];
      if (Array.isArray(canchas)) {
        return { data: canchas, isLive: true };
      }
      return { data: DEMO_CANCHAS, isLive: false };
    } catch (error) {
      console.warn('⚠️ [canchaApi] Backend no disponible, usando datos de demostración locales:', error);
      let filtradas = DEMO_CANCHAS;
      if (disciplina && disciplina !== 'todas') {
        filtradas = DEMO_CANCHAS.filter(c => c.disciplina?.toLowerCase() === disciplina.toLowerCase());
      }
      return { data: filtradas, isLive: false };
    }
  },

  async getById(id: number): Promise<Cancha | null> {
    try {
      const res = await api.get(`/canchas/${id}`);
      return res.data?.data || res.data || null;
    } catch (error) {
      console.error(`Error al obtener cancha #${id}:`, error);
      const demo = DEMO_CANCHAS.find(c => c.id_cancha === id);
      return demo || null;
    }
  },

  async create(data: CanchaFormData): Promise<Cancha> {
    const payload = {
      nombre: data.nombre,
      disciplina: data.disciplina || null,
      capacidad: data.capacidad ? Number(data.capacidad) : null,
      precio_hora: Number(data.precio_hora),
      estado: data.estado || 'disponible',
      ubicacion: data.ubicacion || null,
      largo: data.largo ? Number(data.largo) : null,
      ancho: data.ancho ? Number(data.ancho) : null,
      hora_apertura: data.hora_apertura || null,
      hora_cierre: data.hora_cierre || null,
    };

    const res = await api.post('/canchas', payload);
    return res.data?.data || res.data;
  },

  async update(id: number, data: Partial<CanchaFormData>): Promise<Cancha> {
    const payload: any = { ...data };
    if (data.precio_hora !== undefined) payload.precio_hora = Number(data.precio_hora);
    if (data.capacidad !== undefined) payload.capacidad = data.capacidad ? Number(data.capacidad) : null;
    if (data.largo !== undefined) payload.largo = data.largo ? Number(data.largo) : null;
    if (data.ancho !== undefined) payload.ancho = data.ancho ? Number(data.ancho) : null;

    const res = await api.patch(`/canchas/${id}`, payload);
    return res.data?.data || res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/canchas/${id}`);
  },
};
