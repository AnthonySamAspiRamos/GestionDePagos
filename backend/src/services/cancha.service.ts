/**
 * ============================================================================
 * ARCHIVO: cancha.service.ts
 * CAPA: Servicios (Services/)
 * 
 * PROPÓSITO:
 * Contiene toda la LÓGICA DE NEGOCIO y el ACCESO DIRECTO A LA BASE DE DATOS.
 * Según las especificaciones:
 * - Sin ORM: Ejecutamos consultas SQL puras con 'pool.query()'.
 * - Usamos consultas parametrizadas ($1, $2, etc.) para prevenir inyecciones SQL.
 * - Este archivo NO maneja peticiones HTTP (req, res); solo recibe parámetros y
 *   retorna datos o lanza excepciones.
 * ============================================================================
 */

import { pool } from '../config/database';
import type { Cancha, CreateCanchaDTO, UpdateCanchaDTO, CanchaFilters } from '../types/cancha.types';

export class CanchaService {
  /**
   * 1. OBTENER TODAS LAS CANCHAS
   * Permite listar canchas con filtros opcionales (disciplina, estado, búsqueda por nombre).
   * 
   * @param filters - Criterios de búsqueda opcionales provenientes del query string
   * @returns Lista de canchas encontradas en la BD
   */
  async getAllCanchas(filters: CanchaFilters = {}): Promise<Cancha[]> {
    let sql = `
      SELECT 
        id_cancha,
        nombre,
        disciplina,
        capacidad,
        precio_hora,
        estado,
        ubicacion,
        largo,
        ancho,
        hora_apertura,
        hora_cierre
      FROM cancha
      WHERE 1=1
    `;
    
    const values: any[] = [];

    // Filtro dinámico por disciplina
    if (filters.disciplina) {
      values.push(filters.disciplina.toLowerCase());
      sql += ` AND LOWER(disciplina) = $${values.length}`;
    }

    // Filtro dinámico por estado
    if (filters.estado) {
      values.push(filters.estado.toLowerCase());
      sql += ` AND LOWER(estado) = $${values.length}`;
    }

    // Filtro por búsqueda de texto en nombre o ubicación
    if (filters.search) {
      values.push(`%${filters.search.toLowerCase()}%`);
      sql += ` AND (LOWER(nombre) LIKE $${values.length} OR LOWER(ubicacion) LIKE $${values.length})`;
    }

    sql += ` ORDER BY id_cancha ASC`;

    const result = await pool.query(sql, values);
    return result.rows as Cancha[];
  }

  /**
   * 2. OBTENER CANCHA POR ID
   */
  async getCanchaById(id: number): Promise<Cancha | null> {
    const sql = `
      SELECT 
        id_cancha,
        nombre,
        disciplina,
        capacidad,
        precio_hora,
        estado,
        ubicacion,
        largo,
        ancho,
        hora_apertura,
        hora_cierre
      FROM cancha
      WHERE id_cancha = $1
    `;

    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Cancha;
  }

  /**
   * 3. CREAR UNA NUEVA CANCHA
   */
  async createCancha(data: CreateCanchaDTO): Promise<Cancha> {
    const sql = `
      INSERT INTO cancha (
        nombre,
        disciplina,
        capacidad,
        precio_hora,
        estado,
        ubicacion,
        largo,
        ancho,
        hora_apertura,
        hora_cierre
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING 
        id_cancha,
        nombre,
        disciplina,
        capacidad,
        precio_hora,
        estado,
        ubicacion,
        largo,
        ancho,
        hora_apertura,
        hora_cierre;
    `;

    const values = [
      data.nombre,
      data.disciplina ?? null,
      data.capacidad ?? null,
      data.precio_hora,
      data.estado ?? 'disponible',
      data.ubicacion ?? null,
      data.largo ?? null,
      data.ancho ?? null,
      data.hora_apertura ?? null,
      data.hora_cierre ?? null,
    ];

    const result = await pool.query(sql, values);
    return result.rows[0] as Cancha;
  }

  /**
   * 4. ACTUALIZAR PARCIALMENTE UNA CANCHA (PATCH)
   */
  async updateCancha(id: number, data: UpdateCanchaDTO): Promise<Cancha | null> {
    const fields = Object.keys(data) as (keyof UpdateCanchaDTO)[];
    
    if (fields.length === 0) {
      return await this.getCanchaById(id);
    }

    const setClauses: string[] = [];
    const values: any[] = [];

    fields.forEach((field) => {
      if (data[field] !== undefined) {
        values.push(data[field]);
        setClauses.push(`${field} = $${values.length}`);
      }
    });

    if (setClauses.length === 0) {
      return await this.getCanchaById(id);
    }

    values.push(id);
    const idParamPosition = values.length;

    const sql = `
      UPDATE cancha
      SET ${setClauses.join(', ')}
      WHERE id_cancha = $${idParamPosition}
      RETURNING 
        id_cancha,
        nombre,
        disciplina,
        capacidad,
        precio_hora,
        estado,
        ubicacion,
        largo,
        ancho,
        hora_apertura,
        hora_cierre;
    `;

    const result = await pool.query(sql, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Cancha;
  }

  /**
   * 5. ELIMINAR UNA CANCHA
   */
  async deleteCancha(id: number): Promise<boolean> {
    const sql = `
      DELETE FROM cancha
      WHERE id_cancha = $1
      RETURNING id_cancha;
    `;

    const result = await pool.query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const canchaService = new CanchaService();