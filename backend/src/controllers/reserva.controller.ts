import { Request, Response } from 'express';
import { ReservaService } from '../services/reserva.service';
import { ReservaModel } from '../models/reservaModel';

export const ReservaController = {
    crear: async (req: Request, res: Response) => {
        try {
            const { id_usuario, rol } = (req as any).usuario;
            const body = req.body;

            // 🔍 DEBUG
            console.log('🔍 [CONTROLLER] Usuario del token:', { id_usuario, rol });
            console.log('🔍 [CONTROLLER] Body recibido:', body);

            let id_cliente = body.id_cliente;
            const rolNormalizado = rol?.toLowerCase();
            
            if (rolNormalizado === 'cliente') {
                id_cliente = id_usuario;
            }
            if (rolNormalizado === 'empleado' && !id_cliente) {
                return res.status(400).json({ error: 'Debe seleccionar un cliente para la reserva presencial' });
            }

            const payloadFinal = {
                ...body,
                id_cliente,
                canal_reserva: rolNormalizado === 'cliente' ? 'en_linea' : 'presencial',
                id_empleado: rolNormalizado === 'empleado' ? id_usuario : null
            };

            // 🔍 DEBUG
            console.log('🔍 [CONTROLLER] Payload final al servicio:', payloadFinal);

            const reserva = await ReservaService.crearReserva(payloadFinal);

            console.log('✅ [CONTROLLER] Reserva creada:', reserva);

            res.status(201).json({ success: true, data: reserva });
        } catch (error: any) {
            // 🔍 DEBUG ERROR 
            console.error('❌ [CONTROLLER] Error al crear reserva:');
            console.error('   message:', error.message);
            console.error('   code:', error.code);
            console.error('   detail:', error.detail);
            console.error('   constraint:', error.constraint);
            console.error('   stack:', error.stack);

            res.status(400).json({ success: false, message: error.message });
        }
    },

    misReservas: async (req: Request, res: Response) => {
        try {
            const { id_usuario } = (req as any).usuario;
            const reservas = await ReservaModel.obtenerPorCliente(id_usuario);
            res.json({ success: true, data: reservas });
        } catch (error) {
            console.error('❌ [CONTROLLER] Error en misReservas:', error);
            res.status(500).json({ success: false, message: 'Error al obtener reservas' });
        }
    },

    todas: async (req: Request, res: Response) => {
        try {
            const filtros = {
                estado: req.query.estado,
                fecha: req.query.fecha
            };
            const reservas = await ReservaModel.obtenerTodas(filtros);
            res.json({ success: true, data: reservas });
        } catch (error) {
            console.error('❌ [CONTROLLER] Error en todas:', error);
            res.status(500).json({ success: false, message: 'Error al obtener reservas' });
        }
    },

    admitir: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const reserva = await ReservaService.admitirReserva(Number(id));
            res.json({ success: true, data: reserva });
        } catch (error) {
            console.error('❌ [CONTROLLER] Error en admitir:', error);
            res.status(500).json({ success: false, message: 'Error al admitir reserva' });
        }
    },

    cancelar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { motivo } = req.body;
            const { rol } = (req as any).usuario;
            
            const reserva = await ReservaService.cancelarReserva(Number(id), motivo, rol);
            res.json({ success: true, data: reserva });
        } catch (error: any) {
            console.error('❌ [CONTROLLER] Error en cancelar:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
        modificar: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { rol } = (req as any).usuario;
            
            const reserva = await ReservaService.modificarReserva(Number(id), req.body, rol);
            res.json({ success: true, data: reserva });
        } catch (error: any) {
            console.error('❌ [CONTROLLER] Error al modificar reserva:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    },
};