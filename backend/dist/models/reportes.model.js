"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesModel = void 0;
const database_1 = require("../config/database");
exports.ReportesModel = {
    obtReportPagos: async (fechaInicio, fechaFin) => {
        const query = `
      SELECT
        estado,
        SUM(monto)::numeric AS total,
        count(estado)::int AS cantidad
      FROM pago
      WHERE fecha_pago >= $1::date AND fecha_pago < ($2::date + INTERVAL '1 day')
      GROUP BY estado;
    `;
        const values = [fechaInicio, fechaFin];
        const { rows } = await database_1.pool.query(query, values);
        return rows;
    },
    obtMetricasPagos: async (fechaInicio, fechaFin) => {
        const query = `
      SELECT
        metodo_pago as id,
        metodo_pago as label,
        COUNT(metodo_pago)::int AS cantidad,
        SUM(monto)::numeric AS monto
      FROM pago
      WHERE fecha_pago >= $1::date AND fecha_pago < ($2::date + INTERVAL '1 day') AND estado != 'reembolsado'
      GROUP BY metodo_pago;
    `;
        const values = [fechaInicio, fechaFin];
        const { rows } = await database_1.pool.query(query, values);
        return rows;
    },
    obtDataHeatMap: async (fechaInicio, fechaFin, idCancha) => {
        const query = `
      WITH horas_cancha AS (
        -- Generamos la matriz de días de la semana y bloques de hora
        SELECT d.dia_num, d.dia_nombre, h.hora
          FROM (
            VALUES 
              (1, 'Lunes'), (2, 'Martes'), (3, 'Miércoles'), 
              (4, 'Jueves'), (5, 'Viernes'), (6, 'Sábado'), (7, 'Domingo')
          ) AS d(dia_num, dia_nombre)
          CROSS JOIN (
            SELECT generate_series(8, 23) || ':00' AS hora -- Genera desde las 08:00 hasta las 23:00
          ) h
      ),
      reservas_filtradas AS (
        SELECT 
          EXTRACT(ISODOW FROM r.fecha_reserva) AS dia_num,
          TO_CHAR(r.hora_inicio, 'HH24:00') AS hora,
          COUNT(r.id_reserva) AS total_reservas
        FROM reserva r
        WHERE r.fecha_reserva >= $1::date 
          AND r.fecha_reserva < ($2::date + INTERVAL '1 day')
          AND r.estado IN ('confirmada', 'completada', 'pagada')
          -- Si $3 es NULL o 'todas', ignora el filtro de cancha
          AND ($3::text IS NULL OR $3::text = 'todas' OR r.id_cancha = $3::integer)
        GROUP BY EXTRACT(ISODOW FROM r.fecha_reserva), TO_CHAR(r.hora_inicio, 'HH24:00')
      )
      SELECT 
        hc.dia_nombre AS dia,
        hc.hora,
        COALESCE(rf.total_reservas, 0)::int AS reservas
      FROM horas_cancha hc
      LEFT JOIN reservas_filtradas rf 
        ON hc.dia_num = rf.dia_num AND hc.hora = rf.hora
      ORDER BY hc.dia_num, hc.hora;
    `;
        const values = [fechaInicio, fechaFin, idCancha];
        const { rows } = await database_1.pool.query(query, values);
        return rows;
    },
    listarCanchas: async () => {
        const query = `
      SELECT
        id_cancha,
        nombre,
        disciplina
      FROM cancha;
    `;
        const { rows } = await database_1.pool.query(query);
        return rows;
    },
    obtenerTotalReservas: async (fechaInicio, fechaFin, idCancha) => {
        const query = `
      SELECT COUNT(*)::int AS total
      FROM reserva
      WHERE fecha_reserva >= $1::date
        AND fecha_reserva < ($2::date + INTERVAL '1 day')
        AND estado IN ('confirmada', 'completada', 'pagada')
        AND ($3::text IS NULL OR $3::text = 'todas' OR id_cancha = $3::integer);
    `;
        const values = [fechaInicio, fechaFin, idCancha];
        const { rows } = await database_1.pool.query(query, values);
        return rows[0];
    },
    obtenerHorasOcupadas: async (fechaInicio, fechaFin, idCancha) => {
        const query = `
      SELECT COALESCE(
        SUM(
          EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) / 3600
        ), 0
      )::numeric(10,2) AS horas
      FROM reserva
      WHERE fecha_reserva >= $1::date
        AND fecha_reserva < ($2::date + INTERVAL '1 day')
        AND estado IN ('confirmada', 'completada', 'pagada')
        AND ($3::text IS NULL OR $3::text = 'todas' OR id_cancha = $3::integer);
    `;
        const values = [fechaInicio, fechaFin, idCancha];
        const { rows } = await database_1.pool.query(query, values);
        return rows[0];
    },
    obtenerMayorDemanda: async (fechaInicio, fechaFin, idCancha) => {
        const query = `
      SELECT 
        TO_CHAR(hora_inicio, 'HH24:00') AS hora,
        COUNT(*)::int AS reservas
      FROM reserva
      WHERE fecha_reserva >= $1::date
        AND fecha_reserva < ($2::date + INTERVAL '1 day')
        AND estado IN ('confirmada', 'completada', 'pagada')
        AND ($3::text IS NULL OR $3::text = 'todas' OR id_cancha = $3::integer)
      GROUP BY TO_CHAR(hora_inicio, 'HH24:00')
      ORDER BY reservas DESC
      LIMIT 1;
    `;
        const values = [fechaInicio, fechaFin, idCancha];
        const { rows } = await database_1.pool.query(query, values);
        return rows[0] || { hora: '-', reservas: 0 };
    },
    obtenerRentabilidadServicios: async (fechaInicio, fechaFin) => {
        const query = `
      SELECT
        s.nombre AS servicio,
        COUNT(*)::int AS cantidad,
        COALESCE(SUM(es.costo_contratado), 0)::numeric(10,2) AS ingresos
      FROM evento_servicio es
      INNER JOIN servicio s
        ON es.id_servicio = s.id_servicio
      INNER JOIN evento e
        ON es.id_evento = e.id_evento
      WHERE e.fecha_evento >= $1::date
        AND e.fecha_evento < ($2::date + INTERVAL '1 day')
      GROUP BY s.id_servicio, s.nombre
      ORDER BY ingresos DESC;
    `;
        const values = [fechaInicio, fechaFin];
        const { rows } = await database_1.pool.query(query, values);
        return rows;
    },
    obtenerComportamientoUsuarios: async (fechaInicio, fechaFin) => {
        const clientesVipQuery = `
    SELECT 
      u.id_usuario AS id_cliente,
      CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS cliente,
      u.correo,
      u.telefono,
      COUNT(r.id_reserva)::INTEGER AS total_reservas,
      COALESCE(SUM(p.monto), 0)::NUMERIC AS total_gastado
    FROM cliente c
    JOIN usuario u ON c.id_cliente = u.id_usuario
    JOIN reserva r ON c.id_cliente = r.id_cliente
    LEFT JOIN pago p ON r.id_reserva = p.id_reserva AND p.estado = 'pagado'
    WHERE r.fecha_reserva >= $1::date 
      AND r.fecha_reserva <= $2::date
    GROUP BY u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.telefono
    ORDER BY total_reservas DESC, total_gastado DESC
    LIMIT 10;
  `;
        const metricasReservasQuery = `
    SELECT
      COUNT(*)::INTEGER AS total_solicitadas,
      COUNT(*) FILTER (WHERE estado = 'confirmada')::INTEGER AS confirmadas,
      COUNT(*) FILTER (WHERE estado = 'cancelada')::INTEGER AS canceladas,
      COUNT(*) FILTER (WHERE estado = 'pendiente')::INTEGER AS pendientes,
      ROUND(
        (COUNT(*) FILTER (WHERE estado = 'cancelada')::numeric / NULLIF(COUNT(*), 0)) * 100, 2
      )::FLOAT AS porcentaje_cancelacion
    FROM reserva
    WHERE fecha_reserva >= $1::date 
      AND fecha_reserva <= $2::date;
  `;
        const nuevosRegistrosQuery = `
    SELECT COUNT(*)::INTEGER AS nuevos_clientes
    FROM cliente c
    JOIN usuario u ON c.id_cliente = u.id_usuario
    WHERE u.fecha_registro >= $1::timestamp 
      AND u.fecha_registro <= ($2::date + INTERVAL '1 day');
  `;
        const [vipRes, metricasRes, nuevosRes] = await Promise.all([
            database_1.pool.query(clientesVipQuery, [fechaInicio, fechaFin]),
            database_1.pool.query(metricasReservasQuery, [fechaInicio, fechaFin]),
            database_1.pool.query(nuevosRegistrosQuery, [fechaInicio, fechaFin])
        ]);
        return {
            clientesVip: vipRes.rows,
            metricas: metricasRes.rows[0],
            nuevosClientes: nuevosRes.rows[0].nuevos_clientes
        };
    }
};
