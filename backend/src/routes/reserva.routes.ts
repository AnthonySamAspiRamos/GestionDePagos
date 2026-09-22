import { Router } from 'express';
import { ReservaController } from '../controllers/reserva.controller';
import { verificarToken, esAdminOEmpleado, esAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Cliente y Empleado pueden crear
router.post('/', verificarToken, ReservaController.crear);

// Cliente ve sus propias reservas
router.get('/mis-reservas', verificarToken, ReservaController.misReservas);

// Admin y Empleado ven todas
router.get('/', [verificarToken, esAdminOEmpleado], ReservaController.todas);

// Empleado/Admin admiten reservas
router.put('/:id/admitir', [verificarToken, esAdminOEmpleado], ReservaController.admitir);

// Todos pueden cancelar
router.put('/:id/cancelar', verificarToken, ReservaController.cancelar);

// Solo Admin puede modificar
router.put('/:id', [verificarToken, esAdmin], ReservaController.modificar);


export default router;