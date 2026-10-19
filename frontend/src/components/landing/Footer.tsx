/**
 * ============================================================================
 * ARCHIVO: Footer.tsx
 * COMPONENTE: Pie de Página Institucional del Complejo Deportivo
 * ============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" id="contacto">
      <div className="footer-content">
        {/* Columna Marca */}
        <div className="footer-col brand-col">
          <div className="nav-brand">
            <span className="brand-badge">⚡</span>
            <span className="brand-name">SPORT<span className="brand-accent">PLEX</span></span>
          </div>
          <p className="footer-tagline">
            El complejo deportivo más completo y moderno de la ciudad. Infraestructura pensada para deportistas de alto rendimiento y aficionados.
          </p>
          <div className="footer-socials">
            <span>📍 Av. Universitaria #450, La Paz</span>
          </div>
        </div>

        {/* Columna Disciplinas */}
        <div className="footer-col">
          <h4 className="footer-heading">Disciplinas</h4>
          <ul className="footer-links">
            <li><a href="#canchas">Fútbol 11 y Futsal</a></li>
            <li><a href="#canchas">Pádel y Tenis</a></li>
            <li><a href="#canchas">Básquetbol Reglamentario</a></li>
            <li><a href="#canchas">Voleibol y Arena</a></li>
          </ul>
        </div>

        {/* Columna Sistema */}
        <div className="footer-col">
          <h4 className="footer-heading">Sistema</h4>
          <ul className="footer-links">
            <li><Link to="/login">Iniciar Sesión</Link></li>
            <li><Link to="/registro">Crear Cuenta Cliente</Link></li>
            <li><a href="#como-funciona">Políticas de Reserva</a></li>
            <li><a href="#servicios">Tarifas y Horarios</a></li>
          </ul>
        </div>

        {/* Columna Contacto */}
        <div className="footer-col">
          <h4 className="footer-heading">Atención y Reservas</h4>
          <p className="footer-info">📞 +591 (2) 244-8900</p>
          <p className="footer-info">📱 WhatsApp: +591 789-01234</p>
          <p className="footer-info">✉️ contacto@sportplex.bo</p>
          <p className="footer-info">🕒 Lunes a Domingo: 06:00 - 23:30</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="bottom-row">
          <p>© {new Date().getFullYear()} SPORTPLEX - Complejo Deportivo. Todos los derechos reservados.</p>
          <p>Proyecto Análisis y Diseño de Datos - UMSA</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
