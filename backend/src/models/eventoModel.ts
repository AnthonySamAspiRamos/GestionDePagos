import { pool } from '../config/database';
import { PoolClient } from 'pg';

export interface Servicio {
    id_servicio: number;
    nombre: string;
    tipo_servicio?: string;
    precio_referencia?: number;
    estado: string;
}

export interface Evento {
    id_evento?: number;
    nombre_evento: string;
    descripcion?: string;
    fecha_evento: string;
    hora_inicio: string;
    hora_fin: string;
    cupo_maximo?: number;
    tipo_evento?: string;
    motivo_cancelacion?: string;
    fecha_cancelacion?: string;
    id_usuario_cancelacion?: number;
    estado?: string;
    id_administrador: number;
    fecha_creacion?: string;
    // Agregados para el frontend
    cancha_asignada?: any;
    servicios_adicionales?: any[];
    costo_total?: number;
    cupos_restantes?: number;
}

export class EventoModel {
    static async obtenerServiciosActivos(): Promise<Servicio[]> {
        const query = `SELECT * FROM servicio WHERE estado = 'activo' ORDER BY nombre ASC`;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async inicializarServicios(): Promise<void> {
        const queryCheck = `SELECT COUNT(*) FROM servicio`;
        const { rows } = await pool.query(queryCheck);
        if (parseInt(rows[0].count) === 0) {
            const queryInsert = `
                INSERT INTO servicio (nombre, tipo_servicio, precio_referencia, estado) VALUES
                ('Arbitraje', 'Personal', 50.00, 'activo'),
                ('Alquiler de Balones', 'Equipamiento', 10.00, 'activo'),
                ('Catering', 'Alimentación', 200.00, 'activo'),
                ('Animación', 'Entretenimiento', 100.00, 'activo'),
                ('Fotografía', 'Multimedia', 150.00, 'activo')
            `;
            await pool.query(queryInsert);
        }
    }

    static async verificarDisponibilidadCancha(
        id_cancha: number,
        fecha: string,
        hora_inicio: string,
        hora_fin: string,
        client?: PoolClient,
        id_evento_excluir?: number
    ): Promise<boolean> {
        const db = client || pool;
        
        const queryReservas = `
            SELECT id_reserva FROM reserva
            WHERE id_cancha = $1 
              AND fecha_reserva = $2 
              AND estado IN ('pendiente', 'confirmada')
              AND ($3 < hora_fin AND $4 > hora_inicio)
        `;
        const resReservas = await db.query(queryReservas, [id_cancha, fecha, hora_inicio, hora_fin]);
        if (resReservas.rows.length > 0) return false;

        const queryEventos = `
            SELECT e.id_evento FROM evento e
            JOIN evento_cancha ec ON e.id_evento = ec.id_evento
            WHERE ec.id_cancha = $1
              AND e.fecha_evento = $2
              AND e.estado != 'cancelado'
              AND ($3 < e.hora_fin AND $4 > e.hora_inicio)
              ${id_evento_excluir ? 'AND e.id_evento != $5' : ''}
        `;
        const paramsEventos = id_evento_excluir
            ? [id_cancha, fecha, hora_inicio, hora_fin, id_evento_excluir]
            : [id_cancha, fecha, hora_inicio, hora_fin];
        const resEventos = await db.query(queryEventos, paramsEventos);
        if (resEventos.rows.length > 0) return false;

        return true;
    }

    static async crearEvento(
        evento: Evento,
        id_cancha: number,
        servicios: { id_servicio: number, costo_contratado: number }[]
    ): Promise<Evento> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const insertEventoQuery = `
                INSERT INTO evento (
                    nombre_evento, descripcion, fecha_evento, hora_inicio, hora_fin, 
                    cupo_maximo, tipo_evento, id_administrador, estado
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'programado') RETURNING *
            `;
            const valuesEvento = [
                evento.nombre_evento,
                evento.descripcion || '',
                evento.fecha_evento,
                evento.hora_inicio,
                evento.hora_fin,
                evento.cupo_maximo || 0,
                evento.tipo_evento || 'Otro',
                evento.id_administrador
            ];
            const { rows: eventoRows } = await client.query(insertEventoQuery, valuesEvento);
            const nuevoEvento = eventoRows[0];

            const insertCanchaQuery = `
                INSERT INTO evento_cancha (id_evento, id_cancha)
                VALUES ($1, $2)
            `;
            await client.query(insertCanchaQuery, [nuevoEvento.id_evento, id_cancha]);

            if (servicios && servicios.length > 0) {
                const insertServicioQuery = `
                    INSERT INTO evento_servicio (id_evento, id_servicio, costo_contratado)
                    VALUES ($1, $2, $3)
                `;
                for (const serv of servicios) {
                    await client.query(insertServicioQuery, [nuevoEvento.id_evento, serv.id_servicio, serv.costo_contratado]);
                }
            }

            await client.query('COMMIT');
            return nuevoEvento;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async obtenerEventos(filtros?: { tipo?: string, fecha?: string, id_cancha?: string, disponibles?: boolean }): Promise<Evento[]> {
        let query = `
            SELECT e.*, 
                   c.id_cancha, c.nombre AS cancha_nombre, c.precio_hora, c.disciplina, c.ubicacion,
                   (
                       SELECT COALESCE(SUM(costo_contratado), 0)
                       FROM evento_servicio es WHERE es.id_evento = e.id_evento
                   ) as total_servicios,
                   (
                       SELECT COUNT(*) FROM inscripcion i WHERE i.id_evento = e.id_evento AND i.estado != 'cancelada'
                   ) as inscritos
            FROM evento e
            LEFT JOIN evento_cancha ec ON e.id_evento = ec.id_evento
            LEFT JOIN cancha c ON ec.id_cancha = c.id_cancha
            WHERE 1=1
        `;
        const values: any[] = [];
        let index = 1;

        if (filtros?.tipo) {
            query += ` AND e.tipo_evento = $${index++}`;
            values.push(filtros.tipo);
        }
        if (filtros?.fecha) {
            query += ` AND e.fecha_evento = $${index++}`;
            values.push(filtros.fecha);
        }
        if (filtros?.id_cancha) {
            query += ` AND c.id_cancha = $${index++}`;
            values.push(filtros.id_cancha);
        }
        if (filtros?.disponibles) {
            query += ` AND e.estado = 'programado' AND e.fecha_evento >= CURRENT_DATE`;
        }

        query += ` ORDER BY e.fecha_evento DESC, e.hora_inicio ASC`;

        const { rows } = await pool.query(query, values);
        
        for (const row of rows) {
            const sQuery = `
                SELECT s.id_servicio, s.nombre, es.costo_contratado
                FROM evento_servicio es
                JOIN servicio s ON es.id_servicio = s.id_servicio
                WHERE es.id_evento = $1
            `;
            const sRes = await pool.query(sQuery, [row.id_evento]);
            row.servicios_adicionales = sRes.rows;
            
            const startDate = new Date(`1970-01-01T${row.hora_inicio}Z`);
            const endDate = new Date(`1970-01-01T${row.hora_fin}Z`);
            const horasDecimal = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
            const costoCancha = horasDecimal * parseFloat(row.precio_hora || 0);
            const costoServicios = parseFloat(row.total_servicios || 0);
            
            row.costo_total = costoCancha + costoServicios;
            row.cupos_restantes = row.cupo_maximo - parseInt(row.inscritos);
            row.cancha_asignada = {
                id_cancha: row.id_cancha,
                nombre: row.cancha_nombre,
                disciplina: row.disciplina,
                ubicacion: row.ubicacion,
                precio_hora: row.precio_hora
            };
        }

        return rows;
    }

    static async obtenerEventoPorId(id_evento: number): Promise<Evento | undefined> {
        const query = `
            SELECT e.*, ec.id_cancha
            FROM evento e
            LEFT JOIN evento_cancha ec ON e.id_evento = ec.id_evento
            WHERE e.id_evento = $1
        `;
        const { rows } = await pool.query(query, [id_evento]);
        return rows[0];
    }

    static async actualizarEvento(
        id_evento: number,
        evento: Partial<Evento>,
        id_cancha: number,
        servicios: { id_servicio: number, costo_contratado: number }[]
    ): Promise<Evento> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const actualRes = await client.query(`SELECT * FROM evento WHERE id_evento = $1`, [id_evento]);
            if (actualRes.rows.length === 0) throw new Error('Evento no encontrado');
            const actual = actualRes.rows[0];

            if (actual.estado === 'cancelado') {
                throw new Error('No se puede editar un evento cancelado');
            }

            const finActual = new Date(`${actual.fecha_evento.toISOString().substring(0, 10)}T${actual.hora_fin}`);
            if (finActual <= new Date()) {
                throw new Error('No se puede editar un evento que ya ocurrió');
            }

            const inscritosRes = await client.query(
                `SELECT COUNT(*) as inscritos FROM inscripcion WHERE id_evento = $1 AND estado != 'cancelada'`,
                [id_evento]
            );
            const inscritos = parseInt(inscritosRes.rows[0].inscritos);
            if ((evento.cupo_maximo || 0) < inscritos) {
                throw new Error(`El aforo no puede ser menor a los ${inscritos} inscritos actuales.`);
            }

            const updateEventoQuery = `
                UPDATE evento SET
                    nombre_evento = $1,
                    descripcion = $2,
                    fecha_evento = $3,
                    hora_inicio = $4,
                    hora_fin = $5,
                    cupo_maximo = $6,
                    tipo_evento = $7
                WHERE id_evento = $8 RETURNING *
            `;
            const values = [
                evento.nombre_evento,
                evento.descripcion || '',
                evento.fecha_evento,
                evento.hora_inicio,
                evento.hora_fin,
                evento.cupo_maximo || 0,
                evento.tipo_evento || 'otro',
                id_evento
            ];
            const { rows: eventoRows } = await client.query(updateEventoQuery, values);
            const eventoActualizado = eventoRows[0];

            // Reemplazar cancha asignada
            await client.query(`DELETE FROM evento_cancha WHERE id_evento = $1`, [id_evento]);
            await client.query(`INSERT INTO evento_cancha (id_evento, id_cancha) VALUES ($1, $2)`, [id_evento, id_cancha]);

            // Reemplazar servicios adicionales
            await client.query(`DELETE FROM evento_servicio WHERE id_evento = $1`, [id_evento]);
            if (servicios && servicios.length > 0) {
                const insertServicioQuery = `
                    INSERT INTO evento_servicio (id_evento, id_servicio, costo_contratado)
                    VALUES ($1, $2, $3)
                `;
                for (const serv of servicios) {
                    await client.query(insertServicioQuery, [id_evento, serv.id_servicio, serv.costo_contratado]);
                }
            }

            await client.query('COMMIT');
            return eventoActualizado;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async reprogramarEvento(
        id_evento: number,
        evento: Partial<Evento>,
        id_cancha: number,
        servicios: { id_servicio: number, costo_contratado: number }[]
    ): Promise<Evento> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const actualRes = await client.query(`SELECT * FROM evento WHERE id_evento = $1`, [id_evento]);
            if (actualRes.rows.length === 0) throw new Error('Evento no encontrado');
            const actual = actualRes.rows[0];

            if (actual.estado !== 'cancelado') {
                throw new Error('Solo se pueden reprogramar eventos cancelados');
            }

            const updateEventoQuery = `
                UPDATE evento SET
                    nombre_evento = $1,
                    descripcion = $2,
                    fecha_evento = $3,
                    hora_inicio = $4,
                    hora_fin = $5,
                    cupo_maximo = $6,
                    tipo_evento = $7,
                    estado = 'programado',
                    motivo_cancelacion = NULL,
                    fecha_cancelacion = NULL,
                    id_usuario_cancelacion = NULL
                WHERE id_evento = $8 RETURNING *
            `;
            const values = [
                evento.nombre_evento,
                evento.descripcion || '',
                evento.fecha_evento,
                evento.hora_inicio,
                evento.hora_fin,
                evento.cupo_maximo || 0,
                evento.tipo_evento || 'otro',
                id_evento
            ];
            const { rows: eventoRows } = await client.query(updateEventoQuery, values);
            const eventoReprogramado = eventoRows[0];

            await client.query(`DELETE FROM evento_cancha WHERE id_evento = $1`, [id_evento]);
            await client.query(`INSERT INTO evento_cancha (id_evento, id_cancha) VALUES ($1, $2)`, [id_evento, id_cancha]);

            await client.query(`DELETE FROM evento_servicio WHERE id_evento = $1`, [id_evento]);
            if (servicios && servicios.length > 0) {
                const insertServicioQuery = `
                    INSERT INTO evento_servicio (id_evento, id_servicio, costo_contratado)
                    VALUES ($1, $2, $3)
                `;
                for (const serv of servicios) {
                    await client.query(insertServicioQuery, [id_evento, serv.id_servicio, serv.costo_contratado]);
                }
            }

            await client.query('COMMIT');
            return eventoReprogramado;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }    

