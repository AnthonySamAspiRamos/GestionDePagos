/**
 * ============================================================================
 * ARCHIVO: CanchaModal.tsx
 * COMPONENTE: Modal para Crear / Editar Cancha Deportiva
 * ACCESO: Solo Administradores
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import type { Cancha, CanchaFormData } from './cancha.types';

interface CanchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CanchaFormData, editingId?: number) => Promise<void>;
  canchaToEdit?: Cancha | null;
}

const INITIAL_FORM: CanchaFormData = {
  nombre: '',
  disciplina: 'futbol',
  capacidad: '',
  precio_hora: '',
  estado: 'disponible',
  ubicacion: '',
  largo: '',
  ancho: '',
  hora_apertura: '07:00',
  hora_cierre: '23:00',
};

export const CanchaModal: React.FC<CanchaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  canchaToEdit,
}) => {
  const [formData, setFormData] = useState<CanchaFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditing = Boolean(canchaToEdit);

  useEffect(() => {
    if (canchaToEdit) {
      setFormData({
        nombre: canchaToEdit.nombre,
        disciplina: canchaToEdit.disciplina || 'futbol',
        capacidad: canchaToEdit.capacidad ?? '',
        precio_hora: canchaToEdit.precio_hora,
        estado: canchaToEdit.estado || 'disponible',
        ubicacion: canchaToEdit.ubicacion || '',
        largo: canchaToEdit.largo ?? '',
        ancho: canchaToEdit.ancho ?? '',
        hora_apertura: canchaToEdit.hora_apertura ? canchaToEdit.hora_apertura.slice(0, 5) : '07:00',
        hora_cierre: canchaToEdit.hora_cierre ? canchaToEdit.hora_cierre.slice(0, 5) : '23:00',
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrorMsg('');
  }, [canchaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nombre.trim()) {
      setErrorMsg('El nombre de la cancha es obligatorio');
      return;
    }

    if (!formData.precio_hora || Number(formData.precio_hora) < 0) {
      setErrorMsg('Debes ingresar un precio por hora válido');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, canchaToEdit?.id_cancha);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la cancha en el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? `Editar Cancha #${canchaToEdit?.id_cancha}` : 'Registrar Nueva Cancha'}</h2>
          <button type="button" className="btn-close" onClick={onClose}>×</button>
        </div>

        {errorMsg && (
          <div className="form-error-banner">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre de la Cancha *</label>
            <input
              type="text"
              placeholder="Ej: Cancha Central Sintética"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Disciplina Deportiva</label>
              <select
                value={formData.disciplina}
                onChange={e => setFormData({ ...formData, disciplina: e.target.value })}
              >
                <option value="futbol">Fútbol</option>
                <option value="futsal">Futsal</option>
                <option value="padel">Pádel</option>
                <option value="tenis">Tenis</option>
                <option value="basquet">Básquetbol</option>
                <option value="voley">Voleibol</option>
                <option value="atletismo">Atletismo</option>
                <option value="multiuso">Multiuso</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estado Operativo</label>
              <select
                value={formData.estado}
                onChange={e => setFormData({ ...formData, estado: e.target.value })}
              >
                <option value="disponible">Disponible</option>
                <option value="mantenimiento">En Mantenimiento</option>
                <option value="ocupada">Ocupada</option>
                <option value="inactiva">Inactiva</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio por Hora (Bs.) *</label>
              <input
                type="number"
                step="0.50"
                min="0"
                placeholder="100.00"
                value={formData.precio_hora}
                onChange={e => setFormData({ ...formData, precio_hora: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Capacidad (personas)</label>
              <input
                type="number"
                min="1"
                placeholder="Ej: 14"
                value={formData.capacidad}
                onChange={e => setFormData({ ...formData, capacidad: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ubicación / Sector en el Complejo</label>
            <input
              type="text"
              placeholder="Ej: Sector Norte - Bloque C"
              value={formData.ubicacion}
              onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Largo (metros)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej: 40.0"
                value={formData.largo}
                onChange={e => setFormData({ ...formData, largo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Ancho (metros)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej: 20.0"
                value={formData.ancho}
                onChange={e => setFormData({ ...formData, ancho: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hora Apertura</label>
              <input
                type="time"
                value={formData.hora_apertura}
                onChange={e => setFormData({ ...formData, hora_apertura: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Hora Cierre</label>
              <input
                type="time"
                value={formData.hora_cierre}
                onChange={e => setFormData({ ...formData, hora_cierre: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Cancha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CanchaModal;
