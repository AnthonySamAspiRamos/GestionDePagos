import { useEffect, useMemo, useState } from 'react';
import { crearPago, obtenerPagosReserva, type PagoDetalle } from '../services/pago.api';
import { limpiarAdicionalesReserva } from '../utils/reservaExtras';
import { useAuth } from '../context/AuthContext';

interface ReservaPago {
    id_reserva?: number;
    cancha_nombre: string;
    fecha_reserva: string;
    hora_inicio: string;
    hora_fin: string;
    precio_hora: number | string;
    detallesIniciales?: PagoDetalle[];
}

interface PagoDemoProps {
    reserva: ReservaPago;
    onClose: () => void;
    onComplete: () => void;
    onCrearReserva?: () => Promise<number>;
    onPagarDespues?: () => void;
}

type MetodoPago = 'efectivo' | 'qr' | 'transferencia';

const METODOS_PAGO: { value: MetodoPago; label: string; icon: string }[] = [
    { value: 'efectivo', label: 'Efectivo', icon: '$' },
    { value: 'qr', label: 'QR', icon: '▦' },
    { value: 'transferencia', label: 'Transferencia', icon: '↗' }
];

const calcularHoras = (inicio: string, fin: string) => {
    const [hi, mi] = inicio.slice(0, 5).split(':').map(Number);
    const [hf, mf] = fin.slice(0, 5).split(':').map(Number);
    return Math.max(0, ((hf * 60 + mf) - (hi * 60 + mi)) / 60);
};

