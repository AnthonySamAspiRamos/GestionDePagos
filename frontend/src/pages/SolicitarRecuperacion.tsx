import { useState, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import FieldError from '../components/FieldError';
import { esCorreoValido, claseInput } from '../utils/validaciones';
import IconCanchas from '../assets/icon_canchas.svg?react';


const SolicitarRecuperacion = () => {
    const [correo, setCorreo] = useState<string>('');
    const [cargando, setCargando] = useState<boolean>(false);
    const [exito, setExito] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [errorCampo, setErrorCampo] = useState<string>('');
    const [touched, setTouched] = useState<boolean>(false);

    const validarCorreo = (valor: string): string => {
        if (!valor || !valor.trim()) return 'El correo es obligatorio.';
        if (!esCorreoValido(valor)) return 'Ingresá un correo válido.';
        if (valor.length > 150) return 'Correo demasiado largo.';
        return '';
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const valor = e.target.value;
        setCorreo(valor);
        setTouched(true);
        const err = validarCorreo(valor);
        setErrorCampo(err);
        if (error) setError('');
    };

    const handleBlur = (): void => {
        setTouched(true);
        const err = validarCorreo(correo);
        setErrorCampo(err);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        const err = validarCorreo(correo);
        if (err) {
            setErrorCampo(err);
            setTouched(true);
            return;
        }

        setCargando(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/solicitar-recuperacion`,
                { correo: correo.toLowerCase().trim() }
            );
            setExito(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al procesar la solicitud.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-claro-fondo dark:bg-oscuro-fondo transition-colors duration-300 overflow-hidden">
            
            {/* Columna Izquierda: Imagen */}
            <div 
                className="hidden md:flex md:w-1/2 lg:w-7/12 relative bg-cover bg-center h-full"
                style={{ 
                    backgroundImage: "url('https://i0.wp.com/premiumsportsbo.com/wp-content/uploads/2021/11/d1bd114d-526d-417f-a168-2d128f1ed8bb.jpg?resize=750%2C609&ssl=1')" 
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-claro-primario/90 dark:to-oscuro-fondo transition-colors duration-300"></div>
                
                <div className="relative z-10 p-10 lg:p-16 flex flex-col justify-between w-full h-full">
                    <div>
                        <IconCanchas className="w-9 h-9" />
                    </div>
                    <div className="mb-8">
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-md">
                            Recuperá tu acceso.
                        </h1>
                        <p className="text-gray-200 text-lg max-w-md drop-shadow-sm font-medium">
                            Te ayudamos a volver a la cancha en un par de pasos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Formulario */}
            <div className="w-full md:w-1/2 lg:w-5/12 h-full flex flex-col items-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md bg-claro-tarjeta dark:bg-oscuro-tarjeta p-8 sm:p-10 rounded-2xl shadow-xl border border-claro-borde dark:border-oscuro-borde my-auto">
                    
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">
                            Recuperar contraseña
                        </h2>
                        <ThemeToggle />
                    </div>

                    {!exito ? (
                        <>
                            <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-4">
                                Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-1" noValidate>
                                
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                        Correo electrónico
                                    </label>
                                    <input 
                                        type="email" 
                                        value={correo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="nombre@correo.com"
                                        maxLength={150}
                                        className={claseInput(errorCampo, touched)}
                                    />
                                    <FieldError error={errorCampo} touched={touched} />
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 mt-3">
                                        {error}
                                    </p>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={cargando}
                                    className={`w-full py-3 mt-4 rounded-xl font-medium text-white shadow-md transition-all
                                        ${cargando 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:text-oscuro-fondo dark:hover:bg-oscuro-hover hover:-translate-y-0.5'
                                        }`}
                                >
                                    {cargando ? 'Enviando...' : 'Enviar instrucciones'}
                                </button>

                            </form>

                            <p className="text-center text-sm text-claro-texto2 dark:text-oscuro-texto2 mt-6">
                                <Link to="/login" className="text-claro-primario dark:text-oscuro-primario font-bold hover:underline">
                                    ← Volver al inicio de sesión
                                </Link>
                            </p>
                        </>
                    ) : (
                        <div className="space-y-6 pt-4">
                            {/* Ícono de éxito */}
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <div className="text-center">
                                <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto mb-2">
                                    Revisá tu correo
                                </h3>
                                <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
                                    Si el correo <strong className="text-claro-texto dark:text-oscuro-texto">{correo}</strong> está registrado, te enviamos un enlace para restablecer tu contraseña.
                                </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl">
                                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                                    💡 <strong>Tip:</strong> Si no lo ves, revisá tu carpeta de <strong>Spam</strong> o correo no deseado. El enlace expira en 1 hora.
                                </p>
                            </div>

                            <Link 
                                to="/login" 
                                className="block text-center text-sm text-claro-primario dark:text-oscuro-primario font-medium hover:underline"
                            >
                                ← Volver al inicio de sesión
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SolicitarRecuperacion;