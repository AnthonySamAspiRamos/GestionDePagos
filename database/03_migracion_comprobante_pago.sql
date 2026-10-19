DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'pago'
          AND column_name = 'comprobante_url'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'pago'
          AND column_name = 'comprobante'
    ) THEN
        ALTER TABLE pago RENAME COLUMN comprobante_url TO comprobante;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'pago'
          AND column_name = 'comprobante_url'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'pago'
          AND column_name = 'comprobante'
    ) THEN
        UPDATE pago
        SET comprobante = COALESCE(comprobante, comprobante_url);
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'pago'
          AND column_name = 'comprobante'
    ) THEN
        ALTER TABLE pago ADD COLUMN comprobante TEXT;
    END IF;
END $$;
