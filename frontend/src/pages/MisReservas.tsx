// frontend/src/pages/MisReservas.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PagoDemo from './PagoDemo';
import { obtenerAdicionalesReserva } from '../utils/reservaExtras';
import ModalCancelarReserva from '../components/canchas/ModalCancelarReserva';
import Toast from '../components/Toast.tsx';
import { useToast } from '../hooks/useToast.ts';

const MisReservas = () => {
    const [reservas, setReservas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reservaPago, setReservaPago] = useState<any | null>(null);
    const [isCancelarModalOpen, setIsCancelarModalOpen] = useState(false);
    const [reservaACancelar, setReservaACancelar] = useState<any>(null);
    const [cancelando, setCancelando] = useState(false);
    const [, setTick] = useState(0); // ⏰ Fuerza re-render cada segundo
    
    const { toast, showToast, closeToast } = useToast();
    const navigate = useNavigate();

    const cargarReservas = async () => {
        try {
            const res = await api.get('/reservas/mis-reservas');
            setReservas(res.data.data || []);
        } catch (error) {
            console.error('Error al cargar reservas', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarReservas(); }, []);

    // ⏰ Actualizar el contador cada segundo
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    // ⏰ Calcular tiempo restante usando fecha_solicitud
    const calcularTiempoRestante = (fechaSolicitud: string, canal: string, estado: string): string => {
        // Solo para reservas web pendientes
        if (canal !== 'en_linea' || !['pendiente', 'pendiente_pago'].includes(estado)) {
            return '';
        }
        
        const ahora = new Date();
        const solicitud = new Date(fechaSolicitud);
        const expiracion = new Date(solicitud.getTime() + 15 * 60 * 1000); // +15 min
        const diffMs = expiracion.getTime() - ahora.getTime();
        
        if (diffMs <= 0) return 'Expirada';
        
        const mins = Math.floor(diffMs / 60000);
        const segs = Math.floor((diffMs % 60000) / 1000);
        return `${mins}:${segs.toString().padStart(2, '0')}`;
    };

    const handleAbrirCancelar = (reserva: any) => {
        setReservaACancelar(reserva);
        setIsCancelarModalOpen(true);
    };

    const handleConfirmarCancelar = async (motivo: string) => {
        if (!reservaACancelar) return;
        setCancelando(true);
        try {
            await api.put(`/reservas/${reservaACancelar.id_reserva}/cancelar`, { motivo });
            setIsCancelarModalOpen(false);
            setReservaACancelar(null);
            showToast('Reserva cancelada correctamente', 'success');
            cargarReservas();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error al cancelar la reserva', 'error');
        } finally {
            setCancelando(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando reservas...</div>;

    return (
        <div className="p-6">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">Mis Reservas</h1>
                <button onClick={() => navigate('/canchas')}
                    className="px-4 py-2 bg-claro-primario text-white rounded-lg hover:bg-claro-hover">
                    + Nueva Reserva
                </button>
            </div>

            {reservas.length === 0 ? (
                <div className="p-8 text-center text-claro-texto2 border rounded-xl">
                    No tenés reservas todavía. ¡Hacé tu primera reserva!
                </div>
            ) : (
                <div className="overflow-x-auto border rounded-xl border-claro-borde dark:border-oscuro-borde">
                    <table className="w-full text-left">
                        <thead className="bg-claro-tinte dark:bg-oscuro-tinte text-claro-texto dark:text-oscuro-texto">
                            <tr>
                                <th className="p-3">Cancha</th>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Horario</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-claro-texto dark:text-oscuro-texto">
                            {reservas.map((r) => {
                                // ⏰ Calculamos la expiración desde fecha_solicitud
                                const tiempoRestante = calcularTiempoRestante(r.fecha_solicitud, r.canal_reserva, r.estado);
                                const estaPendiente = ['pendiente', 'pendiente_pago'].includes(r.estado) && r.canal_reserva === 'en_linea';
                                const estaPorExpirar = estaPendiente && tiempoRestante && tiempoRestante !== 'Expirada';
                                
                                return (
                                    <tr key={r.id_reserva} className="border-t border-claro-borde dark:border-oscuro-borde">
                                        <td className="p-3" data-label="Cancha">{r.cancha_nombre}</td>
                                        <td className="p-3" data-label="Fecha">{new Date(r.fecha_reserva).toLocaleDateString()}</td>
                                        <td className="p-3" data-label="Horario">{r.hora_inicio} - {r.hora_fin}</td>
                                        <td className="p-3" data-label="Estado">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                                                    r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                                                    estaPendiente ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {r.estado === 'pendiente_pago' ? 'Pendiente de Pago' : r.estado}
                                                </span>
                                                {/* ⏰ Contador */}
                                                {estaPorExpirar && (
                                                    <span className="text-xs font-mono text-orange-600 dark:text-orange-400 font-bold">
                                                        ⏰ Expira en: {tiempoRestante}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3" data-label="Acciones">
                                            <div className="flex gap-3 flex-wrap">
                                                {r.estado !== 'cancelada' && (
                                                    <button
                                                        onClick={() => setReservaPago({ ...r, detallesIniciales: obtenerAdicionalesReserva(r.id_reserva) })}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                                    >
                                                        💳 Pagar o reintentar
                                                    </button>
                                                )}
                                                {r.estado !== 'cancelada' && r.estado !== 'pagada' && (
                                                    <button
                                                        onClick={() => handleAbrirCancelar(r)}
                                                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                                    >
                                                        ✕ Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {reservaPago && (
                <PagoDemo
                    reserva={reservaPago}
                    onClose={() => setReservaPago(null)}
                    onComplete={() => {
                        showToast('Pago procesado correctamente', 'success');
                        cargarReservas();
                    }}
                />
            )}

            <ModalCancelarReserva
                isOpen={isCancelarModalOpen}
                onClose={() => {
                    setIsCancelarModalOpen(false);
                    setReservaACancelar(null);
                }}
                onConfirm={handleConfirmarCancelar}
                reserva={reservaACancelar}
                cargando={cancelando}
            />
        </div>
    );
};

export default MisReservas;