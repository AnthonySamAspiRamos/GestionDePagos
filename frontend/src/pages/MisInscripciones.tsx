import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import IconCanchas from '../assets/icon_canchas.svg?react';

const MisInscripciones = () => {
    const { token } = useAuth();
    const [inscripciones, setInscripciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    useEffect(() => {
        cargarInscripciones();
    }, []);

    const cargarInscripciones = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/eventos/mis-inscripciones`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInscripciones(res.data.data);
        } catch (error) {
            console.error("Error al cargar inscripciones", error);
            setMensaje({ tipo: 'error', texto: 'No se pudieron cargar tus inscripciones.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarInscripcion = async (id_evento: number) => {
        if (!window.confirm('¿Estás seguro que deseas cancelar tu inscripción a este evento?')) return;
        
        try {
            await axios.patch(`${apiUrl}/eventos/${id_evento}/cancelar-inscripcion`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensaje({ tipo: 'exito', texto: 'Inscripción cancelada con éxito. Se ha liberado tu cupo.' });
            cargarInscripciones();
        } catch (error: any) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.message || 'Error al cancelar inscripción.' });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div>
                <h2 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">Mis Inscripciones</h2>
                <p className="text-claro-texto2 dark:text-oscuro-texto2 mt-1">
                    Gestiona tu participación en los eventos del complejo deportivo.
                </p>
            </div>

            {mensaje && (
                <div className={`p-4 rounded-xl text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {mensaje.texto}
                    <button onClick={() => setMensaje(null)} className="float-right font-bold">&times;</button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-claro-texto2 dark:text-oscuro-texto2">Cargando inscripciones...</div>
            ) : inscripciones.length === 0 ? (
                <div className="text-center py-10 bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde">
                    <IconCanchas className="w-16 h-16 mx-auto text-claro-texto2 dark:text-oscuro-texto2 opacity-50 mb-4" />
                    <p className="text-lg font-medium text-claro-texto dark:text-oscuro-texto">No tienes inscripciones activas</p>
                    <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-6">Explora los eventos disponibles y únete a uno.</p>
                    <a href="/eventos" className="bg-claro-primario text-white px-6 py-2.5 rounded-xl font-bold">Ver Eventos</a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inscripciones.map(inscripcion => {
                        const fechaEvento = new Date(inscripcion.fecha_evento);
                        const esFechaPasada = fechaEvento < new Date();
                        const estaCancelada = inscripcion.estado_inscripcion !== 'confirmada';
                        const eventoCancelado = inscripcion.estado_evento === 'cancelado';
                        
                        return (
                            <div key={inscripcion.id_inscripcion} className={`bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde overflow-hidden flex flex-col ${estaCancelada ? 'opacity-70' : ''}`}>
                                <div className={`p-5 border-b border-claro-borde dark:border-oscuro-borde ${eventoCancelado ? 'bg-red-50 dark:bg-red-900/10' : 'bg-claro-tinte dark:bg-oscuro-tinte'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-white dark:bg-oscuro-fondo px-3 py-1 rounded-full text-xs font-bold text-claro-primario dark:text-oscuro-primario shadow-sm">
                                            {inscripcion.tipo_evento}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                            estaCancelada ? 'bg-red-100 text-red-700' : 
                                            eventoCancelado ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {eventoCancelado ? 'EVENTO CANCELADO' : estaCancelada ? 'CANCELADA' : 'CONFIRMADA'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto line-clamp-1">{inscripcion.nombre_evento}</h3>
                                </div>
                                <div className="p-5 flex-1 flex flex-col space-y-3">
                                    <div className="flex items-center gap-3 text-claro-texto2 dark:text-oscuro-texto2 text-sm">
                                        <span className="font-medium">{fechaEvento.toLocaleDateString('es-ES', { timeZone: 'UTC' })}</span>
                                        <span>•</span>
                                        <span>{inscripcion.hora_inicio} - {inscripcion.hora_fin}</span>
                                    </div>
                                    <div className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
                                        Cancha: <span className="font-medium text-claro-texto dark:text-oscuro-texto">{inscripcion.cancha_nombre}</span>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-claro-borde dark:border-oscuro-borde text-xs text-claro-texto2 dark:text-oscuro-texto2 mb-4">
                                        Inscrito el: {new Date(inscripcion.fecha_inscripcion).toLocaleString()}
                                    </div>

                                    {!esFechaPasada && !estaCancelada && !eventoCancelado && (
                                        <button
                                            onClick={() => handleCancelarInscripcion(inscripcion.id_evento)}
                                            className="w-full py-2.5 rounded-xl font-bold transition-all text-sm border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                                        >
                                            Cancelar Inscripción
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

export default MisInscripciones;
