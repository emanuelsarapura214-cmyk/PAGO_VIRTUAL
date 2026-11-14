
CREATE OR REPLACE FUNCTION public.mipv_crear_perfil_usuario()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.usuarios (
    auth_uid,nombre_usuario,apellido_usuario,email_usuario,dni_usuario,
    telefono_usuario,rol_usuario,estado_usuario
  ) VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'nombre_usuario',''),'Usuario'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'apellido_usuario',''),'Nuevo'),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'dni_usuario',''),
    NULLIF(NEW.raw_user_meta_data ->> 'telefono_usuario',''),
    'usuario',TRUE
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mipv_auth_user_created ON auth.users;
CREATE TRIGGER mipv_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.mipv_crear_perfil_usuario();

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mipv_usuarios_leer_perfil_propio" ON public.usuarios;
CREATE POLICY "mipv_usuarios_leer_perfil_propio" ON public.usuarios
FOR SELECT TO authenticated USING (auth_uid = (SELECT auth.uid()));
