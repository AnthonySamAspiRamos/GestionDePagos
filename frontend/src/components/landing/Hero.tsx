/**
 * ============================================================================
 * ARCHIVO: Hero.tsx
 * COMPONENTE: Sección Principal de Bienvenida del Complejo Deportivo
 * ============================================================================
 */

import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Badge superior */}
        <div className="hero-badge">
          <span className="pulsing-dot"></span>
          <span>Instalaciones abiertas hoy • Horario 06:00 a 23:30</span>
        </div>

        {/* Título Principal con Gradiente */}
        <h1 className="hero-title">
          Tu espacio ideal para <br />
          <span className="text-gradient">jugar, entrenar y competir</span>
        </h1>

        {/* Descripción */}
        <p className="hero-description">
          El complejo deportivo más completo de la ciudad. Reserva canchas de fútbol, básquetbol, 
          voleibol, tenis y pádel con disponibilidad en tiempo real y confirmación instantánea.
        </p>

        {/* Grupo de Botones de Acción */}
        <div className="hero-cta-group">
          <a href="#canchas" className="btn-hero-primary">
            Explorar Canchas
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a href="#como-funciona" className="btn-hero-secondary">
            ¿Cómo reservar?
          </a>
        </div>

        {/* Barra de Estadísticas Rápidas */}
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-number">6+</span>
            <span className="stat-title">Canchas Profesionales</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <span className="stat-number">7</span>
            <span className="stat-title">Disciplinas Deportivas</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <span className="stat-number">100%</span>
            <span className="stat-title">Gestión en Línea</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <span className="stat-number">4.9 ★</span>
            <span className="stat-title">Calificación Usuarios</span>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
