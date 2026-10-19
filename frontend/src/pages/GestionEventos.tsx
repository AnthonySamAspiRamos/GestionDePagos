import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GestionEventos = () => {
    const { token } = useAuth();
    const [eventos, setEventos] = useState<any[]>([]);
    const [canchas, setCanchas] = useState<any[]>([]);
    const [serviciosCatalogo, setServiciosCatalogo] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);

    // Formulario de creacion / edicion
    const [mostrarModal, setMostrarModal] = useState(false);
    const [eventoEnEdicion, setEventoEnEdicion] = useState<number | null>(null);
    const [modoReprogramar, setModoReprogramar] = useState(false);
    const formVacio = {
        nombre_evento: '',
        descripcion: '',
        fecha_evento: '',
        hora_inicio: '',
        hora_fin: '',
        cupo_maximo: 0,
        tipo_evento: 'torneo',
        id_cancha: ''
    };
    const [formData, setFormData] = useState(formVacio);
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState<{ id_servicio: number, costo_contratado: number }[]>([]);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';


    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [evRes, canchasRes, servRes] = await Promise.all([
                axios.get(`${apiUrl}/eventos`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${apiUrl}/canchas`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${apiUrl}/eventos/servicios`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setEventos(evRes.data.data);
            setCanchas(canchasRes.data.data);
            setServiciosCatalogo(servRes.data.data);
        } catch (error) {
            console.error("Error cargando datos:", error);
            setMensaje({ tipo: 'error', texto: 'No se pudieron cargar los datos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleGuardarEvento = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            cupo_maximo: parseInt(formData.cupo_maximo.toString()),
            servicios: serviciosSeleccionados
        };
        try {
            if (modoReprogramar && eventoEnEdicion) {
                await axios.patch(`${apiUrl}/eventos/${eventoEnEdicion}/reprogramar`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMensaje({ tipo: 'exito', texto: 'Evento reprogramado exitosamente.' });
            } else if (eventoEnEdicion) {
                await axios.put(`${apiUrl}/eventos/${eventoEnEdicion}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMensaje({ tipo: 'exito', texto: 'Evento actualizado exitosamente.' });
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/eventos`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMensaje({ tipo: 'exito', texto: 'Evento creado exitosamente.' });
            }
            cerrarModal();
            cargarDatos();
        } catch (error: any) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al guardar el evento' });
        }
    };

    const abrirModalCrear = () => {
        setEventoEnEdicion(null);
        setModoReprogramar(false);
        setFormData(formVacio);
        setServiciosSeleccionados([]);
        setMostrarModal(true);
    };

    const abrirModalEditar = (evento: any) => {
        setEventoEnEdicion(evento.id_evento);
        setModoReprogramar(false);
        setFormData({
            nombre_evento: evento.nombre_evento || '',
            descripcion: evento.descripcion || '',
            fecha_evento: evento.fecha_evento ? evento.fecha_evento.substring(0, 10) : '',
            hora_inicio: (evento.hora_inicio || '').substring(0, 5),
            hora_fin: (evento.hora_fin || '').substring(0, 5),
            cupo_maximo: evento.cupo_maximo || 0,
            tipo_evento: evento.tipo_evento || 'torneo',
            id_cancha: evento.cancha_asignada?.id_cancha ? evento.cancha_asignada.id_cancha.toString() : ''
        });
        setServiciosSeleccionados(
            (evento.servicios_adicionales || []).map((s: any) => ({
                id_servicio: s.id_servicio,
                costo_contratado: parseFloat(s.costo_contratado)
            }))
        );
        setMostrarModal(true);
    };

    const abrirModalReprogramar = (evento: any) => {
        setEventoEnEdicion(evento.id_evento);
        setModoReprogramar(true);
        setFormData({
            nombre_evento: evento.nombre_evento || '',
            descripcion: evento.descripcion || '',
            fecha_evento: '',
            hora_inicio: '',
            hora_fin: '',
            cupo_maximo: evento.cupo_maximo || 0,
            tipo_evento: evento.tipo_evento || 'torneo',
            id_cancha: evento.cancha_asignada?.id_cancha ? evento.cancha_asignada.id_cancha.toString() : ''
        });
        setServiciosSeleccionados(
            (evento.servicios_adicionales || []).map((s: any) => ({
                id_servicio: s.id_servicio,
                costo_contratado: parseFloat(s.costo_contratado)
            }))
        );
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setEventoEnEdicion(null);
        setModoReprogramar(false);
        setFormData(formVacio);
        setServiciosSeleccionados([]);
    };

    const handleCancelarEvento = async (id: number) => {
        const motivo = prompt("Ingrese el motivo de la cancelación:");
        if (!motivo) return;

        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/eventos/${id}/cancelar`, { motivo_cancelacion: motivo }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const afectados = res.data?.data?.afectados || [];
            const texto = afectados.length > 0
                ? `Evento cancelado. Clientes a notificar (${afectados.length}): ${afectados.map((a: any) => `${a.nombre} (${a.correo})`).join(', ')}`
                : 'Evento cancelado exitosamente. No había clientes inscritos.';
            setMensaje({ tipo: 'exito', texto });
            cargarDatos();
        } catch (error: any) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al cancelar evento' });
        }
    };

    const toggleServicio = (id_servicio: number, precio_referencia: number) => {
        const existe = serviciosSeleccionados.find(s => s.id_servicio === id_servicio);
        if (existe) {
            setServiciosSeleccionados(serviciosSeleccionados.filter(s => s.id_servicio !== id_servicio));
        } else {
            setServiciosSeleccionados([...serviciosSeleccionados, { id_servicio, costo_contratado: precio_referencia }]);
        }
    };

    const updateCostoServicio = (id_servicio: number, costo: number) => {
        setServiciosSeleccionados(serviciosSeleccionados.map(s => 
            s.id_servicio === id_servicio ? { ...s, costo_contratado: costo } : s
        ));
    };

    // Calculo en tiempo real del costo
    const calcularCostoTotalPreview = () => {
        let costoCancha = 0;
        if (formData.id_cancha && formData.hora_inicio && formData.hora_fin) {
            const cancha = canchas.find(c => c.id_cancha.toString() === formData.id_cancha.toString());
            if (cancha) {
                const start = new Date(`1970-01-01T${formData.hora_inicio}Z`);
                const end = new Date(`1970-01-01T${formData.hora_fin}Z`);
                const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                if (hours > 0) costoCancha = hours * parseFloat(cancha.precio_hora);
            }
        }
        const costoServicios = serviciosSeleccionados.reduce((acc, curr) => acc + parseFloat(curr.costo_contratado.toString()), 0);
        return { costoCancha, costoServicios, total: costoCancha + costoServicios };
    };

    const previewCostos = calcularCostoTotalPreview();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">Gestión de Eventos</h2>
                <button 
                    onClick={abrirModalCrear}
                    className="bg-claro-primario text-white px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 dark:bg-oscuro-primario shadow-sm flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Evento
                </button>
            </div>

            {mensaje && (
                <div className={`p-4 rounded-xl text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {mensaje.texto}
                    <button onClick={() => setMensaje(null)} className="float-right font-bold">&times;</button>
                </div>
            )}

            <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-claro-texto dark:text-oscuro-texto">
                        <thead className="bg-gray-50 dark:bg-oscuro-fondo border-b border-claro-borde dark:border-oscuro-borde text-claro-texto2 dark:text-oscuro-texto2">
                            <tr>
                                <th className="px-6 py-4 font-medium">Evento</th>
                                <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                                <th className="px-6 py-4 font-medium">Cancha</th>
                                <th className="px-6 py-4 font-medium">Costo Total</th>
                                <th className="px-6 py-4 font-medium">Estado</th>
                                <th className="px-6 py-4 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-claro-borde dark:divide-oscuro-borde">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-claro-texto2 dark:text-oscuro-texto2">Cargando eventos...</td></tr>
                            ) : eventos.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-claro-texto2 dark:text-oscuro-texto2">No hay eventos registrados.</td></tr>
                            ) : (
                                eventos.map(evento => (
                                    <tr key={evento.id_evento} className="hover:bg-gray-50 dark:hover:bg-oscuro-fondo transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold">{evento.nombre_evento}</div>
                                            <div className="text-xs text-claro-texto2 dark:text-oscuro-texto2">{evento.tipo_evento}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>{new Date(evento.fecha_evento).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</div>
                                            <div className="text-xs text-claro-texto2 dark:text-oscuro-texto2">{evento.hora_inicio} - {evento.hora_fin}</div>
                                        </td>
                                        <td className="px-6 py-4">{evento.cancha_asignada?.nombre}</td>
                                        <td className="px-6 py-4 font-medium">Bs. {evento.costo_total?.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${evento.estado === 'programado' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                                  evento.estado === 'cancelado' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                                                  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                }`}>
                                                {evento.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {evento.estado === 'programado' && (
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => abrirModalEditar(evento)}
                                                        className="text-claro-primario hover:text-opacity-80 dark:text-oscuro-primario font-medium text-sm transition-colors"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCancelarEvento(evento.id_evento)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            )}
                                            {evento.estado === 'cancelado' && (
                                                <button 
                                                    onClick={() => abrirModalReprogramar(evento)}
                                                    className="text-claro-primario hover:text-opacity-80 dark:text-oscuro-primario font-medium text-sm transition-colors"
                                                >
                                                    Reprogramar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Creación */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-claro-borde dark:border-oscuro-borde">
                        <div className="p-6 border-b border-claro-borde dark:border-oscuro-borde flex justify-between items-center sticky top-0 bg-claro-tarjeta dark:bg-oscuro-tarjeta z-10">
                            <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto">{modoReprogramar ? 'Reprogramar Evento' : eventoEnEdicion ? 'Editar Evento' : 'Registrar Nuevo Evento'}</h3>
                            <button onClick={cerrarModal} className="text-claro-texto2 hover:text-claro-texto dark:text-oscuro-texto2 dark:hover:text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleGuardarEvento} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-claro-texto dark:text-oscuro-texto border-b pb-2 border-claro-borde dark:border-oscuro-borde">Datos Principales</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">Nombre del Evento</label>
                                            <input required type="text" className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo" value={formData.nombre_evento} onChange={e => setFormData({...formData, nombre_evento: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">Tipo de Evento</label>
                                            <select required className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo" value={formData.tipo_evento} onChange={e => setFormData({...formData, tipo_evento: e.target.value})}>
                                                <option value="torneo">Torneo</option>
                                                <option value="exhibicion">Exhibición</option>
                                                <option value="recreativo">Recreativo</option>
                                                <option value="social">Actividad Social</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">Fecha</label>
                                                <input required type="date" className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo" value={formData.fecha_evento} onChange={e => setFormData({...formData, fecha_evento: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">Aforo Máximo</label>
                                                <input required type="number" min="1" className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo" value={formData.cupo_maximo} onChange={e => setFormData({...formData, cupo_maximo: e.target.value === '' ? 0 : parseInt(e.target.value)})} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">Hora Inicio</label>
                                                <input required type="time" className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo" value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">Hora Fin</label>
                                                <input required type="time" className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo" value={formData.hora_fin} onChange={e => setFormData({...formData, hora_fin: e.target.value})} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-claro-texto dark:text-oscuro-texto mb-1">Cancha o Espacio</label>
                                            <select required className="w-full px-3 py-2 rounded-lg border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo" value={formData.id_cancha} onChange={e => setFormData({...formData, id_cancha: e.target.value})}>
                                                <option value="">Seleccione una cancha...</option>
                                                {canchas.map(c => <option key={c.id_cancha} value={c.id_cancha}>{c.nombre} (Bs. {c.precio_hora}/hr)</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-claro-texto dark:text-oscuro-texto border-b pb-2 border-claro-borde dark:border-oscuro-borde">Servicios Adicionales</h4>
                                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                            {serviciosCatalogo.map(serv => {
                                                const sel = serviciosSeleccionados.find(s => s.id_servicio === serv.id_servicio);
                                                return (
                                                    <div key={serv.id_servicio} className="flex items-center justify-between p-3 border border-claro-borde dark:border-oscuro-borde rounded-xl bg-claro-fondo dark:bg-oscuro-fondo">
                                                        <div className="flex items-center gap-3">
                                                            <input type="checkbox" className="w-4 h-4 text-claro-primario rounded" checked={!!sel} onChange={() => toggleServicio(serv.id_servicio, parseFloat(serv.precio_referencia))} />
                                                            <span className="text-sm font-medium text-claro-texto dark:text-oscuro-texto">{serv.nombre}</span>
                                                        </div>
                                                        {sel && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-claro-texto2 dark:text-oscuro-texto2">Bs.</span>
                                                                <input type="number" className="w-20 px-2 py-1 text-sm rounded border border-claro-borde dark:border-oscuro-borde bg-white dark:bg-oscuro-tarjeta" value={sel.costo_contratado} onChange={(e) => updateCostoServicio(serv.id_servicio, e.target.value === '' ? 0 : parseFloat(e.target.value))} min="0" step="0.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 bg-claro-tinte dark:bg-oscuro-tinte p-4 rounded-xl border border-claro-borde dark:border-oscuro-borde">
                                            <h4 className="font-bold text-claro-texto dark:text-oscuro-texto mb-3">Resumen de Costos</h4>
                                            <div className="flex justify-between text-sm mb-1 text-claro-texto2 dark:text-oscuro-texto2">
                                                <span>Costo de Espacio:</span>
                                                <span>Bs. {previewCostos.costoCancha.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-3 text-claro-texto2 dark:text-oscuro-texto2">
                                                <span>Servicios Adicionales:</span>
                                                <span>Bs. {previewCostos.costoServicios.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg text-claro-primario dark:text-oscuro-primario border-t border-claro-borde dark:border-oscuro-borde pt-2">
                                                <span>Total a Cobrar:</span>
                                                <span>Bs. {previewCostos.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-claro-borde dark:border-oscuro-borde">
                                    <button type="button" onClick={cerrarModal} className="px-5 py-2.5 rounded-xl font-medium text-claro-texto2 hover:bg-gray-100 dark:text-oscuro-texto2 dark:hover:bg-oscuro-fondo transition-colors">Cancelar</button>
                                    <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-claro-primario text-white hover:bg-opacity-90 dark:bg-oscuro-primario shadow-md transition-all">{modoReprogramar ? 'Reprogramar Evento' : eventoEnEdicion ? 'Guardar Cambios' : 'Guardar Evento'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEventos;