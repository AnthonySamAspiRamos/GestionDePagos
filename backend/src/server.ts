/**
 * ============================================================================
 * ARCHIVO: server.ts
 * CAPA: Punto de Entrada (Entry Point)
 *
 * PROPÓSITO:
 * Inicializa el servidor HTTP y verifica la conexión con PostgreSQL
 * antes de comenzar a recibir peticiones.
 * ============================================================================
 */

import dotenv from 'dotenv';
import app from './app';
import { testDatabaseConnection } from './config/database';

// ============================================================================
// VARIABLES DE ENTORNO
// ============================================================================

dotenv.config();

// Puerto del servidor
const PORT = Number(process.env.PORT) || 4000;

// ============================================================================
// ARRANQUE DEL SERVIDOR
// ============================================================================

const startServer = async () => {
  try {
    // 1. Verificar conexión con PostgreSQL
    console.log('🔄 Verificando conexión con PostgreSQL...');

    await testDatabaseConnection();

    // 2. Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(
        `🚀 Servidor backend escuchando en: http://localhost:${PORT}`
      );
      console.log(
        `🔐 Autenticación: http://localhost:${PORT}/api/auth`
      );
      console.log(
        `👤 Usuarios: http://localhost:${PORT}/api/usuarios`
      );
      console.log(
        `🏟️ Canchas: http://localhost:${PORT}/api/canchas`
      );
      console.log(
        `🩺 Health check: http://localhost:${PORT}/api/health`
      );
      console.log('====================================================');
    });

  } catch (error) {
    console.error(
      '❌ Error fatal al iniciar el servidor:',
      error
    );

    process.exit(1);
  }
};

startServer();