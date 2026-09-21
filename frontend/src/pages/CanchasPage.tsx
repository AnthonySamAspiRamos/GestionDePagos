/**
 * ============================================================================
 * ARCHIVO: CanchasPage.tsx
 * PÁGINA: Módulo de Canchas dentro del Panel Autenticado
 * RUTA: /canchas (Protegida)
 * ============================================================================
 */

import React from 'react';
import { CanchaList } from '../components/canchas/CanchaList';

export const CanchasPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Contenedor adaptado al tema del panel */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-6 md:p-8 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-claro-texto dark:text-oscuro-texto mb-2">
          Gestión de Canchas y Escenarios Deportivos
        </h1>
        <p className="text-claro-texto2 dark:text-oscuro-texto2 text-sm md:text-base">
          Explora la disponibilidad, tarifas, disciplinas y características técnicas de cada escenario.
        </p>
      </div>

      <div className="bg-bg-main p-4 md:p-6 rounded-2xl border border-border-subtle shadow-md">
        <CanchaList
          title="Catálogo Operativo de Canchas"
          subtitle="Monitoreo de estado, precios por hora y control de mantenimiento."
        />
      </div>
    </div>
  );
};
export default CanchasPage;
