/**
 * ============================================================================
 * ARCHIVO: cancha.routes.ts
 * CAPA: Rutas (Routes/)
 * 
 * PROPÓSITO:
 * Mapea los verbos HTTP (GET, POST, PATCH, DELETE) y las URLs a las funciones
 * correspondientes del controlador 'canchaController'.
 * 
 * Flujo:
 * Petición Cliente -> Router -> Controller -> Service -> Base de Datos
 * ============================================================================
 */

import { Router } from 'express';
import { canchaController } from '../controllers/cancha.controller';
import { verificarToken, esAdmin } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/canchas
 * @desc    Obtener todas las canchas (soporta filtros: ?disciplina=futbol&estado=disponible&search=central)
 * @access  Público
 */
router.get('/', (req, res) => canchaController.getAll(req, res));

/**
 * @route   GET /api/canchas/:id/reservas
 * @desc    Consultar reservas de una cancha por mes o por fecha
 * @access  Público
 */
router.get('/:id/reservas', (req, res) => canchaController.getReservasPorCancha(req, res));

/**
 * @route   GET /api/canchas/:id
 * @desc    Obtener el detalle de una cancha específica por su ID
 * @access  Público
 */
router.get('/:id', (req, res) => canchaController.getById(req, res));

/**
 * @route   POST /api/canchas
 * @desc    Crear una nueva cancha
 * @access  Administrador
 */
router.post('/', verificarToken, esAdmin, (req, res) => canchaController.create(req, res));

/**
 * @route   PATCH /api/canchas/:id
 * @desc    Actualizar parcialmente los datos de una cancha
 * @access  Administrador
 */
router.patch('/:id', verificarToken, esAdmin, (req, res) => canchaController.update(req, res));

/**
 * @route   DELETE /api/canchas/:id
 * @desc    Eliminar una cancha por su ID
 * @access  Administrador
 */
router.delete('/:id', verificarToken, esAdmin, (req, res) => canchaController.delete(req, res));

export default router;