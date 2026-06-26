-- Diagnóstico: estado actual de las columnas
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'PushSubscription'
ORDER BY ordinal_position;