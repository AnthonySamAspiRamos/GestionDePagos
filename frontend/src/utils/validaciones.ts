// frontend/src/utils/validaciones.ts
// =====================================================
// UTILIDADES DE VALIDACIÓN (FRONTEND)
// Espejo del backend para validar en vivo antes de enviar
// =====================================================

export interface ResultadoValidacion {
    valido: boolean;
    error?: string;
    edad?: number;
}

export interface ErroresFormulario {
    [key: string]: string;
}

// =====================================================
// VALIDACIONES GENÉRICAS
// =====================================================

/**
 * Valida que un texto contenga solo letras (con tildes, ñ, ü),
 * espacios, apóstrofes y guiones. No acepta números ni símbolos raros.
 */
export const esSoloLetras = (texto: any): boolean => {
    if (!texto || typeof texto !== 'string') return false;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(texto.trim());
};

/**
 * Valida que un texto contenga solo números (sin letras ni símbolos).
 */
export const esSoloNumeros = (texto: any): boolean => {
    if (texto === null || texto === undefined) return false;
    return /^[0-9]+$/.test(String(texto).trim());
};

/**
 * Valida un correo electrónico con formato estándar.
 */
export const esCorreoValido = (correo: any): boolean => {
    if (!correo || typeof correo !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
};

/**
 * Valida un teléfono boliviano: exactamente 8 dígitos numéricos.
 */
export const esTelefonoValido = (telefono: any): boolean => {
    if (!telefono) return false;
    const limpio = String(telefono).replace(/[\s-]/g, '');
    return /^[0-9]{8}$/.test(limpio);
};

/**
 * Valida un CI/NIT: solo números, entre 5 y 15 dígitos.
 */
export const esCiNitValido = (ci_nit: any): boolean => {
    if (ci_nit === null || ci_nit === undefined) return false;
    const limpio = String(ci_nit).trim();
    if (!/^[0-9]+$/.test(limpio)) return false;
    return limpio.length >= 5 && limpio.length <= 15;
};

/**
 * Valida longitud de un string (con trim aplicado).
 */
export const longitudValida = (texto: any, min: number, max: number): boolean => {
    if (!texto || typeof texto !== 'string') return false;
    const limpio = texto.trim();
    return limpio.length >= min && limpio.length <= max;
};

// =====================================================
// CÁLCULO DE EDAD
// =====================================================

/**
 * Calcula la edad a partir de una fecha de nacimiento.
 * Devuelve null si la fecha es inválida.
 */
export const calcularEdad = (fechaNacimiento: string | Date | null | undefined): number | null => {
    if (!fechaNacimiento) return null;

    const nac = new Date(fechaNacimiento);
    if (isNaN(nac.getTime())) return null;

    const hoy = new Date();
    if (nac > hoy) return null;

    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
        edad--;
    }

    return edad;
};

/**
 * Valida que la fecha de nacimiento corresponda a una edad entre 15 y 80 años.
 * Rechaza fechas futuras y fechas de hoy.
 */
