import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import IconCanchas from '../assets/icon_canchas.svg?react';

// =====================================================
// TIPOS
// =====================================================
type Rol = 'Administrador' | 'Empleado' | 'Cliente' | 'Usuario';

interface MenuItem {
    path: string;
    name: string;
    icon: string;
    roles: Rol[];
}

interface NavbarProps {
    abierto: boolean;
    onCerrar: () => void;
}

// =====================================================
// COMPONENTE
// =====================================================
const Navbar = ({ abierto, onCerrar }: NavbarProps) => {
    const { usuario } = useAuth();

    const menuItems: MenuItem[] = [
        { 
            path: '/dashboard', 
            name: 'Inicio', 
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 
            roles: ['Administrador', 'Empleado', 'Cliente', 'Usuario'] 
        },
        { 
            path: '/panel-admin', 
            name: 'Usuarios', 
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', 
            roles: ['Administrador'] 
        },
        { 
            path: '/canchas', 
            name: 'Canchas', 
            icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', 
            roles: ['Administrador', 'Empleado', 'Cliente', 'Usuario'] 
        },
        // --- RESERVA PARA CLIENTE ---
        { 
            path: '/reservas', 
            name: 'Mis Reservas', 
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
            roles: ['Cliente', 'Usuario'] 
        },
        // --- RESERVA PARA ADMIN/EMPLEADO ---
        { 
            path: '/gestion-reservas', 
            name: 'Gestión de Reservas', 
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
            roles: ['Administrador', 'Empleado'] 
        },
        // --- EVENTOS: catálogo/inscripción, visible para todos los roles ---
        { 
            path: '/eventos', 
            name: 'Eventos', 
            icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', 
            roles: ['Administrador', 'Empleado', 'Cliente', 'Usuario'] 
        },
        // --- MIS INSCRIPCIONES: solo cliente ---
        { 
            path: '/mis-inscripciones', 
            name: 'Mis Inscripciones', 
            icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 
            roles: ['Cliente', 'Usuario'] 
        },
        // --- GESTIÓN DE EVENTOS: admin/empleado crea, asocia servicios y cancela ---
        { 
            path: '/gestion-eventos', 
            name: 'Gestión de Eventos', 
            icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5', 
            roles: ['Administrador', 'Empleado'] 
        },
        { 
            path: '/reportes', 
            name: 'Reportes', 
            icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 
            roles: ['Administrador'] 
        }
    ];

    const rolActual: Rol = (usuario?.rol as Rol) || 'Usuario';
    const menuFiltrado = menuItems.filter(item => item.roles.includes(rolActual));

    return (
        <>
            {/* Overlay oscuro en móvil */}
            {abierto && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onCerrar}
                />
            )}

            <aside className={`
                w-64 h-screen fixed left-0 top-0 
                bg-claro-tarjeta dark:bg-oscuro-tarjeta 
                border-r border-claro-borde dark:border-oscuro-borde 
                flex flex-col transition-transform duration-300 z-50
                ${abierto ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0
            `}>
                <div className="flex items-center gap-3 px-6 py-8">
                    <IconCanchas className="w-9 h-9" />
                    <span className="text-xl font-bold text-claro-texto dark:text-oscuro-texto tracking-tight">
                        CanchasDeportivas
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {menuFiltrado.map((item) => (
                        <NavLink 
                            key={item.name} 
                            to={item.path} 
                            onClick={onCerrar}   
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 
                                ${isActive 
                                    ? 'bg-claro-tinte text-claro-primario dark:bg-oscuro-tinte dark:text-oscuro-primario' 
                                    : 'text-claro-texto2 hover:bg-gray-50 hover:text-claro-texto dark:text-oscuro-texto2 dark:hover:bg-oscuro-fondo dark:hover:text-oscuro-texto'
                                }
                            `}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Navbar;