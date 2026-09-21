import { ReservaModel } from '../models/reservaModel';

export const ReservaService = {
    crearReserva: async (data: any) => {
        console.log('🔍 [SERVICE] Datos recibidos:', data);

        // 1. Validar disponibilidad
        const ocupado = await ReservaModel.verificarDisponibilidad(
            data.id_cancha, data.fecha_reserva, data.hora_inicio, data.hora_fin
        );
        
        console.log('🔍 [SERVICE] ¿Turno ocupado?:', ocupado);

        if (ocupado) {
            throw new Error('El turno seleccionado ya está ocupado. Por favor, elegí otro horario.');
        }

        // 2. Definir estado inicial
        const estadoInicial = data.canal_reserva === 'presencial' ? 'confirmada' : 'pendiente';
        console.log('🔍 [SERVICE] Estado inicial:', estadoInicial);

        // 3. Crear reserva
        const reserva = await ReservaModel.crear({
            ...data,
            estado: estadoInicial
        });

        console.log('✅ [SERVICE] Reserva creada:', reserva);
        return reserva;
    },

    admitirReserva: async (id_reserva: number) => {
        return await ReservaModel.actualizarEstado(id_reserva, 'confirmada');
    },

    cancelarReserva: async (id_reserva: number, motivo: string, rol: string) => {
        const reserva = await ReservaModel.obtenerPorId(id_reserva);
        
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
        
        return await ReservaModel.actualizarEstado(id_reserva, 'cancelada', motivo);
    },
        modificarReserva: async (id_reserva: number, data: any, rol: string) => {
        const rolNormalizado = rol?.toLowerCase();
        // 1. Solo Admin puede modificar
        if (rolNormalizado !== 'admin' && rolNormalizado !== 'administrador') {
            throw new Error('Solo el administrador puede modificar reservas');
        }

        // 2. Verificar que la reserva existe
        const reservaActual = await ReservaModel.obtenerPorId(id_reserva);
        if (!reservaActual) {
            throw new Error('La reserva no existe');
        }

        // 3. Si se cambia fecha/hora/cancha, validar disponibilidad
        const idCanchaFinal = data.id_cancha || reservaActual.id_cancha;
        const fechaFinal = data.fecha_reserva || reservaActual.fecha_reserva;
        const horaInicioFinal = data.hora_inicio || reservaActual.hora_inicio;
        const horaFinFinal = data.hora_fin || reservaActual.hora_fin;

        // Solo validar si cambió algo de fecha/hora/cancha
        const cambiaHorario = data.fecha_reserva || data.hora_inicio || data.hora_fin || data.id_cancha;
        
        if (cambiaHorario) {
            const ocupado = await ReservaModel.verificarDisponibilidadExcluyendo(
                idCanchaFinal, fechaFinal, horaInicioFinal, horaFinFinal, id_reserva
            );
            if (ocupado) {
                throw new Error('El nuevo turno ya está ocupado. Por favor, elegí otro horario.');
            }
        }

        // 4. Actualizar
        return await ReservaModel.actualizar(id_reserva, data);
    }
};