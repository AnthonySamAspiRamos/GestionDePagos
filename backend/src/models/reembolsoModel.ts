import { pool } from '../config/database';

export const ReembolsoModel = {
    crear: async (data: {
        id_reserva: number;
        id_pago: number;
        monto_original: number;
        porcentaje_reembolso: number;
        monto_reembolsado: number;
        motivo_cancelacion?: string;
        horas_anticipacion: number;
    }) => {
        const query = `
            INSERT INTO reembolso 
            (id_reserva, id_pago, monto_original, porcentaje_reembolso, monto_reembolsado, motivo_cancelacion, horas_anticipacion, estado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
            RETURNING *;
        `;
        const values = [
            data.id_reserva,
            data.id_pago,
            data.monto_original,
            data.porcentaje_reembolso,
            data.monto_reembolsado,
            data.motivo_cancelacion || null,
            data.horas_anticipacion
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    obtenerPorReserva: async (id_reserva: number) => {
        const query = `
            SELECT r.*, p.monto as pago_monto, p.metodo_pago, p.estado as pago_estado
            FROM reembolso r
            JOIN pago p ON r.id_pago = p.id_pago
            WHERE r.id_reserva = $1;
        `;
        const result = await pool.query(query, [id_reserva]);
        return result.rows[0];
    },

    obtenerPendientes: async () => {
        const query = `
            SELECT r.*, 
                   p.monto as pago_monto, p.metodo_pago,
                   res.fecha_reserva, res.hora_inicio, res.hora_fin,
                   c.nombre as cancha_nombre,
                   u.nombre as cliente_nombre, u.apellido_paterno, u.correo
            FROM reembolso r
            JOIN pago p ON r.id_pago = p.id_pago
            JOIN reserva res ON r.id_reserva = res.id_reserva
            JOIN cancha c ON res.id_cancha = c.id_cancha
            JOIN cliente cl ON res.id_cliente = cl.id_cliente
            JOIN usuario u ON cl.id_cliente = u.id_usuario
            WHERE r.estado = 'pendiente'
            ORDER BY r.fecha_solicitud DESC;
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    obtenerPorCliente: async (id_cliente: number) => {
        const query = `
            SELECT r.*, 
                   p.monto as pago_monto, p.metodo_pago,
                   res.fecha_reserva, res.hora_inicio, res.hora_fin,
                   c.nombre as cancha_nombre
            FROM reembolso r
            JOIN pago p ON r.id_pago = p.id_pago
            JOIN reserva res ON r.id_reserva = res.id_reserva
            JOIN cancha c ON res.id_cancha = c.id_cancha
            WHERE res.id_cliente = $1
            ORDER BY r.fecha_solicitud DESC;
        `;
        const result = await pool.query(query, [id_cliente]);
        return result.rows;
    },

    procesar: async (id_reembolso: number, estado: string, notas_admin?: string) => {
        const query = `
            UPDATE reembolso 
            SET estado = $1, fecha_procesado = now(), notas_admin = COALESCE($2, notas_admin)
            WHERE id_reembolso = $3
            RETURNING *;
        `;
        const result = await pool.query(query, [estado, notas_admin || null, id_reembolso]);
        return result.rows[0];
    }
};
