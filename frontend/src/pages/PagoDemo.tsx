import { useEffect, useMemo, useState } from 'react';
import { crearPago, obtenerPagosReserva, type PagoDetalle } from '../services/pago.api';
import { limpiarAdicionalesReserva } from '../utils/reservaExtras';

interface ReservaPago {
    id_reserva: number;
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
}

type MetodoPago = 'tarjeta' | 'qr' | 'transferencia';

const calcularHoras = (inicio: string, fin: string) => {
    const [hi, mi] = inicio.slice(0, 5).split(':').map(Number);
    const [hf, mf] = fin.slice(0, 5).split(':').map(Number);
    return Math.max(0, ((hf * 60 + mf) - (hi * 60 + mi)) / 60);
};

const PagoDemo = ({ reserva, onClose, onComplete }: PagoDemoProps) => {
    const [metodo, setMetodo] = useState<MetodoPago>('tarjeta');
    const [tarjeta, setTarjeta] = useState('');
    const [referencia, setReferencia] = useState('');
    const [historial, setHistorial] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const precioReserva = useMemo(
        () => Number(reserva.precio_hora) * calcularHoras(reserva.hora_inicio, reserva.hora_fin),
        [reserva]
    );

    const detalles = reserva.detallesIniciales || [];

    const total = precioReserva + detalles.reduce((suma, detalle) => suma + detalle.subtotal, 0);

    const cargarHistorial = async () => {
        try {
            setHistorial(await obtenerPagosReserva(reserva.id_reserva));
        } catch {
            setHistorial([]);
        }
    };

    useEffect(() => { cargarHistorial(); }, [reserva.id_reserva]);

    const enviarPago = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setMensaje('');
        if (metodo === 'tarjeta' && !/^\d{4,19}$/.test(tarjeta)) {
            setError('Ingresa un número de tarjeta de prueba de 4 a 19 dígitos.');
            return;
        }
        setCargando(true);
        try {
            const response = await crearPago({
                id_reserva: reserva.id_reserva,
                monto: Number(total.toFixed(2)),
                metodo_pago: metodo,
                numero_tarjeta: metodo === 'tarjeta' ? tarjeta : undefined,
                referencia_pasarela: referencia || undefined,
                detalles
            });
            setMensaje(response.data.estado === 'pagado'
                ? `Pago aprobado. Comprobante: ${response.data.nro_comprobante}`
                : 'Pago rechazado. Puedes intentarlo nuevamente sin crear otra reserva.');
            setTarjeta('');
            if (response.data.estado === 'pagado') limpiarAdicionalesReserva(reserva.id_reserva);
            await cargarHistorial();
            onComplete();
        } catch (err: any) {
            setError(err.response?.data?.error || 'No se pudo procesar el pago');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-claro-tarjeta shadow-2xl dark:bg-oscuro-tarjeta" onClick={(event) => event.stopPropagation()}>
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
                            {(['tarjeta', 'qr', 'transferencia'] as MetodoPago[]).map((opcion) => (
                                <button key={opcion} type="button" onClick={() => setMetodo(opcion)} className={`rounded-2xl border p-4 text-left text-sm capitalize transition ${metodo === opcion ? 'border-claro-primario bg-claro-primario/10 shadow-sm' : 'border-claro-borde hover:border-claro-primario/50'}`}>
                                    <span className="block text-lg">{opcion === 'tarjeta' ? '▣' : opcion === 'qr' ? '▦' : '↗'}</span><span className="mt-2 block font-semibold">{opcion}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {metodo === 'tarjeta' ? (
                        <label className="block text-sm text-claro-texto dark:text-oscuro-texto">
                            Tarjeta de prueba
                            <input value={tarjeta} onChange={(event) => setTarjeta(event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="4111111111111111" className="mt-1 w-full rounded-lg border border-claro-borde bg-transparent p-3" />
                            <span className="mt-1 block text-xs text-claro-texto2">Usa una tarjeta terminada en 0002 para simular rechazo.</span>
                        </label>
                    ) : (
                        <label className="block text-sm text-claro-texto dark:text-oscuro-texto">
                            Referencia de operación (opcional)
                            <input value={referencia} onChange={(event) => setReferencia(event.target.value)} placeholder="Se genera automáticamente si queda vacío" className="mt-1 w-full rounded-lg border border-claro-borde bg-transparent p-3" />
                        </label>
                    )}

                    {metodo === 'qr' && <div className="flex items-center gap-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/40"><img src="/demo-qr.svg" alt="Código QR de demostración" className="h-28 w-28 rounded-xl bg-white p-2" /><div><p className="font-semibold text-slate-900 dark:text-cyan-100">QR de demostración</p><p className="mt-1 text-xs text-slate-600 dark:text-cyan-200">Este código es ilustrativo y no procesa un pago real.</p></div></div>}

                    <section>
                        <div className="mb-3 flex items-end justify-between gap-3">
                            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-claro-primario">Resumen elegido</p><h3 className="mt-1 font-semibold text-claro-texto dark:text-oscuro-texto">Servicios adicionales</h3></div>
                            <span className="text-xs text-claro-texto2">Se seleccionan en la reserva</span>
                        </div>
                        {detalles.length ? <div className="space-y-2">{detalles.map((detalle) => <div key={detalle.nombre} className="flex items-center justify-between rounded-xl border border-claro-borde bg-claro-tinte/40 px-4 py-3 text-sm dark:bg-oscuro-tinte/30"><span><span className="font-semibold text-claro-texto dark:text-oscuro-texto">{detalle.nombre}</span><span className="ml-2 text-xs text-claro-texto2">{detalle.cantidad} × Bs. {detalle.precio_unitario.toFixed(2)}</span></span><span className="font-semibold text-claro-primario">Bs. {detalle.subtotal.toFixed(2)}</span></div>)}</div> : <p className="rounded-xl border border-dashed border-claro-borde p-4 text-sm text-claro-texto2">No agregaste servicios adicionales.</p>}
                    </section>

                    <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-slate-100 p-5 dark:from-slate-800 dark:to-slate-900">
                        <div className="flex justify-between text-sm"><span>Reserva</span><span>Bs. {precioReserva.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span>Adicionales</span><span>Bs. {detalles.reduce((suma, detalle) => suma + detalle.subtotal, 0).toFixed(2)}</span></div>
                        <div className="mt-3 flex justify-between border-t border-slate-300 pt-3 text-xl font-bold text-slate-950 dark:border-slate-700 dark:text-white"><span>Total a pagar</span><span>Bs. {total.toFixed(2)}</span></div>
                    </div>

                    {error && <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</p>}
                    {mensaje && <p className="rounded-lg bg-green-100 p-3 text-sm text-green-700">{mensaje}</p>}
                    <button disabled={cargando} className="w-full rounded-xl bg-claro-primario px-4 py-3.5 font-semibold text-white shadow-lg shadow-cyan-900/10 transition hover:-translate-y-0.5 hover:bg-claro-hover disabled:opacity-50">{cargando ? 'Procesando...' : `Pagar Bs. ${total.toFixed(2)}`}</button>
                    <button type="button" onClick={onClose} className="w-full rounded-xl border border-claro-borde px-4 py-3 text-sm font-semibold text-claro-texto2 transition hover:border-claro-primario hover:text-claro-primario">Pagar después desde Mis reservas</button>
                </form>

                <section className="border-t border-claro-borde bg-claro-tinte/50 p-6 dark:bg-oscuro-tinte/30 md:p-7">
                    <h3 className="mb-2 font-semibold text-claro-texto dark:text-oscuro-texto">Historial de intentos</h3>
                    {historial.length === 0 ? <p className="text-sm text-claro-texto2">Todavía no hay intentos.</p> : historial.map((pago) => <div key={pago.id_pago} className="flex justify-between border-b border-claro-borde py-2 text-sm"><span>#{pago.id_pago} · {pago.metodo_pago}</span><span className={pago.estado === 'pagado' ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>{pago.estado}</span></div>)}
                </section>
            </div>
        </div>
    );
};

export default PagoDemo;
