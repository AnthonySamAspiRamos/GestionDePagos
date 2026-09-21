import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    onAbrirMenu?: () => void;
}

interface PerfilResponse {
    foto_url?: string | null;
}

const Header = ({ onAbrirMenu }: HeaderProps) => {
    const { usuario, token, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
    const [fotoUrl, setFotoUrl] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const iniciales = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';
    const rolActual = usuario?.rol || 'Usuario';

    const handleLogout = (): void => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchFoto = async (): Promise<void> => {
            if (!token) return;
            try {
                const res = await axios.get<PerfilResponse>(
                    `${import.meta.env.VITE_API_URL}/usuarios/perfil`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.foto_url) {
                    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
                    setFotoUrl(`${baseUrl}${res.data.foto_url}`);
                } else {
                    setFotoUrl(null);
                }
            } catch (error) {
                console.error("Error al cargar foto del header", error);
            }
        };
        fetchFoto();
    }, [token, location.pathname]);

    useEffect(() => {
        const handleClickFuera = (event: MouseEvent): void => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    const titulosPorRuta: Record<string, string> = {
        '/dashboard': 'Inicio',
        '/panel-admin': 'Gestión de Usuarios',
        '/canchas': 'Canchas Disponibles',
        '/reservas': 'Mis Reservas',
        '/reportes': 'Reportes y Estadísticas',
        '/perfil': 'Mi Perfil'
    };
    
    const tituloActual = titulosPorRuta[location.pathname] || 'Sistema';

    return (
        <header className="h-20 bg-claro-tarjeta dark:bg-oscuro-tarjeta border-b border-claro-borde dark:border-oscuro-borde flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-colors duration-300">
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={onAbrirMenu}
                    className="md:hidden p-2 rounded-xl hover:bg-claro-tinte dark:hover:bg-oscuro-tinte text-claro-texto dark:text-oscuro-texto transition-colors"
                    aria-label="Abrir menú"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <h1 className="text-lg md:text-xl font-bold text-claro-texto dark:text-oscuro-texto">
                    {tituloActual}
                </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                
                <div className="text-right hidden sm:block border-r border-claro-borde dark:border-oscuro-borde pr-4 mr-2">
                    <p className="text-sm font-semibold text-claro-texto dark:text-oscuro-texto">
                        ¡Bienvenido, {rolActual}!
                    </p>
                </div>

                <ThemeToggle />
                
                <div className="relative ml-1 md:ml-2" ref={menuRef}>
                    <div 
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-claro-tinte dark:hover:bg-oscuro-tinte p-1.5 md:p-2 rounded-xl transition-colors"
                    >
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-claro-primario dark:bg-oscuro-primario flex items-center justify-center text-white dark:text-oscuro-fondo font-bold text-base md:text-lg shadow-sm border-2 border-white dark:border-oscuro-tarjeta overflow-hidden">
                            {fotoUrl ? (
                                <img src={fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
                            ) : (
                                iniciales
                            )}
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                            <span className="text-sm font-medium text-claro-texto dark:text-oscuro-texto">
                                {usuario?.nombre || 'Perfil'}
                            </span>
                            <svg className={`w-4 h-4 text-claro-texto2 dark:text-oscuro-texto2 transition-transform duration-200 ${menuAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>

                    {menuAbierto && (
                        <div className="absolute right-0 mt-2 w-48 bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-xl shadow-lg py-2 z-50 overflow-hidden">
                            <Link 
                                to="/perfil" 
                                onClick={() => setMenuAbierto(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte transition-colors"
                            >
                                <svg className="w-4 h-4 text-claro-texto2 dark:text-oscuro-texto2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Mi perfil
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
        </header>
    );
};

export default Header;