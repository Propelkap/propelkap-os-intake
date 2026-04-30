export type QuestionType =
  | "short"
  | "long"
  | "email"
  | "tel"
  | "number"
  | "url"
  | "single"
  | "multi"
  | "scale"
  | "date"
  | "currency";

export type Question = {
  id: string;
  label: string;
  help?: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  showIf?: { id: string; equals?: string; includes?: string };
};

export type Block = {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  questions: Question[];
};

export const BLOCKS: Block[] = [
  {
    id: "negocio",
    index: 1,
    title: "Tu negocio en una foto",
    subtitle:
      "Empecemos por lo básico: quién eres, dónde estás y cómo se llama tu mundo.",
    questions: [
      { id: "nombre_dueña", label: "Nombre completo", type: "short", required: true, placeholder: "Gina Torres" },
      { id: "email", label: "Correo electrónico", type: "email", required: true, placeholder: "gina@ginabrows.com" },
      { id: "whatsapp", label: "WhatsApp", type: "tel", required: true, placeholder: "+52 81 ..." },
      { id: "nombre_estudio", label: "Nombre del estudio", type: "short", required: true, placeholder: "Gina Brows" },
      { id: "ciudad", label: "Ciudad y país", type: "short", required: true, placeholder: "Monterrey, MX" },
      { id: "anios_operando", label: "¿Cuántos años llevas operando?", type: "number", required: true },
      { id: "num_sucursales", label: "¿Cuántas sucursales tienes?", type: "number", required: true },
      { id: "instagram", label: "Instagram del estudio", type: "url", placeholder: "https://instagram.com/..." },
      { id: "tiktok", label: "TikTok (si aplica)", type: "url" },
      {
        id: "tamanio_equipo",
        label: "¿Cuántas personas trabajan contigo?",
        type: "single",
        required: true,
        options: ["Solo yo", "2-3 personas", "4-6 personas", "7+ personas"],
      },
    ],
  },
  {
    id: "agendapro",
    index: 2,
    title: "Auditoría AgendaPro",
    subtitle:
      "Lo que está dentro de AgendaPro hoy. Cuanto más detalle, más limpia será la migración.",
    questions: [
      { id: "tiempo_agendapro", label: "¿Hace cuánto usas AgendaPro?", type: "short", required: true, placeholder: "2 años" },
      { id: "costo_mensual_agendapro", label: "¿Cuánto pagas al mes? (USD/MXN)", type: "currency" },
      {
        id: "num_contactos_agendapro",
        label: "¿Aproximadamente cuántos contactos tienes guardados?",
        type: "single",
        required: true,
        options: ["Menos de 100", "100-500", "500-2,000", "2,000-5,000", "Más de 5,000"],
      },
      {
        id: "num_citas_historicas",
        label: "¿Cuántas citas históricas crees que tiene tu agenda?",
        type: "single",
        options: ["Menos de 500", "500-2,000", "2,000-10,000", "Más de 10,000", "No sé"],
      },
      {
        id: "puede_exportar",
        label: "¿Puedes exportar tus datos en CSV/Excel desde AgendaPro?",
        type: "single",
        required: true,
        options: ["Sí, ya exporté antes", "Creo que sí pero nunca lo he hecho", "No sé", "No, no se puede"],
      },
      {
        id: "campos_que_usas",
        label: "¿Qué campos guardas hoy de cada cliente? (selecciona todos los que apliquen)",
        type: "multi",
        options: [
          "Nombre completo",
          "Teléfono",
          "Email",
          "Cumpleaños",
          "Tipo de piel",
          "Alergias / contraindicaciones",
          "Historial de procedimientos",
          "Fotos antes/después",
          "Consentimientos firmados",
          "Notas libres",
          "Origen del lead (cómo te conoció)",
          "Referido por (otro cliente)",
        ],
      },
      { id: "lo_que_no_te_deja", label: "¿Qué cosa quisieras hacer y AgendaPro no te deja?", type: "long", required: true, placeholder: "Por ejemplo: enviar recordatorio de retoque anual, automatizar cumpleaños…" },
      { id: "que_si_funciona", label: "¿Qué SÍ te gusta de AgendaPro y no quieres perder?", type: "long" },
    ],
  },
  {
    id: "operacion",
    index: 3,
    title: "El día a día del estudio",
    subtitle:
      "Cómo entran las citas, quién las maneja y cómo cobras.",
    questions: [
      {
        id: "canales_agenda",
        label: "¿Por dónde te agendan las citas hoy?",
        type: "multi",
        required: true,
        options: ["WhatsApp", "Instagram DM", "Llamada", "Walk-in (sin cita)", "Link de AgendaPro", "Facebook Messenger", "Otro"],
      },
      { id: "quien_agenda", label: "¿Quién agenda las citas?", type: "single", required: true, options: ["Yo sola", "Recepcionista dedicada", "Mis técnicas también agendan", "Bot/automatizado"] },
      { id: "horas_agendando_semana", label: "¿Cuántas horas a la semana inviertes solo agendando/confirmando?", type: "number" },
      { id: "porcentaje_no_show", label: "¿Aproximadamente qué % de tus clientes no llegan a su cita?", type: "single", options: ["Menos de 5%", "5-15%", "15-30%", "Más de 30%"] },
      { id: "cobra_anticipo", label: "¿Cobras anticipo para apartar la cita?", type: "single", required: true, options: ["Sí, siempre", "Solo en algunos servicios", "No, pero quisiera empezar", "No"] },
      { id: "metodos_pago", label: "¿Qué métodos de pago aceptas?", type: "multi", options: ["Efectivo", "Terminal física", "Transferencia (SPEI/CLABE)", "Stripe / link de pago online", "MercadoPago / Conekta", "PayPal"] },
      { id: "consentimiento_formato", label: "¿Cómo manejas los consentimientos firmados?", type: "single", options: ["Papel físico", "PDF firmado a mano y escaneado", "Firma digital (DocuSign / similar)", "No los manejo formalmente"] },
    ],
  },
  {
    id: "servicios",
    index: 4,
    title: "Tu catálogo y los ciclos de retoque",
    subtitle:
      "Necesitamos cada servicio con su precio y su lógica de retoque para automatizar bien los recordatorios.",
    questions: [
      { id: "lista_servicios", label: "Lista TODOS tus servicios con su precio. Una línea por servicio.", help: "Ej: Microblading — $4,500 MXN | Microshading — $5,500 MXN | Lips blush — $6,000 MXN…", type: "long", required: true, placeholder: "Microblading — $4,500 MXN\nMicroshading — $5,500 MXN\n..." },
      { id: "servicio_estrella", label: "¿Cuál es tu servicio estrella (más vendido)?", type: "short", required: true },
      { id: "ticket_promedio", label: "¿Cuál es tu ticket promedio por cliente?", type: "currency", required: true },
      { id: "ciclos_retoque", label: "¿Cuáles son los ciclos de retoque? Por servicio, indícanos cuándo debe regresar el cliente.", help: "Ej: Microblading: retoque a los 30 días (incluido) + retoque anual ($1,800)", type: "long", required: true },
      { id: "garantia_retoque", label: "¿Qué pasa si el cliente NO llega a su retoque a tiempo?", type: "long", placeholder: "Pierde garantía, precio sube, etc." },
      { id: "contraindicaciones_clave", label: "¿Cuáles son las contraindicaciones que SIEMPRE preguntas antes del procedimiento?", type: "long", placeholder: "Embarazo, diabetes no controlada, anticoagulantes, etc." },
    ],
  },
  {
    id: "marketing",
    index: 5,
    title: "Marketing y voz de marca",
    subtitle: "Tus canales activos y cómo te comunicas con el mundo.",
    questions: [
      { id: "canales_activos", label: "¿En qué canales publicas hoy?", type: "multi", required: true, options: ["Instagram", "TikTok", "Facebook", "YouTube", "WhatsApp Business", "Email marketing", "Blog", "Ninguno"] },
      { id: "quien_publica", label: "¿Quién publica el contenido?", type: "single", options: ["Yo misma", "Mi equipo", "Community manager externo", "Agencia"] },
      { id: "frecuencia_publicacion", label: "¿Con qué frecuencia publicas en IG/TikTok?", type: "single", options: ["Diario", "3-4 por semana", "1-2 por semana", "Cuando puedo", "Casi nunca"] },
      { id: "hace_ads", label: "¿Inviertes en publicidad pagada hoy?", type: "single", required: true, options: ["Sí, Meta Ads", "Sí, TikTok Ads", "Sí, Google Ads", "Sí, en varias plataformas", "No, pero me interesa", "No, ni me interesa por ahora"] },
      { id: "presupuesto_ads", label: "¿Cuánto inviertes al mes en ads? (aprox)", type: "currency", showIf: { id: "hace_ads", includes: "Sí" } },
      { id: "tiene_email_db", label: "¿Tienes una base de datos para email marketing?", type: "single", options: ["Sí, ya envío campañas", "Sí, pero nunca la he usado", "No tengo"] },
      { id: "herramienta_email", label: "¿Qué herramienta usas para email?", type: "short", showIf: { id: "tiene_email_db", equals: "Sí, ya envío campañas" }, placeholder: "Mailchimp, Brevo, etc." },
      { id: "tono_marca", label: "¿Cómo describirías el tono de tu marca? (3-5 palabras)", type: "short", required: true, placeholder: "Cercana, profesional, lujo accesible…" },
      { id: "frases_si", label: "Frases o palabras que SIEMPRE usas con tus clientes", type: "long" },
      { id: "frases_no", label: "Frases o palabras que JAMÁS usarías", type: "long" },
    ],
  },
  {
    id: "automatizaciones",
    index: 6,
    title: "Automatizaciones que sueñas con tener",
    subtitle:
      "Marca todas las que quisieras y dinos cuál es la #1 que más impacto tendría.",
    questions: [
      {
        id: "automatizaciones_deseadas",
        label: "Selecciona todas las automatizaciones que quisieras tener:",
        type: "multi",
        required: true,
        options: [
          "Recordatorio de cita 24h antes (WhatsApp)",
          "Recordatorio de cita 2h antes",
          "Confirmación automática de cita",
          "Aviso de retoque mensual (1er retoque)",
          "Aviso de retoque anual",
          "Felicitación de cumpleaños con cupón",
          "Reactivación de clientes dormidos (>6 meses)",
          "Encuesta post-servicio (NPS)",
          "Pedir reseña de Google después del servicio",
          "Programa de referidos automatizado",
          "Reporte mensual de mi negocio por email/WhatsApp",
          "Auto-respuesta inicial cuando alguien escribe por IG/WhatsApp",
        ],
      },
      { id: "automatizacion_top", label: "Si SOLO pudiera implementarse UNA automatización primero, ¿cuál sería y por qué?", type: "long", required: true },
      { id: "incentivo_referidos", label: "¿Qué te imaginas regalando a alguien que te refiere a una amiga?", type: "short", placeholder: "10% de descuento, retoque gratis, producto de skincare…" },
      { id: "incentivo_cumple", label: "¿Qué regalo de cumpleaños te imaginas mandando?", type: "short" },
    ],
  },
  {
    id: "equipo",
    index: 7,
    title: "Equipo y permisos",
    subtitle: "Quién va a usar el CRM y desde dónde.",
    questions: [
      {
        id: "roles_crm",
        label: "¿Quiénes van a usar el CRM y con qué nivel de acceso?",
        type: "long",
        required: true,
        placeholder: "Ej: Gina (admin total) | Recepcionista (agenda+contactos) | 2 técnicas (solo su agenda)",
      },
      { id: "dispositivos", label: "¿Desde qué dispositivos van a trabajar?", type: "multi", options: ["Celular", "Tablet en recepción", "Laptop/desktop"] },
      { id: "horario_atencion", label: "¿Cuál es tu horario de atención?", type: "short", placeholder: "L-V 10-19h, S 10-15h" },
    ],
  },
  {
    id: "integraciones",
    index: 8,
    title: "Integraciones y herramientas actuales",
    subtitle: "Lo que ya pagas o usas y queremos enlazar al nuevo CRM.",
    questions: [
      { id: "tiene_whatsapp_business", label: "¿Tienes WhatsApp Business API o solo la app normal?", type: "single", required: true, options: ["WhatsApp Business API (con proveedor tipo Twilio/Meta)", "Solo WhatsApp Business app", "WhatsApp normal personal", "No sé la diferencia"] },
      { id: "numero_whatsapp_dedicado", label: "¿Tienes un número de WhatsApp DEDICADO para el negocio?", type: "single", options: ["Sí, número independiente", "Comparto mi número personal", "No tengo"] },
      { id: "tiene_dominio", label: "¿Tienes dominio web propio (ginabrows.com o similar)?", type: "single", options: ["Sí", "No, solo Instagram", "No sé"] },
      { id: "dominio_url", label: "¿Cuál es tu dominio?", type: "url", showIf: { id: "tiene_dominio", equals: "Sí" } },
      { id: "tiene_google_business", label: "¿Tienes ficha de Google Business / Google Maps?", type: "single", options: ["Sí, con muchas reseñas", "Sí, pero pocas reseñas", "No"] },
      { id: "calendario_uso", label: "¿Qué calendario usas?", type: "single", options: ["Google Calendar", "Outlook/Microsoft", "iCal/Apple", "Solo el de AgendaPro", "Ninguno"] },
      { id: "herramientas_extras", label: "¿Qué OTRAS herramientas pagas hoy? (Canva Pro, Hootsuite, etc.)", type: "long" },
    ],
  },
  {
    id: "metricas",
    index: 9,
    title: "Métricas y reporte",
    subtitle: "Qué quieres medir y cómo quieres enterarte.",
    questions: [
      {
        id: "kpis_interesa",
        label: "¿Qué métricas te interesa ver cada mes?",
        type: "multi",
        required: true,
        options: [
          "Citas por semana/mes",
          "Ingresos del mes",
          "Ticket promedio",
          "% de retención (clientes que regresan)",
          "% de no-shows",
          "LTV (valor de vida del cliente)",
          "Origen de mis nuevos clientes",
          "Servicios más vendidos",
          "Reseñas nuevas / NPS",
        ],
      },
      { id: "donde_quiere_ver", label: "¿Cómo prefieres recibir el reporte mensual?", type: "single", options: ["Dashboard en vivo en el CRM", "PDF que me llega por email", "Resumen por WhatsApp", "Las tres cosas"] },
    ],
  },
  {
    id: "cierre",
    index: 10,
    title: "Plazos, presupuesto y definición de éxito",
    subtitle:
      "Última parte. Lo más importante: qué te haría sentir que esto fue una buena inversión.",
    questions: [
      { id: "fecha_objetivo", label: "¿Para cuándo te gustaría apagar AgendaPro y vivir 100% en el nuevo CRM?", type: "single", required: true, options: ["En 30 días", "En 60 días", "En 90 días", "Cuando esté listo, sin prisa"] },
      { id: "presupuesto_herramientas_actual", label: "¿Cuánto pagas hoy en suma por todas tus herramientas digitales? (mensual)", type: "currency" },
      { id: "presupuesto_disponible", label: "¿Qué presupuesto mensual tienes disponible para invertir en este ecosistema?", type: "currency" },
      { id: "definicion_exito", label: "Termina esta frase: 'A 60 días de tener mi nuevo CRM, lo voy a considerar un éxito si…'", type: "long", required: true },
      { id: "miedo_principal", label: "¿Cuál es tu MAYOR miedo de hacer esta migración?", type: "long" },
      { id: "algo_mas", label: "¿Algo más que debamos saber y no te preguntamos?", type: "long" },
    ],
  },
];

export const TOTAL_QUESTIONS = BLOCKS.reduce((sum, b) => sum + b.questions.length, 0);