const PagoDemo = ({ reserva, onClose, onComplete, onCrearReserva, onPagarDespues }: PagoDemoProps) => {
    const { usuario } = useAuth();
    const esAdminOEmpleado = ['admin', 'administrador', 'empleado']
        .includes(String(usuario?.rol || '').toLowerCase());

    const [idReserva, setIdReserva] = useState<number | undefined>(reserva.id_reserva);
    const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
    const [comprobante, setComprobante] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [referencia, setReferencia] = useState('');
    const [historial, setHistorial] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!comprobante) {
            setPreviewUrl('');
            return;
        }

        const objectUrl = URL.createObjectURL(comprobante);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [comprobante]);

    const precioReserva = useMemo(
        () => Number(reserva.precio_hora) * calcularHoras(reserva.hora_inicio, reserva.hora_fin),
        [reserva]
    );

    const detalles = reserva.detallesIniciales || [];
    const subtotalAdicionales = detalles.reduce((suma, detalle) => suma + detalle.subtotal, 0);
    const total = precioReserva + subtotalAdicionales;

    const cargarHistorial = async () => {
        if (!idReserva) return;
        try {
            setHistorial(await obtenerPagosReserva(idReserva));
        } catch {
            setHistorial([]);
        }
    };

    useEffect(() => { cargarHistorial(); }, [idReserva]);

    const enviarPago = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setMensaje('');
        setCargando(true);
        try {
            let id = idReserva;
            if (!id && onCrearReserva) {
                id = await onCrearReserva();
                setIdReserva(id);
            }
            if (!id) throw new Error('No se pudo crear la reserva');

            const response = await crearPago({
                id_reserva: id,
                metodo_pago: metodo,
                comprobante: comprobante || undefined,
                referencia_pasarela: referencia || undefined
            });

            const estadoPago = response.data?.estado;
            setMensaje(metodo === 'efectivo'
                ? '✅ Pago en efectivo registrado. La reserva quedó pendiente.'
                : '✅ Pago registrado. La reserva está pendiente de verificación.');
            setComprobante(null);
            if (estadoPago !== 'rechazado') limpiarAdicionalesReserva(id);
            await cargarHistorial();

            // Reserva nueva: se muestra el mensaje un momento y luego se redirige
            if (onCrearReserva && estadoPago !== 'rechazado') {
                setTimeout(onComplete, esAdminOEmpleado ? 800 : 1500);
            } else {
                onComplete();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'No se pudo procesar el pago');
        } finally {
            setCargando(false);
        }
    };

    const pagarDespues = async () => {
        setError('');
        setCargando(true);
        try {
            if (!idReserva && onCrearReserva) setIdReserva(await onCrearReserva());
            if (onPagarDespues) onPagarDespues(); else onClose();
        } catch (err: any) {
            setError(err.message || 'No se pudo guardar la reserva');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-claro-tarjeta shadow-2xl dark:bg-oscuro-tarjeta">
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white md:p-7">
                    <div className="mb-5 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Paso 3 · Pago seguro</p>
                            <h2 className="mt-2 text-2xl font-bold">Completar pago</h2>
                            <p className="mt-1 text-sm text-slate-300">{reserva.cancha_nombre} · {new Date(reserva.fecha_reserva).toLocaleDateString()} · {reserva.hora_inicio.slice(0, 5)} - {reserva.hora_fin.slice(0, 5)}</p>
                        </div>
                        <button type="button" onClick={onClose} className="rounded-full border border-white/20 px-3 py-1 text-2xl leading-none text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar">×</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
                        <span className="rounded-full bg-white/10 px-2 py-2 text-white">1 · Reserva</span>
                        <span className="rounded-full bg-white/10 px-2 py-2 text-white">2 · Adicionales</span>
                        <span className="rounded-full bg-cyan-400/20 px-2 py-2 text-cyan-200">3 · Pago</span>
                    </div>
                </div>

                <form onSubmit={enviarPago} className="space-y-6 p-6 md:p-7">
                    <section>
                        <div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-claro-primario">Elige una opción</p><h3 className="mt-1 font-semibold text-claro-texto dark:text-oscuro-texto">Método de pago</h3></div><span className="text-xs text-claro-texto2">Demo conectada a PostgreSQL</span></div>
                        <div className="grid grid-cols-3 gap-2">
                            {METODOS_PAGO.map((opcion) => (
                                <button key={opcion.value} type="button" onClick={() => {
                                    setMetodo(opcion.value);
                                    if (opcion.value === 'efectivo') {
                                        setComprobante(null);
                                        setReferencia('');
                                    }
                                }} className={`rounded-2xl border p-4 text-left text-sm transition ${metodo === opcion.value ? 'border-claro-primario bg-claro-primario/10 shadow-sm' : 'border-claro-borde hover:border-claro-primario/50'}`}>
                                    <span className="block text-lg">{opcion.icon}</span>
                                    <span className="mt-2 block font-semibold">{opcion.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {(metodo === 'qr' || metodo === 'transferencia') && (
                        <label className="block text-sm text-claro-texto dark:text-oscuro-texto">
                            Referencia de operación (opcional)
                            <input value={referencia} onChange={(event) => setReferencia(event.target.value)} placeholder="Número o referencia de la operación" className="mt-1 w-full rounded-lg border border-claro-borde bg-transparent p-3" />
                            <span className="mt-3 block">Comprobante (opcional)</span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                                        setError('El comprobante debe ser una imagen JPG, PNG o WEBP.');
                                        setComprobante(null);
                                        event.target.value = '';
                                        return;
                                    }
                                    if (file.size > 5 * 1024 * 1024) {
                                        setError('La imagen no debe superar 5 MB.');
                                        setComprobante(null);
                                        event.target.value = '';
                                        return;
                                    }
                                    setError('');
                                    setComprobante(file);
                                }}
                                className="mt-1 block w-full rounded-lg border border-claro-borde bg-transparent p-3"
                            />
                            {previewUrl && <img src={previewUrl} alt="Vista previa del comprobante" className="mt-3 max-h-40 rounded-lg object-contain" />}
                        </label>
                    )}

                    {metodo === 'efectivo' && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">La reserva quedará pendiente hasta que se confirme el pago en efectivo.</p>}

                    <section>
                        <div className="mb-3 flex items-end justify-between gap-3">
                            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-claro-primario">Resumen elegido</p><h3 className="mt-1 font-semibold text-claro-texto dark:text-oscuro-texto">Servicios adicionales</h3></div>
                            <span className="text-xs text-claro-texto2">Se seleccionan en la reserva</span>
                        </div>
                        {detalles.length ? <div className="space-y-2">{detalles.map((detalle) => <div key={detalle.nombre} className="flex items-center justify-between rounded-xl border border-claro-borde bg-claro-tinte/40 px-4 py-3 text-sm dark:bg-oscuro-tinte/30"><span><span className="font-semibold text-claro-texto dark:text-oscuro-texto">{detalle.nombre}</span><span className="ml-2 text-xs text-claro-texto2">{detalle.cantidad} × Bs. {detalle.precio_unitario.toFixed(2)}</span></span><span className="font-semibold text-claro-primario">Bs. {detalle.subtotal.toFixed(2)}</span></div>)}</div> : <p className="rounded-xl border border-dashed border-claro-borde p-4 text-sm text-claro-texto2">No agregaste servicios adicionales.</p>}
                    </section>

                    <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-slate-100 p-5 dark:from-slate-800 dark:to-slate-900">
                        <div className="flex justify-between text-sm"><span>Reserva</span><span>Bs. {precioReserva.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span>Adicionales</span><span>Bs. {subtotalAdicionales.toFixed(2)}</span></div>
                        <div className="mt-3 flex justify-between border-t border-slate-300 pt-3 text-xl font-bold text-slate-950 dark:border-slate-700 dark:text-white"><span>Total a pagar</span><span>Bs. {total.toFixed(2)}</span></div>
                    </div>

                    {error && <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</p>}
                    {mensaje && <p className="rounded-lg bg-green-100 p-3 text-sm text-green-700">{mensaje}</p>}

                    <button disabled={cargando} className="w-full rounded-xl bg-claro-primario px-4 py-3.5 font-semibold text-white shadow-lg shadow-cyan-900/10 transition hover:-translate-y-0.5 hover:bg-claro-hover disabled:opacity-50">{cargando ? 'Procesando...' : `Registrar pago Bs. ${total.toFixed(2)}`}</button>

                    {/* "Pagar después" solo para CLIENTES */}
                    {!esAdminOEmpleado && (
                        <button type="button" disabled={cargando} onClick={pagarDespues} className="w-full rounded-xl border border-claro-borde px-4 py-3 text-sm font-semibold text-claro-texto2 transition hover:border-claro-primario hover:text-claro-primario disabled:opacity-50">
                            Pagar después desde Mis reservas
                        </button>
                    )}
                </form>

                <section className="border-t border-claro-borde bg-claro-tinte/50 p-6 dark:bg-oscuro-tinte/30 md:p-7">
                    <h3 className="mb-2 font-semibold text-claro-texto dark:text-oscuro-texto">Historial de intentos</h3>
                    {historial.length === 0 ? <p className="text-sm text-claro-texto2">Todavía no hay intentos.</p> : historial.map((pago) => <div key={pago.id_pago} className="flex justify-between border-b border-claro-borde py-2 text-sm"><span>#{pago.id_pago} · {pago.metodo_pago}</span><span className={pago.estado === 'pagado' ? 'font-semibold text-green-600' : pago.estado === 'pendiente' ? 'font-semibold text-amber-600' : 'font-semibold text-red-600'}>{pago.estado}</span></div>)}
                </section>
            </div>
        </div>
    );
};

export default PagoDemo;