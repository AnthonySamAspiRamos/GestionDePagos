import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import FieldError from '../FieldError';
import type { Cancha } from './cancha.types';

interface ModalReservaProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    cancha: Cancha | null;
    esPresencial?: boolean;
}

type MetodoPago = 'presencial' | 'tarjeta_debito' | 'tarjeta_credito' | 'qr';

const ModalReserva = ({ isOpen, onClose, onSave, cancha = null, esPresencial = false }: ModalReservaProps) => {
    const [paso, setPaso] = useState<'reserva' | 'pago'>('reserva');
    const [formData, setFormData] = useState({
        fecha_reserva: '',
        hora_inicio: '',
        hora_fin: '',
        id_cancha: cancha?.id_cancha || '',
        id_cliente: '',
        observaciones: ''
    });

    const [pagoData, setPagoData] = useState({
        metodo_pago: 'presencial' as MetodoPago,
        // Tarjeta
        numero_tarjeta: '',
        titular_tarjeta: '',
        cvv: '',
        fecha_expiracion: '',
        // QR (generado automáticamente)
        qrGenerado: false
    });

    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [monto, setMonto] = useState(0);
    const [idReservaCreada, setIdReservaCreada] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                if (!cancha) {
                    const res = await api.get('/canchas');
                    setCanchas(res.data.data || []);
                }
                if (esPresencial) {
                    const res = await api.get('/usuarios?rol=Cliente');
                    setClientes(res.data.data || res.data || []);
                }
            } catch (err) {
                console.error('Error al cargar datos', err);
            }
        };
        fetchData();
    }, [isOpen, cancha, esPresencial]);

    useEffect(() => {
        if (cancha) {
            setFormData(prev => ({ ...prev, id_cancha: cancha.id_cancha }));
        }
    }, [cancha]);

    useEffect(() => {
        if (isOpen) {
            setPaso('reserva');
            setFormData({
                fecha_reserva: '',
                hora_inicio: '',
                hora_fin: '',
                id_cancha: cancha?.id_cancha || '',
                id_cliente: '',
                observaciones: ''
            });
            setPagoData({
                metodo_pago: 'presencial',
                numero_tarjeta: '',
                titular_tarjeta: '',
                cvv: '',
                fecha_expiracion: '',
                qrGenerado: false
            });
            setErrores({});
            setError('');
            setMonto(0);
            setIdReservaCreada(null);
            setSuccessMsg('');
        }
    }, [isOpen]);

    const calcularMonto = () => {
        if (!formData.id_cancha || !formData.hora_inicio || !formData.hora_fin) {
            setMonto(0);
            return;
        }

        const canchaSeleccionada = cancha?.id_cancha === Number(formData.id_cancha)
            ? cancha
            : canchas.find(c => c.id_cancha === Number(formData.id_cancha));

        if (!canchaSeleccionada || !canchaSeleccionada.precio_hora) {
            setMonto(0);
            return;
        }

        const [hi, mi] = formData.hora_inicio.split(':').map(Number);
        const [hf, mf] = formData.hora_fin.split(':').map(Number);
        const horas = (hf * 60 + mf - (hi * 60 + mi)) / 60;

        if (horas > 0) {
            setMonto(horas * Number(canchaSeleccionada.precio_hora));
        } else {
            setMonto(0);
        }
    };

    useEffect(() => {
        calcularMonto();
    }, [formData.hora_inicio, formData.hora_fin, formData.id_cancha, cancha, canchas]);

    if (!isOpen) return null;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
    };

    // Formateador para número de tarjeta (XXXX XXXX XXXX XXXX)
    const formatearNumeroTarjeta = (valor: string) => {
        const soloNumeros = valor.replace(/\D/g, '').slice(0, 16);
        return soloNumeros.replace(/(.{4})/g, '$1 ').trim();
    };

    // Formateador para fecha de expiración (MM/AA)
    const formatearFechaExpiracion = (valor: string) => {
        const soloNumeros = valor.replace(/\D/g, '').slice(0, 4);
        if (soloNumeros.length >= 3) {
            return soloNumeros.slice(0, 2) + '/' + soloNumeros.slice(2);
        }
        return soloNumeros;
    };

    const handlePagoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let valorFormateado = value;

        if (name === 'numero_tarjeta') {
            valorFormateado = formatearNumeroTarjeta(value);
        } else if (name === 'cvv') {
            valorFormateado = value.replace(/\D/g, '').slice(0, 3);
        } else if (name === 'fecha_expiracion') {
            valorFormateado = formatearFechaExpiracion(value);
        }

        setPagoData(prev => ({ ...prev, [name]: valorFormateado }));
        if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
    };

    const validarReserva = () => {
        const nuevosErrores: Record<string, string> = {};
        if (!formData.fecha_reserva) nuevosErrores.fecha_reserva = 'La fecha es obligatoria';
        if (!formData.hora_inicio) nuevosErrores.hora_inicio = 'La hora de inicio es obligatoria';
        if (!formData.hora_fin) nuevosErrores.hora_fin = 'La hora de fin es obligatoria';
        if (!formData.id_cancha) nuevosErrores.id_cancha = 'Debe seleccionar una cancha';
        if (esPresencial && !formData.id_cliente) nuevosErrores.id_cliente = 'Debe seleccionar un cliente';

        if (formData.hora_inicio && formData.hora_fin && formData.hora_inicio >= formData.hora_fin) {
            nuevosErrores.hora_fin = 'La hora de fin debe ser mayor a la de inicio';
        }
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const validarPago = () => {
        const nuevosErrores: Record<string, string> = {};

        if (pagoData.metodo_pago === 'tarjeta_debito' || pagoData.metodo_pago === 'tarjeta_credito') {
            const numeroLimpio = pagoData.numero_tarjeta.replace(/\s/g, '');
            if (!numeroLimpio) {
                nuevosErrores.numero_tarjeta = 'El número de tarjeta es obligatorio';
            } else if (numeroLimpio.length !== 16) {
                nuevosErrores.numero_tarjeta = 'El número de tarjeta debe tener 16 dígitos';
            }

            if (!pagoData.titular_tarjeta.trim()) {
                nuevosErrores.titular_tarjeta = 'El titular es obligatorio';
            }

            if (!pagoData.cvv) {
                nuevosErrores.cvv = 'El CVV es obligatorio';
            } else if (pagoData.cvv.length !== 3) {
                nuevosErrores.cvv = 'El CVV debe tener 3 dígitos';
            }

            if (!pagoData.fecha_expiracion) {
                nuevosErrores.fecha_expiracion = 'La fecha de expiración es obligatoria';
            } else {
                const [mm, aa] = pagoData.fecha_expiracion.split('/').map(Number);
                if (!mm || !aa || mm < 1 || mm > 12) {
                    nuevosErrores.fecha_expiracion = 'Formato inválido (MM/AA)';
                } else {
                    const ahora = new Date();
                    const expiracion = new Date(2000 + aa, mm - 1);
                    if (expiracion < ahora) {
                        nuevosErrores.fecha_expiracion = 'La tarjeta está expirada';
                    }
                }
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleCrearReserva = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validarReserva()) return;

        setCargando(true);
        try {
            const payload: any = {
                fecha_reserva: formData.fecha_reserva,
                hora_inicio: formData.hora_inicio,
                hora_fin: formData.hora_fin,
                id_cancha: Number(formData.id_cancha),
                observaciones: formData.observaciones || undefined
            };

            if (esPresencial) {
                payload.id_cliente = Number(formData.id_cliente);
            }

            const res = await api.post('/reservas', payload);
            const idReserva = res.data?.data?.id_reserva || res.data?.id_reserva;
            setIdReservaCreada(idReserva);
            setPaso('pago');
        } catch (err: any) {
            console.error('Error al crear reserva:', err.response?.data);
            setError(err.response?.data?.message || 'Error al crear la reserva');
        } finally {
            setCargando(false);
        }
    };

    const handleEnviarPago = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (pagoData.metodo_pago !== 'presencial' && !validarPago()) return;

        setCargando(true);
        try {
            if (pagoData.metodo_pago === 'presencial') {
                // Pago presencial: solo registrar
                await api.post('/pagos/procesar', {
                    id_reserva: idReservaCreada,
                    metodo_pago: 'presencial'
                });
                setSuccessMsg('¡Reserva confirmada! Pago presencial registrado.');
            } else if (pagoData.metodo_pago === 'qr') {
                // Pago QR: simular pago automático (sin comprobante)
                await api.post('/pagos/procesar', {
                    id_reserva: idReservaCreada,
                    metodo_pago: 'qr',
                    referencia_pasarela: `QR-${idReservaCreada}-${Date.now()}`
                });
                setSuccessMsg('¡Pago QR realizado con éxito! Reserva confirmada.');
            } else {
                // Pago con tarjeta: enviar datos de tarjeta como referencia
                const referencia = `****${pagoData.numero_tarjeta.replace(/\s/g, '').slice(-4)} | ${pagoData.titular_tarjeta}`;
                await api.post('/pagos/procesar', {
                    id_reserva: idReservaCreada,
                    metodo_pago: pagoData.metodo_pago,
                    referencia_pasarela: referencia
                });
                setSuccessMsg('¡Pago con tarjeta procesado con éxito! Reserva confirmada.');
            }
            onSave();
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error('Error al procesar pago:', err.response?.data);
            setError(err.response?.data?.error || err.response?.data?.message || 'Error al procesar el pago');
        } finally {
            setCargando(false);
        }
    };

    const metodosPago: { value: MetodoPago; label: string; icon: string }[] = [
        { value: 'presencial', label: 'Pago Presencial', icon: '🏢' },
        { value: 'tarjeta_debito', label: 'Tarjeta Débito', icon: '💳' },
        { value: 'tarjeta_credito', label: 'Tarjeta Crédito', icon: '💎' },
        { value: 'qr', label: 'Pago QR', icon: '' },
    ];

    // Contenido del QR
    const qrContenido = JSON.stringify({
        comercio: 'Complejo Deportivo Canchas BO',
        concepto: `Reserva #${idReservaCreada}`,
        monto: `Bs. ${monto.toFixed(2)}`,
        fecha: formData.fecha_reserva,
        hora: `${formData.hora_inicio} - ${formData.hora_fin}`,
        referencia: `RES-${idReservaCreada}-${Date.now()}`
    });

    const esTarjeta = pagoData.metodo_pago === 'tarjeta_debito' || pagoData.metodo_pago === 'tarjeta_credito';
    const esQR = pagoData.metodo_pago === 'qr';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl shadow-xl overflow-hidden border border-claro-borde dark:border-oscuro-borde max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde sticky top-0 bg-claro-tarjeta dark:bg-oscuro-tarjeta z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-claro-texto dark:text-oscuro-texto">
                            {paso === 'reserva'
                                ? (cancha ? `Reservar ${cancha.nombre}` : 'Nueva Reserva')
                                : 'Completar Pago'
                            }
                        </h2>
                        {paso === 'pago' && (
                            <p className="text-sm text-claro-texto2 mt-1">
                                Paso 2 de 2 - Monto: <span className="font-bold text-claro-primario">Bs. {monto.toFixed(2)}</span>
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-claro-texto2 hover:text-claro-texto">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {successMsg ? (
                    <div className="p-8 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <p className="text-lg font-medium text-green-600 dark:text-green-400">{successMsg}</p>
                    </div>
                ) : paso === 'reserva' ? (
                    <form onSubmit={handleCrearReserva} className="p-6 space-y-4">

                        {esPresencial && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Cliente *</label>
                                <select name="id_cliente" value={formData.id_cliente} onChange={handleChange}
                                    className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo">
                                    <option value="">Seleccione un cliente</option>
                                    {clientes.map(c => (
                                        <option key={c.id_usuario || c.id} value={c.id_usuario || c.id}>
                                            {c.nombre} {c.paterno || c.apellido_paterno} - {c.correo}
                                        </option>
                                    ))}
                                </select>
                                {errores.id_cliente && <FieldError error={errores.id_cliente} touched={true} />}
                            </div>
                        )}

                        {!cancha && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Cancha *</label>
                                <select name="id_cancha" value={formData.id_cancha} onChange={handleChange}
                                    className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo">
                                    <option value="">Seleccione una cancha</option>
                                    {canchas.map(c => (
                                        <option key={c.id_cancha} value={c.id_cancha}>
                                            {c.nombre} - {c.disciplina} (Bs. {c.precio_hora}/h)
                                        </option>
                                    ))}
                                </select>
                                {errores.id_cancha && <FieldError error={errores.id_cancha} touched={true} />}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha *</label>
                            <input type="date" name="fecha_reserva" value={formData.fecha_reserva} onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo" />
                            {errores.fecha_reserva && <FieldError error={errores.fecha_reserva} touched={true} />}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Hora Inicio *</label>
                                <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange}
                                    className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo" />
                                {errores.hora_inicio && <FieldError error={errores.hora_inicio} touched={true} />}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Hora Fin *</label>
                                <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange}
                                    className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo" />
                                {errores.hora_fin && <FieldError error={errores.hora_fin} touched={true} />}
                            </div>
                        </div>

                        {monto > 0 && (
                            <div className="bg-claro-primario/10 dark:bg-oscuro-primario/10 rounded-xl p-4">
                                <p className="text-sm text-claro-texto2">Monto estimado:</p>
                                <p className="text-2xl font-bold text-claro-primario">Bs. {monto.toFixed(2)}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Observaciones</label>
                            <textarea name="observaciones" value={formData.observaciones} onChange={handleChange}
                                rows={2} placeholder="Ej: Necesito pelotas, petos, etc."
                                className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo resize-none" />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-claro-borde dark:border-oscuro-borde">
                            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium rounded-lg hover:bg-claro-tinte">
                                Cancelar
                            </button>
                            <button type="submit" disabled={cargando}
                                className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-all
                                    ${cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-claro-primario hover:bg-claro-hover text-white'}`}>
                                {cargando ? 'Procesando...' : 'Continuar al Pago'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleEnviarPago} className="p-6 space-y-4">
                        {/* Selector de método de pago */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Método de Pago *</label>
                            <div className="grid grid-cols-2 gap-3">
                                {metodosPago.map(m => (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => setPagoData(prev => ({ ...prev, metodo_pago: m.value }))}
                                        className={`p-3 rounded-xl border-2 text-left transition-all
                                            ${pagoData.metodo_pago === m.value
                                                ? 'border-claro-primario bg-claro-primario/10'
                                                : 'border-claro-borde hover:border-claro-primario/50'
                                            }`}
                                    >
                                        <span className="text-xl">{m.icon}</span>
                                        <p className="text-sm font-medium mt-1">{m.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ===================== PAGO PRESENCIAL ===================== */}
                        {pagoData.metodo_pago === 'presencial' && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    🏢 Pagarás directamente en el complejo deportivo al momento de tu reserva.
                                </p>
                            </div>
                        )}

                        {/* ===================== PAGO CON TARJETA ===================== */}
                        {esTarjeta && (
                            <div className="space-y-4">
                                <div className={`${pagoData.metodo_pago === 'tarjeta_credito' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'} border rounded-xl p-4`}>
                                    <p className={`text-sm ${pagoData.metodo_pago === 'tarjeta_credito' ? 'text-purple-800 dark:text-purple-200' : 'text-indigo-800 dark:text-indigo-200'}`}>
                                        {pagoData.metodo_pago === 'tarjeta_credito' ? '💎' : '💳'} Ingresa los datos de tu tarjeta para procesar el pago de <strong>Bs. {monto.toFixed(2)}</strong>
                                    </p>
                                </div>

                                {/* Visualización de tarjeta */}
                                <div className={`rounded-2xl p-5 text-white shadow-lg ${pagoData.metodo_pago === 'tarjeta_credito' ? 'bg-gradient-to-br from-purple-600 to-purple-900' : 'bg-gradient-to-br from-indigo-600 to-indigo-900'}`}>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-10 h-7 bg-yellow-300 rounded-sm"></div>
                                        <span className="text-xs uppercase tracking-wider opacity-80">
                                            {pagoData.metodo_pago === 'tarjeta_credito' ? 'Crédito' : 'Débito'}
                                        </span>
                                    </div>
                                    <p className="font-mono text-lg tracking-widest mb-4">
                                        {pagoData.numero_tarjeta || '•••• •••• •••• ••••'}
                                    </p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] uppercase opacity-60">Titular</p>
                                            <p className="text-sm font-medium truncate max-w-[180px]">
                                                {pagoData.titular_tarjeta || 'NOMBRE APELLIDO'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase opacity-60">Vence</p>
                                            <p className="text-sm font-medium">
                                                {pagoData.fecha_expiracion || 'MM/AA'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Número de tarjeta */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Número de Tarjeta *
                                    </label>
                                    <input
                                        type="text"
                                        name="numero_tarjeta"
                                        value={pagoData.numero_tarjeta}
                                        onChange={handlePagoChange}
                                        placeholder="1234 5678 9012 3456"
                                        inputMode="numeric"
                                        maxLength={19}
                                        className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo font-mono tracking-wider"
                                    />
                                    {errores.numero_tarjeta && <FieldError error={errores.numero_tarjeta} touched={true} />}
                                </div>

                                {/* Titular */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Titular de la Tarjeta *
                                    </label>
                                    <input
                                        type="text"
                                        name="titular_tarjeta"
                                        value={pagoData.titular_tarjeta}
                                        onChange={handlePagoChange}
                                        placeholder="NOMBRE APELLIDO"
                                        className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo uppercase"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    {errores.titular_tarjeta && <FieldError error={errores.titular_tarjeta} touched={true} />}
                                </div>

                                {/* CVV y Fecha de expiración */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            CVV * (3 dígitos)
                                        </label>
                                        <input
                                            type="password"
                                            name="cvv"
                                            value={pagoData.cvv}
                                            onChange={handlePagoChange}
                                            placeholder="•••"
                                            inputMode="numeric"
                                            maxLength={3}
                                            className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo tracking-widest text-center"
                                        />
                                        {errores.cvv && <FieldError error={errores.cvv} touched={true} />}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Fecha de Expiración *
                                        </label>
                                        <input
                                            type="text"
                                            name="fecha_expiracion"
                                            value={pagoData.fecha_expiracion}
                                            onChange={handlePagoChange}
                                            placeholder="MM/AA"
                                            maxLength={5}
                                            className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo text-center"
                                        />
                                        {errores.fecha_expiracion && <FieldError error={errores.fecha_expiracion} touched={true} />}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-claro-texto2 dark:text-oscuro-texto2">
                                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Tus datos están protegidos. Esta es una simulación de prueba.</span>
                                </div>
                            </div>
                        )}

                        {/* ===================== PAGO QR ===================== */}
                        {esQR && (
                            <div className="space-y-4">
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        📱 Escanea este código QR con tu aplicación de pagos para completar la transacción de <strong>Bs. {monto.toFixed(2)}</strong>
                                    </p>
                                </div>

                                <div className="flex flex-col items-center py-4">
                                    <div className="bg-white p-4 rounded-2xl shadow-md">
                                        <QRCodeSVG
                                            value={qrContenido}
                                            size={180}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <p className="text-xs text-claro-texto2 mt-3 text-center">
                                        QR de prueba generado automáticamente
                                    </p>
                                </div>

                                <div className="bg-claro-fondo dark:bg-oscuro-fondo rounded-xl p-4 space-y-2">
                                    <h4 className="text-sm font-semibold text-claro-texto dark:text-oscuro-texto">Detalles del pago</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-claro-texto2">Comercio:</span>
                                        <span className="text-claro-texto dark:text-oscuro-texto font-medium">Canchas BO</span>
                                        <span className="text-claro-texto2">Concepto:</span>
                                        <span className="text-claro-texto dark:text-oscuro-texto font-medium">Reserva #{idReservaCreada}</span>
                                        <span className="text-claro-texto2">Monto:</span>
                                        <span className="text-claro-primario font-bold">Bs. {monto.toFixed(2)}</span>
                                        <span className="text-claro-texto2">Fecha:</span>
                                        <span className="text-claro-texto dark:text-oscuro-texto font-medium">{formData.fecha_reserva}</span>
                                        <span className="text-claro-texto2">Horario:</span>
                                        <span className="text-claro-texto dark:text-oscuro-texto font-medium">{formData.hora_inicio} - {formData.hora_fin}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-claro-texto2 dark:text-oscuro-texto2">
                                    <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>Este es un QR de prueba. No se realizará ningún cobro real.</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-claro-borde dark:border-oscuro-borde">
                            <button type="button" onClick={() => setPaso('reserva')} className="px-5 py-2 text-sm font-medium rounded-lg hover:bg-claro-tinte">
                                 Volver
                            </button>
                            <button type="submit"
                                disabled={cargando}
                                className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-all
                                    ${cargando
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : esQR
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : esTarjeta
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                : 'bg-claro-primario hover:bg-claro-hover text-white'}`}>
                                {cargando
                                    ? 'Procesando...'
                                    : esQR
                                        ? 'Confirmar Pago QR'
                                        : esTarjeta
                                            ? `Pagar Bs. ${monto.toFixed(2)}`
                                            : 'Confirmar Pago Presencial'
                                }
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ModalReserva;
