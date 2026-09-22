"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagoController = void 0;
const reservaModel_1 = require("../models/reservaModel");
const pagoModel_1 = require("../models/pagoModel");
const database_1 = require("../config/database");
exports.PagoController = {
    procesarPagoConComprobante: async (req, res) => {
        try {
            const { id_usuario, rol } = req.usuario;
            const { id_reserva, metodo_pago, nro_comprobante } = req.body;
            if (!id_reserva || !metodo_pago) {
                return res.status(400).json({ error: 'id_reserva y metodo_pago son obligatorios' });
            }
            const metodosValidos = ['presencial', 'tarjeta_debito', 'tarjeta_credito', 'qr'];
            if (!metodosValidos.includes(metodo_pago)) {
                return res.status(400).json({
                    error: `Método de pago inválido. Opciones: ${metodosValidos.join(', ')}`
                });
            }
            const esVirtual = ['tarjeta_debito', 'tarjeta_credito', 'qr'].includes(metodo_pago);
            if (esVirtual && !req.file) {
                return res.status(400).json({
                    error: 'Para pagos virtuales es obligatorio subir el comprobante de pago.'
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
            let comprobanteUrl = null;
            if (req.file) {
                comprobanteUrl = `/uploads/comprobantes/${req.file.filename}`;
            }
            const tipoRegistro = metodo_pago === 'presencial' ? 'presencial' : 'online';
            const estadoPago = metodo_pago === 'presencial' ? 'pagado' : 'pendiente_verificacion';
            const pago = await pagoModel_1.PagoModel.crearPago({
                id_reserva: Number(id_reserva),
                monto,
                metodo_pago,
                tipo_registro: tipoRegistro,
                referencia_pasarela: nro_comprobante || null,
                nro_comprobante: nro_comprobante || null,
                comprobante_url: comprobanteUrl,
                estado: estadoPago
            });
            if (metodo_pago === 'presencial') {
                await reservaModel_1.ReservaModel.actualizarEstado(Number(id_reserva), 'confirmada');
            }
            else {
                await reservaModel_1.ReservaModel.actualizarEstado(Number(id_reserva), 'pendiente_pago');
            }
            res.status(201).json({
                success: true,
                message: metodo_pago === 'presencial'
                    ? 'Pago presencial registrado. Reserva confirmada.'
                    : 'Comprobante enviado. Tu reserva está pendiente de verificación por un administrador.',
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
            const { id_usuario } = req.usuario;
            const { id_reserva, metodo_pago, nro_comprobante, referencia_pasarela, modo_demo } = req.body;
            if (!id_reserva || !metodo_pago) {
                return res.status(400).json({ error: 'id_reserva y metodo_pago son obligatorios' });
            }
            const metodosValidos = ['presencial', 'tarjeta_debito', 'tarjeta_credito', 'qr', 'transferencia'];
            if (!metodosValidos.includes(metodo_pago)) {
                return res.status(400).json({
                    error: `Método de pago inválido. Opciones: ${metodosValidos.join(', ')}`
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
            const tipoRegistro = metodo_pago === 'presencial' ? 'presencial' : 'online';
            const modoDemoActivo = process.env.NODE_ENV !== 'production' && modo_demo === true;
            const estadoPago = metodo_pago === 'presencial' || modoDemoActivo ? 'pagado' : 'pendiente_verificacion';
            const pago = await pagoModel_1.PagoModel.crearPago({
                id_reserva: Number(id_reserva),
                monto,
                metodo_pago,
                tipo_registro: tipoRegistro,
                referencia_pasarela: referencia_pasarela || null,
                nro_comprobante: nro_comprobante || null,
                estado: estadoPago
            });
            if (metodo_pago === 'presencial' || modoDemoActivo) {
                await reservaModel_1.ReservaModel.actualizarEstado(Number(id_reserva), 'confirmada');
            }
            else {
                await reservaModel_1.ReservaModel.actualizarEstado(Number(id_reserva), 'pendiente_pago');
            }
            res.status(201).json({
                success: true,
                message: metodo_pago === 'presencial'
                    ? 'Pago presencial registrado. Reserva confirmada.'
                    : 'Comprobante enviado. Tu reserva está pendiente de verificación.',
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
            const comprobanteUrl = `/uploads/comprobantes/${req.file.filename}`;
            const pago = await pagoModel_1.PagoModel.obtenerPorReserva(Number(id_pago));
            if (!pago) {
                return res.status(404).json({ error: 'Pago no encontrado' });
            }
            const reserva = await reservaModel_1.ReservaModel.obtenerPorId(pago.id_reserva);
            if (!reserva || reserva.id_cliente !== id_usuario) {
                return res.status(403).json({ error: 'No autorizado' });
            }
            const esVirtual = ['tarjeta_debito', 'tarjeta_credito', 'qr'].includes(pago.metodo_pago);
            if (!esVirtual) {
                return res.status(400).json({ error: 'Los pagos presenciales no requieren comprobante' });
            }
            const pagoActualizado = await pagoModel_1.PagoModel.actualizarComprobante(Number(id_pago), comprobanteUrl);
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
            await pagoModel_1.PagoModel.verificarPago(Number(id_pago), estado, motivo_rechazo || null);
            const pago = await pagoModel_1.PagoModel.obtenerPorReserva(Number(id_pago));
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
