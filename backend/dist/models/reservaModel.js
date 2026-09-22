"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaModel = void 0;
const database_1 = require("../config/database");
exports.ReservaModel = {
    crear: async (data) => {
        const query = `
            INSERT INTO reserva 
            (fecha_reserva, canal_reserva, hora_inicio, hora_fin, id_cliente, id_cancha, id_empleado, estado, observaciones)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [
            data.fecha_reserva,
            data.canal_reserva,
            data.hora_inicio,
            data.hora_fin,
            data.id_cliente,
            data.id_cancha,
            data.id_empleado || null,
            data.estado || 'pendiente',
            data.observaciones || null
        ];
        console.log('[MODEL] Ejecutando INSERT con values:', values);
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    },
    verificarDisponibilidad: async (id_cancha, fecha, hora_inicio, hora_fin) => {
        const query = `
            SELECT * FROM reserva 
            WHERE id_cancha = $1 
              AND fecha_reserva = $2 
              AND estado NOT IN ('cancelada', 'rechazada')
              AND (
                  (hora_inicio < $4 AND hora_fin > $3)
              );
        `;
        const result = await database_1.pool.query(query, [id_cancha, fecha, hora_inicio, hora_fin]);
        return result.rows.length > 0;
    },
    obtenerPorCliente: async (id_cliente) => {
        const query = `
            SELECT r.*, c.nombre as cancha_nombre, c.disciplina, c.precio_hora
            FROM reserva r
            JOIN cancha c ON r.id_cancha = c.id_cancha
            WHERE r.id_cliente = $1
            ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC;
        `;
        const result = await database_1.pool.query(query, [id_cliente]);
        return result.rows;
    },
    obtenerTodas: async (filtros) => {
        let query = `
            SELECT r.*, c.nombre as cancha_nombre, u.nombre as cliente_nombre, u.apellido_paterno
            FROM reserva r
            JOIN cancha c ON r.id_cancha = c.id_cancha
            JOIN cliente cl ON r.id_cliente = cl.id_cliente
            JOIN usuario u ON cl.id_cliente = u.id_usuario
            WHERE 1=1
        `;
        const values = [];
        let contador = 1;
        if (filtros?.estado) {
            query += ` AND r.estado = $${contador}`;
            values.push(filtros.estado);
            contador++;
        }
        if (filtros?.fecha) {
            query += ` AND r.fecha_reserva = $${contador}`;
            values.push(filtros.fecha);
            contador++;
        }
        query += ` ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC;`;
        const result = await database_1.pool.query(query, values);
        return result.rows;
    },
    obtenerPorId: async (id) => {
        const query = `SELECT * FROM reserva WHERE id_reserva = $1`;
        const result = await database_1.pool.query(query, [id]);
        return result.rows[0];
    },
    actualizarEstado: async (id_reserva, estado, observaciones) => {
        const query = `
            UPDATE reserva 
            SET estado = $1, fecha_gestion = now(), observaciones = COALESCE($2, observaciones)
            WHERE id_reserva = $3
            RETURNING *;
        `;
        const result = await database_1.pool.query(query, [estado, observaciones, id_reserva]);
        return result.rows[0];
    },
    actualizar: async (id_reserva, data) => {
        const query = `
            UPDATE reserva 
            SET 
                fecha_reserva = COALESCE($1, fecha_reserva),
                hora_inicio = COALESCE($2, hora_inicio),
                hora_fin = COALESCE($3, hora_fin),
                id_cancha = COALESCE($4, id_cancha),
                observaciones = COALESCE($5, observaciones),
                fecha_gestion = now()
            WHERE id_reserva = $6
            RETURNING *;
        `;
        const values = [
            data.fecha_reserva || null,
            data.hora_inicio || null,
            data.hora_fin || null,
            data.id_cancha || null,
            data.observaciones || null,
            id_reserva
        ];
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    },
    verificarDisponibilidadExcluyendo: async (id_cancha, fecha, hora_inicio, hora_fin, id_reserva_excluir) => {
        const query = `
            SELECT * FROM reserva 
            WHERE id_cancha = $1 
              AND fecha_reserva = $2 
              AND id_reserva != $5
              AND estado NOT IN ('cancelada', 'rechazada')
              AND (hora_inicio < $4 AND hora_fin > $3);
        `;
        const result = await database_1.pool.query(query, [id_cancha, fecha, hora_inicio, hora_fin, id_reserva_excluir]);
        return result.rows.length > 0;
    }
};
