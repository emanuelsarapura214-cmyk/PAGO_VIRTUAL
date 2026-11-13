-- Ejecutar en Supabase DESPUÉS de mipagovirtual.sql.
-- La API Express autentica JWT y autoriza roles antes de usar la service role key.
-- No crear políticas públicas permisivas. La service role del servidor omite RLS;
-- anon/authenticated quedan bloqueados hasta definir políticas específicas.

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrenadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;

-- Vincular manualmente usuarios existentes con Auth:
-- UPDATE public.usuarios
-- SET auth_uid = 'UUID_DE_AUTH'
-- WHERE email_usuario = 'correo@ejemplo.com';
--
-- Crear primero las cuentas desde Supabase Authentication.
-- No permitir que el navegador elija su propio rol: rol_usuario se asigna
-- desde administración/SQL y la API lo consulta en cada petición.
