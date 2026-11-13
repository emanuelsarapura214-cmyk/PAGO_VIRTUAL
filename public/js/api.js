// Cliente HTTP para consumir la API protegida de MiPagoVirtual.
// No colocar SUPABASE_SERVICE_ROLE_KEY en archivos del navegador.
export async function apiRequest(path, { token, method = "GET", body } = {}) {
  if (!token) throw new Error("Iniciá sesión para continuar.");
  const response = await fetch(`/api/${path.replace(/^\/+/, "")}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (response.status === 204) return null;
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "No se pudo completar la operación.");
  return result;
}