    static async cancelarEvento(id_evento: number, motivo_cancelacion: string, id_usuario_cancelacion?: number): Promise<any> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const actualRes = await client.query(
                `SELECT fecha_evento, hora_fin, estado FROM evento WHERE id_evento = $1`,
                [id_evento]
            );
            if (actualRes.rows.length === 0) throw new Error("Evento no encontrado");
            const actual = actualRes.rows[0];

            if (actual.estado === 'cancelado') {
                throw new Error("El evento ya se encuentra cancelado");
            }

            const finEvento = new Date(`${actual.fecha_evento.toISOString().substring(0, 10)}T${actual.hora_fin}`);
            if (finEvento <= new Date()) {
                throw new Error("No se puede cancelar un evento que ya ocurrió");
            }
            
            const updateQuery = `
                UPDATE evento 
                SET estado = 'cancelado', motivo_cancelacion = $1, fecha_cancelacion = NOW(), id_usuario_cancelacion = $3
                WHERE id_evento = $2 RETURNING *
            `;
            const { rows } = await client.query(updateQuery, [motivo_cancelacion, id_evento, id_usuario_cancelacion || null]);
            const evento = rows[0];

            const inscritosQuery = `
                SELECT c.id_cliente, u.nombre, u.correo 
                FROM inscripcion i
                JOIN cliente c ON i.id_cliente = c.id_cliente
                JOIN usuario u ON c.id_cliente = u.id_usuario
                WHERE i.id_evento = $1 AND i.estado = 'confirmada'
            `;
            const inscritosRes = await client.query(inscritosQuery, [id_evento]);

            const updateInscripcion = `
                UPDATE inscripcion SET estado = 'cancelada_por_evento', fecha_cancelacion = NOW()
                WHERE id_evento = $1 AND estado = 'confirmada'
            `;
            await client.query(updateInscripcion, [id_evento]);

            await client.query('COMMIT');
            
            return {
                evento,
                afectados: inscritosRes.rows
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}