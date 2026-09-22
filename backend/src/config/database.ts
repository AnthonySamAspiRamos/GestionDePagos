
/**
 * ============================================================================
 * ARCHIVO: database.ts
 * CAPA: Configuración (Config/)
 * 
 * PROPÓSITO:
 * Este archivo gestiona la conexión a la base de datos PostgreSQL utilizando
 * la librería 'pg' (node-postgres) mediante un "Pool" de conexiones.
 * Al trabajar sin ORM (SQL puro), todas las consultas se enviarán a través
 * de este pool hacia PostgreSQL.
 * ============================================================================
 */

import { Pool } from 'pg';
import type { PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno definidas en el archivo .env
dotenv.config();

// 1. Configuración de credenciales del pool de conexiones
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'limber',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'bdcomplejodeportivo',
  // Número máximo de clientes simultáneos en el pool
  max: 20,
  // Tiempo máximo (en milisegundos) que un cliente puede estar inactivo antes de cerrarse
  idleTimeoutMillis: 30000,
  // Tiempo máximo de espera para obtener una conexión del pool
  connectionTimeoutMillis: 2000,
};

// 2. Instanciación del Pool
export const pool = new Pool(dbConfig);

// 3. Evento informativo: cuando un cliente nuevo se conecta al pool
pool.on('connect', () => {
  // Conexión exitosa al pool
});

// 4. Manejo de errores imprevistos en clientes inactivos
pool.on('error', (err: Error) => {
  console.error('🔴 [PostgreSQL] Error inesperado en cliente inactivo del pool:', err);
  process.exit(-1);
});

/**
 * Función auxiliar para verificar la conectividad con la base de datos al iniciar el servidor.
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    client.release(); // Siempre liberar el cliente de vuelta al pool
    console.log(`✅ [PostgreSQL] Conexión exitosa a la base de datos '${result.rows[0].db_name}'`);
    return true;
  } catch (error) {
    console.error('⚠️ [PostgreSQL] No se pudo conectar a la base de datos:', (error as Error).message);
    console.info('💡 Asegúrate de tener levantado Docker con: docker compose up -d');
    return false;
  }
};