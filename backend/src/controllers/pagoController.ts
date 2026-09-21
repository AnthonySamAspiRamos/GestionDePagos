import { Request, Response } from 'express';
import { ReservaModel } from '../models/reservaModel';
import { PagoModel } from '../models/pagoModel';
import { pool } from '../config/database';

export const PagoController = {
    procesarPagoConComprobante: async (req: Request, res: Response) => {
        try {
            const { id_usuario, rol } = (req as any).usuario;
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

            const reserva = await ReservaModel.obtenerPorId(Number(id_reserva));
            if (!reserva) {
                return res.status(404).json({ error: 'La reserva no existe' });
            }

            const pagoExistente = await PagoModel.obtenerPorReserva(Number(id_reserva));
            if (pagoExistente) {
                return res.status(400).json({ error: 'Esta reserva ya tiene un pago registrado' });
            }

            const cancha = await pool.query('SELECT precio_hora FROM cancha WHERE id_cancha = $1', [reserva.id_cancha]);
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

            const pago = await PagoModel.crearPago({
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
                await ReservaModel.actualizarEstado(Number(id_reserva), 'confirmada');
            } else {
                await ReservaModel.actualizarEstado(Number(id_reserva), 'pendiente_pago');
            }

            res.status(201).json({
                success: true,
                message: metodo_pago === 'presencial' 
                    ? 'Pago presencial registrado. Reserva confirmada.'
                    : 'Comprobante enviado. Tu reserva está pendiente de verificación por un administrador.',
                data: pago
            });

        } catch (error: any) {
            console.error('Error en procesarPagoConComprobante:', error);
            res.status(500).json({ error: error.message || 'Error al procesar el pago' });
        }
    },

    procesarPago: async (req: Request, res: Response) => {
        try {
            const { id_usuario } = (req as any).usuario;
            const { id_reserva, metodo_pago, nro_comprobante, referencia_pasarela } = req.body;

            if (!id_reserva || !metodo_pago) {
                return res.status(400).json({ error: 'id_reserva y metodo_pago son obligatorios' });
            }

            const metodosValidos = ['presencial', 'tarjeta_debito', 'tarjeta_credito', 'qr'];
            if (!metodosValidos.includes(metodo_pago)) {
                return res.status(400).json({ 
                    error: `Método de pago inválido. Opciones: ${metodosValidos.join(', ')}` 
                });
            }

            const reserva = await ReservaModel.obtenerPorId(Number(id_reserva));
            if (!reserva) {
                return res.status(404).json({ error: 'La reserva no existe' });
            }

            const pagoExistente = await PagoModel.obtenerPorReserva(Number(id_reserva));
            if (pagoExistente) {
                return res.status(400).json({ error: 'Esta reserva ya tiene un pago registrado' });
            }

            const cancha = await pool.query('SELECT precio_hora FROM cancha WHERE id_cancha = $1', [reserva.id_cancha]);
            if (cancha.rows.length === 0) {
                return res.status(404).json({ error: 'Cancha no encontrada' });
            }

            const precioHora = parseFloat(cancha.rows[0].precio_hora);
            const horaInicio = new Date(`2000-01-01T${reserva.hora_inicio}`);
            const horaFin = new Date(`2000-01-01T${reserva.hora_fin}`);
            const horas = (horaFin.getTime() - horaInicio.getTime()) / (1000 * 60 * 60);
            const monto = precioHora * horas;

            const tipoRegistro = metodo_pago === 'presencial' ? 'presencial' : 'online';
            const estadoPago = metodo_pago === 'presencial' ? 'pagado' : 'pendiente_verificacion';

            const pago = await PagoModel.crearPago({
                id_reserva: Number(id_reserva),
                monto,
                metodo_pago,
                tipo_registro: tipoRegistro,
                referencia_pasarela: referencia_pasarela || null,
                nro_comprobante: nro_comprobante || null,
                estado: estadoPago
            });

            if (metodo_pago === 'presencial') {
                await ReservaModel.actualizarEstado(Number(id_reserva), 'confirmada');
            } else {
                await ReservaModel.actualizarEstado(Number(id_reserva), 'pendiente_pago');
            }

            res.status(201).json({
                success: true,
                message: metodo_pago === 'presencial' 
                    ? 'Pago presencial registrado. Reserva confirmada.'
                    : 'Comprobante enviado. Tu reserva está pendiente de verificación.',
                data: pago
            });

        } catch (error: any) {
            console.error('Error en procesarPago:', error);
            res.status(500).json({ error: error.message || 'Error al procesar el pago' });
        }
    },

    subirComprobante: async (req: Request, res: Response) => {
        try {
            const { id_pago } = req.params;
            const { id_usuario } = (req as any).usuario;

            if (!req.file) {
                return res.status(400).json({ error: 'No se subió ningún archivo' });
            }

            const comprobanteUrl = `/uploads/comprobantes/${req.file.filename}`;

            const pago = await PagoModel.obtenerPorReserva(Number(id_pago));
            if (!pago) {
                return res.status(404).json({ error: 'Pago no encontrado' });
            }

            const reserva = await ReservaModel.obtenerPorId(pago.id_reserva);
            if (!reserva || reserva.id_cliente !== id_usuario) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const esVirtual = ['tarjeta_debito', 'tarjeta_credito', 'qr'].includes(pago.metodo_pago);
            if (!esVirtual) {
                return res.status(400).json({ error: 'Los pagos presenciales no requieren comprobante' });
            }

            const pagoActualizado = await PagoModel.actualizarComprobante(Number(id_pago), comprobanteUrl);

            res.json({
                success: true,
                message: 'Comprobante subido correctamente. Tu reserva será verificada pronto.',
                data: pagoActualizado
            });

        } catch (error: any) {
            console.error('Error en subirComprobante:', error);
            res.status(500).json({ error: error.message || 'Error al subir comprobante' });
        }
    },

    verificarPago: async (req: Request, res: Response) => {
        try {
            const { id_pago } = req.params;
            const { estado, motivo_rechazo } = req.body;

            if (!estado || !['pagado', 'rechazado'].includes(estado)) {
                return res.status(400).json({ error: 'Estado inválido. Use "pagado" o "rechazado"' });
            }

            await PagoModel.verificarPago(Number(id_pago), estado, motivo_rechazo || null);

            const pago = await PagoModel.obtenerPorReserva(Number(id_pago));

            if (estado === 'pagado') {
                await ReservaModel.actualizarEstado(pago.id_reserva, 'confirmada');
            } else if (estado === 'rechazado') {
                await ReservaModel.actualizarEstado(pago.id_reserva, 'pendiente_pago');
            }

            res.json({
                success: true,
                message: `Pago ${estado === 'pagado' ? 'aprobado y reserva confirmada' : 'rechazado'}`
            });

        } catch (error: any) {
            console.error('Error en verificarPago:', error);
            res.status(500).json({ error: error.message || 'Error al verificar pago' });
        }
    },

    historialPagos: async (req: Request, res: Response) => {
        try {
            const { id_usuario } = (req as any).usuario;
            const pagos = await PagoModel.obtenerHistorialPagos(id_usuario);
            res.json({ success: true, data: pagos });
        } catch (error: any) {
            console.error('Error en historialPagos:', error);
            res.status(500).json({ error: 'Error al obtener historial de pagos' });
        }
    },

    pagosPendientes: async (_req: Request, res: Response) => {
        try {
            const pagos = await PagoModel.obtenerPagosPendientes();
            res.json({ success: true, data: pagos });
        } catch (error: any) {
            console.error('Error en pagosPendientes:', error);
            res.status(500).json({ error: 'Error al obtener pagos pendientes' });
        }
    },

    reintentarPago: async (req: Request, res: Response) => {
        try {
            const { id_reserva } = req.params;
            const { id_usuario } = (req as any).usuario;

            const reserva = await ReservaModel.obtenerPorId(Number(id_reserva));
            if (!reserva || reserva.id_cliente !== id_usuario) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const pagoExistente = await PagoModel.obtenerPorReserva(Number(id_reserva));
            if (pagoExistente && pagoExistente.estado !== 'rechazado') {
                return res.status(400).json({ error: 'Esta reserva no tiene un pago rechazado' });
            }

            if (pagoExistente) {
                await PagoModel.eliminarPago(Number(id_reserva));
            }

            await ReservaModel.actualizarEstado(Number(id_reserva), 'pendiente');

            res.json({
                success: true,
                message: 'Puedes volver a intentar el pago desde tu reserva.'
            });

        } catch (error: any) {
            console.error('Error en reintentarPago:', error);
            res.status(500).json({ error: 'Error al reintentar el pago' });
        }
    }
};
