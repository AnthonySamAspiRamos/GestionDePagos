"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'limber',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'bdcomplejodeportivo',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
exports.pool = new pg_1.Pool(dbConfig);
exports.pool.on('connect', () => {
});
exports.pool.on('error', (err) => {
    console.error('🔴 [PostgreSQL] Error inesperado en cliente inactivo del pool:', err);
    process.exit(-1);
});
const testDatabaseConnection = async () => {
    try {
        const client = await exports.pool.connect();
        const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
        client.release();
        console.log(`✅ [PostgreSQL] Conexión exitosa a la base de datos '${result.rows[0].db_name}'`);
        return true;
    }
    catch (error) {
        console.error('⚠️ [PostgreSQL] No se pudo conectar a la base de datos:', error.message);
        console.info('💡 Asegúrate de tener levantado Docker con: docker compose up -d');
        return false;
    }
};
exports.testDatabaseConnection = testDatabaseConnection;
