"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagoModel = void 0;
const database_1 = require("../config/database");
exports.PagoModel = {
    crearPago: async (data) => {
        const query = `
            INSERT INTO pago 
            (id_reserva, monto, metodo_pago, tipo_registro, referencia_pasarela, nro_comprobante, estado, comprobante)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            data.id_reserva,
            data.monto,
            data.metodo_pago,
            data.tipo_registro || 'online',
            data.referencia_pasarela || null,
            data.nro_comprobante || null,
            data.estado || 'pendiente',
            data.comprobante || null
        ];
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    },
    obtenerPorReserva: async (id_reserva) => {
        const query = `
            SELECT p.*, u.nombre, u.apellido_paterno, u.correo
            FROM pago p
            JOIN reserva r ON p.id_reserva = r.id_reserva
            JOIN cliente cl ON r.id_cliente = cl.id_cliente
            JOIN usuario u ON cl.id_cliente = u.id_usuario
            WHERE p.id_reserva = $1;
        `;
        const result = await database_1.pool.query(query, [id_reserva]);
        return result.rows[0];
    },
    obtenerPorId: async (id_pago) => {
        const result = await database_1.pool.query('SELECT * FROM pago WHERE id_pago = $1', [id_pago]);
        return result.rows[0];
    },
    actualizarComprobante: async (id_pago, comprobante) => {
        const query = `
            UPDATE pago 
            SET comprobante = $1, estado = 'pendiente'
            WHERE id_pago = $2
            RETURNING *;
        `;
        const result = await database_1.pool.query(query, [comprobante, id_pago]);
        return result.rows[0];
    },
    verificarPago: async (id_pago, estado, motivo_rechazo) => {
        const query = `
            UPDATE pago 
            SET estado = $1, fecha_pago = now()
            ${motivo_rechazo ? `, referencia_pasarela = COALESCE($3, referencia_pasarela)` : ''}
            WHERE id_pago = $2
            RETURNING *;
        `;
        const values = motivo_rechazo ? [estado, id_pago, motivo_rechazo] : [estado, id_pago];
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    },
    obtenerHistorialPagos: async (id_cliente) => {
        const query = `
            SELECT p.*, r.fecha_reserva, r.hora_inicio, r.hora_fin, c.nombre as cancha_nombre
            FROM pago p
            JOIN reserva r ON p.id_reserva = r.id_reserva
            JOIN cancha c ON r.id_cancha = c.id_cancha
            WHERE r.id_cliente = $1
            ORDER BY p.fecha_pago DESC;
        `;
        const result = await database_1.pool.query(query, [id_cliente]);
        return result.rows;
    },
    obtenerPagosPendientes: async () => {
        const query = `
            SELECT p.*, 
                   u.nombre, u.apellido_paterno, u.correo,
                   c.nombre as cancha_nombre,
                   r.fecha_reserva, r.hora_inicio, r.hora_fin
            FROM pago p
            JOIN reserva r ON p.id_reserva = r.id_reserva
            JOIN cliente cl ON r.id_cliente = cl.id_cliente
            JOIN usuario u ON cl.id_cliente = u.id_usuario
            JOIN cancha c ON r.id_cancha = c.id_cancha
            WHERE p.estado = 'pendiente'
            ORDER BY p.fecha_pago DESC;
        `;
        const result = await database_1.pool.query(query);
        return result.rows;
    },
    eliminarPago: async (id_reserva) => {
        const query = `DELETE FROM pago WHERE id_reserva = $1 RETURNING *;`;
        const result = await database_1.pool.query(query, [id_reserva]);
        return result.rows[0];
    }
};
