import { Router } from 'express';
import { ReembolsoController } from '../controllers/reembolso.controller';
import { verificarToken, esAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Admin ve todos los reembolsos pendientes
router.get('/pendientes', [verificarToken, esAdmin], ReembolsoController.pendientes);

// Cliente ve sus propios reembolsos
router.get('/mis-reembolsos', verificarToken, ReembolsoController.misReembolsos);

// Obtener reembolso de una reserva específica
router.get('/reserva/:id_reserva', verificarToken, ReembolsoController.obtenerPorReserva);

// Admin procesa reembolso (aprobar/rechazar)
router.put('/:id/procesar', [verificarToken, esAdmin], ReembolsoController.procesar);

export default router;
