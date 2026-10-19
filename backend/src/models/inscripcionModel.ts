import { pool } from '../config/database';

export class InscripcionModel {
    static async crearInscripcion(id_cliente: number, id_evento: number): Promise<any> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const eventoRes = await client.query(`SELECT fecha_evento, hora_inicio, hora_fin, cupo_maximo, estado FROM evento WHERE id_evento = $1`, [id_evento]);
            if (eventoRes.rows.length === 0) throw new Error("Evento no encontrado");
            const evento = eventoRes.rows[0];
            if (evento.estado === 'cancelado') throw new Error("El evento está cancelado");

            const finEvento = new Date(`${evento.fecha_evento.toISOString().substring(0, 10)}T${evento.hora_fin}`);
            if (finEvento <= new Date()) {
                throw new Error("No es posible inscribirse a un evento que ya ocurrió");
            }
            
            const cuposRes = await client.query(`SELECT COUNT(*) as inscritos FROM inscripcion WHERE id_evento = $1 AND estado != 'cancelada'`, [id_evento]);
            const inscritos = parseInt(cuposRes.rows[0].inscritos);
            if (inscritos >= evento.cupo_maximo) throw new Error("Se ha alcanzado el aforo máximo para este evento");

            const traslapeReservas = await client.query(`
                SELECT id_reserva FROM reserva
                WHERE id_cliente = $1 
                  AND fecha_reserva = $2 
                  AND estado IN ('pendiente', 'confirmada')
                  AND ($3 < hora_fin AND $4 > hora_inicio)
            `, [id_cliente, evento.fecha_evento, evento.hora_inicio, evento.hora_fin]);
            if (traslapeReservas.rows.length > 0) throw new Error("Tienes un cruce de horario con una reserva existente");

            const traslapeEventos = await client.query(`
                SELECT i.id_inscripcion FROM inscripcion i
                JOIN evento e ON i.id_evento = e.id_evento
                WHERE i.id_cliente = $1 
                  AND e.fecha_evento = $2
                  AND i.estado != 'cancelada'
                  AND i.id_evento != $5
                  AND ($3 < e.hora_fin AND $4 > e.hora_inicio)
            `, [id_cliente, evento.fecha_evento, evento.hora_inicio, evento.hora_fin, id_evento]);
            if (traslapeEventos.rows.length > 0) throw new Error("Tienes un cruce de horario con otra inscripción a un evento");

            const previa = await client.query(`SELECT id_inscripcion FROM inscripcion WHERE id_cliente = $1 AND id_evento = $2`, [id_cliente, id_evento]);
            let inscripcion;
            if (previa.rows.length > 0) {
                const res = await client.query(`UPDATE inscripcion SET estado = 'confirmada', fecha_inscripcion = NOW(), fecha_cancelacion = NULL WHERE id_cliente = $1 AND id_evento = $2 RETURNING *`, [id_cliente, id_evento]);
                inscripcion = res.rows[0];
            } else {
                const res = await client.query(`INSERT INTO inscripcion (id_cliente, id_evento, estado) VALUES ($1, $2, 'confirmada') RETURNING *`, [id_cliente, id_evento]);
                inscripcion = res.rows[0];
            }

            await client.query('COMMIT');
            return inscripcion;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async cancelarInscripcion(id_cliente: number, id_evento: number): Promise<any> {
        const eventoRes = await pool.query(`SELECT fecha_evento, hora_inicio, hora_fin FROM evento WHERE id_evento = $1`, [id_evento]);
        if (eventoRes.rows.length === 0) throw new Error("Evento no encontrado");

        const evento = eventoRes.rows[0];
        const finEvento = new Date(`${evento.fecha_evento.toISOString().substring(0, 10)}T${evento.hora_fin}`);
        if (finEvento <= new Date()) {
            throw new Error("No se puede cancelar la inscripción a un evento que ya ocurrió");
        }
        
        const res = await pool.query(`
            UPDATE inscripcion 
            SET estado = 'cancelada', fecha_cancelacion = NOW() 
            WHERE id_cliente = $1 AND id_evento = $2 AND estado = 'confirmada'
            RETURNING *
        `, [id_cliente, id_evento]);

        if (res.rows.length === 0) throw new Error("Inscripción no encontrada o ya cancelada");
        return res.rows[0];
    }

    static async obtenerInscripcionesCliente(id_cliente: number): Promise<any[]> {
        const query = `
            SELECT i.id_inscripcion, i.estado as estado_inscripcion, i.fecha_inscripcion, 
                   e.id_evento, e.nombre_evento, e.fecha_evento, e.hora_inicio, e.hora_fin, e.tipo_evento, e.estado as estado_evento,
                   c.nombre as cancha_nombre
            FROM inscripcion i
            JOIN evento e ON i.id_evento = e.id_evento
            LEFT JOIN evento_cancha ec ON e.id_evento = ec.id_evento
            LEFT JOIN cancha c ON ec.id_cancha = c.id_cancha
            WHERE i.id_cliente = $1
            ORDER BY e.fecha_evento DESC, e.hora_inicio DESC
        `;
        const { rows } = await pool.query(query, [id_cliente]);
        return rows;
    }
}