/**
 * ============================================================================
 * ARCHIVO: HowItWorks.tsx
 * COMPONENTE: Sección explicativa "Cómo Reservar"
 * ============================================================================
 */

import React from 'react';

const STEPS = [
  {
    number: '01',
    icon: '🔍',
    title: 'Elige tu Cancha',
    description: 'Filtra por disciplina (Fútbol, Pádel, Tenis, Básquet) y revisa especificaciones, dimensiones y estado.',
  },
  {
    number: '02',
    icon: '📅',
    title: 'Selecciona Fecha y Hora',
    description: 'Verifica la disponibilidad en tiempo real sin colas ni llamadas. Elige el horario que mejor te convenga.',
  },
  {
    number: '03',
    icon: '⚽',
    title: 'Confirma y Juega',
    description: 'Recibe la confirmación inmediata de tu reserva y prepárate para disfrutar tu deporte favorito.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="how-it-works-section" id="como-funciona">
      <div className="text-center">
        <span className="section-pill">Paso a Paso</span>
        <h2 className="section-title">¿Cómo Funciona el Sistema?</h2>
        <p className="section-subtitle">
          Reservar un escenario deportivo nunca fue tan rápido, transparente y cómodo.
        </p>
      </div>

      <div className="steps-grid">
        {STEPS.map(step => (
          <div key={step.number} className="step-card">
            <div className="step-top">
              <span className="step-number">{step.number}</span>
              <span className="step-icon">{step.icon}</span>
            </div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
export default HowItWorks;
