import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ModalUsuario from '../components/ModalUsuario';

// =====================================================
// TIPOS
// =====================================================
interface Usuario {
    id: number;
    nombre?: string;
    apellidos?: string;
    correo?: string;
    rol?: string;
    estado?: string;
    estado_cuenta?: string;
    [key: string]: unknown;
}

// =====================================================
// COMPONENTE
// =====================================================
const PanelAdmin = () => {
    const { token } = useAuth();
    
    // Estados principales
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Estados para el Modal
    const [modalAbierto, setModalAbierto] = useState<boolean>(false);
    const [usuarioIdEditar, setUsuarioIdEditar] = useState<number | null>(null);

    // Obtener la lista de usuarios
    const fetchUsuarios = async (): Promise<void> => {
        try {
            setCargando(true);
            const respuesta = await api.get<Usuario[]>('/usuarios');
            setUsuarios(respuesta.data);
            setError('');
        } catch (err) {
            setError('Error al cargar los usuarios. Verifica tu conexión al servidor.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsuarios();
    }, [token]);

    // Manejadores del Modal
    const abrirModalNuevo = (): void => {
        setUsuarioIdEditar(null);
        setModalAbierto(true);
    };

    const abrirModalEditar = (usuario: Usuario): void => {
        setUsuarioIdEditar(usuario.id);
        setModalAbierto(true);
    };

    const handleGuardarUsuario = (): void => {
        fetchUsuarios();
    };

    // Eliminar Usuario
    const handleEliminar = async (id: number): Promise<void> => {
        if (window.confirm('¿Estás seguro de eliminar este usuario de forma permanente?')) {
            try {
                await api.delete(`/usuarios/${id}`);
                fetchUsuarios();
            } catch (err: any) {
                alert('Error al eliminar: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    // Cálculos para las tarjetas
    const totalUsuarios = usuarios.length;
    const usuariosActivos = usuarios.filter(u => u.estado_cuenta === 'Activo' || u.estado === 'Activo').length;
    const usuariosSuspendidos = usuarios.filter(u => u.estado_cuenta === 'Inactivo' || u.estado === 'Inactivo').length;

    return (
        <div className="space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto">Usuarios</h1>
                    <p className="text-claro-texto2 dark:text-oscuro-texto2 text-sm mt-1">
                        Resumen general de las cuentas registradas.
                    </p>
                </div>
                <button 
                    onClick={abrirModalNuevo}
                    className="px-5 py-2.5 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:text-oscuro-fondo dark:hover:bg-oscuro-hover text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo usuario
                </button>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
                    <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Total registrados</p>
                    <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">{totalUsuarios}</h3>
                </div>
                <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
                    <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Activos</p>
                    <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">{usuariosActivos}</h3>
                </div>
                <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
                    <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Roles de Admin</p>
                    <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">
                        {usuarios.filter(u => u.rol === 'Admin' || u.rol === 'Administrador').length}
                    </h3>
                </div>
                <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
                    <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Suspendidos</p>
                    <h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{usuariosSuspendidos}</h3>
                </div>
            </div>

            {/* Contenedor */}
            <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-2xl shadow-sm overflow-hidden transition-colors">
                
                <div className="px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde bg-claro-fondo/50 dark:bg-oscuro-fondo/50">
                    <h2 className="font-semibold text-claro-texto dark:text-oscuro-texto">Administrar usuarios</h2>
                </div>

                {/* Estado de carga/error */}
                {cargando ? (
                    <div className="px-6 py-8 text-center text-claro-texto2 dark:text-oscuro-texto2">
                        Cargando usuarios...
                    </div>
                ) : error ? (
                    <div className="px-6 py-8 text-center text-red-500 font-medium">
                        {error}
                    </div>
                ) : usuarios.length === 0 ? (
                    <div className="px-6 py-8 text-center text-claro-texto2 dark:text-oscuro-texto2">
                        No hay usuarios registrados.
                    </div>
                ) : (
                    <>
                        {/* ============================================ */}
                        {/* VISTA DESKTOP: TABLA (visible desde md)        */}
                        {/* ============================================ */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-semibold text-claro-texto2 dark:text-oscuro-texto2 border-b border-claro-borde dark:border-oscuro-borde">
                                        <th className="px-6 py-4">USUARIO</th>
                                        <th className="px-6 py-4">CORREO ELECTRÓNICO</th>
                                        <th className="px-6 py-4">ROL</th>
                                        <th className="px-6 py-4">ESTADO</th>
                                        <th className="px-6 py-4 text-right">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-claro-borde dark:divide-oscuro-borde">
                                    {usuarios.map((user) => (
                                        <tr key={user.id} className="hover:bg-claro-fondo dark:hover:bg-oscuro-fondo/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario flex items-center justify-center font-bold text-sm">
                                                        {(user.nombre?.charAt(0) || '') + (user.apellidos?.charAt(0) || '')}
                                                    </div>
                                                    <span className="font-medium text-claro-texto dark:text-oscuro-texto">
                                                        {user.nombre} {user.apellidos}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2">
                                                {user.correo}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2">
                                                {user.rol}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                                                    ${(user.estado === 'Activo' || user.estado_cuenta === 'Activo')
                                                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                                                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                                    }`}>
                                                    {user.estado || user.estado_cuenta}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button 
                                                    onClick={() => abrirModalEditar(user)}
                                                    className="px-3 py-1.5 text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-white dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:text-claro-primario dark:hover:text-oscuro-primario transition-colors"
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleEliminar(user.id)}
                                                    className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ============================================ */}
                        {/* VISTA MÓVIL: CARDS (visible hasta md)          */}
                        {/* ============================================ */}
                        <div className="md:hidden divide-y divide-claro-borde dark:divide-oscuro-borde">
                            {usuarios.map((user) => (
                                <div key={user.id} className="p-4 space-y-4">
                                    
                                    {/* Fila 1: Avatar + Nombre + Correo */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-claro-tinte dark:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario flex items-center justify-center font-bold text-sm shrink-0">
                                            {(user.nombre?.charAt(0) || '') + (user.apellidos?.charAt(0) || '')}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-claro-texto dark:text-oscuro-texto truncate">
                                                {user.nombre} {user.apellidos}
                                            </h3>
                                            <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2 truncate">
                                                {user.correo}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Fila 2: Rol y Estado */}
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <p className="text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wide mb-1">Rol</p>
                                            <p className="font-medium text-claro-texto dark:text-oscuro-texto">
                                                {user.rol}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-claro-texto2 dark:text-oscuro-texto2 uppercase tracking-wide mb-1">Estado</p>
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${(user.estado === 'Activo' || user.estado_cuenta === 'Activo')
                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                                }`}>
                                                {user.estado || user.estado_cuenta}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Fila 3: Botones */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => abrirModalEditar(user)}
                                            className="flex-1 py-2 text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:text-claro-primario dark:hover:text-oscuro-primario transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleEliminar(user.id)}
                                            className="flex-1 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-claro-fondo dark:bg-oscuro-fondo border border-claro-borde dark:border-oscuro-borde rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            <ModalUsuario 
                isOpen={modalAbierto} 
                onClose={() => setModalAbierto(false)} 
                onSave={handleGuardarUsuario} 
                usuarioId={usuarioIdEditar}
            />
        </div>
    );
};

export default PanelAdmin;