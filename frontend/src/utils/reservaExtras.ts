import type { PagoDetalle } from '../services/pago.api';

const STORAGE_KEY = 'reserva_adicionales';

type ExtrasGuardados = Record<string, PagoDetalle[]>;

const leer = (): ExtrasGuardados => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as ExtrasGuardados;
    } catch {
        return {};
    }
};

export const guardarAdicionalesReserva = (idReserva: number, detalles: PagoDetalle[]) => {
    const extras = leer();
    extras[String(idReserva)] = detalles;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extras));
};

export const obtenerAdicionalesReserva = (idReserva: number): PagoDetalle[] => leer()[String(idReserva)] || [];

export const limpiarAdicionalesReserva = (idReserva: number) => {
    const extras = leer();
    delete extras[String(idReserva)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extras));
};
