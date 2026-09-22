"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaService = void 0;
const reservaModel_1 = require("../models/reservaModel");
exports.ReservaService = {
    crearReserva: async (data) => {
        console.log('🔍 [SERVICE] Datos recibidos:', data);
        const ocupado = await reservaModel_1.ReservaModel.verificarDisponibilidad(data.id_cancha, data.fecha_reserva, data.hora_inicio, data.hora_fin);
        console.log('🔍 [SERVICE] ¿Turno ocupado?:', ocupado);
        if (ocupado) {
            throw new Error('El turno seleccionado ya está ocupado. Por favor, elegí otro horario.');
        }
        const estadoInicial = data.canal_reserva === 'presencial' ? 'confirmada' : 'pendiente';
        console.log('🔍 [SERVICE] Estado inicial:', estadoInicial);
        const reserva = await reservaModel_1.ReservaModel.crear({
            ...data,
            estado: estadoInicial
        });
        console.log('✅ [SERVICE] Reserva creada:', reserva);
        return reserva;
    },
    admitirReserva: async (id_reserva) => {
        return await reservaModel_1.ReservaModel.actualizarEstado(id_reserva, 'confirmada');
    },
    cancelarReserva: async (id_reserva, motivo, rol) => {
        const reserva = await reservaModel_1.ReservaModel.obtenerPorId(id_reserva);
        if (!reserva) {
            throw new Error('La reserva no existe');
        }
        if (rol === 'cliente' || rol === 'Cliente') {
            const ahora = new Date();
            const fechaReserva = new Date(`${reserva.fecha_reserva}T${reserva.hora_inicio}`);
            const diferenciaHoras = (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);
            if (diferenciaHoras < 24) {
                throw new Error('No podés cancelar con menos de 24 horas de anticipación. Contactá a un empleado o administrador.');
            }
        }
        return await reservaModel_1.ReservaModel.actualizarEstado(id_reserva, 'cancelada', motivo);
    },
    modificarReserva: async (id_reserva, data, rol) => {
        const rolNormalizado = rol?.toLowerCase();
        if (rolNormalizado !== 'admin' && rolNormalizado !== 'administrador') {
            throw new Error('Solo el administrador puede modificar reservas');
        }
        const reservaActual = await reservaModel_1.ReservaModel.obtenerPorId(id_reserva);
        if (!reservaActual) {
            throw new Error('La reserva no existe');
        }
        const idCanchaFinal = data.id_cancha || reservaActual.id_cancha;
        const fechaFinal = data.fecha_reserva || reservaActual.fecha_reserva;
        const horaInicioFinal = data.hora_inicio || reservaActual.hora_inicio;
        const horaFinFinal = data.hora_fin || reservaActual.hora_fin;
        const cambiaHorario = data.fecha_reserva || data.hora_inicio || data.hora_fin || data.id_cancha;
        if (cambiaHorario) {
            const ocupado = await reservaModel_1.ReservaModel.verificarDisponibilidadExcluyendo(idCanchaFinal, fechaFinal, horaInicioFinal, horaFinFinal, id_reserva);
            if (ocupado) {
                throw new Error('El nuevo turno ya está ocupado. Por favor, elegí otro horario.');
            }
        }
        return await reservaModel_1.ReservaModel.actualizar(id_reserva, data);
    }
};
