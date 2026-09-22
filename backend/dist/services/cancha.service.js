"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canchaService = exports.CanchaService = void 0;
const database_1 = require("../config/database");
class CanchaService {
    async getAllCanchas(filters = {}) {
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
        const values = [];
        if (filters.disciplina) {
            values.push(filters.disciplina.toLowerCase());
            sql += ` AND LOWER(disciplina) = $${values.length}`;
        }
        if (filters.estado) {
            values.push(filters.estado.toLowerCase());
            sql += ` AND LOWER(estado) = $${values.length}`;
        }
        if (filters.search) {
            values.push(`%${filters.search.toLowerCase()}%`);
            sql += ` AND (LOWER(nombre) LIKE $${values.length} OR LOWER(ubicacion) LIKE $${values.length})`;
        }
        sql += ` ORDER BY id_cancha ASC`;
        const result = await database_1.pool.query(sql, values);
        return result.rows;
    }
    async getCanchaById(id) {
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
        const result = await database_1.pool.query(sql, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    async getReservasDeCancha(id, filtro) {
        let sql = `
      SELECT id_reserva, fecha_reserva, hora_inicio, hora_fin, estado
      FROM reserva
      WHERE id_cancha = $1
        AND estado NOT IN ('cancelada', 'rechazada')
    `;
        const values = [id];
        if (filtro?.fecha) {
            values.push(filtro.fecha);
            sql += ` AND fecha_reserva = $${values.length}`;
        }
        else if (filtro?.mes) {
            values.push(filtro.mes);
            sql += ` AND TO_CHAR(fecha_reserva, 'YYYY-MM') = $${values.length}`;
        }
        sql += ` ORDER BY fecha_reserva ASC, hora_inicio ASC;`;
        const result = await database_1.pool.query(sql, values);
        return result.rows;
    }
    async createCancha(data) {
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
        const result = await database_1.pool.query(sql, values);
        return result.rows[0];
    }
    async updateCancha(id, data) {
        const fields = Object.keys(data);
        if (fields.length === 0) {
            return await this.getCanchaById(id);
        }
        const setClauses = [];
        const values = [];
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
        const result = await database_1.pool.query(sql, values);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    async deleteCancha(id) {
        const sql = `
      DELETE FROM cancha
      WHERE id_cancha = $1
      RETURNING id_cancha;
    `;
        const result = await database_1.pool.query(sql, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.CanchaService = CanchaService;
exports.canchaService = new CanchaService();
