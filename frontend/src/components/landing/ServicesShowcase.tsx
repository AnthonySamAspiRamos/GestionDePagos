/**
 * ============================================================================
 * ARCHIVO: ServicesShowcase.tsx
 * COMPONENTE: Sección de Servicios e Instalaciones del Complejo
 * ============================================================================
 */

import React from 'react';

const SERVICES = [
  {
    icon: '💡',
    title: 'Iluminación LED Profesional',
    description: 'Sistemas de iluminación nocturna de alta potencia que garantizan visibilidad perfecta para partidos después de las 18:00.',
  },
  {
    icon: '🚿',
    title: 'Vestuarios y Duchas con Agua Caliente',
    description: 'Casilleros de seguridad individuales, baños higienizados y duchas presurizadas a disposición de los jugadores.',
  },
  {
    icon: '🚗',
    title: 'Parqueo Privado y Seguro',
    description: 'Amplia playa de estacionamiento con vigilancia por cámaras de circuito cerrado 24/7 para tu total tranquilidad.',
  },
  {
    icon: '🥤',
    title: 'Cafetería e Hidratación',
    description: 'Bebidas isotónicas, snacks saludables, área lounge con pantallas gigantes para ver partidos y descansar.',
  },
  {
    icon: '🏆',
    title: 'Organización de Torneos',
    description: 'Soporte y logística para ligas empresariales, campeonatos intercolegiales y eventos deportivos corporativos.',
  },
  {
    icon: '🛡️',
    title: 'Seguridad y Primeros Auxilios',
    description: 'Personal de atención médica primaria y botiquín de emergencia disponible en todo momento ante cualquier eventualidad.',
  },
];

export const ServicesShowcase: React.FC = () => {
  return (
    <section className="services-section" id="servicios">
      <div className="text-center">
        <span className="section-pill">Comodidades</span>
        <h2 className="section-title">Instalaciones de Primer Nivel</h2>
        <p className="section-subtitle">
          Todo lo necesario para que tu experiencia deportiva sea completa, segura y memorable.
        </p>
      </div>

      <div className="services-grid">
        {SERVICES.map((s, idx) => (
          <div key={idx} className="service-card">
            <div className="service-icon">{s.icon}</div>
            <h3 className="service-title">{s.title}</h3>
            <p className="service-description">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
export default ServicesShowcase;
