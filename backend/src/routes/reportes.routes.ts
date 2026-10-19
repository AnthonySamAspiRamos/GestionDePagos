import { Router } from "express";
import { ReportesController } from "../controllers/reportes.controller";
import { esAdmin, verificarToken } from "../middlewares/authMiddleware";

const router = Router();

// Solo administrador puede ver

router.post('/pagos', [verificarToken, esAdmin], ReportesController.obtenerDatosPagos);

router.post('/metricasPagos', [verificarToken, esAdmin], ReportesController.obtenerMetricasPagos);

router.post('/heatmap', [verificarToken, esAdmin], ReportesController.obtenerDatosOcupacion);

router.get('/listarCanchas', [verificarToken, esAdmin], ReportesController.listarCanchas);

router.post(
  '/totalReservas',
  [verificarToken, esAdmin],
  ReportesController.obtenerTotalReservas
);
router.post(
  '/horasOcupadas',
  [verificarToken, esAdmin],
  ReportesController.obtenerHorasOcupadas
);

router.post(
  '/mayorDemanda',
  [verificarToken, esAdmin],
  ReportesController.obtenerMayorDemanda
);
router.post(
  '/rentabilidadServicios',
  [verificarToken, esAdmin],
  ReportesController.obtenerRentabilidadServicios
);

router.post('/comportamiento-usuarios', [verificarToken, esAdmin], ReportesController.obtenerComportamientoUsuarios);
export default router;
