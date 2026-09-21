import { useState, useEffect } from 'react';
import api from '../services/api';
import ModalReserva from '../components/canchas/ModalReserva';
import PagoDemo from './PagoDemo';
import { obtenerAdicionalesReserva } from '../utils/reservaExtras';

const MisReservas = () => {
    const [reservas, setReservas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [reservaPago, setReservaPago] = useState<any | null>(null);

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

    const handleCancelar = async (id: number) => {
        const motivo = prompt('Ingrese el motivo de la cancelación:');
        if (!motivo) return;
        try {
            await api.put(`/reservas/${id}/cancelar`, { motivo });
            cargarReservas();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al cancelar');
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando reservas...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">Mis Reservas</h1>
                <button onClick={() => setModalOpen(true)}
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
                            {reservas.map((r) => (
                                <tr key={r.id_reserva} className="border-t border-claro-borde dark:border-oscuro-borde">
                                    <td className="p-3">{r.cancha_nombre}</td>
                                    <td className="p-3">{new Date(r.fecha_reserva).toLocaleDateString()}</td>
                                    <td className="p-3">{r.hora_inicio} - {r.hora_fin}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                                            r.estado === 'pendiente' || r.estado === 'pendiente_pago' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {r.estado === 'pendiente_pago' ? 'Pendiente de Pago' : r.estado}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-3 flex-wrap">
                                            {/* ✅ BOTÓN DE PAGAR - SIEMPRE VISIBLE (excepto canceladas) */}
                                            {r.estado !== 'cancelada' && (
                                                <button
                                                    onClick={() => setReservaPago({ ...r, detallesIniciales: obtenerAdicionalesReserva(r.id_reserva) })}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                                >
                                                    💳 Pagar o reintentar
                                                </button>
                                            )}

                                            {/* Botón CANCELAR */}
                                            {r.estado !== 'cancelada' && r.estado !== 'pagada' && (
                                                <button
                                                    onClick={() => handleCancelar(r.id_reserva)}
                                                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                                >
                                                    ✕ Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ModalReserva
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={cargarReservas}
                cancha={null}
            />
            {reservaPago && (
                <PagoDemo
                    reserva={reservaPago}
                    onClose={() => setReservaPago(null)}
                    onComplete={cargarReservas}
                />
            )}
        </div>
    );
};

export default MisReservas;