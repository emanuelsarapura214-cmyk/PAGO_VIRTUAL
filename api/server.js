import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "100kb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 150 }));

const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Falta configurar ${key}`);
}
const authClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Lista blanca: nunca se acepta el nombre de una tabla directamente del cliente.
const resources = {
  actividades: { table: "actividades", id: "id_actividad", roles: ["administrador"], fields: ["nombre_actividad","descripcion_actividad","categoria_actividad","dia_actividad","hora_inicio","hora_fin","cupo_maximo","id_entrenador","lugar_actividad","estado_actividad"] },
  inscripciones: { table: "inscripciones", id: "id_inscripcion", roles: ["usuario","administrador"], fields: ["id_usuario","id_actividad","estado_inscripcion","observaciones"] },
  pagos: { table: "pagos", id: "id_pago", roles: ["administrador"], fields: ["id_usuario","id_inscripcion","concepto_pago","monto_pago","medio_pago","fecha_pago","estado_pago","referencia_pago"] }
};

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Falta el token de sesión." });
  const { data: auth, error } = await authClient.auth.getUser(token);
  if (error || !auth.user) return res.status(401).json({ error: "Sesión inválida o vencida." });
  const { data: profile, error: profileError } = await db.from("usuarios")
    .select("id_usuario, rol_usuario, estado_usuario")
    .eq("auth_uid", auth.user.id).maybeSingle();
  if (profileError || !profile || !profile.estado_usuario)
    return res.status(403).json({ error: "No existe un perfil activo asociado a esta cuenta." });
  req.user = { ...profile, authUid: auth.user.id };
  next();
}
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "MiPagoVirtual API" }));
app.use("/api", authenticate);

function cleanPayload(body, allowed) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const out = Object.fromEntries(Object.entries(body).filter(([key, value]) => allowed.includes(key) && value !== undefined));
  return Object.keys(out).length ? out : null;
}
app.get("/api/:resource", async (req, res) => {
  const cfg = resources[req.params.resource];
  if (!cfg) return res.status(404).json({ error: "Recurso no encontrado." });
  if (!cfg.roles.includes(req.user.rol_usuario)) return res.status(403).json({ error: "No tenés permisos." });
  let query = db.from(cfg.table).select("*").order(cfg.id, { ascending: false }).limit(200);
  if (req.user.rol_usuario === "usuario" && cfg.table === "inscripciones") query = query.eq("id_usuario", req.user.id_usuario);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});
app.post("/api/:resource", async (req, res) => {
  const cfg = resources[req.params.resource];
  if (!cfg) return res.status(404).json({ error: "Recurso no encontrado." });
  if (!cfg.roles.includes(req.user.rol_usuario)) return res.status(403).json({ error: "No tenés permisos." });
  const payload = cleanPayload(req.body, cfg.fields);
  if (!payload) return res.status(400).json({ error: "No hay campos válidos para guardar." });
  if (cfg.table === "inscripciones" && req.user.rol_usuario === "usuario") payload.id_usuario = req.user.id_usuario;
  const { data, error } = await db.from(cfg.table).insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});
app.put("/api/:resource/:id", async (req, res) => {
  const cfg = resources[req.params.resource];
  if (!cfg) return res.status(404).json({ error: "Recurso no encontrado." });
  if (req.user.rol_usuario !== "administrador") return res.status(403).json({ error: "Solo administración puede editar este recurso." });
  const payload = cleanPayload(req.body, cfg.fields);
  if (!payload) return res.status(400).json({ error: "No hay campos válidos para actualizar." });
  const { data, error } = await db.from(cfg.table).update(payload).eq(cfg.id, req.params.id).select().maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Registro no encontrado." });
  res.json(data);
});
app.delete("/api/:resource/:id", async (req, res) => {
  const cfg = resources[req.params.resource];
  if (!cfg) return res.status(404).json({ error: "Recurso no encontrado." });
  if (req.user.rol_usuario !== "administrador") return res.status(403).json({ error: "Solo administración puede eliminar registros." });
  const { error } = await db.from(cfg.table).delete().eq(cfg.id, req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MiPagoVirtual API escuchando en ${port}`));
