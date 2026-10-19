import { Router } from 'express';
import multer from 'multer';
import { PagoController } from '../controllers/pagoController';
import { verificarToken, esAdminOEmpleado } from '../middlewares/authMiddleware';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
        }
    }
});

// Endpoint unificado: crear pago + comprobante en un solo paso
router.post('/procesar-con-comprobante', verificarToken, upload.single('comprobante'), PagoController.procesarPagoConComprobante);

// Endpoint legacy para compatibilidad
router.post('/procesar', verificarToken, PagoController.procesarPago);

// Subir comprobante para pago existente
router.post('/comprobante/:id_pago', verificarToken, upload.single('comprobante'), PagoController.subirComprobante);

// Verificar pago (Admin/Empleado)
router.patch('/verificar/:id_pago', verificarToken, esAdminOEmpleado, PagoController.verificarPago);

// Obtener pagos pendientes de verificación (Admin/Empleado)
router.get('/pendientes', verificarToken, esAdminOEmpleado, PagoController.pagosPendientes);

// Historial de pagos del cliente
router.get('/historial', verificarToken, PagoController.historialPagos);

// Pagos asociados a una reserva
router.get('/reserva/:id_reserva', verificarToken, PagoController.pagosPorReserva);

// Reintentar pago después de rechazo
router.post('/reintentar/:id_reserva', verificarToken, PagoController.reintentarPago);

export default router;
