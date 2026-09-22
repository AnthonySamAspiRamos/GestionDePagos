import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ModalReserva from '../components/canchas/ModalReserva';

const MisReservas = () => {
    const [reservas, setReservas] = useState<any[]>([]);
    const [reembolsos, setReembolsos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [tabActiva, setTabActiva] = useState<'reservas' | 'reembolsos'>('reservas');
    const [modalCancelar, setModalCancelar] = useState<{ open: boolean; reserva: any }>({ open: false, reserva: null });
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const [procesandoCancelacion, setProcesandoCancelacion] = useState(false);
    const { usuario } = useAuth();

    const cargarReservas = async () => {
        try {
            const res = await api.get('/reservas/mis-reservas');
            setReservas(res.data.data || []);
        } catch (error) {
            console.error('Error al cargar reservas', error);
        }
    };

    const cargarReembolsos = async () => {
        try {
            const res = await api.get('/reembolsos/mis-reembolsos');
            setReembolsos(res.data.data || []);
        } catch (error) {
            console.error('Error al cargar reembolsos', error);
        }
    };

    useEffect(() => {
        const cargarTodo = async () => {
            setLoading(true);
            await Promise.all([cargarReservas(), cargarReembolsos()]);
            setLoading(false);
        };
        cargarTodo();
    }, []);

    // Calcular política de reembolso
    const calcularPolitica = (fechaReserva: string, horaInicio: string) => {
        const ahora = new Date();
        const fechaRes = new Date(`${fechaReserva}T${horaInicio}`);
        const diferenciaHoras = (fechaRes.getTime() - ahora.getTime()) / (1000 * 60 * 60);

        if (diferenciaHoras < 0) return { porcentaje: -1, texto: 'Reserva ya pasada', color: 'red' };
        if (diferenciaHoras > 24) return { porcentaje: 100, texto: '100%', color: 'green', horas: Math.round(diferenciaHoras) };
        if (diferenciaHoras > 12) return { porcentaje: 50, texto: '50%', color: 'yellow', horas: Math.round(diferenciaHoras) };
        if (diferenciaHoras > 6) return { porcentaje: 25, texto: '25%', color: 'orange', horas: Math.round(diferenciaHoras) };
        return { porcentaje: 0, texto: '0%', color: 'red', horas: Math.round(diferenciaHoras) };
    };

    const abrirModalCancelar = (reserva: any) => {
        setModalCancelar({ open: true, reserva });
        setMotivoCancelacion('');
    };

    const confirmarCancelacion = async () => {
        if (!motivoCancelacion.trim()) return;
        if (!modalCancelar.reserva) return;

        setProcesandoCancelacion(true);
        try {
            await api.put(`/reservas/${modalCancelar.reserva.id_reserva}/cancelar`, {
                motivo: motivoCancelacion
            });
            setModalCancelar({ open: false, reserva: null });
            setMotivoCancelacion('');
            await Promise.all([cargarReservas(), cargarReembolsos()]);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al cancelar');
        } finally {
            setProcesandoCancelacion(false);
        }
    };

    const puedeCancelar = (reserva: any) => {
        return reserva.estado === 'confirmada' || reserva.estado === 'pendiente' || reserva.estado === 'pendiente_pago';
    };

    const getEstadoBadge = (estado: string) => {
        const estados: Record<string, { bg: string; text: string; label: string }> = {
            'confirmada': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Confirmada' },
            'pendiente': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pendiente' },
            'pendiente_pago': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pendiente de Pago' },
            'cancelada': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Cancelada' },
        };
        return estados[estado] || { bg: 'bg-gray-100', text: 'text-gray-700', label: estado };
    };

    const getReembolsoBadge = (estado: string, porcentaje: number) => {
        const estados: Record<string, { bg: string; text: string; label: string }> = {
            'pendiente': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: '⏳ Pendiente de aprobación' },
            'aprobado': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: `✅ Aprobado (${porcentaje}%)` },
            'rechazado': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: '❌ Rechazado' },
        };
        return estados[estado] || { bg: 'bg-gray-100', text: 'text-gray-700', label: estado };
    };

    if (loading) return <div className="p-8 text-center">Cargando reservas...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">Mis Reservas y Reembolsos</h1>
                <button onClick={() => setModalOpen(true)}
                    className="px-4 py-2 bg-claro-primario text-white rounded-lg hover:bg-claro-hover shadow-sm transition-all">
                    + Nueva Reserva
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-claro-tinte dark:bg-oscuro-tinte p-1 rounded-xl w-fit">
                <button
                    onClick={() => setTabActiva('reservas')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        tabActiva === 'reservas'
                            ? 'bg-white dark:bg-oscuro-tarjeta text-claro-primario shadow-sm'
                            : 'text-claro-texto2 hover:text-claro-texto'
                    }`}
                >
                    📋 Reservas ({reservas.length})
                </button>
                <button
                    onClick={() => setTabActiva('reembolsos')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        tabActiva === 'reembolsos'
                            ? 'bg-white dark:bg-oscuro-tarjeta text-claro-primario shadow-sm'
                            : 'text-claro-texto2 hover:text-claro-texto'
                    }`}
                >
                    💰 Reembolsos ({reembolsos.length})
                </button>
            </div>

            {/* Tab Reservas */}
            {tabActiva === 'reservas' && (
                <>
                    {reservas.length === 0 ? (
                        <div className="p-8 text-center text-claro-texto2 border rounded-xl bg-claro-tarjeta dark:bg-oscuro-tarjeta">
                            <span className="text-4xl block mb-3">📋</span>
                            No tenés reservas todavía. ¡Hacé tu primera reserva!
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {reservas.map((r) => {
                                const politica = calcularPolitica(r.fecha_reserva, r.hora_inicio);
                                const badge = getEstadoBadge(r.estado);

                                return (
                                    <div key={r.id_reserva} className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-claro-texto dark:text-oscuro-texto text-lg">
                                                        🏟️ {r.cancha_nombre}
                                                    </h3>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-claro-texto2">
                                                    <span>📅 {new Date(r.fecha_reserva).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                    <span>🕐 {r.hora_inicio} - {r.hora_fin}</span>
                                                    {r.disciplina && <span>⚽ {r.disciplina}</span>}
                                                </div>
                                                {r.precio_hora && (
                                                    <p className="text-sm mt-2 font-medium text-claro-primario">
                                                        Bs. {r.precio_hora}/hora
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-2 flex-wrap">
                                                {/* Info de política de reembolso para reservas cancelables */}
                                                {puedeCancelar(r) && politica.porcentaje >= 0 && (
                                                    <div className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                                                        politica.color === 'green' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' :
                                                        politica.color === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400' :
                                                        politica.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400' :
                                                        'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                                                    }`}>
                                                        {politica.porcentaje > 0
                                                            ? `Reembolso ${politica.texto} (${politica.horas}h antes)`
                                                            : politica.porcentaje === 0
                                                                ? `Sin reembolso (${politica.horas}h antes)`
                                                                : ''
                                                        }
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => abrirModalCancelar(r)}
                                                    disabled={!puedeCancelar(r)}
                                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm ${
                                                        puedeCancelar(r)
                                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    ✕ Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Tab Reembolsos */}
            {tabActiva === 'reembolsos' && (
                <>
                    {reembolsos.length === 0 ? (
                        <div className="p-8 text-center text-claro-texto2 border rounded-xl bg-claro-tarjeta dark:bg-oscuro-tarjeta">
                            <span className="text-4xl block mb-3">💰</span>
                            No tenés reembolsos registrados.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {reembolsos.map((reb) => {
                                const badge = getReembolsoBadge(reb.estado, reb.porcentaje_reembolso);

                                return (
                                    <div key={reb.id_reembolso} className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-claro-texto dark:text-oscuro-texto text-lg">
                                                        🏟️ {reb.cancha_nombre}
                                                    </h3>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-claro-texto2">
                                                    <span>📅 {new Date(reb.fecha_reserva).toLocaleDateString('es-ES')}</span>
                                                    <span>🕐 {reb.hora_inicio} - {reb.hora_fin}</span>
                                                    <span>📩 Solicitado: {new Date(reb.fecha_solicitud).toLocaleDateString('es-ES')}</span>
                                                </div>

                                                <div className="mt-3 flex items-center gap-6">
                                                    <div>
                                                        <p className="text-xs text-claro-texto2">Monto original</p>
                                                        <p className="text-sm font-medium text-claro-texto dark:text-oscuro-texto line-through">Bs. {reb.monto_original}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-claro-texto2">Reembolso</p>
                                                        <p className={`text-lg font-bold ${
                                                            reb.estado === 'aprobado' ? 'text-green-600' :
                                                            reb.estado === 'rechazado' ? 'text-red-600' :
                                                            'text-yellow-600'
                                                        }`}>
                                                            Bs. {reb.monto_reembolsado}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-claro-texto2">Anticipación</p>
                                                        <p className="text-sm font-medium text-claro-texto dark:text-oscuro-texto">
                                                            {Math.round(reb.horas_anticipacion)} horas
                                                        </p>
                                                    </div>
                                                </div>

                                                {reb.motivo_cancelacion && (
                                                    <p className="mt-2 text-xs text-claro-texto2 italic">
                                                        Motivo: {reb.motivo_cancelacion}
                                                    </p>
                                                )}
                                                {reb.notas_admin && (
                                                    <p className="mt-1 text-xs text-claro-texto2">
                                                        📝 Nota admin: {reb.notas_admin}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Modal de Cancelación con Política de Reembolso */}
            {modalCancelar.open && modalCancelar.reserva && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl shadow-xl border border-claro-borde dark:border-oscuro-borde">
                        <div className="px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde">
                            <h2 className="text-xl font-semibold text-claro-texto dark:text-oscuro-texto">Cancelar Reserva</h2>
                            <p className="text-sm text-claro-texto2 mt-1">
                                {modalCancelar.reserva.cancha_nombre} — {new Date(modalCancelar.reserva.fecha_reserva).toLocaleDateString('es-ES')}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Política de reembolso visual */}
                            {(() => {
                                const politica = calcularPolitica(modalCancelar.reserva.fecha_reserva, modalCancelar.reserva.hora_inicio);
                                if (politica.porcentaje < 0) return null;

                                return (
                                    <div className={`rounded-xl p-4 border-2 ${
                                        politica.color === 'green' ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800' :
                                        politica.color === 'yellow' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800' :
                                        politica.color === 'orange' ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800' :
                                        'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                                    }`}>
                                        <h3 className="font-semibold text-sm mb-3 text-claro-texto dark:text-oscuro-texto">
                                            💰 Política de Reembolso
                                        </h3>
                                        
                                        {/* Barra de progreso visual */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs text-claro-texto2 mb-1">
                                                <span>0%</span>
                                                <span>25%</span>
                                                <span>50%</span>
                                                <span>100%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${
                                                    politica.color === 'green' ? 'bg-green-500 w-full' :
                                                    politica.color === 'yellow' ? 'bg-yellow-500 w-1/2' :
                                                    politica.color === 'orange' ? 'bg-orange-500 w-1/4' :
                                                    'bg-red-500 w-0'
                                                }`} />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-claro-texto2 mt-1">
                                                <span>&lt;6h</span>
                                                <span>6-12h</span>
                                                <span>12-24h</span>
                                                <span>&gt;24h</span>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <p className={`text-3xl font-bold ${
                                                politica.color === 'green' ? 'text-green-600' :
                                                politica.color === 'yellow' ? 'text-yellow-600' :
                                                politica.color === 'orange' ? 'text-orange-600' :
                                                'text-red-600'
                                            }`}>
                                                {politica.texto}
                                            </p>
                                            <p className="text-xs text-claro-texto2 mt-1">
                                                {politica.horas !== undefined && `${politica.horas} horas antes de la reserva`}
                                            </p>
                                            {modalCancelar.reserva.precio_hora && politica.porcentaje > 0 && (
                                                <p className="text-sm font-medium mt-2 text-claro-texto dark:text-oscuro-texto">
                                                    Recibirás: <span className="text-green-600 font-bold">Bs. {(modalCancelar.reserva.precio_hora * politica.porcentaje / 100).toFixed(2)}</span>
                                                    <span className="text-xs text-claro-texto2"> (pendiente de aprobación)</span>
                                                </p>
                                            )}
                                            {politica.porcentaje === 0 && (
                                                <p className="text-xs text-red-600 mt-2 font-medium">
                                                    ⚠️ No se realizará reembolso. Cancelación dentro de las 6 horas previas.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Tabla de política completa */}
                            <div className="bg-claro-fondo dark:bg-oscuro-fondo rounded-xl p-3">
                                <p className="text-xs font-semibold text-claro-texto dark:text-oscuro-texto mb-2">📋 Tabla de Reembolsos:</p>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    <span className="text-green-600 font-medium">+24h antes</span><span className="text-claro-texto2">100% reembolso</span>
                                    <span className="text-yellow-600 font-medium">12-24h antes</span><span className="text-claro-texto2">50% reembolso</span>
                                    <span className="text-orange-600 font-medium">6-12h antes</span><span className="text-claro-texto2">25% reembolso</span>
                                    <span className="text-red-600 font-medium">&lt;6h antes</span><span className="text-claro-texto2">Sin reembolso</span>
                                </div>
                            </div>

                            {/* Motivo */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-claro-texto dark:text-oscuro-texto">
                                    Motivo de cancelación *
                                </label>
                                <textarea
                                    value={motivoCancelacion}
                                    onChange={(e) => setMotivoCancelacion(e.target.value)}
                                    placeholder="Explica el motivo de tu cancelación..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-claro-borde dark:border-oscuro-borde">
                            <button
                                onClick={() => setModalCancelar({ open: false, reserva: null })}
                                className="px-5 py-2 text-sm font-medium rounded-lg hover:bg-claro-tinte"
                            >
                                Volver
                            </button>
                            <button
                                onClick={confirmarCancelacion}
                                disabled={procesandoCancelacion || !motivoCancelacion.trim()}
                                className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-all text-white ${
                                    procesandoCancelacion || !motivoCancelacion.trim()
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {procesandoCancelacion ? 'Cancelando...' : 'Confirmar Cancelación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ModalReserva
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={() => { cargarReservas(); cargarReembolsos(); }}
                cancha={null}
            />
        </div>
    );
};

export default MisReservas;
