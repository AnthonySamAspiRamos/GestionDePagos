/**
 * ============================================================================
 * ARCHIVO: CanchaList.tsx
 * COMPONENTE: Catálogo interactivo de Canchas Deportivas
 * CONTROL DE PERMISOS:
 * - Cualquier usuario/visitante: Ver catálogo, consultar horarios y disponibilidad.
 * - Administradores: Crear (+ Nueva Cancha), Editar y Eliminar canchas.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CanchaCard } from './CanchaCard';
import { CanchaModal } from './CanchaModal';
import { canchaApi } from './cancha.api';
import type { Cancha, CanchaFormData, DisciplinaOption } from './cancha.types';
import ModalReserva from './ModalReserva';


const DISCIPLINAS: DisciplinaOption[] = [
  { id: 'todas', label: 'Todas', icon: '⚡' },
  { id: 'futbol', label: 'Fútbol', icon: '⚽' },
  { id: 'futsal', label: 'Futsal', icon: '🥅' },
  { id: 'padel', label: 'Pádel', icon: '🏸' },
  { id: 'tenis', label: 'Tenis', icon: '🎾' },
  { id: 'basquet', label: 'Básquet', icon: '🏀' },
  { id: 'voley', label: 'Voleibol', icon: '🏐' },
];

interface CanchaListProps {
  title?: string;
  subtitle?: string;
}

export const CanchaList: React.FC<CanchaListProps> = ({
  title = "Nuestras Canchas y Escenarios Deportivos",
  subtitle = "Instalaciones de alto rendimiento con iluminación LED, césped sintético y piso flotante reglamentario."
}) => {
  const navigate = useNavigate();
  const { usuario, isAuthenticated } = useAuth();
  
  // Determinamos si el usuario actual tiene permisos de Administrador
  const isAdmin = Boolean(
    usuario && (usuario.rol === 'Admin' || usuario.rol === 'Administrador')
  );

  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [activeDisciplina, setActiveDisciplina] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado del Modal (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canchaToEdit, setCanchaToEdit] = useState<Cancha | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [canchaParaReservar, setCanchaParaReservar] = useState<Cancha | null>(null);

  // Función para cargar canchas desde el backend
  const cargarCanchas = async (disciplina = activeDisciplina) => {
    setIsLoading(true);
    try {
      const res = await canchaApi.getAll(disciplina);
      setCanchas(res.data);
      setIsBackendOnline(res.isLive);
    } catch (err: any) {
      console.error('Error al cargar canchas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCanchas(activeDisciplina);
  }, [activeDisciplina]);

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Manejador para Guardar (Crear o Actualizar) - Solo Admin
  const handleSaveCancha = async (formData: CanchaFormData, editingId?: number) => {
    if (!isAdmin) {
      showNotification('Acción restringida: Solo administradores pueden gestionar canchas', 'error');
      return;
    }

    if (editingId) {
      if (isBackendOnline) {
        await canchaApi.update(editingId, formData);
        showNotification('Cancha actualizada exitosamente');
        await cargarCanchas();
      } else {
        setCanchas(prev => prev.map(c => c.id_cancha === editingId ? {
          ...c,
          ...formData,
          precio_hora: Number(formData.precio_hora),
          capacidad: formData.capacidad ? Number(formData.capacidad) : null,
          largo: formData.largo ? Number(formData.largo) : null,
          ancho: formData.ancho ? Number(formData.ancho) : null,
        } : c));
        showNotification('Cancha actualizada (Modo Demo)');
      }
    } else {
      if (isBackendOnline) {
        await canchaApi.create(formData);
        showNotification('Cancha creada exitosamente');
        await cargarCanchas();
      } else {
        const newId = Math.max(0, ...canchas.map(c => c.id_cancha)) + 1;
        const newCancha: Cancha = {
          id_cancha: newId,
          nombre: formData.nombre,
          disciplina: formData.disciplina,
          precio_hora: Number(formData.precio_hora),
          capacidad: formData.capacidad ? Number(formData.capacidad) : null,
          estado: formData.estado,
          ubicacion: formData.ubicacion,
          largo: formData.largo ? Number(formData.largo) : null,
          ancho: formData.ancho ? Number(formData.ancho) : null,
          hora_apertura: formData.hora_apertura,
          hora_cierre: formData.hora_cierre,
        };
        setCanchas(prev => [newCancha, ...prev]);
        showNotification('Nueva cancha registrada (Modo Demo)');
      }
    }
  };

  // Manejador para Eliminar - Solo Admin
  const handleDeleteCancha = async (id: number) => {
    if (!isAdmin) {
      showNotification('Acción restringida: Solo administradores pueden eliminar canchas', 'error');
      return;
    }

    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar la cancha #${id}?`);
    if (!confirmDelete) return;

    try {
      if (isBackendOnline) {
        await canchaApi.delete(id);
        showNotification(`Cancha #${id} eliminada exitosamente`);
        await cargarCanchas();
      } else {
        setCanchas(prev => prev.filter(c => c.id_cancha !== id));
        showNotification(`Cancha #${id} eliminada (Modo Demo)`);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al eliminar la cancha', 'error');
    }
  };

  const handleOpenCreateModal = () => {
    if (!isAdmin) {
      showNotification('Debes ser Administrador para agregar canchas', 'error');
      return;
    }
    setCanchaToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cancha: Cancha) => {
    if (!isAdmin) {
      showNotification('Debes ser Administrador para editar canchas', 'error');
      return;
    }
    setCanchaToEdit(cancha);
    setIsModalOpen(true);
  };

  // Manejador del botón Reservar
  const handleSelectReserva = (cancha: Cancha) => {
    if (!isAuthenticated) {
        showNotification(
            `Para reservar "${cancha.nombre}" debes iniciar sesión con tu cuenta.`,
            'info'
        );
        setTimeout(() => {
            navigate('/login');
        }, 1800);
        return;
    }

    // Si está logueado, abrir el modal de reserva
    setCanchaParaReservar(cancha);
    setIsReservaModalOpen(true);
};

  // Filtrado en memoria por texto de búsqueda
  const filteredCanchas = canchas.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(term) ||
      (c.ubicacion && c.ubicacion.toLowerCase().includes(term)) ||
      (c.disciplina && c.disciplina.toLowerCase().includes(term))
    );
  });

  return (
    <section className="canchas-section" id="canchas">
      {/* Notificación Toast */}
      {notification && (
        <div className={`toast-alert toast-${notification.type}`}>
          {notification.type === 'success' ? '✓ ' : notification.type === 'error' ? '⚠️ ' : 'ℹ️ '}
          {notification.msg}
        </div>
      )}

      <div className="section-header">
        <div>
          <div className="inline-badge">
            <span className={`status-indicator ${isBackendOnline ? 'online' : 'demo'}`}></span>
            {isBackendOnline ? 'Conectado a PostgreSQL (Backend API)' : 'Modo Demostración Frontend'}
          </div>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        <div className="header-actions">
          {/* Botón Nueva Cancha: Exclusivo para Administradores */}
          {isAdmin ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handleOpenCreateModal}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Cancha
            </button>
          ) : (
            <span className="text-xs text-text-muted px-3 py-1 bg-bg-surface rounded-full border border-border-subtle">
              {isAuthenticated ? `Sesión: ${usuario?.nombre} (${usuario?.rol})` : 'Modo Explorador / Reservas'}
            </span>
          )}
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="filters-bar">
        <div className="disciplinas-pills">
          {DISCIPLINAS.map(d => (
            <button
              key={d.id}
              type="button"
              className={`pill-btn ${activeDisciplina === d.id ? 'active' : ''}`}
              onClick={() => setActiveDisciplina(d.id)}
            >
              <span className="pill-icon">{d.icon}</span>
              {d.label}
            </button>
          ))}
        </div>

        <div className="search-box">
          <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o sector..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>
      </div>

      {/* Grid de Canchas */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando canchas del complejo deportivo...</p>
        </div>
      ) : filteredCanchas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏟️</div>
          <h3>No se encontraron canchas</h3>
          <p>No hay canchas registradas para esta disciplina o término de búsqueda.</p>
          {isAdmin && (
            <button type="button" className="btn-secondary" onClick={handleOpenCreateModal}>
              Crear primera cancha
            </button>
          )}
        </div>
      ) : (
        <div className="canchas-grid">
          {filteredCanchas.map(cancha => (
            <CanchaCard
              key={cancha.id_cancha}
              cancha={cancha}
              isAdmin={isAdmin}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteCancha}
              onSelectReserva={handleSelectReserva}
            />
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Cancha (Solo Admin) */}
      {isAdmin && (
        <CanchaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveCancha}
          canchaToEdit={canchaToEdit}
        />
      )}
      {/* Modal de Reserva */}
    <ModalReserva
      isOpen={isReservaModalOpen}
      onClose={() => setIsReservaModalOpen(false)}
      onSave={() => {
          showNotification('Reserva creada exitosamente', 'success');
          cargarCanchas(); // Refrescar la lista
      }}
      cancha={canchaParaReservar}
      esPresencial={usuario?.rol === 'Empleado' || usuario?.rol === 'empleado' || 
                  usuario?.rol === 'Admin' || usuario?.rol === 'Administrador'}
    />
    </section>
  );
};
export default CanchaList;
