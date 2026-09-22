import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

const RutasProtegidas = () => {
    const { isAuthenticated } = useAuth();
    const [menuMovilAbierto, setMenuMovilAbierto] = useState<boolean>(false);
    const location = useLocation();

    // Cierra el menú móvil automáticamente al cambiar de ruta
    useEffect(() => {
        setMenuMovilAbierto(false);
    }, [location.pathname]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const cerrarMenu = (): void => setMenuMovilAbierto(false);

    return (
        <div className="flex h-screen bg-claro-fondo dark:bg-oscuro-fondo transition-colors duration-300">
            
            {/* Sidebar */}
            <Navbar 
                abierto={menuMovilAbierto} 
                onCerrar={cerrarMenu} 
            />
            
            {/* Contenedor principal: ml-64 SOLO en desktop */}
            <div className="flex-1 md:ml-64 flex flex-col overflow-hidden w-full">
                
                <Header onAbrirMenu={() => setMenuMovilAbierto(true)} />
                
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default RutasProtegidas;