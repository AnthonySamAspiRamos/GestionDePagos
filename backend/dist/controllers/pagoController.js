"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagoController = void 0;
const reservaModel_1 = require("../models/reservaModel");
const pagoModel_1 = require("../models/pagoModel");
const database_1 = require("../config/database");
const METODOS_VALIDOS = ['efectivo', 'qr', 'transferencia'];
const esRolStaff = (rol) => ['admin', 'administrador', 'empleado'].includes(String(rol || '').toLowerCase());
const subirComprobanteImgBB = async (file) => {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
        throw new Error('Falta configurar IMGBB_API_KEY en el backend');
    }
    const formData = new FormData();
    formData.append('image', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, { method: 'POST', body: formData });
    const result = await response.json();
    if (!response.ok || !result.success || !result.data?.url) {
        throw new Error(result.error?.message || 'ImgBB no pudo guardar el comprobante');
    }
    return result.data.url;
};
exports.PagoController = {
    procesarPagoConComprobante: async (req, res) => {
        try {
            const { id_reserva, metodo_pago, nro_comprobante } = req.body;
            if (!id_reserva || !metodo_pago) {
                return res.status(400).json({ error: 'id_reserva y metodo_pago son obligatorios' });
            }
            if (!METODOS_VALIDOS.includes(metodo_pago)) {
                return res.status(400).json({
                    error: `Método de pago inválido. Opciones: ${METODOS_VALIDOS.join(', ')}`
                });
            }
            const requiereComprobante = ['qr', 'transferencia'].includes(metodo_pago);
            if (req.file && !requiereComprobante) {
                return res.status(400).json({
                    error: 'El comprobante solo se admite para pagos QR o transferencia'
                });
            }
            const reserva = await reservaModel_1.ReservaModel.obtenerPorId(Number(id_reserva));
            if (!reserva) {
                return res.status(404).json({ error: 'La reserva no existe' });
            }
            const pagoExistente = await pagoModel_1.PagoModel.obtenerPorReserva(Number(id_reserva));
            if (pagoExistente) {
                return res.status(400).json({ error: 'Esta reserva ya tiene un pago registrado' });
            }
            const cancha = await database_1.pool.query('SELECT precio_hora FROM cancha WHERE id_cancha = $1', [reserva.id_cancha]);
            if (cancha.rows.length === 0) {
                return res.status(404).json({ error: 'Cancha no encontrada' });
            }
            const precioHora = parseFloat(cancha.rows[0].precio_hora);
            const horaInicio = new Date(`2000-01-01T${reserva.hora_inicio}`);
            const horaFin = new Date(`2000-01-01T${reserva.hora_fin}`);
            const horas = (horaFin.getTime() - horaInicio.getTime()) / (1000 * 60 * 60);
            const monto = precioHora * horas;
            const comprobante = req.file ? await subirComprobanteImgBB(req.file) : null;
            const pago = await pagoModel_1.PagoModel.crearPago({
                id_reserva: Number(id_reserva),
                monto,
                metodo_pago,
                tipo_registro: metodo_pago === 'efectivo' ? 'presencial' : 'online',
                referencia_pasarela: nro_comprobante || null,
                nro_comprobante: nro_comprobante || null,
                comprobante,
                estado: 'pendiente'
            });
            await reservaModel_1.ReservaModel.actualizarEstado(Number(id_reserva), metodo_pago === 'efectivo' ? 'pendiente' : 'pendiente_pago');
            res.status(201).json({
                success: true,
                message: metodo_pago === 'efectivo'
                    ? 'Pago en efectivo registrado. La reserva permanece pendiente.'
                    : 'Pago registrado. La reserva está pendiente de verificación.',
                data: pago
            });
        }
        catch (error) {
            console.error('Error en procesarPagoConComprobante:', error);
            res.status(500).json({ error: error.message || 'Error al procesar el pago' });
        }
    },
    procesarPago: async (req, res) => {
        try {
            const { id_reserva, metodo_pago, nro_comprobante, referencia_pasarela } = req.body;
            if (!id_reserva || !metodo_pago) {
                return res.status(400).json({ error: 'id_reserva y metodo_pago son obligatorios' });
            }
            if (!METODOS_VALIDOS.includes(metodo_pago)) {
                return res.status(400).json({
                    error: `Método de pago inválido. Opciones: ${METODOS_VALIDOS.join(', ')}`
                });
            }
            const reserva = await reservaModel_1.ReservaModel.obtenerPorId(Number(id_reserva));
            if (!reserva) {
                return res.status(404).json({ error: 'La reserva no existe' });
            }
            const pagoExistente = await pagoModel_1.PagoModel.obtenerPorReserva(Number(id_reserva));
            if (pagoExistente) {
                return res.status(400).json({ error: 'Esta reserva ya tiene un pago registrado' });
            }
            const cancha = await database_1.pool.query('SELECT precio_hora FROM cancha WHERE id_cancha = $1', [reserva.id_cancha]);
            if (cancha.rows.length === 0) {
                return res.status(404).json({ error: 'Cancha no encontrada' });
            }
            const precioHora = parseFloat(cancha.rows[0].precio_hora);
            const horaInicio = new Date(`2000-01-01T${reserva.hora_inicio}`);
            const horaFin = new Date(`2000-01-01T${reserva.hora_fin}`);
            const horas = (horaFin.getTime() - horaInicio.getTime()) / (1000 * 60 * 60);
            const monto = precioHora * horas;
            const pago = await pagoModel_1.PagoModel.crearPago({
                id_reserva: Number(id_reserva),
                monto,
                metodo_pago,
                tipo_registro: metodo_pago === 'efectivo' ? 'presencial' : 'online',
                referencia_pasarela: referencia_pasarela || null,
                nro_comprobante: nro_comprobante || null,
                estado: 'pendiente'
            });
            await reservaModel_1.ReservaModel.actualizarEstado(Number(id_reserva), metodo_pago === 'efectivo' ? 'pendiente' : 'pendiente_pago');
            res.status(201).json({
                success: true,
                message: metodo_pago === 'efectivo'
                    ? 'Pago en efectivo registrado. La reserva permanece pendiente.'
                    : 'Pago registrado. La reserva está pendiente de verificación.',
                data: pago
            });
        }
        catch (error) {
            console.error('Error en procesarPago:', error);
            res.status(500).json({ error: error.message || 'Error al procesar el pago' });
        }
    },
    subirComprobante: async (req, res) => {
        try {
            const { id_pago } = req.params;
            const { id_usuario } = req.usuario;
            if (!req.file) {
                return res.status(400).json({ error: 'No se subió ningún archivo' });
            }
            const pago = await pagoModel_1.PagoModel.obtenerPorId(Number(id_pago));
            if (!pago) {
                return res.status(404).json({ error: 'Pago no encontrado' });
            }
            const reserva = await reservaModel_1.ReservaModel.obtenerPorId(pago.id_reserva);
            if (!reserva || reserva.id_cliente !== id_usuario) {
                return res.status(403).json({ error: 'No autorizado' });
            }
            if (!['qr', 'transferencia'].includes(pago.metodo_pago)) {
                return res.status(400).json({ error: 'Solo los pagos QR o transferencia admiten comprobante' });
            }
            const comprobante = await subirComprobanteImgBB(req.file);
            const pagoActualizado = await pagoModel_1.PagoModel.actualizarComprobante(Number(id_pago), comprobante);
            res.json({
                success: true,
                message: 'Comprobante subido correctamente. Tu reserva será verificada pronto.',
                data: pagoActualizado
            });
        }
        catch (error) {
            console.error('Error en subirComprobante:', error);
            res.status(500).json({ error: error.message || 'Error al subir comprobante' });
        }
    },
    verificarPago: async (req, res) => {
        try {
            const { id_pago } = req.params;
            const { estado, motivo_rechazo } = req.body;
            if (!estado || !['pagado', 'rechazado'].includes(estado)) {
                return res.status(400).json({ error: 'Estado inválido. Use "pagado" o "rechazado"' });
            }
            const pago = await pagoModel_1.PagoModel.verificarPago(Number(id_pago), estado, motivo_rechazo || null);
            if (!pago) {
                return res.status(404).json({ error: 'Pago no encontrado' });
            }
            if (estado === 'pagado') {
                await reservaModel_1.ReservaModel.actualizarEstado(pago.id_reserva, 'confirmada');
            }
            else if (estado === 'rechazado') {
                await reservaModel_1.ReservaModel.actualizarEstado(pago.id_reserva, 'pendiente_pago');
            }
            res.json({
                success: true,
                message: `Pago ${estado === 'pagado' ? 'aprobado y reserva confirmada' : 'rechazado'}`
            });
        }
        catch (error) {
            console.error('Error en verificarPago:', error);
            res.status(500).json({ error: error.message || 'Error al verificar pago' });
        }
    },
    historialPagos: async (req, res) => {
        try {
            const { id_usuario } = req.usuario;
            const pagos = await pagoModel_1.PagoModel.obtenerHistorialPagos(id_usuario);
            res.json({ success: true, data: pagos });
        }
        catch (error) {
            console.error('Error en historialPagos:', error);
            res.status(500).json({ error: 'Error al obtener historial de pagos' });
        }
    },
    pagosPorReserva: async (req, res) => {
        try {
            const idReserva = Number(req.params.id_reserva);
            const { id_usuario, rol } = req.usuario;
            if (!Number.isInteger(idReserva) || idReserva <= 0) {
                return res.status(400).json({ error: 'ID de reserva inválido' });
            }
            const reserva = await reservaModel_1.ReservaModel.obtenerPorId(idReserva);
            if (!reserva) {
                return res.status(404).json({ error: 'La reserva no existe' });
            }
            if (Number(reserva.id_cliente) !== Number(id_usuario) && !esRolStaff(rol)) {
                return res.status(403).json({ error: 'No autorizado' });
            }
            const pago = await pagoModel_1.PagoModel.obtenerPorReserva(idReserva);
            res.json({ success: true, data: pago ? [pago] : [] });
        }
        catch (error) {
            console.error('Error en pagosPorReserva:', error);
            res.status(500).json({ error: 'Error al obtener los pagos de la reserva' });
        }
    },
    pagosPendientes: async (_req, res) => {
        try {
            const pagos = await pagoModel_1.PagoModel.obtenerPagosPendientes();
            res.json({ success: true, data: pagos });
        }
        catch (error) {
            console.error('Error en pagosPendientes:', error);
            res.status(500).json({ error: 'Error al obtener pagos pendientes' });
        }
    },
    reintentarPago: async (req, res) => {
        try {
            const { id_reserva } = req.params;
            const { id_usuario } = req.usuario;
            const reserva = await reservaModel_1.ReservaModel.obtenerPorId(Number(id_reserva));
            if (!reserva || reserva.id_cliente !== id_usuario) {
                return res.status(403).json({ error: 'No autorizado' });
            }
            const pagoExistente = await pagoModel_1.PagoModel.obtenerPorReserva(Number(id_reserva));
            if (pagoExistente && pagoExistente.estado !== 'rechazado') {
                return res.status(400).json({ error: 'Esta reserva no tiene un pago rechazado' });
            }
            if (pagoExistente) {
                await pagoModel_1.PagoModel.eliminarPago(Number(id_reserva));
            }
            await reservaModel_1.ReservaModel.actualizarEstado(Number(id_reserva), 'pendiente');
            res.json({
                success: true,
                message: 'Puedes volver a intentar el pago desde tu reserva.'
            });
        }
        catch (error) {
            console.error('Error en reintentarPago:', error);
            res.status(500).json({ error: 'Error al reintentar el pago' });
        }
    }
};
