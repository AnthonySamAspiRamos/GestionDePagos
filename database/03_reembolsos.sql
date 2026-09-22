-- =========================================================
-- SISTEMA DE REEMBOLSOS
-- =========================================================

CREATE TABLE IF NOT EXISTS reembolso (
    id_reembolso SERIAL PRIMARY KEY,
    id_reserva INTEGER NOT NULL REFERENCES reserva(id_reserva),
    id_pago INTEGER NOT NULL REFERENCES pago(id_pago),
    monto_original NUMERIC(10,2) NOT NULL,
    porcentaje_reembolso NUMERIC(5,2) NOT NULL,
    monto_reembolsado NUMERIC(10,2) NOT NULL,
    motivo_cancelacion TEXT,
    fecha_solicitud TIMESTAMP NOT NULL DEFAULT now(),
    horas_anticipacion NUMERIC(5,2) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    fecha_procesado TIMESTAMP,
    notas_admin TEXT
);

-- Actualizar tipo de dato de estado en pago para incluir estados de reembolso
ALTER TABLE pago ALTER COLUMN estado TYPE VARCHAR(50);

-- Agregar índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_reembolso_reserva ON reembolso(id_reserva);
CREATE INDEX IF NOT EXISTS idx_reembolso_estado ON reembolso(estado);
CREATE INDEX IF NOT EXISTS idx_reembolso_fecha ON reembolso(fecha_solicitud);
