/**
 * ============================================================================
 * ARCHIVO: LandingNavbar.tsx
 * COMPONENTE: Barra de navegación pública principal
 * CAPACIDADES:
 * - Detecta si el usuario está autenticado mediante AuthContext
 * - Muestra botones de Login / Registro si es visitante
 * - Muestra accesos directos a Dashboard / Panel Admin / Perfil si está logueado
 * ============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LandingNavbar: React.FC = () => {
  const { usuario, isAuthenticated, logout } = useAuth();
  const isAdmin = usuario?.rol === 'Admin' || usuario?.rol === 'Administrador';

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-badge">⚡</span>
          <span className="brand-name">SPORT<span className="brand-accent">PLEX</span></span>
        </Link>

        <nav className="nav-links">
          <a href="#canchas" className="nav-link">Canchas</a>
          <a href="#como-funciona" className="nav-link">Cómo Reservar</a>
          <a href="#servicios" className="nav-link">Servicios</a>
          <a href="#contacto" className="nav-link">Contacto</a>
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Badge de Rol y Nombre */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-text-main">
                  {usuario?.nombre || 'Usuario'}
                </span>
                <span className="text-xs text-accent-primary font-medium">
                  {usuario?.rol}
                </span>
              </div>

              {/* Botón de acceso a panel */}
              <Link
                to={isAdmin ? "/panel-admin" : "/dashboard"}
                className="btn-outline-sm"
              >
                {isAdmin ? "Panel Admin" : "Mi Panel"}
              </Link>

              {/* Botón de perfil */}
              <Link
                to="/perfil"
                className="btn-outline-sm hidden md:inline-flex"
                title="Mi Perfil"
              >
                Perfil
              </Link>

              {/* Cerrar Sesión */}
              <button
                type="button"
                onClick={logout}
                className="btn-outline-sm text-danger hover:border-danger"
                title="Cerrar Sesión"
              >
                Salir
              </button>

              <a href="#canchas" className="btn-primary-sm">
                Reservar
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline-sm">
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="btn-outline-sm hidden sm:inline-flex">
                Registrarse
              </Link>
              <a href="#canchas" className="btn-primary-sm">
                Ver Canchas
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default LandingNavbar;
