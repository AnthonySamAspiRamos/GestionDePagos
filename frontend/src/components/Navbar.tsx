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
        { 
            path: '/verificar-pagos', 
            name: 'Verificar Pagos', 
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', 
            roles: ['Administrador', 'Empleado'] 
        },
        { 
            path: '/gestion-reembolsos', 
            name: 'Reembolsos', 
            icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', 
            roles: ['Administrador'] 
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