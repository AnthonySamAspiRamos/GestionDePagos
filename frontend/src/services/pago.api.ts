import api from './api';

export interface PagoDetalle {
    nombre: string;
    tipo: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface CrearPagoInput {
    id_reserva: number;
    metodo_pago: 'efectivo' | 'qr' | 'transferencia';
    comprobante?: File;
    referencia_pasarela?: string;
}

export const crearPago = async (data: CrearPagoInput) => {
    const formData = new FormData();
    formData.append('id_reserva', String(data.id_reserva));
    formData.append('metodo_pago', data.metodo_pago);
    if (data.referencia_pasarela) {
        formData.append('nro_comprobante', data.referencia_pasarela);
    }
    if (data.comprobante && data.metodo_pago !== 'efectivo') {
        formData.append('comprobante', data.comprobante);
    }

    const response = await api.post('/pagos/procesar-con-comprobante', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const obtenerPagosReserva = async (idReserva: number) => {
    const response = await api.get(`/pagos/reserva/${idReserva}`);
    return response.data.data || [];
};
