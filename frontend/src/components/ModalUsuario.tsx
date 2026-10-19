import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import FieldError from './FieldError';
import {
    validarCampo,
    validarFormularioCompleto,
    claseInput,
    calcularEdad
} from '../utils/validaciones';

// =====================================================
// TIPOS
// =====================================================
type Rol = 'Cliente' | 'Empleado' | 'Admin' | 'Administrador';
type Estado = 'Activo' | 'Inactivo';
type Turno = 'Mañana' | 'Tarde' | 'Noche';
type NivelAcceso = 'Total' | 'Medio' | 'Bajo';

interface FormData {
    nombre: string;
    paterno: string;
    materno: string;
    correo: string;
    telefono: string;
    contraseña: string;
    rol: Rol;
    estado: Estado;
    ci_nit: string;
    fecha_nacimiento: string;
    calle: string;
    zona: string;
    ciudad: string;
    fecha_contratacion: string;
    cargo: string;
    turno: Turno;
    nivel_acceso: NivelAcceso;
}

interface Errores {
    [key: string]: string | undefined;
}

interface Touched {
    [key: string]: boolean;
}

interface ModalUsuarioProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    usuarioId?: number | null;
}

// =====================================================
// COMPONENTE
// =====================================================
const ModalUsuario = ({ isOpen, onClose, onSave, usuarioId = null }: ModalUsuarioProps) => {
    const modoEdicion = Boolean(usuarioId);

    const estadoInicial: FormData = {
        nombre: '',
        paterno: '',
        materno: '',
        correo: '',
        telefono: '',
        contraseña: '',
        rol: 'Cliente',
        estado: 'Activo',
        ci_nit: '',
        fecha_nacimiento: '',
        calle: '',
        zona: '',
        ciudad: '',
        fecha_contratacion: '',
        cargo: '',
        turno: 'Mañana',
        nivel_acceso: 'Total'
    };

    const [formData, setFormData] = useState<FormData>(estadoInicial);
    const [errores, setErrores] = useState<Errores>({});
    const [touched, setTouched] = useState<Touched>({});
    const [cargando, setCargando] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [mostrarContraseña, setMostrarContraseña] = useState<boolean>(false);

    // =====================================================
    // FLAGS DE ROL
    // =====================================================
    const rolNorm = (formData.rol || '').toLowerCase().trim();
    const esCliente = rolNorm === 'cliente';
    const esEmpleado = rolNorm === 'empleado';
    const esAdmin = rolNorm === 'admin' || rolNorm === 'administrador';

    // =====================================================
    // BLOQUEAR SCROLL DEL BODY MIENTRAS EL MODAL ESTÁ ABIERTO
    // =====================================================
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // =====================================================
    // CARGAR DATOS SI ES EDICIÓN
    // =====================================================
    useEffect(() => {
        if (!isOpen) return;

        setMostrarContraseña(false);

        if (!usuarioId) {
            setFormData(estadoInicial);
            setErrores({});
            setTouched({});
            setError('');
            return;
        }

        const fetchUsuario = async (): Promise<void> => {
            try {
                const res = await api.get(`/usuarios/${usuarioId}`);
                const d = res.data;
                setFormData({
                    nombre: d.nombre || '',
                    paterno: d.paterno || '',
                    materno: d.materno || '',
                    correo: d.correo || '',
                    telefono: d.telefono || '',
                    contraseña: '',
                    rol: d.rol || 'Cliente',
                    estado: d.estado_cuenta || 'Activo',
                    ci_nit: d.ci_nit ? String(d.ci_nit) : '',
                    fecha_nacimiento: d.fecha_nacimiento
                        ? new Date(d.fecha_nacimiento).toISOString().split('T')[0]
                        : '',
                    calle: d.calle || '',
                    zona: d.zona || '',
                    ciudad: d.ciudad || '',
                    fecha_contratacion: d.fecha_contratacion
                        ? new Date(d.fecha_contratacion).toISOString().split('T')[0]
                        : '',
                    cargo: d.cargo || '',
                    turno: d.turno || 'Mañana',
                    nivel_acceso: d.nivel_acceso || 'Total'
                });
                setErrores({});
                setTouched({});
            } catch (err) {
                console.error(err);
                setError('Error al cargar los datos del usuario');
            }
        };
        fetchUsuario();
    }, [isOpen, usuarioId]);

    if (!isOpen) return null;

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;

        let valorFiltrado = value;
        if (name === 'ci_nit' || name === 'telefono') {
            valorFiltrado = value.replace(/[^0-9]/g, '');
        }

        const nuevosDatos = { ...formData, [name]: valorFiltrado };
        setFormData(nuevosDatos);
        setTouched((prev) => ({ ...prev, [name]: true }));

        const err = validarCampo(name, valorFiltrado, nuevosDatos);
        setErrores((prev) => ({ ...prev, [name]: err }));

        if (error) setError('');
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const err = validarCampo(name, value, formData);
        setErrores((prev) => ({ ...prev, [name]: err }));
    };

    const handleRolChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        const nuevoRol = e.target.value as Rol;
        setFormData((prev) => ({ ...prev, rol: nuevoRol }));
        setErrores({});
        setTouched({});
    };

    // =====================================================
    // SUBMIT
    // =====================================================
    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        const erroresEncontrados = validarFormularioCompleto(
            formData,
            formData.rol,
            modoEdicion
        );

        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados);
            const tocados: Touched = {};
            Object.keys(erroresEncontrados).forEach((k) => { tocados[k] = true; });
            setTouched(tocados);
            setError('Revisá los campos marcados en rojo.');
            return;
        }

        setCargando(true);
        try {
            const payload: Record<string, unknown> = {
                nombre: formData.nombre.trim(),
                paterno: formData.paterno.trim(),
                materno: formData.materno?.trim() || '',
                correo: formData.correo.toLowerCase().trim(),
                telefono: String(formData.telefono).trim(),
                rol: formData.rol,
                estado: formData.estado
            };

            if (esCliente) {
                payload.ci_nit = formData.ci_nit ? String(formData.ci_nit).trim() : '';
                payload.fecha_nacimiento = formData.fecha_nacimiento || '';
                payload.calle = formData.calle?.trim() || '';
                payload.zona = formData.zona?.trim() || '';
                payload.ciudad = formData.ciudad?.trim() || '';
            }

            if (esEmpleado) {
                payload.fecha_contratacion = formData.fecha_contratacion;
                payload.cargo = formData.cargo?.trim() || '';
                payload.turno = formData.turno;
            }

            if (esAdmin) {
                payload.nivel_acceso = formData.nivel_acceso;
            }

            if (formData.contraseña && formData.contraseña.trim()) {
                payload.contraseña = formData.contraseña;
            } else if (!modoEdicion) {
                payload.contraseña = formData.contraseña;
            }

            if (modoEdicion) {
                await api.put(`/usuarios/${usuarioId}`, payload);
            } else {
                await api.post('/usuarios', payload);
            }

            onSave();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al guardar el usuario');
        } finally {
            setCargando(false);
        }
    };

    const fechaMaxima = new Date();
    fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 15);
    const fechaMaximaStr = fechaMaxima.toISOString().split('T')[0];

    const edadCalculada = formData.fecha_nacimiento
        ? calcularEdad(formData.fecha_nacimiento)
        : null;

    // ✅ MODAL RENDERIZADO EN PORTAL
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl shadow-xl overflow-hidden border border-claro-borde dark:border-oscuro-borde max-h-[90vh] flex flex-col">

                {/* Cabecera */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde shrink-0">
                    <h2 className="text-xl font-semibold text-claro-texto dark:text-oscuro-texto">
                        {modoEdicion ? 'Editar usuario' : 'Nuevo usuario'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-claro-texto2 hover:text-claro-texto dark:text-oscuro-texto2 dark:hover:text-oscuro-texto">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Formulario scrolleable */}
                <form
                    id="form-usuario"
                    onSubmit={handleSubmit}
                    className="p-6 space-y-3 overflow-y-auto flex-1"
                    noValidate
                >

                    {/* === DATOS BÁSICOS === */}
                    <h3 className="text-sm font-semibold text-claro-primario dark:text-oscuro-primario uppercase tracking-wide">
                        Datos básicos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Nombre *</label>
                            <input
                                type="text" name="nombre"
                                value={formData.nombre} onChange={handleChange} onBlur={handleBlur}
                                maxLength={50}
                                className={claseInput(errores.nombre, touched.nombre)}
                            />
                            <FieldError error={errores.nombre} touched={touched.nombre} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Ap. Paterno *</label>
                            <input
                                type="text" name="paterno"
                                value={formData.paterno} onChange={handleChange} onBlur={handleBlur}
                                maxLength={50}
                                className={claseInput(errores.paterno, touched.paterno)}
                            />
                            <FieldError error={errores.paterno} touched={touched.paterno} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Ap. Materno</label>
                            <input
                                type="text" name="materno"
                                value={formData.materno} onChange={handleChange} onBlur={handleBlur}
                                maxLength={50}
                                className={claseInput(errores.materno, touched.materno)}
                            />
                            <FieldError error={errores.materno} touched={touched.materno} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Correo *</label>
                            <input
                                type="email" name="correo"
                                value={formData.correo} onChange={handleChange} onBlur={handleBlur}
                                maxLength={150}
                                className={claseInput(errores.correo, touched.correo)}
                            />
                            <FieldError error={errores.correo} touched={touched.correo} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Teléfono *</label>
                            <input
                                type="tel" name="telefono"
                                inputMode="numeric"
                                value={formData.telefono} onChange={handleChange} onBlur={handleBlur}
                                maxLength={8}
                                className={claseInput(errores.telefono, touched.telefono)}
                            />
                            <FieldError error={errores.telefono} touched={touched.telefono} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Rol *</label>
                            <select
                                name="rol"
                                value={formData.rol}
                                onChange={handleRolChange}
                                className="w-full px-3 py-2.5 border border-claro-borde dark:border-oscuro-borde rounded-xl bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario"
                            >
                                <option value="Cliente">Cliente</option>
                                <option value="Empleado">Empleado</option>
                                <option value="Admin">Administrador</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Estado</label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-claro-borde dark:border-oscuro-borde rounded-xl bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario"
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">
                                Contraseña {modoEdicion ? '(opcional)' : '*'}
                            </label>
                            <div className="relative">
                                <input
                                    type={mostrarContraseña ? 'text' : 'password'}
                                    name="contraseña"
                                    value={formData.contraseña}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={modoEdicion ? 'Dejar vacío' : '••••••••'}
                                    maxLength={100}
                                    className={claseInput(errores.contraseña, touched.contraseña)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarContraseña(!mostrarContraseña)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-claro-texto2 hover:text-claro-primario dark:text-oscuro-texto2 dark:hover:text-oscuro-primario font-medium transition-colors"
                                    tabIndex={-1}
                                >
                                    {mostrarContraseña ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                            <FieldError error={errores.contraseña} touched={touched.contraseña} />
                        </div>
                    </div>

                    {/* === DATOS PERSONALES (SOLO CLIENTE) === */}
                    {esCliente && (
                        <>
                            <h3 className="text-sm font-semibold text-claro-primario dark:text-oscuro-primario uppercase tracking-wide pt-2">
                                Datos personales
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">CI / NIT</label>
                                    <input
                                        type="text" name="ci_nit"
                                        inputMode="numeric"
                                        value={formData.ci_nit} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={15}
                                        className={claseInput(errores.ci_nit, touched.ci_nit)}
                                    />
                                    <FieldError error={errores.ci_nit} touched={touched.ci_nit} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Fecha de nacimiento</label>
                                    <input
                                        type="date" name="fecha_nacimiento"
                                        value={formData.fecha_nacimiento} onChange={handleChange} onBlur={handleBlur}
                                        max={fechaMaximaStr}
                                        className={claseInput(errores.fecha_nacimiento, touched.fecha_nacimiento)}
                                    />
                                    {errores.fecha_nacimiento && touched.fecha_nacimiento ? (
                                        <FieldError error={errores.fecha_nacimiento} touched={touched.fecha_nacimiento} />
                                    ) : (
                                        <p className="text-xs mt-1 min-h-[16px] text-claro-texto2 dark:text-oscuro-texto2">
                                            {edadCalculada !== null ? (
                                                <>Edad: <span className="font-semibold text-claro-primario dark:text-oscuro-primario">{edadCalculada} años</span></>
                                            ) : '\u00A0'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Calle / Avenida</label>
                                <input
                                    type="text" name="calle"
                                    value={formData.calle} onChange={handleChange} onBlur={handleBlur}
                                    maxLength={150}
                                    className={claseInput(errores.calle, touched.calle)}
                                />
                                <FieldError error={errores.calle} touched={touched.calle} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Zona / Barrio</label>
                                    <input
                                        type="text" name="zona"
                                        value={formData.zona} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={100}
                                        className={claseInput(errores.zona, touched.zona)}
                                    />
                                    <FieldError error={errores.zona} touched={touched.zona} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Ciudad</label>
                                    <input
                                        type="text" name="ciudad"
                                        value={formData.ciudad} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={100}
                                        className={claseInput(errores.ciudad, touched.ciudad)}
                                    />
                                    <FieldError error={errores.ciudad} touched={touched.ciudad} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* === CAMPOS EMPLEADO === */}
                    {esEmpleado && (
                        <>
                            <h3 className="text-sm font-semibold text-claro-primario dark:text-oscuro-primario uppercase tracking-wide pt-2">
                                Datos laborales
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Fecha de contratación *</label>
                                    <input
                                        type="date" name="fecha_contratacion"
                                        value={formData.fecha_contratacion} onChange={handleChange} onBlur={handleBlur}
                                        className={claseInput(errores.fecha_contratacion, touched.fecha_contratacion)}
                                    />
                                    <FieldError error={errores.fecha_contratacion} touched={touched.fecha_contratacion} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Cargo *</label>
                                    <input
                                        type="text" name="cargo"
                                        value={formData.cargo} onChange={handleChange} onBlur={handleBlur}
                                        placeholder="Ej: Recepcionista"
                                        maxLength={100}
                                        className={claseInput(errores.cargo, touched.cargo)}
                                    />
                                    <FieldError error={errores.cargo} touched={touched.cargo} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Turno *</label>
                                    <select
                                        name="turno"
                                        value={formData.turno}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 border border-claro-borde dark:border-oscuro-borde rounded-xl bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario"
                                    >
                                        <option value="Mañana">Mañana</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Noche">Noche</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* === CAMPOS ADMIN === */}
                    {esAdmin && (
                        <>
                            <h3 className="text-sm font-semibold text-claro-primario dark:text-oscuro-primario uppercase tracking-wide pt-2">
                                Datos del administrador
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1">Nivel de acceso *</label>
                                <select
                                    name="nivel_acceso"
                                    value={formData.nivel_acceso}
                                    onChange={handleChange} onBlur={handleBlur}
                                    className={claseInput(errores.nivel_acceso, touched.nivel_acceso)}
                                >
                                    <option value="Total">Total (SuperAdmin)</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Bajo">Bajo</option>
                                </select>
                                <FieldError error={errores.nivel_acceso} touched={touched.nivel_acceso} />
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}
                </form>

                {/* Pie con botones */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-claro-borde dark:border-oscuro-borde shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte rounded-lg transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="form-usuario"
                        disabled={cargando}
                        className={`px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition-all
                            ${cargando
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : 'bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:text-oscuro-fondo dark:hover:bg-oscuro-hover text-white'}`}
                    >
                        {cargando ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalUsuario;