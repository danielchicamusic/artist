// ============================================================
// CONFIGURACIÓN — rellena esto con tus propios datos
// La SUPABASE_ANON_KEY es pública por diseño (Supabase la protege con RLS),
// es segura de subir a un repo público de GitHub.
// ============================================================
const CONFIG = {
  SUPABASE_URL: "https://vvefeulpvskzotbbshjd.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_6TdSP24xEabBw1uY3AI-PQ__fDYDNUX",

  // URL del webhook del workflow de n8n (nodo "Webhook Chat")
  N8N_WEBHOOK_URL: "https://solucionestechnics.app.n8n.cloud/webhook/agente-financiero",

  // Opcional: si configuraste DASHBOARD_SHARED_SECRET en n8n como variable de entorno,
  // pon aquí el mismo valor. Si lo dejas vacío, no se envía ninguna cabecera de seguridad.
  DASHBOARD_SHARED_SECRET: ""
};
