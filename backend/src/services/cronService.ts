import cron from 'node-cron';
import { pool } from '../config/database';

export const iniciarCronJob = () => {
    // Ejecutar cada minuto
    cron.schedule('* * * * *', async () => {
        try {
            // ⏰ Cancelar reservas web que no se pagaron en 15 minutos
            const query = `
                UPDATE reserva 
                SET estado = 'cancelada',
                    observaciones = COALESCE(observaciones, '') || 
                        CASE WHEN observaciones IS NULL OR observaciones = '' 
                            THEN 'Cancelada automáticamente: no se pagó en 15 minutos'
                            ELSE ' | Cancelada automáticamente: no se pagó en 15 minutos'
                        END,
                    fecha_gestion = NOW()
                WHERE estado IN ('pendiente', 'pendiente_pago')
                  AND canal_reserva = 'en_linea'
                  AND fecha_solicitud < NOW() - INTERVAL '15 minutes'
                RETURNING id_reserva;
            `;
            const result = await pool.query(query);
            
            if (result.rows.length > 0) {
                console.log(`⏰ [CRON] ${result.rows.length} reserva(s) expirada(s) cancelada(s):`, 
                    result.rows.map(r => `#${r.id_reserva}`).join(', '));
            }
        } catch (error) {
            console.error('❌ [CRON] Error al cancelar reservas expiradas:', error);
        }
    });
    
    console.log('✅ [CRON] Job iniciado: reservas web sin pago se cancelan después de 15 min');
};