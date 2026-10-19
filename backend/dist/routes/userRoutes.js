"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = './uploads/perfiles';
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('El archivo no es una imagen válida'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});
router.get('/perfil', authMiddleware_1.verificarToken, userController_1.obtenerPerfil);
router.put('/perfil', authMiddleware_1.verificarToken, upload.single('foto'), userController_1.actualizarPerfil);
router.get('/', authMiddleware_1.verificarToken, userController_1.listarUsuarios);
router.post('/', authMiddleware_1.verificarToken, userController_1.crearUsuario);
router.put('/estado/:id', authMiddleware_1.verificarToken, userController_1.cambiarEstadoUsuario);
router.put('/:id', authMiddleware_1.verificarToken, userController_1.actualizarUsuario);
router.delete('/:id', authMiddleware_1.verificarToken, userController_1.eliminarUsuario);
router.get('/:id', authMiddleware_1.verificarToken, userController_1.obtenerUsuarioCompletoPorId);
exports.default = router;
