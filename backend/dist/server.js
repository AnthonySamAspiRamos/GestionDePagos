"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 4000;
const startServer = async () => {
    try {
        console.log('🔄 Verificando conexión con PostgreSQL...');
        await (0, database_1.testDatabaseConnection)();
        app_1.default.listen(PORT, () => {
            console.log('====================================================');
            console.log(`🚀 Servidor backend escuchando en: http://localhost:${PORT}`);
            console.log(`🔐 Autenticación: http://localhost:${PORT}/api/auth`);
            console.log(`👤 Usuarios: http://localhost:${PORT}/api/usuarios`);
            console.log(`🏟️ Canchas: http://localhost:${PORT}/api/canchas`);
            console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
            console.log('====================================================');
        });
    }
    catch (error) {
        console.error('❌ Error fatal al iniciar el servidor:', error);
        process.exit(1);
    }
};
startServer();
