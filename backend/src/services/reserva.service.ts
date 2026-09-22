import { ReservaModel } from '../models/reservaModel';
import { PagoModel } from '../models/pagoModel';
import { ReembolsoModel } from '../models/reembolsoModel';

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

        // Calcular horas de anticipación
        const ahora = new Date();
        const fechaReserva = new Date(`${reserva.fecha_reserva}T${reserva.hora_inicio}`);
        const diferenciaHoras = (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);

        // Clientes pueden cancelar en cualquier momento (con política de reembolso)
        // Admins y empleados pueden cancelar sin restricciones
        if (rol === 'cliente' || rol === 'Cliente') {
            if (diferenciaHoras < 0) {
                throw new Error('No se puede cancelar una reserva que ya pasó');
            }
        }
        
        // Cancelar la reserva
        const reservaCancelada = await ReservaModel.actualizarEstado(id_reserva, 'cancelada', motivo);

        // Buscar si existe pago asociado
        const pago = await PagoModel.obtenerPorReserva(id_reserva);
        
        if (pago && pago.estado === 'pagado') {
            // Determinar porcentaje de reembolso según política
            let porcentajeReembolso = 0;
            
            if (diferenciaHoras > 24) {
                porcentajeReembolso = 100;
            } else if (diferenciaHoras > 12) {
                porcentajeReembolso = 50;
            } else if (diferenciaHoras > 6) {
                porcentajeReembolso = 25;
            } else {
                porcentajeReembolso = 0;
            }

            const montoReembolsado = (pago.monto * porcentajeReembolso) / 100;

            // Crear registro de reembolso
            const reembolso = await ReembolsoModel.crear({
                id_reserva,
                id_pago: pago.id_pago,
                monto_original: pago.monto,
                porcentaje_reembolso: porcentajeReembolso,
                monto_reembolsado: montoReembolsado,
                motivo_cancelacion: motivo,
                horas_anticipacion: Math.max(0, diferenciaHoras)
            });

            // Actualizar estado del pago según el porcentaje
            let nuevoEstadoPago = 'reembolso_pendiente';
            if (porcentajeReembolso === 0) {
                nuevoEstadoPago = 'sin_reembolso';
            } else if (porcentajeReembolso === 100) {
                nuevoEstadoPago = 'reembolso_pendiente';
            } else {
                nuevoEstadoPago = 'reembolso_parcial_pendiente';
            }

            await PagoModel.actualizarEstadoPago(pago.id_pago, nuevoEstadoPago);

            console.log(`✅ [SERVICE] Reembolso creado: ${porcentajeReembolso}% de Bs. ${pago.monto} = Bs. ${montoReembolsado}`);
            
            return {
                reserva: reservaCancelada,
                reembolso: {
                    ...reembolso,
                    porcentaje_reembolso: porcentajeReembolso,
                    monto_reembolsado: montoReembolsado,
                    politica_aplicada: diferenciaHoras > 24 ? 'Más de 24h: 100%' :
                                     diferenciaHoras > 12 ? '24-12h: 50%' :
                                     diferenciaHoras > 6 ? '12-6h: 25%' : 'Menos de 6h: 0%'
                }
            };
        }

        return { reserva: reservaCancelada, reembolso: null };
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