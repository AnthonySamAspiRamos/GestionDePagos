"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaController = void 0;
const reserva_service_1 = require("../services/reserva.service");
const reservaModel_1 = require("../models/reservaModel");
exports.ReservaController = {
    crear: async (req, res) => {
        try {
            const { id_usuario, rol } = req.usuario;
            const body = req.body;
            console.log('🔍 [CONTROLLER] Usuario del token:', { id_usuario, rol });
            console.log('🔍 [CONTROLLER] Body recibido:', body);
            let id_cliente = body.id_cliente;
            const rolNormalizado = rol?.toLowerCase();
            if (rolNormalizado === 'cliente') {
                id_cliente = id_usuario;
            }
            if ((rolNormalizado === 'empleado' || rolNormalizado === 'admin' || rolNormalizado === 'administrador') && !id_cliente) {
                return res.status(400).json({ error: 'Debe seleccionar un cliente para registrar la reserva.' });
            }
            const payloadFinal = {
                ...body,
                id_cliente,
                canal_reserva: rolNormalizado === 'cliente' ? 'en_linea' : 'presencial',
                id_empleado: rolNormalizado === 'empleado' ? id_usuario : null
            };
            console.log('🔍 [CONTROLLER] Payload final al servicio:', payloadFinal);
            const reserva = await reserva_service_1.ReservaService.crearReserva(payloadFinal);
            console.log('✅ [CONTROLLER] Reserva creada:', reserva);
            res.status(201).json({ success: true, data: reserva });
        }
        catch (error) {
            console.error('❌ [CONTROLLER] Error al crear reserva:');
            console.error('   message:', error.message);
            console.error('   code:', error.code);
            console.error('   detail:', error.detail);
            console.error('   constraint:', error.constraint);
            console.error('   stack:', error.stack);
            res.status(400).json({ success: false, message: error.message });
        }
    },
    misReservas: async (req, res) => {
        try {
            const { id_usuario } = req.usuario;
            const reservas = await reservaModel_1.ReservaModel.obtenerPorCliente(id_usuario);
            res.json({ success: true, data: reservas });
        }
        catch (error) {
            console.error('❌ [CONTROLLER] Error en misReservas:', error);
            res.status(500).json({ success: false, message: 'Error al obtener reservas' });
        }
    },
    todas: async (req, res) => {
        try {
            const filtros = {
                estado: req.query.estado,
                fecha: req.query.fecha
            };
            const reservas = await reservaModel_1.ReservaModel.obtenerTodas(filtros);
            res.json({ success: true, data: reservas });
        }
        catch (error) {
            console.error('❌ [CONTROLLER] Error en todas:', error);
            res.status(500).json({ success: false, message: 'Error al obtener reservas' });
        }
    },
    admitir: async (req, res) => {
        try {
            const { id } = req.params;
            const reserva = await reserva_service_1.ReservaService.admitirReserva(Number(id));
            res.json({ success: true, data: reserva });
        }
        catch (error) {
            console.error('❌ [CONTROLLER] Error en admitir:', error);
            res.status(500).json({ success: false, message: 'Error al admitir reserva' });
        }
    },
    cancelar: async (req, res) => {
        try {
            const { id } = req.params;
            const { motivo } = req.body;
            const { rol } = req.usuario;
            const reserva = await reserva_service_1.ReservaService.cancelarReserva(Number(id), motivo, rol);
            res.json({ success: true, data: reserva });
        }
        catch (error) {
            console.error('❌ [CONTROLLER] Error en cancelar:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    modificar: async (req, res) => {
        try {
            const { id } = req.params;
            const { rol } = req.usuario;
            const reserva = await reserva_service_1.ReservaService.modificarReserva(Number(id), req.body, rol);
            res.json({ success: true, data: reserva });
        }
        catch (error) {
            console.error('❌ [CONTROLLER] Error al modificar reserva:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    },
};
