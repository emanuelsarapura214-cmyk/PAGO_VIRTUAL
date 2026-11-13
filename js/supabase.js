/* Configuración pública de Supabase. Nunca colocar aquí la service_role key. */
(() => {
  const SUPABASE_URL = "https://asxtzcvqzibmfgrnvpqb.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_PQqvoGHmdY0kRCqKs3RSjQ_rmfxsz4J";
  if (!window.supabase?.createClient) {
    console.error("No se pudo cargar la librería de Supabase.");
    return;
  }
  if (SUPABASE_URL.includes("TU-PROYECTO") || SUPABASE_ANON_KEY.includes("TU_ANON")) {
    console.warn("Falta configurar Supabase en js/supabase.js.");
    window.mipvSupabase = null;
    return;
  }
  window.mipvSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
