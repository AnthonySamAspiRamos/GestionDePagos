/**
 * ============================================================================
 * ARCHIVO: App.tsx
 * PROPÓSITO: Configuración central de Rutas del Sistema de Reservas
 * ============================================================================
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RutasProtegidas from './components/RutasProtegidas';
import Home from './pages/Home';
import CanchasPage from './pages/CanchasPage';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PanelAdmin from './pages/PanelAdmin';
import Perfil from './pages/Perfil';
import Dashboard from './pages/Dashboard';
import SolicitarRecuperacion from './pages/SolicitarRecuperacion';
import ResetPassword from './pages/ResetPassword';
import MisReservas from './pages/MisReservas';
import GestionReservas from './pages/GestionReservas';
import VerificarPagos from './pages/VerificarPagos';
import DisponibilidadCancha from './pages/DisponibilidadCancha';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Página Principal Pública (Landing Page con Hero, Canchas y Servicios) */}
        <Route path="/" element={<Home />} />
        
        {/* 2. Rutas Públicas de Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/solicitar-recuperacion" element={<SolicitarRecuperacion />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* 3. Rutas Privadas (Protegidas por AuthContext y envueltas con el Sidebar del Panel) */}
        <Route element={<RutasProtegidas />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/canchas" element={<CanchasPage />} />
            <Route path="/canchas/:id/reservar" element={<DisponibilidadCancha />} />
            <Route path="/panel-admin" element={<PanelAdmin />} />
            <Route path="/perfil" element={<Perfil />} />
            
            {/* --- RUTAS DE RESERVAS --- */}
            {/* Cliente: Ver sus propias reservas */}
            <Route path="/reservas" element={<MisReservas />} />
            
            {/* Empleado/Admin: Ver y gestionar todas las reservas */}
            <Route path="/gestion-reservas" element={<GestionReservas />} />

            {/* Admin/Empleado: Verificar pagos */}
            <Route path="/verificar-pagos" element={<VerificarPagos />} />

            {/* Módulos futuros */}
            <Route path="/reportes" element={<div className="p-6 text-claro-texto dark:text-oscuro-texto bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-xl border border-claro-borde dark:border-oscuro-borde">Módulo de Reportes (Iteración 6 en desarrollo)...</div>} />
        </Route>

        {/* 4. Redirección por defecto ante rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;