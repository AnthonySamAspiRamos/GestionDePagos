import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GestionReembolsos = () => {
    const { usuario, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [reembolsos, setReembolsos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [modalProcesar, setModalProcesar] = useState<{ open: boolean; reembolso: any; accion: 'aprobar' | 'rechazar' }>({
        open: false, reembolso: null, accion: 'aprobar'
    });
    const [notas, setNotas] = useState('');
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const isAdmin = usuario?.rol === 'Admin' || usuario?.rol === 'Administrador';
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
        cargarReembolsos();
    }, [isAuthenticated, usuario, navigate]);

    const cargarReembolsos = async () => {
        setCargando(true);
        try {
            const res = await api.get('/reembolsos/pendientes');
            setReembolsos(res.data?.data || []);
        } catch (err: any) {
            setError('Error al cargar reembolsos pendientes');
        } finally {
            setCargando(false);
        }
    };

    const abrirModal = (reembolso: any, accion: 'aprobar' | 'rechazar') => {
        setModalProcesar({ open: true, reembolso, accion });
        setNotas('');
    };

    const confirmarProcesar = async () => {
        if (!modalProcesar.reembolso) return;
        setProcesando(true);
        try {
            const res = await api.put(`/reembolsos/${modalProcesar.reembolso.id_reembolso}/procesar`, {
                estado: modalProcesar.accion === 'aprobar' ? 'aprobado' : 'rechazado',
                notas_admin: notas || undefined
            });
            setMensaje(res.data?.message || `Reembolso ${modalProcesar.accion === 'aprobar' ? 'aprobado' : 'rechazado'} correctamente`);
            setModalProcesar({ open: false, reembolso: null, accion: 'aprobar' });
            setNotas('');
            setReembolsos(prev => prev.filter(r => r.id_reembolso !== modalProcesar.reembolso.id_reembolso));
            setTimeout(() => setMensaje(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al procesar reembolso');
            setTimeout(() => setError(''), 3000);
        } finally {
            setProcesando(false);
        }
    };

    const getMetodoLabel = (metodo: string) => {
        const labels: Record<string, string> = {
            presencial: '🏢 Presencial',
            tarjeta_debito: '💳 Tarjeta Débito',
            tarjeta_credito: '💎 Tarjeta Crédito',
            qr: '📱 QR'
        };
        return labels[metodo] || metodo;
    };

    const getPorcentajeColor = (porcentaje: number) => {
        if (porcentaje >= 100) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
        if (porcentaje >= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
        if (porcentaje >= 25) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    };

    if (cargando) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-claro-primario border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-claro-texto2">Cargando reembolsos pendientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-claro-fondo dark:bg-oscuro-fondo p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mb-2">
                        💰 Gestionar Reembolsos
                    </h1>
                    <p className="text-claro-texto2">
                        Aprueba o rechaza las solicitudes de reembolso de los clientes
                    </p>
                </div>

                {mensaje && (
                    <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-medium">
                        {mensaje}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium">
                        {error}
                    </div>
                )}

                {reembolsos.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="text-6xl mb-4 block">✅</span>
                        <h3 className="text-xl font-semibold text-claro-texto dark:text-oscuro-texto mb-2">
                            No hay reembolsos pendientes
                        </h3>
                        <p className="text-claro-texto2">Todas las solicitudes han sido procesadas</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reembolsos.map((reb) => (
                            <div key={reb.id_reembolso} className="bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-xl shadow-md border border-claro-borde dark:border-oscuro-borde overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="text-lg font-bold text-claro-texto dark:text-oscuro-texto">
                                                    {reb.cliente_nombre} {reb.apellido_paterno}
                                                </span>
                                                <span className={`text-sm px-3 py-1 rounded-full font-medium ${getPorcentajeColor(reb.porcentaje_reembolso)}`}>
                                                    {reb.porcentaje_reembolso}% reembolso
                                                </span>
                                                <span className="text-sm bg-claro-primario/10 text-claro-primario px-3 py-1 rounded-full">
                                                    {getMetodoLabel(reb.metodo_pago)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-claro-texto2 mb-3">{reb.correo}</p>

                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                                <div>
                                                    <p className="text-claro-texto2">Cancha</p>
                                                    <p className="font-medium text-claro-texto">{reb.cancha_nombre}</p>
                                                </div>
                                                <div>
                                                    <p className="text-claro-texto2">Fecha</p>
                                                    <p className="font-medium text-claro-texto">{new Date(reb.fecha_reserva).toLocaleDateString('es-ES')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-claro-texto2">Horario</p>
                                                    <p className="font-medium text-claro-texto">{reb.hora_inicio?.slice(0,5)} - {reb.hora_fin?.slice(0,5)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-claro-texto2">Monto original</p>
                                                    <p className="font-medium text-claro-texto line-through">Bs. {parseFloat(reb.monto_original).toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-claro-texto2">A reembolsar</p>
                                                    <p className="font-bold text-green-600 text-lg">Bs. {parseFloat(reb.monto_reembolsado).toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-claro-texto2">Anticipación</p>
                                                    <p className="font-medium text-claro-texto">{Math.round(reb.horas_anticipacion)} horas antes</p>
                                                </div>
                                                <div>
                                                    <p className="text-claro-texto2">Solicitado</p>
                                                    <p className="font-medium text-claro-texto">{new Date(reb.fecha_solicitud).toLocaleString('es-ES')}</p>
                                                </div>
                                            </div>

                                            {reb.motivo_cancelacion && (
                                                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                                                    <p className="text-xs text-claro-texto2 mb-1">Motivo de cancelación:</p>
                                                    <p className="text-sm text-claro-texto">{reb.motivo_cancelacion}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 lg:flex-col lg:items-end">
                                            <button
                                                onClick={() => abrirModal(reb, 'rechazar')}
                                                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                            >
                                                ✕ Rechazar
                                            </button>
                                            <button
                                                onClick={() => abrirModal(reb, 'aprobar')}
                                                className="px-4 py-2 text-sm font-medium rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                                            >
                                                ✓ Aprobar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de confirmación */}
            {modalProcesar.open && modalProcesar.reembolso && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl shadow-xl border border-claro-borde dark:border-oscuro-borde">
                        <div className="px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde">
                            <h2 className="text-xl font-semibold text-claro-texto dark:text-oscuro-texto">
                                {modalProcesar.accion === 'aprobar' ? '✅ Aprobar Reembolso' : '❌ Rechazar Reembolso'}
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-claro-fondo dark:bg-oscuro-fondo rounded-xl p-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-claro-texto2">Cliente</p>
                                        <p className="font-medium text-claro-texto">{modalProcesar.reembolso.cliente_nombre} {modalProcesar.reembolso.apellido_paterno}</p>
                                    </div>
                                    <div>
                                        <p className="text-claro-texto2">Monto a reembolsar</p>
                                        <p className="font-bold text-green-600 text-lg">Bs. {parseFloat(modalProcesar.reembolso.monto_reembolsado).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-claro-texto2">Porcentaje</p>
                                        <p className="font-medium text-claro-texto">{modalProcesar.reembolso.porcentaje_reembolso}%</p>
                                    </div>
                                    <div>
                                        <p className="text-claro-texto2">Método de pago</p>
                                        <p className="font-medium text-claro-texto">{getMetodoLabel(modalProcesar.reembolso.metodo_pago)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-claro-texto dark:text-oscuro-texto">
                                    Notas (opcional)
                                </label>
                                <textarea
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    placeholder={modalProcesar.accion === 'aprobar' ? 'Agregar nota de aprobación...' : 'Motivo del rechazo...'}
                                    rows={3}
                                    className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-claro-borde dark:border-oscuro-borde">
                            <button
                                onClick={() => setModalProcesar({ open: false, reembolso: null, accion: 'aprobar' })}
                                className="px-5 py-2 text-sm font-medium rounded-lg hover:bg-claro-tinte"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarProcesar}
                                disabled={procesando}
                                className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-all text-white ${
                                    procesando ? 'bg-gray-400 cursor-not-allowed' :
                                    modalProcesar.accion === 'aprobar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {procesando ? 'Procesando...' : modalProcesar.accion === 'aprobar' ? 'Aprobar Reembolso' : 'Rechazar Reembolso'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionReembolsos;
