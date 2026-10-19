import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import IconCanchas from '../assets/icon_canchas.svg?react';

interface CanchaAsignada {
    id_cancha: number;
    nombre: string;
    disciplina: string;
    ubicacion?: string;
    precio_hora?: number;
}

interface Servicio {
    id_servicio: number;
    nombre: string;
    costo_contratado: string;
}

interface Evento {
    id_evento: number;
    nombre_evento: string;
    descripcion: string;
    fecha_evento: string;
    hora_inicio: string;
    hora_fin: string;
    cupo_maximo: number;
    cupos_restantes: number;
    tipo_evento: string;
    estado: string;
    cancha_asignada?: CanchaAsignada;
    servicios_adicionales?: Servicio[];
    costo_total?: number;
}

const EventosPage = () => {
    const { token, usuario } = useAuth();
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [canchas, setCanchas] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filtroTipo, setFiltroTipo] = useState<string>('');
    const [filtroFecha, setFiltroFecha] = useState<string>('');
    const [filtroCancha, setFiltroCancha] = useState<string>('');
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);
    const isCliente = usuario?.rol?.toLowerCase() === 'cliente';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';


    useEffect(() => {
        cargarCanchas();
    }, []);

    useEffect(() => {
        cargarEventos();
    }, [filtroTipo, filtroFecha, filtroCancha]);

    const cargarCanchas = async () => {
        try {
            const res = await axios.get(`${apiUrl}/canchas`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCanchas(res.data.data);
        } catch (error) {
            console.error("Error al cargar canchas", error);
        }
    };

    const cargarEventos = async () => {
        setLoading(true);
        try {
            
            let url = `${apiUrl}/eventos?disponibles=true`;
            if (filtroTipo) url += `&tipo=${filtroTipo}`;
            if (filtroFecha) url += `&fecha=${filtroFecha}`;
            if (filtroCancha) url += `&id_cancha=${filtroCancha}`;
            
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEventos(res.data.data);
        } catch (error) {
            console.error("Error al cargar eventos", error);
            setMensaje({ tipo: 'error', texto: 'No se pudieron cargar los eventos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleInscribir = async (id_evento: number) => {
        if (!isCliente) {
            setMensaje({ tipo: 'error', texto: 'Solo los clientes pueden inscribirse a eventos.' });
            return;
        }

        try {
            await axios.post(`${apiUrl}/eventos/${id_evento}/inscribir`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensaje({ tipo: 'exito', texto: '¡Inscripción exitosa al evento!' });
            cargarEventos(); // recargar para actualizar cupos
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Error al inscribirse.';
            setMensaje({ tipo: 'error', texto: errorMsg });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">
                        Eventos Disponibles
                    </h2>
                    <p className="text-claro-texto2 dark:text-oscuro-texto2 mt-1">
                        Inscríbete en los próximos eventos deportivos y sociales.
                    </p>
                </div>
            </div>

            {/* Banner informativo */}
            <div className="bg-claro-tinte dark:bg-oscuro-tinte border border-claro-primario/20 dark:border-oscuro-primario/20 rounded-2xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-claro-primario dark:text-oscuro-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
                    <span className="font-semibold text-claro-texto dark:text-oscuro-texto">¿Cómo funciona esta sección? </span>
                    Aquí puedes ver los eventos ya programados por el complejo, revisar cupos y costo, e inscribirte con un solo clic.
                    ¿Necesitas organizar un <span className="font-semibold">evento privado</span> (cumpleaños, celebración, torneo personalizado)?
                    Acércate a nuestras sucursales o contáctanos directamente para coordinar fecha, cancha y servicios adicionales a tu medida.
                </p>
            </div>

            {mensaje && (
                <div className={`p-4 rounded-xl text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {mensaje.texto}
                    <button onClick={() => setMensaje(null)} className="float-right font-bold">&times;</button>
                </div>
            )}

            {/* Filtros */}
            <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-4 rounded-2xl border border-claro-borde dark:border-oscuro-borde flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Tipo de Evento</label>
                    <select 
                        className="w-full px-4 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:ring-2 focus:ring-claro-primario dark:focus:ring-oscuro-primario outline-none"
                        value={filtroTipo} 
                        onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="torneo">Torneo</option>
                        <option value="exhibicion">Exhibición</option>
                        <option value="recreativo">Recreativo</option>
                        <option value="social">Actividad Social</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Fecha</label>
                    <input 
                        type="date" 
                        className="w-full px-4 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:ring-2 focus:ring-claro-primario dark:focus:ring-oscuro-primario outline-none"
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Cancha / Espacio</label>
                    <select
                        className="w-full px-4 py-2.5 rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:ring-2 focus:ring-claro-primario dark:focus:ring-oscuro-primario outline-none"
                        value={filtroCancha}
                        onChange={(e) => setFiltroCancha(e.target.value)}
                    >
                        <option value="">Todas</option>
                        {canchas.map(c => <option key={c.id_cancha} value={c.id_cancha}>{c.nombre}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-claro-texto2 dark:text-oscuro-texto2">Cargando eventos...</div>
            ) : eventos.length === 0 ? (
                <div className="text-center py-10 bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde">
                    <IconCanchas className="w-16 h-16 mx-auto text-claro-texto2 dark:text-oscuro-texto2 opacity-50 mb-4" />
                    <p className="text-lg font-medium text-claro-texto dark:text-oscuro-texto">No se encontraron eventos</p>
                    <p className="text-claro-texto2 dark:text-oscuro-texto2">Intenta ajustar los filtros de búsqueda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventos.map(evento => {
                        const esFechaPasada = new Date(evento.fecha_evento) < new Date();
                        const sinCupo = evento.cupos_restantes <= 0;
                        const fechaFormat = new Date(evento.fecha_evento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

                        return (
                            <div key={evento.id_evento} className="bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                                <div className="h-32 bg-claro-tinte dark:bg-oscuro-tinte p-6 flex flex-col justify-end relative">
                                    <span className="absolute top-4 right-4 bg-white dark:bg-oscuro-fondo px-3 py-1 rounded-full text-xs font-bold text-claro-primario dark:text-oscuro-primario shadow-sm">
                                        {evento.tipo_evento}
                                    </span>
                                    <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto line-clamp-1">{evento.nombre_evento}</h3>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="space-y-3 mb-6 flex-1">
                                        <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm font-medium">{fechaFormat}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">{evento.hora_inicio} - {evento.hora_fin}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-sm font-medium line-clamp-1">
                                                {evento.cancha_asignada?.nombre}
                                                {evento.cancha_asignada?.ubicacion ? ` · ${evento.cancha_asignada.ubicacion}` : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">Cupos restantes: {evento.cupos_restantes} / {evento.cupo_maximo}</span>
                                        </div>
                                        {typeof evento.costo_total === 'number' && (
                                            <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2">
                                                <span className="text-sm font-medium">Costo: Bs. {evento.costo_total.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {isCliente && (
                                        <button
                                            onClick={() => handleInscribir(evento.id_evento)}
                                            disabled={esFechaPasada || sinCupo}
                                            className={`w-full py-3 rounded-xl font-bold transition-all text-sm
                                                ${esFechaPasada || sinCupo 
                                                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                                                    : 'bg-claro-primario text-white hover:bg-opacity-90 dark:bg-oscuro-primario shadow-md hover:shadow-lg'
                                                }
                                            `}
                                        >
                                            {esFechaPasada ? 'Evento Finalizado' : sinCupo ? 'Agotado' : 'Inscribirse Ahora'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EventosPage;