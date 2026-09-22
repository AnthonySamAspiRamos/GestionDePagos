/**
 * ============================================================================
 * ARCHIVO: CanchaCard.tsx
 * COMPONENTE: Tarjeta visual de Cancha Deportiva
 * ============================================================================
 */

import React from 'react';
import type { Cancha } from './cancha.types';

interface CanchaCardProps {
  cancha: Cancha;
  isAdmin?: boolean;
  onEdit: (cancha: Cancha) => void;
  onDelete: (id: number) => void;
  onSelectReserva?: (cancha: Cancha) => void;
}

// Iconos visuales y estilos por disciplina deportiva
const getDisciplinaBadge = (disciplina: string | null) => {
  const d = disciplina?.toLowerCase() || '';
  if (d.includes('futbol')) return { label: 'Fútbol', color: 'badge-emerald', icon: '⚽' };
  if (d.includes('basquet')) return { label: 'Básquetbol', color: 'badge-amber', icon: '🏀' };
  if (d.includes('voley')) return { label: 'Voleibol', color: 'badge-sky', icon: '🏐' };
  if (d.includes('tenis')) return { label: 'Tenis', color: 'badge-yellow', icon: '🎾' };
  if (d.includes('padel')) return { label: 'Pádel', color: 'badge-indigo', icon: '🏸' };
  if (d.includes('futsal')) return { label: 'Futsal', color: 'badge-orange', icon: '🥅' };
  if (d.includes('atletismo')) return { label: 'Atletismo', color: 'badge-rose', icon: '🏃' };
  return { label: disciplina || 'General', color: 'badge-slate', icon: '🏟️' };
};

export const CanchaCard: React.FC<CanchaCardProps> = ({
  cancha,
  isAdmin = false,
  onEdit,
  onDelete,
  onSelectReserva,
}) => {
  const discInfo = getDisciplinaBadge(cancha.disciplina);
  const isDisponible = cancha.estado?.toLowerCase() === 'disponible';

  return (
    <div className="cancha-card">
      <div className="card-header">
        <div className="card-discipline-badge">
          <span className="disc-icon">{discInfo.icon}</span>
          <span className={`badge ${discInfo.color}`}>{discInfo.label}</span>
        </div>
        <span className={`status-pill ${isDisponible ? 'status-online' : 'status-maint'}`}>
          <span className="status-dot"></span>
          {isDisponible ? 'Disponible' : 'Mantenimiento'}
        </span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{cancha.nombre}</h3>
        
        <p className="card-location">
          <svg className="mini-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {cancha.ubicacion || 'Sector Principal'}
        </p>

        <div className="card-specs">
          {cancha.capacidad && (
            <div className="spec-item">
              <span className="spec-label">Capacidad</span>
              <span className="spec-val">{cancha.capacidad} pers.</span>
            </div>
          )}

          {cancha.largo && cancha.ancho && (
            <div className="spec-item">
              <span className="spec-label">Dimensiones</span>
              <span className="spec-val">{cancha.largo}m × {cancha.ancho}m</span>
            </div>
          )}

          {cancha.hora_apertura && cancha.hora_cierre && (
            <div className="spec-item">
              <span className="spec-label">Horario</span>
              <span className="spec-val">
                {cancha.hora_apertura.slice(0, 5)} - {cancha.hora_cierre.slice(0, 5)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="card-footer">
        <div className="price-tag">
          <span className="currency">Bs.</span>
          <span className="amount">{Number(cancha.precio_hora).toFixed(0)}</span>
          <span className="period">/ hora</span>
        </div>

        <div className="card-actions">
          {/* Botones de Gestión Administrativa: SOLO si isAdmin es true */}
          {isAdmin && (
            <>
              <button
                type="button"
                className="btn-icon"
                title="Editar Cancha (Solo Administrador)"
                onClick={() => onEdit(cancha)}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                type="button"
                className="btn-icon btn-danger"
                title="Eliminar Cancha (Solo Administrador)"
                onClick={() => onDelete(cancha.id_cancha)}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}

          {/* Botón de Reserva para Clientes y Usuarios */}
          <button
            type="button"
            className="btn-reserve"
            disabled={!isDisponible}
            onClick={() => onSelectReserva && onSelectReserva(cancha)}
          >
            {isDisponible ? 'Reservar' : 'No disp.'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CanchaCard;