export const esFechaNacimientoValida = (fechaNacimiento: string | Date | null | undefined): ResultadoValidacion => {
    if (!fechaNacimiento) {
        return { valido: false, error: 'La fecha de nacimiento es obligatoria.' };
    }

    const nac = new Date(fechaNacimiento);
    if (isNaN(nac.getTime())) {
        return { valido: false, error: 'Fecha de nacimiento inválida.' };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const nacLimpia = new Date(nac);
    nacLimpia.setHours(0, 0, 0, 0);

    if (nacLimpia >= hoy) {
        return { valido: false, error: 'La fecha de nacimiento no puede ser hoy ni una fecha futura.' };
    }

    const edad = calcularEdad(fechaNacimiento);

    if (edad === null) {
        return { valido: false, error: 'Fecha de nacimiento inválida.' };
    }

    if (edad < 15) {
        return { valido: false, error: 'Debés tener al menos 15 años para registrarte.' };
    }

    if (edad > 80) {
        return { valido: false, error: 'La fecha no corresponde a una edad válida (máximo 80 años).' };
    }

    return { valido: true, edad };
};

// =====================================================
// CONTRASEÑA
// =====================================================

/**
 * Valida una contraseña:
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula, 1 minúscula, 1 número
 */
export const esContraseñaSegura = (contraseña: any): ResultadoValidacion => {
    if (!contraseña || typeof contraseña !== 'string') {
        return { valido: false, error: 'La contraseña es obligatoria.' };
    }

    if (contraseña.length < 8) {
        return { valido: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    if (contraseña.length > 100) {
        return { valido: false, error: 'La contraseña no puede superar los 100 caracteres.' };
    }

    if (!/[A-Z]/.test(contraseña)) {
        return { valido: false, error: 'Debe incluir al menos una letra mayúscula.' };
    }

    if (!/[a-z]/.test(contraseña)) {
        return { valido: false, error: 'Debe incluir al menos una letra minúscula.' };
    }

    if (!/[0-9]/.test(contraseña)) {
        return { valido: false, error: 'Debe incluir al menos un número.' };
    }

    return { valido: true };
};

// =====================================================
// VALIDACIÓN POR CAMPO (para usar en formularios)
// Devuelve un string vacío si está OK, o el mensaje de error
// =====================================================

/**
 * Valida un campo individual según su `name`.
 * Útil para validar en vivo en los formularios.
 */
export const validarCampo = (name: string, value: any, formData: Record<string, any> = {}): string => {
    switch (name) {
        case 'nombre':
            if (!value || !value.trim()) return 'El nombre es obligatorio.';
            if (value.trim().length < 2) return 'Mínimo 2 caracteres.';
            if (value.trim().length > 50) return 'Máximo 50 caracteres.';
            if (!esSoloLetras(value)) return 'Solo letras y espacios.';
            return '';

        case 'paterno':
            if (!value || !value.trim()) return 'El apellido paterno es obligatorio.';
            if (value.trim().length < 2) return 'Mínimo 2 caracteres.';
            if (value.trim().length > 50) return 'Máximo 50 caracteres.';
            if (!esSoloLetras(value)) return 'Solo letras y espacios.';
            return '';

        case 'materno':
            if (value && value.trim()) {
                if (value.trim().length < 2) return 'Mínimo 2 caracteres.';
                if (value.trim().length > 50) return 'Máximo 50 caracteres.';
                if (!esSoloLetras(value)) return 'Solo letras y espacios.';
            }
            return '';

        case 'correo':
            if (!value || !value.trim()) return 'El correo es obligatorio.';
            if (!esCorreoValido(value)) return 'Formato de correo inválido.';
            if (value.length > 150) return 'Correo demasiado largo.';
            return '';

        case 'telefono':
        case 'celular':
            if (!value || !String(value).trim()) return 'El teléfono es obligatorio.';
            if (!esSoloNumeros(value)) return 'Solo se aceptan números.';
            if (!esTelefonoValido(value)) return 'Debe tener exactamente 8 dígitos.';
            return '';

        case 'ci_nit':
            if (!value || !String(value).trim()) return 'El CI/NIT es obligatorio.';
            if (!esSoloNumeros(value)) return 'Solo se aceptan números.';
            if (!esCiNitValido(value)) return 'Debe tener entre 5 y 15 dígitos.';
            return '';

        case 'fecha_nacimiento': {
            const res = esFechaNacimientoValida(value);
            return res.valido ? '' : res.error || 'Fecha inválida';
        }

        case 'contraseña':
        case 'nuevaContraseña':
            return esContraseñaSegura(value).error || '';

        case 'confirmar':
        case 'passwordConfirmar':
            if (!value) return 'Debés confirmar la contraseña.';
            if (value !== (formData.nuevaContraseña || formData.contraseña || formData.passwordNueva)) {
                return 'Las contraseñas no coinciden.';
            }
            return '';

        // Empleado
        case 'fecha_contratacion':
            if (!value) return 'La fecha de contratación es obligatoria.';
            return '';

        case 'cargo':
            if (!value || !value.trim()) return 'El cargo es obligatorio.';
            if (value.trim().length < 3) return 'Mínimo 3 caracteres.';
            if (value.trim().length > 100) return 'Máximo 100 caracteres.';
            return '';

        case 'turno':
            if (!value) return 'El turno es obligatorio.';
            if (!['Mañana', 'Tarde', 'Noche'].includes(value)) return 'Turno inválido.';
            return '';

        case 'antiguedad':
            if (value !== undefined && value !== '' && value !== null) {
                if (isNaN(Number(value)) || Number(value) < 0) return 'Debe ser un número mayor o igual a 0.';
                if (Number(value) > 100) return 'Valor demasiado alto.';
            }
            return '';

        // Admin
        case 'nivel_acceso':
            if (!value) return 'El nivel de acceso es obligatorio.';
            if (!['Total', 'Medio', 'Bajo'].includes(value)) return 'Nivel inválido.';
            return '';

        // Dirección (opcionales)
        case 'calle':
            if (value && value.trim().length > 150) return 'Máximo 150 caracteres.';
            return '';

        case 'zona':
            if (value && value.trim().length > 100) return 'Máximo 100 caracteres.';
            return '';

        case 'ciudad':
            if (value && value.trim().length > 100) return 'Máximo 100 caracteres.';
            return '';

        default:
            return '';
    }
};

// =====================================================
// VALIDACIÓN COMPLETA POR ROL
// Devuelve un objeto con errores por campo
// =====================================================

/**
 * Valida todos los campos del formulario.
 * Ahora los datos personales (CI, fecha nac, dirección) son comunes a TODOS los roles.
 */
export const validarFormularioCompleto = (formData: Record<string, any>, rol: string = 'Cliente', modoEdicion: boolean = false): ErroresFormulario => {
    const errores: ErroresFormulario = {};

    // === CAMPOS COMUNES SIEMPRE REQUERIDOS ===
    ['nombre', 'paterno', 'correo', 'telefono'].forEach((campo) => {
        const err = validarCampo(campo, formData[campo], formData);
        if (err) errores[campo] = err;
    });

    // Materno es opcional, pero si viene se valida
    const errMaterno = validarCampo('materno', formData.materno, formData);
    if (errMaterno) errores.materno = errMaterno;

    // === DATOS PERSONALES (comunes a TODOS los roles) ===
    // Solo se validan si vienen (porque en Registro público son opcionales,
    // pero en Panel Admin son obligatorios)
    if (formData.ci_nit) {
        const errCi = validarCampo('ci_nit', formData.ci_nit, formData);
        if (errCi) errores.ci_nit = errCi;
    }
    if (formData.fecha_nacimiento) {
        const errFecha = validarCampo('fecha_nacimiento', formData.fecha_nacimiento, formData);
        if (errFecha) errores.fecha_nacimiento = errFecha;
    }

    // Calle, zona, ciudad son opcionales (se validan solo longitud)
    ['calle', 'zona', 'ciudad'].forEach((campo) => {
        const err = validarCampo(campo, formData[campo], formData);
        if (err) errores[campo] = err;
    });

    // === CONTRASEÑA ===
    if (!modoEdicion || formData.contraseña) {
        const errPwd = validarCampo('contraseña', formData.contraseña, formData);
        if (errPwd) errores.contraseña = errPwd;
    }

    // === CAMPOS ESPECÍFICOS DEL ROL ===
    if (rol === 'Empleado') {
        ['fecha_contratacion', 'cargo', 'turno'].forEach((campo) => {
            const err = validarCampo(campo, formData[campo], formData);
            if (err) errores[campo] = err;
        });
        const errAnti = validarCampo('antiguedad', formData.antiguedad, formData);
        if (errAnti) errores.antiguedad = errAnti;
    }

    if (rol === 'Admin' || rol === 'Administrador') {
        const errNivel = validarCampo('nivel_acceso', formData.nivel_acceso, formData);
        if (errNivel) errores.nivel_acceso = errNivel;
    }

    return errores;
};

// =====================================================
// HELPERS DE UI
// =====================================================

/**
 * Devuelve una clase de Tailwind según el estado del campo.
 * Usa la paleta del sistema (EMERALD para OK, BURGUNDY para error).
 */
export const claseInput = (tieneError: boolean | string | undefined, touched: boolean | undefined = true): string => {
    const base = 'w-full px-4 py-2.5 rounded-xl border bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 transition-all';

    if (!touched) {
        // Neutro: borde normal de la paleta
        return `${base} border-claro-borde dark:border-oscuro-borde focus:ring-claro-primario dark:focus:ring-oscuro-primario`;
    }

    if (tieneError) {
        // ❌ Error: BURGUNDY (acento)
        return `${base} border-claro-acento dark:border-oscuro-acento focus:ring-claro-acento dark:focus:ring-oscuro-acento`;
    }

    // ✅ OK: EMERALD (primario) — no verde brillante
    return `${base} border-claro-primario dark:border-oscuro-primario focus:ring-claro-primario dark:focus:ring-oscuro-primario`;
};

/**
 * Calcula la fuerza de una contraseña del 0 al 3.
 */
export const fuerzaContraseña = (contraseña: string | undefined | null): number => {
    if (!contraseña) return 0;
    let puntos = 0;
    if (contraseña.length >= 8) puntos++;
    if (contraseña.length >= 12) puntos++;
    if (/[A-Z]/.test(contraseña) && /[0-9]/.test(contraseña)) puntos++;
    return Math.min(puntos, 3);
};

/**
 * Devuelve el texto de la fuerza de la contraseña.
 */
export const textoFuerza = (nivel: number): string => {
    switch (nivel) {
        case 0: return 'Muy débil';
        case 1: return 'Débil';
        case 2: return 'Aceptable';
        case 3: return 'Segura';
        default: return '';
    }
};

/**
 * Devuelve el color de la barra de fuerza.
 * Ahora usa la paleta del sistema.
 */
export const colorFuerza = (nivel: number): string => {
    switch (nivel) {
        case 1: return 'bg-claro-acento dark:bg-oscuro-acento';           // BURGUNDY suave
        case 2: return 'bg-yellow-500 dark:bg-yellow-400';                // Intermedio (mantenemos amarillo)
        case 3: return 'bg-claro-primario dark:bg-oscuro-primario';        // EMERALD
        default: return 'bg-gray-200 dark:bg-gray-700';
    }
};