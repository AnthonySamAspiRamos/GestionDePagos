import { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import FieldError from '../components/FieldError';
import IconCanchas from '../assets/icon_canchas.svg?react';
import {
    validarCampo,
    validarFormularioCompleto,
    calcularEdad,
    claseInput,
    fuerzaContraseña,
    textoFuerza,
    colorFuerza
} from '../utils/validaciones';

// =====================================================
// TIPOS
// =====================================================
interface FormData {
    nombre: string;
    paterno: string;
    materno: string;
    correo: string;
    telefono: string;
    ci_nit: string;
    fecha_nacimiento: string;
    calle: string;
    zona: string;
    ciudad: string;
    contraseña: string;
}

interface Errores {
    [key: string]: string | undefined;
}

interface Touched {
    [key: string]: boolean;
}

// =====================================================
// COMPONENTE
// =====================================================
const Registro = () => {
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        paterno: '',
        materno: '',
        correo: '',
        telefono: '',
        ci_nit: '',
        fecha_nacimiento: '',
        calle: '',
        zona: '',
        ciudad: '',
        contraseña: '',
    });

    const [aceptarTerminos, setAceptarTerminos] = useState<boolean>(false);
    const [mostrarContraseña, setMostrarContraseña] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [errores, setErrores] = useState<Errores>({});
    const [touched, setTouched] = useState<Touched>({});
    const [cargando, setCargando] = useState<boolean>(false);

    const navigate = useNavigate();

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        let valorFiltrado = value;
        if (name === 'ci_nit' || name === 'telefono') {
            valorFiltrado = value.replace(/[^0-9]/g, '');
        }

        const nuevosDatos = { ...formData, [name]: valorFiltrado };
        setFormData(nuevosDatos);

        setTouched((prev) => ({ ...prev, [name]: true }));

        const errorCampo = validarCampo(name, valorFiltrado, nuevosDatos);
        setErrores((prev) => ({ ...prev, [name]: errorCampo }));

        if (error) setError('');
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const errorCampo = validarCampo(name, value, formData);
        setErrores((prev) => ({ ...prev, [name]: errorCampo }));
    };

    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        if (!aceptarTerminos) {
            setError('Debés aceptar los términos y condiciones para continuar.');
            return;
        }

        const erroresEncontrados = validarFormularioCompleto(formData, 'Cliente', false);

        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados);
            const todosTocados: Touched = {};
            Object.keys(formData).forEach((k) => { todosTocados[k] = true; });
            setTouched(todosTocados);
            setError('Revisá los campos marcados en rojo.');
            return;
        }

        const edad = calcularEdad(formData.fecha_nacimiento);

        setCargando(true);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/registrar`, {
                ...formData,
                edad
            });
            navigate('/login');
        } catch (err: any) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Ocurrió un error al crear la cuenta. Inténtalo de nuevo.');
            }
        } finally {
            setCargando(false);
        }
    };

    const edadCalculada = calcularEdad(formData.fecha_nacimiento);
    const nivelFuerza = fuerzaContraseña(formData.contraseña);

    const fechaMaxima = new Date();
    fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 15);
    const fechaMaximaStr = fechaMaxima.toISOString().split('T')[0];

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
                            Una cuenta, todas las canchas.
                        </h1>
                        <p className="text-gray-200 text-lg max-w-md drop-shadow-sm font-medium">
                            Guardá tus favoritas, repetí reservas anteriores y recibí recordatorios antes del partido.
                        </p>
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Formulario */}
            <div className="w-full md:w-1/2 lg:w-5/12 h-full flex flex-col items-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-lg bg-claro-tarjeta dark:bg-oscuro-tarjeta p-8 sm:p-10 rounded-2xl shadow-xl border border-claro-borde dark:border-oscuro-borde my-auto">
                    
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">
                            Crear cuenta
                        </h2>
                        <ThemeToggle />
                    </div>

                    <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-6">
                        Completá tus datos para empezar a reservar.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-1" noValidate>
                        
                        {/* NOMBRE */}
                        <div>
                            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                Nombres *
                            </label>
                            <input 
                                type="text" 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Ej: Juan Carlos"
                                maxLength={50}
                                className={claseInput(errores.nombre, touched.nombre)}
                            />
                            <FieldError error={errores.nombre} touched={touched.nombre} />
                        </div>

                        {/* APELLIDOS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                    Apellido Paterno *
                                </label>
                                <input 
                                    type="text" 
                                    name="paterno" 
                                    value={formData.paterno} 
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Perez"
                                    maxLength={50}
                                    className={claseInput(errores.paterno, touched.paterno)}
                                />
                                <FieldError error={errores.paterno} touched={touched.paterno} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                    Apellido Materno
                                </label>
                                <input 
                                    type="text" 
                                    name="materno"
                                    value={formData.materno} 
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Herrera (Opcional)"
                                    maxLength={50}
                                    className={claseInput(errores.materno, touched.materno)}
                                />
                                <FieldError error={errores.materno} touched={touched.materno} />
                            </div>
                        </div>

                        {/* CI/NIT Y TELÉFONO */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                    CI / NIT *
                                </label>
                                <input 
                                    type="text" 
                                    name="ci_nit" 
                                    inputMode="numeric"
                                    value={formData.ci_nit} 
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="1234567"
                                    maxLength={15}
                                    className={claseInput(errores.ci_nit, touched.ci_nit)}
                                />
                                <FieldError error={errores.ci_nit} touched={touched.ci_nit} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                    Teléfono *
                                </label>
                                <input 
                                    type="tel" 
                                    name="telefono" 
                                    inputMode="numeric"
                                    value={formData.telefono} 
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="71234567"
                                    maxLength={8}
                                    className={claseInput(errores.telefono, touched.telefono)}
                                />
                                <FieldError error={errores.telefono} touched={touched.telefono} />
                            </div>
                        </div>

                        {/* FECHA NACIMIENTO */}
                        <div>
                            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                Fecha de nacimiento *
                            </label>
                            <input 
                                type="date" 
                                name="fecha_nacimiento" 
                                value={formData.fecha_nacimiento} 
                                onChange={handleChange}
                                onBlur={handleBlur}
                                max={fechaMaximaStr}
                                className={claseInput(errores.fecha_nacimiento, touched.fecha_nacimiento)}
                            />
                            {errores.fecha_nacimiento && touched.fecha_nacimiento ? (
                                <FieldError error={errores.fecha_nacimiento} touched={touched.fecha_nacimiento} />
                            ) : (
                                <p className="text-xs mt-1 min-h-[16px] text-claro-texto2 dark:text-oscuro-texto2">
                                    {formData.fecha_nacimiento && edadCalculada !== null ? (
                                        <>Edad: <span className="font-semibold text-claro-primario dark:text-oscuro-primario">{edadCalculada} años</span></>
                                    ) : '\u00A0'}
                                </p>
                            )}
                        </div>

                        {/* DIRECCIÓN */}
                        <div className="pt-2">
                            <h3 className="text-sm font-semibold text-claro-primario dark:text-oscuro-primario uppercase tracking-wide mb-3">
                                Dirección
                            </h3>

                            <div className="space-y-1">
                                {/* Calle */}
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                        Calle / Avenida
                                    </label>
                                    <input 
                                        type="text" 
                                        name="calle" 
                                        value={formData.calle} 
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Ej: Av. 6 de Agosto #1234"
                                        maxLength={150}
                                        className={claseInput(errores.calle, touched.calle)}
                                    />
                                    <FieldError error={errores.calle} touched={touched.calle} />
                                </div>

                                {/* Zona y Ciudad */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                            Zona / Barrio
                                        </label>
                                        <input 
                                            type="text" 
                                            name="zona" 
                                            value={formData.zona} 
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Ej: Sopocachi"
                                            maxLength={100}
                                            className={claseInput(errores.zona, touched.zona)}
                                        />
                                        <FieldError error={errores.zona} touched={touched.zona} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                            Ciudad
                                        </label>
                                        <input 
                                            type="text" 
                                            name="ciudad" 
                                            value={formData.ciudad} 
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Ej: La Paz"
                                            maxLength={100}
                                            className={claseInput(errores.ciudad, touched.ciudad)}
                                        />
                                        <FieldError error={errores.ciudad} touched={touched.ciudad} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CUENTA */}
                        <div className="pt-2">
                            <h3 className="text-sm font-semibold text-claro-primario dark:text-oscuro-primario uppercase tracking-wide mb-3">
                                Cuenta
                            </h3>

                            <div className="space-y-1">
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                        Correo electrónico *
                                    </label>
                                    <input 
                                        type="email" 
                                        name="correo" 
                                        value={formData.correo} 
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="nombre@correo.com"
                                        maxLength={150}
                                        className={claseInput(errores.correo, touched.correo)}
                                    />
                                    <FieldError error={errores.correo} touched={touched.correo} />
                                </div>

                                {/* CONTRASEÑA */}
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                        Contraseña *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type={mostrarContraseña ? "text" : "password"} 
                                            name="contraseña" 
                                            value={formData.contraseña} 
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Mínimo 8 caracteres"
                                            maxLength={100}
                                            className={claseInput(errores.contraseña, touched.contraseña)}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setMostrarContraseña(!mostrarContraseña)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-claro-texto2 hover:text-claro-primario dark:text-oscuro-texto2 dark:hover:text-oscuro-primario font-medium"
                                        >
                                            {mostrarContraseña ? 'Ocultar' : 'Mostrar'}
                                        </button>
                                    </div>
                                    <FieldError error={errores.contraseña} touched={touched.contraseña} />
                                    {formData.contraseña && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex gap-1 flex-1">
                                                <div className={`h-1 flex-1 rounded-full ${nivelFuerza >= 1 ? colorFuerza(nivelFuerza) : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                                <div className={`h-1 flex-1 rounded-full ${nivelFuerza >= 2 ? colorFuerza(nivelFuerza) : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                                <div className={`h-1 flex-1 rounded-full ${nivelFuerza >= 3 ? colorFuerza(nivelFuerza) : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                            </div>
                                            <span className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                                                {textoFuerza(nivelFuerza)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                                {error}
                            </p>
                        )}

                        {/* TÉRMINOS */}
                        <div className="flex items-center gap-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="terminos"
                                checked={aceptarTerminos} 
                                onChange={(e) => setAceptarTerminos(e.target.checked)}
                                className="w-4 h-4 rounded border-claro-borde text-claro-primario focus:ring-claro-primario dark:bg-oscuro-fondo dark:border-oscuro-borde cursor-pointer" 
                            />
                            <label htmlFor="terminos" className="text-sm text-claro-texto2 dark:text-oscuro-texto2 cursor-pointer">
                                Acepto los <a href="#" className="text-claro-primario dark:text-oscuro-primario hover:underline font-medium">términos y condiciones</a>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={cargando}
                            className={`w-full py-3 mt-4 rounded-xl font-medium text-white shadow-md transition-all
                                ${cargando 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:text-oscuro-fondo dark:hover:bg-oscuro-hover hover:-translate-y-0.5'
                                }`}
                        >
                            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-claro-texto2 dark:text-oscuro-texto2 mt-6">
                        ¿Ya tenés cuenta?{' '}
                        <Link to="/login" className="text-claro-primario dark:text-oscuro-primario font-bold hover:underline">
                            Iniciá sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Registro;