import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from '../../services/api';
import FieldError from '../FieldError';
import type { Cancha } from './cancha.types';

interface ModalModificarReservaProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    reserva: any | null;
}

const ModalModificarReserva = ({ isOpen, onClose, onSave, reserva }: ModalModificarReservaProps) => {
    const [formData, setFormData] = useState({
        fecha_reserva: '',
        hora_inicio: '',
        hora_fin: '',
        id_cancha: '',
        observaciones: ''
    });

    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // Cargar canchas disponibles
    useEffect(() => {
        if (!isOpen) return;
        const fetchCanchas = async () => {
            try {
                const res = await api.get('/canchas');
                setCanchas(res.data.data || []);
            } catch (err) {
                console.error('Error al cargar canchas', err);
            }
        };
        fetchCanchas();
    }, [isOpen]);

    // Precargar datos de la reserva
    useEffect(() => {
        if (isOpen && reserva) {
            setFormData({
                fecha_reserva: reserva.fecha_reserva ? new Date(reserva.fecha_reserva).toISOString().split('T')[0] : '',
                hora_inicio: reserva.hora_inicio || '',
                hora_fin: reserva.hora_fin || '',
                id_cancha: reserva.id_cancha || '',
                observaciones: reserva.observaciones || ''
            });
            setErrores({});
            setError('');
        }
    }, [isOpen, reserva]);

    if (!isOpen) return null;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
    };

    const validar = () => {
        const nuevosErrores: Record<string, string> = {};
        if (!formData.fecha_reserva) nuevosErrores.fecha_reserva = 'La fecha es obligatoria';
        if (!formData.hora_inicio) nuevosErrores.hora_inicio = 'La hora de inicio es obligatoria';
        if (!formData.hora_fin) nuevosErrores.hora_fin = 'La hora de fin es obligatoria';
        if (!formData.id_cancha) nuevosErrores.id_cancha = 'Debe seleccionar una cancha';
        
        if (formData.hora_inicio && formData.hora_fin && formData.hora_inicio >= formData.hora_fin) {
            nuevosErrores.hora_fin = 'La hora de fin debe ser mayor a la de inicio';
        }
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!validar()) return;

        setCargando(true);
        try {
            await api.put(`/reservas/${reserva.id_reserva}`, {
                fecha_reserva: formData.fecha_reserva,
                hora_inicio: formData.hora_inicio,
                hora_fin: formData.hora_fin,
                id_cancha: Number(formData.id_cancha),
                observaciones: formData.observaciones
            });
            onSave();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al modificar la reserva');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl shadow-xl overflow-hidden border border-claro-borde dark:border-oscuro-borde">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde">
                    <h2 className="text-xl font-semibold text-claro-texto dark:text-oscuro-texto">
                        Modificar Reserva #{reserva?.id_reserva}
                    </h2>
                    <button onClick={onClose} className="text-claro-texto2 hover:text-claro-texto">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    <div className="p-3 bg-claro-tinte dark:bg-oscuro-tinte rounded-lg text-sm">
                        <p><strong>Cliente:</strong> {reserva?.cliente_nombre} {reserva?.apellido_paterno}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Cancha *</label>
                        <select name="id_cancha" value={formData.id_cancha} onChange={handleChange}
                            className="w-full px-3 py-2.5 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo">
                            <option value="">Seleccione una cancha</option>
                            {canchas.map(c => (
                                <option key={c.id_cancha} value={c.id_cancha}>
                                    {c.nombre} - {c.disciplina}
                                </option>
                            ))}
                        </select>
                        {errores.id_cancha && <FieldError error={errores.id_cancha} touched={true} />}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha *</label>
                        <input type="date" name="fecha_reserva" value={formData.fecha_reserva} onChange={handleChange}
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

                    <div>
                        <label className="block text-sm font-medium mb-1">Observaciones</label>
                        <textarea name="observaciones" value={formData.observaciones} onChange={handleChange}
                            rows={3}
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
                            {cargando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalModificarReserva;