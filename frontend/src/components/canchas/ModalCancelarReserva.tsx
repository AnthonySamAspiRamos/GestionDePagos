import { useState, useEffect, FormEvent } from 'react';

interface ModalCancelarReservaProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (motivo: string) => void;
    reserva: any | null;
    cargando?: boolean;
}

const ModalCancelarReserva = ({ isOpen, onClose, onConfirm, reserva, cargando = false }: ModalCancelarReservaProps) => {
    const [motivo, setMotivo] = useState('');
    const [error, setError] = useState('');

    // Resetear el motivo cada vez que se abre el modal
    useEffect(() => {
        if (isOpen) {
            setMotivo('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!motivo.trim()) {
            setError('Debe ingresar un motivo para cancelar la reserva.');
            return;
        }

        if (motivo.trim().length < 5) {
            setError('El motivo debe tener al menos 5 caracteres.');
            return;
        }

        onConfirm(motivo.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl shadow-2xl overflow-hidden border border-claro-borde dark:border-oscuro-borde">
                
                {/* Cabecera */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-claro-texto dark:text-oscuro-texto">
                                Cancelar Reserva
                            </h2>
                            <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                                Esta acción no se puede deshacer
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={cargando}
                        className="text-claro-texto2 hover:text-claro-texto dark:text-oscuro-texto2 dark:hover:text-oscuro-texto disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Cuerpo */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Info de la reserva */}
                    {reserva && (
                        <div className="p-4 rounded-xl bg-claro-tinte dark:bg-oscuro-tinte border border-claro-borde dark:border-oscuro-borde">
                            <p className="text-xs uppercase tracking-wider text-claro-texto2 dark:text-oscuro-texto2 mb-2 font-semibold">
                                Detalles de la reserva
                            </p>
                            <div className="space-y-1 text-sm">
                                <p className="text-claro-texto dark:text-oscuro-texto">
                                    <span className="font-medium">Cliente:</span> {reserva.cliente_nombre} {reserva.apellido_paterno}
                                </p>
                                <p className="text-claro-texto dark:text-oscuro-texto">
                                    <span className="font-medium">Cancha:</span> {reserva.cancha_nombre}
                                </p>
                                <p className="text-claro-texto dark:text-oscuro-texto">
                                    <span className="font-medium">Fecha:</span> {new Date(reserva.fecha_reserva).toLocaleDateString()}
                                </p>
                                <p className="text-claro-texto dark:text-oscuro-texto">
                                    <span className="font-medium">Horario:</span> {reserva.hora_inicio} - {reserva.hora_fin}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Campo de motivo */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-claro-texto dark:text-oscuro-texto">
                            Motivo de la cancelación <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={motivo}
                            onChange={(e) => {
                                setMotivo(e.target.value);
                                if (error) setError('');
                            }}
                            rows={4}
                            placeholder="Ej: El cliente tuvo una emergencia personal..."
                            maxLength={200}
                            disabled={cargando}
                            className={`w-full px-4 py-3 border rounded-xl bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto resize-none focus:outline-none focus:ring-2 transition-all ${
                                error 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-claro-borde dark:border-oscuro-borde focus:ring-claro-primario dark:focus:ring-oscuro-primario'
                            } disabled:opacity-60`}
                        />
                        <div className="flex justify-between items-center mt-1">
                            {error ? (
                                <p className="text-xs text-red-500 font-medium">{error}</p>
                            ) : (
                                <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                                    Mínimo 5 caracteres
                                </p>
                            )}
                            <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                                {motivo.length}/200
                            </p>
                        </div>
                    </div>

                    {/* Advertencia */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-yellow-800 dark:text-yellow-300">
                            Si la reserva ya fue pagada, la devolución será gestionada por el módulo de Pagos.
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={cargando}
                            className="px-5 py-2.5 text-sm font-medium rounded-xl text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte transition-colors disabled:opacity-50"
                        >
                            Volver
                        </button>
                        <button
                            type="submit"
                            disabled={cargando}
                            className={`px-5 py-2.5 text-sm font-medium rounded-xl shadow-sm transition-all flex items-center gap-2 ${
                                cargando
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                        >
                            {cargando ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Cancelando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Confirmar Cancelación
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalCancelarReserva;