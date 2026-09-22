import { Request, Response } from 'express';
import { ReembolsoModel } from '../models/reembolsoModel';
import { PagoModel } from '../models/pagoModel';

export const ReembolsoController = {
    // Obtener todos los reembolsos pendientes (solo admin)
    pendientes: async (_req: Request, res: Response) => {
        try {
            const reembolsos = await ReembolsoModel.obtenerPendientes();
            res.json({ success: true, data: reembolsos });
        } catch (error: any) {
            console.error('❌ [CONTROLLER] Error al obtener reembolsos pendientes:', error);
            res.status(500).json({ success: false, message: 'Error al obtener reembolsos pendientes' });
        }
    },

    // Obtener reembolsos del cliente actual
    misReembolsos: async (req: Request, res: Response) => {
        try {
            const { id_usuario } = (req as any).usuario;
            const reembolsos = await ReembolsoModel.obtenerPorCliente(id_usuario);
            res.json({ success: true, data: reembolsos });
        } catch (error: any) {
            console.error('❌ [CONTROLLER] Error al obtener reembolsos del cliente:', error);
            res.status(500).json({ success: false, message: 'Error al obtener reembolsos' });
        }
    },

    // Aprobar o rechazar reembolso (solo admin)
    procesar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { estado, notas_admin } = req.body;

            if (!estado || !['aprobado', 'rechazado'].includes(estado)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Estado inválido. Use "aprobado" o "rechazado"' 
                });
            }

            const reembolso = await ReembolsoModel.procesar(Number(id), estado, notas_admin);
            
            if (!reembolso) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Reembolso no encontrado' 
                });
            }

            // Si se aprueba, actualizar estado del pago
            if (estado === 'aprobado') {
                const nuevoEstadoPago = reembolso.porcentaje_reembolso === 100 
                    ? 'reembolsado' 
                    : 'reembolso_parcial';
                await PagoModel.actualizarEstadoPago(reembolso.id_pago, nuevoEstadoPago);
            } else {
                // Si se rechaza, el pago queda como está (sin reembolso)
                await PagoModel.actualizarEstadoPago(reembolso.id_pago, 'reembolso_rechazado');
            }

            res.json({ 
                success: true, 
                data: reembolso,
                message: estado === 'aprobado' 
                    ? `Reembolso aprobado. Monto: Bs. ${reembolso.monto_reembolsado}`
                    : 'Reembolso rechazado'
            });
        } catch (error: any) {
            console.error('❌ [CONTROLLER] Error al procesar reembolso:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Obtener detalle de un reembolso específico
    obtenerPorReserva: async (req: Request, res: Response) => {
        try {
            const { id_reserva } = req.params;
            const reembolso = await ReembolsoModel.obtenerPorReserva(Number(id_reserva));
            
            if (!reembolso) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'No se encontró reembolso para esta reserva' 
                });
            }

            res.json({ success: true, data: reembolso });
        } catch (error: any) {
            console.error('❌ [CONTROLLER] Error al obtener reembolso:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
