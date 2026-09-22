import { Router } from 'express';
import { 
    registrar, 
    login, 
    solicitarRecuperacion, 
    validarToken, 
    resetPassword 
} from '../controllers/authController';

const router = Router();

router.post('/registrar', registrar);
router.post('/login', login);

router.post('/solicitar-recuperacion', solicitarRecuperacion);
router.get('/validar-token/:token', validarToken);
router.post('/reset-password', resetPassword);

export default router;