/**
 * ============================================================================
 * ARCHIVO: app.ts
 * CAPA: Configuración de la Aplicación Express
 *
 * PROPÓSITO:
 * Centraliza la configuración de Express y el registro de todas las rutas
 * del sistema.
 * ============================================================================
 */

import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';


// ============================================================================
// IMPORTACIÓN DE RUTAS
// ============================================================================

// Gestión de canchas
import canchaRoutes from './routes/cancha.routes';

// Gestión de usuarios y autenticación
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import reservaRoutes from './routes/reserva.routes';
import pagoRoutes from './routes/pago.routes';


// ============================================================================
// INICIALIZACIÓN DE EXPRESS
// ============================================================================

export const app: Application = express();

// ============================================================================
// MIDDLEWARES GLOBALES
// ============================================================================

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Permite recibir JSON
app.use(express.json());

// Archivos estáticos
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'))
);

// Logger simple
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(
    `📡 [${req.method}] ${req.url} - ${new Date().toLocaleTimeString()}`
  );

  next();
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend del Complejo Deportivo funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// RUTAS DE LA API
// ============================================================================

// Autenticación
app.use('/api/auth', authRoutes);

// Gestión de usuarios
app.use('/api/usuarios', userRoutes);

// Gestión de canchas
app.use('/api/canchas', canchaRoutes);

// Gestión de reservas
app.use('/api/reservas', reservaRoutes);

// Gestión de pagos
app.use('/api/pagos', pagoRoutes);
// ============================================================================
// RUTA PRINCIPAL
// ============================================================================

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'API del sistema de gestión del complejo deportivo funcionando correctamente',
  });
});

// ============================================================================
// RUTA 404
// ============================================================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `La ruta [${req.method}] ${req.originalUrl} no existe en este servidor`,
  });
});

// ============================================================================
// MANEJO GLOBAL DE ERRORES
// ============================================================================

app.use(
  (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error('💥 Error no controlado en la aplicación:', err);

    res.status(500).json({
      success: false,
      message: 'Ocurrió un error inesperado en el servidor',
      error:
        process.env.NODE_ENV === 'development'
          ? err.message
          : undefined,
    });
  }
);

export default app;