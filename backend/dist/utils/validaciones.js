"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarDatosCliente = exports.validarDatosUsuario = exports.longitudValida = exports.esContraseñaSegura = exports.esFechaNacimientoValida = exports.calcularEdad = exports.esCiNitValido = exports.esTelefonoValido = exports.esCorreoValido = exports.esSoloNumeros = exports.esSoloLetras = void 0;
const esSoloLetras = (texto) => {
    if (!texto || typeof texto !== 'string')
        return false;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(texto.trim());
};
exports.esSoloLetras = esSoloLetras;
const esSoloNumeros = (texto) => {
    if (texto === null || texto === undefined)
        return false;
    return /^[0-9]+$/.test(String(texto).trim());
};
exports.esSoloNumeros = esSoloNumeros;
const esCorreoValido = (correo) => {
    if (!correo || typeof correo !== 'string')
        return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
};
exports.esCorreoValido = esCorreoValido;
const esTelefonoValido = (telefono) => {
    if (!telefono)
        return false;
    const limpio = String(telefono).replace(/[\s-]/g, '');
    return /^[0-9]{8}$/.test(limpio);
};
exports.esTelefonoValido = esTelefonoValido;
const esCiNitValido = (ci_nit) => {
    if (ci_nit === null || ci_nit === undefined)
        return false;
    const limpio = String(ci_nit).trim();
    if (!/^[0-9]+$/.test(limpio))
        return false;
    return limpio.length >= 5 && limpio.length <= 15;
};
exports.esCiNitValido = esCiNitValido;
const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento)
        return null;
    const nac = new Date(fechaNacimiento);
    if (isNaN(nac.getTime()))
        return null;
    const hoy = new Date();
    if (nac > hoy)
        return null;
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
        edad--;
    }
    return edad;
};
exports.calcularEdad = calcularEdad;
const esFechaNacimientoValida = (fechaNacimiento) => {
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
    const edad = (0, exports.calcularEdad)(fechaNacimiento);
    if (edad === null) {
        return { valido: false, error: 'Fecha de nacimiento inválida.' };
    }
    if (edad < 15) {
        return { valido: false, error: 'Debés tener al menos 15 años para registrarte.' };
    }
    if (edad > 80) {
        return { valido: false, error: 'La fecha de nacimiento no corresponde a una edad válida (máximo 80 años).' };
    }
    return { valido: true, edad };
};
exports.esFechaNacimientoValida = esFechaNacimientoValida;
const esContraseñaSegura = (contraseña) => {
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
exports.esContraseñaSegura = esContraseñaSegura;
const longitudValida = (texto, min, max) => {
    if (!texto || typeof texto !== 'string')
        return false;
    const limpio = texto.trim();
    return limpio.length >= min && limpio.length <= max;
};
exports.longitudValida = longitudValida;
const validarDatosUsuario = (datos) => {
    const { nombre, paterno, materno, correo, telefono } = datos;
    if (!nombre || !nombre.trim()) {
        return { valido: false, error: 'El nombre es obligatorio.' };
    }
    if (!(0, exports.longitudValida)(nombre, 2, 50)) {
        return { valido: false, error: 'El nombre debe tener entre 2 y 50 caracteres.' };
    }
    if (!(0, exports.esSoloLetras)(nombre)) {
        return { valido: false, error: 'El nombre solo puede contener letras y espacios.' };
    }
    if (!paterno || !paterno.trim()) {
        return { valido: false, error: 'El apellido paterno es obligatorio.' };
    }
    if (!(0, exports.longitudValida)(paterno, 2, 50)) {
        return { valido: false, error: 'El apellido paterno debe tener entre 2 y 50 caracteres.' };
    }
    if (!(0, exports.esSoloLetras)(paterno)) {
        return { valido: false, error: 'El apellido paterno solo puede contener letras y espacios.' };
    }
    if (materno && materno.trim()) {
        if (!(0, exports.longitudValida)(materno, 2, 50)) {
            return { valido: false, error: 'El apellido materno debe tener entre 2 y 50 caracteres.' };
        }
        if (!(0, exports.esSoloLetras)(materno)) {
            return { valido: false, error: 'El apellido materno solo puede contener letras y espacios.' };
        }
    }
    if (!correo || !correo.trim()) {
        return { valido: false, error: 'El correo es obligatorio.' };
    }
    if (!(0, exports.esCorreoValido)(correo)) {
        return { valido: false, error: 'El correo no tiene un formato válido.' };
    }
    if (correo.length > 150) {
        return { valido: false, error: 'El correo no puede superar los 150 caracteres.' };
    }
    if (!telefono || !String(telefono).trim()) {
        return { valido: false, error: 'El teléfono es obligatorio.' };
    }
    if (!(0, exports.esTelefonoValido)(telefono)) {
        return { valido: false, error: 'El teléfono debe tener exactamente 8 dígitos numéricos.' };
    }
    return { valido: true };
};
exports.validarDatosUsuario = validarDatosUsuario;
const validarDatosCliente = (datos) => {
    const { ci_nit, fecha_nacimiento, calle, zona, ciudad } = datos;
    if (!ci_nit || String(ci_nit).trim() === '') {
        return { valido: false, error: 'El CI/NIT es obligatorio.' };
    }
    if (!(0, exports.esCiNitValido)(ci_nit)) {
        return { valido: false, error: 'El CI/NIT debe tener entre 5 y 15 dígitos numéricos.' };
    }
    const resultadoFecha = (0, exports.esFechaNacimientoValida)(fecha_nacimiento);
    if (!resultadoFecha.valido) {
        return resultadoFecha;
    }
    if (calle && calle.trim().length > 150) {
        return { valido: false, error: 'La calle no puede superar los 150 caracteres.' };
    }
    if (zona && zona.trim().length > 100) {
        return { valido: false, error: 'La zona no puede superar los 100 caracteres.' };
    }
    if (ciudad && ciudad.trim().length > 100) {
        return { valido: false, error: 'La ciudad no puede superar los 100 caracteres.' };
    }
    return { valido: true, edad: resultadoFecha.edad };
};
exports.validarDatosCliente = validarDatosCliente;
