/**
 * ============================================================================
 * ARCHIVO: Home.tsx
 * PÁGINA: Página Principal del Complejo Deportivo (Landing Page)
 * RUTA: /
 * ============================================================================
 */

import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Hero } from '../components/landing/Hero';
import { CanchaList } from '../components/canchas/CanchaList';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ServicesShowcase } from '../components/landing/ServicesShowcase';
import { Footer } from '../components/landing/Footer';

export const Home: React.FC = () => {
  return (
    <div className="app-layout">
      {/* 1. Barra de Navegación Pública (con detección de sesión) */}
      <LandingNavbar />

      <main>
        {/* 2. Sección Hero con métricas y bienvenida */}
        <Hero />

        {/* 3. Catálogo y Gestión de Canchas (CRUD con permisos admin) */}
        <CanchaList />

        {/* 4. ¿Cómo funciona la reserva? */}
        <HowItWorks />

        {/* 5. Comodidades y Servicios */}
        <ServicesShowcase />
      </main>

      {/* 6. Pie de Página */}
      <Footer />
    </div>
  );
};
export default Home;
