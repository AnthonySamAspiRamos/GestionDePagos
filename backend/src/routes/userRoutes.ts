import { Router, Request } from 'express';
import { 
    obtenerPerfil, 
    actualizarPerfil, 
    listarUsuarios, 
    crearUsuario, 
    cambiarEstadoUsuario, 
    actualizarUsuario, 
    eliminarUsuario, 
    obtenerUsuarioCompletoPorId 
} from '../controllers/userController';
import { verificarToken } from '../middlewares/authMiddleware';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        const dir = './uploads/perfiles';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('El archivo no es una imagen válida'));
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Rutas de perfil
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, upload.single('foto'), actualizarPerfil);

// Rutas CRUD de usuarios
router.get('/', verificarToken, listarUsuarios);
router.post('/', verificarToken, crearUsuario);
router.put('/estado/:id', verificarToken, cambiarEstadoUsuario);
router.put('/:id', verificarToken, actualizarUsuario);
router.delete('/:id', verificarToken, eliminarUsuario);

router.get('/:id', verificarToken, obtenerUsuarioCompletoPorId);

export default router;