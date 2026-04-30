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

// ─────────────────────────────────────────────────────────────────────
// PropelKap OS · Cuestionario de diagnóstico
// 9 bloques · ~50 preguntas · 7-10 min completar.
// El cliente llena UNA vez. Genera: scoring lead, propuesta, system prompt
// del bot del cliente, plantillas Día 3, scripts Día 4, pipeline default.
// ─────────────────────────────────────────────────────────────────────

export const BLOCKS: Block[] = [
  // ─────────── 1 · Quién eres ───────────
  {
    id: "identidad",
    index: 1,
    title: "Quién eres",
    subtitle:
      "Empecemos por lo básico para personalizar tu diagnóstico.",
    questions: [
      { id: "nombre_completo", label: "Nombre completo", type: "short", required: true, placeholder: "Carlos Méndez" },
      { id: "email", label: "Correo electrónico", type: "email", required: true, placeholder: "carlos@correo.com" },
      { id: "whatsapp", label: "WhatsApp (con +52 1)", type: "tel", required: true, placeholder: "+52 1 81 ..." },
      { id: "ciudad", label: "Ciudad y estado", type: "short", required: true, placeholder: "Monterrey, Nuevo León" },
      {
        id: "especialidad",
        label: "Tu especialidad principal",
        type: "single",
        required: true,
        options: [
          "Agente de Seguros",
          "Asesor de Pensiones",
          "Asesor de AFORE",
          "Asesor de Inversiones",
          "Asesor Financiero (general)",
          "Promotoría",
          "Otro",
        ],
      },
      {
        id: "cedula_vigente",
        label: "¿Cédula vigente?",
        type: "single",
        required: true,
        options: ["Sí, vigente", "En trámite", "No aplica para mi línea", "No tengo"],
      },
    ],
  },

  // ─────────── 2 · Tu negocio actual ───────────
  {
    id: "negocio",
    index: 2,
    title: "Tu negocio actual",
    subtitle:
      "Cómo opera tu negocio hoy, antes de PropelKap.",
    questions: [
      { id: "anios_operando", label: "Años operando como asesor/agente", type: "number", required: true, placeholder: "3" },
      {
        id: "clientes_activos",
        label: "Clientes activos hoy",
        type: "single",
        required: true,
        options: ["Menos de 10", "10-30", "30-100", "100-300", "Más de 300"],
      },
      {
        id: "cierres_mes",
        label: "Cierres promedio al mes",
        type: "single",
        required: true,
        options: ["1-3", "4-8", "9-15", "16-30", "Más de 30"],
      },
      {
        id: "tamanio_equipo",
        label: "Tamaño de tu equipo",
        type: "single",
        required: true,
        options: ["Solo yo", "2-3 personas", "4-6 personas", "7+ personas"],
      },
      {
        id: "software_actual",
        label: "Software que usas hoy para gestionar clientes",
        type: "multi",
        required: true,
        options: [
          "Excel / Google Sheets",
          "WhatsApp manual (sin sistema)",
          "Salesforce",
          "Hubspot",
          "Otro CRM",
          "Notion / Airtable",
          "Nada formal",
        ],
      },
      {
        id: "canales_captacion",
        label: "Canales donde captas leads hoy",
        type: "multi",
        required: true,
        options: ["Instagram", "TikTok", "LinkedIn", "Facebook", "Google Ads", "Meta Ads", "Referidos", "Eventos / networking", "Llamada en frío", "Página web propia"],
      },
    ],
  },

  // ─────────── 3 · Tu dolor (clave clasificación) ───────────
  {
    id: "dolor",
    index: 3,
    title: "Tu dolor real",
    subtitle:
      "La parte más importante. Cuanto más honesto, mejor el diagnóstico.",
    questions: [
      {
        id: "tareas_que_roban_tiempo",
        label: "¿Qué te roba más tiempo hoy?",
        type: "multi",
        required: true,
        options: [
          "Seguimiento WhatsApp manual a leads",
          "Generar propuestas personalizadas",
          "Cobranza y conciliación de pagos",
          "Agendar citas / coordinar calendarios",
          "Capacitación a clientes nuevos",
          "Reportería y métricas",
          "Prospección activa de leads",
          "Filtrar leads no calificados (perdedores de tiempo)",
          "Documentación / compliance",
        ],
      },
      {
        id: "horas_operativo_semana",
        label: "¿Cuántas horas/semana inviertes en tareas operativas (no venta)?",
        type: "single",
        required: true,
        options: ["Menos de 10", "10-20", "20-30", "30-40", "Más de 40"],
      },
      {
        id: "varita_magica",
        label: "Si tuvieras varita mágica, ¿qué automatizarías PRIMERO?",
        help: "Sé específico. La respuesta determina dónde el sistema empieza.",
        type: "long",
        required: true,
        placeholder: "Ej: que un asistente IA responda WhatsApp 24/7 y solo me pase los calientes...",
      },
      {
        id: "intentos_previos",
        label: "¿Has intentado automatizar antes? Con qué resultados?",
        type: "long",
        placeholder: "Ej: probé Hubspot pero era muy complejo... contraté VA pero seguía siendo manual...",
      },
      {
        id: "frustracion_clientes",
        label: "Tu mayor frustración con CLIENTES hoy",
        type: "long",
        required: true,
        placeholder: "Ej: clientes que dicen 'lo pienso' y desaparecen, perder cierres por no contestar a tiempo...",
      },
    ],
  },

  // ─────────── 4 · Capacidad e intención ───────────
  {
    id: "intencion",
    index: 4,
    title: "Capacidad e intención",
    subtitle: "Para entender qué tan rápido puedes arrancar.",
    questions: [
      {
        id: "presupuesto_herramientas",
        label: "Presupuesto mensual disponible para herramientas",
        type: "single",
        required: true,
        options: ["Menos de $1,000 MXN", "$1,000-3,000 MXN", "$3,000-10,000 MXN", "$10,000+ MXN"],
      },
      {
        id: "cuando_arrancas",
        label: "¿Cuándo idealmente arrancarías?",
        type: "single",
        required: true,
        options: ["Esta semana", "Este mes", "Próximos 3 meses", "Solo estoy explorando"],
      },
      {
        id: "decision_factor",
        label: "¿Qué te haría tomar la decisión HOY?",
        type: "long",
        required: true,
        placeholder: "Ej: ver un demo en vivo, hablar con otro asesor que ya lo use, garantía de devolución...",
      },
      {
        id: "decision_solo_o_equipo",
        label: "¿Decides tú solo o hay socio/equipo?",
        type: "single",
        required: true,
        options: ["Decido yo solo", "Decido con socio / pareja", "Necesito aprobación de mi gerente / superior"],
      },
    ],
  },

  // ─────────── 5 · Agente IA · cómo debe sonar ───────────
  {
    id: "agente_tono",
    index: 5,
    title: "Tu agente IA · cómo debe SONAR como tú",
    subtitle:
      "Estas respuestas entrenan directamente al asistente IA que va a contestar WhatsApp por ti. Sé específico.",
    questions: [
      {
        id: "tono_general",
        label: "Tono con clientes",
        type: "single",
        required: true,
        options: [
          'Formal "usted" (siempre)',
          'Formal "tú" (cordial pero cercano)',
          "Casual cercano (como amigos)",
          "Adapta según cliente",
        ],
      },
      {
        id: "saludo_inicial",
        label: "Tu saludo TÍPICO al iniciar conversación con un lead nuevo",
        help: "Escribe el mensaje literal que mandarías. Esto entrena el opener del bot.",
        type: "long",
        required: true,
        placeholder: "Ej: Hola Juan! 👋 Gracias por contactarme. Soy Carlos de [tu negocio]. Cuéntame, ¿qué te gustaría resolver?",
      },
      {
        id: "cierre_mensaje",
        label: "Cómo CIERRAS un mensaje cuando esperas respuesta",
        type: "long",
        required: true,
        placeholder: "Ej: Quedo atento a tus comentarios... ¿Te parece si lo agendamos?...",
      },
      {
        id: "muletillas_si",
        label: "3 muletillas o frases que SÍ usas con clientes",
        help: "Frases tuyas que el bot debe imitar para sonar como tú.",
        type: "long",
        required: true,
        placeholder: "1. 'lo bueno es que...'\n2. 'fíjate que...'\n3. 'lo que te conviene es...'",
      },
      {
        id: "frases_no",
        label: "3 palabras o frases que NUNCA usarías",
        help: "Lista negra del bot. Si estas frases salen, sales humano.",
        type: "long",
        required: true,
        placeholder: '1. "no sabría decirle"\n2. "déjeme checar y le aviso"\n3. "depende"',
      },
      {
        id: "firma_personal",
        label: "Tu firma personal en mensajes",
        type: "short",
        required: true,
        placeholder: 'Ej: "Un abrazo, Carlos" o "Saludos cordiales"',
      },
      {
        id: "emoji_identidad",
        label: "Un emoji que te identifica (opcional)",
        type: "short",
        placeholder: "🚀 / 💪 / ✨ / no uso emojis",
      },
      {
        id: "max_preguntas",
        label: "¿Cuántas preguntas máximo metes en un mensaje?",
        type: "single",
        required: true,
        options: ["1 pregunta a la vez", "Máximo 2", "3 o más está bien"],
      },
    ],
  },

  // ─────────── 6 · Agente IA · cómo debe NEGOCIAR ───────────
  {
    id: "agente_negociacion",
    index: 6,
    title: "Tu agente IA · cómo debe NEGOCIAR",
    subtitle:
      "Cómo el bot maneja objeciones y avanza el cierre. Sé exacto: estas respuestas son el script que va a usar.",
    questions: [
      {
        id: "estilo_negociacion",
        label: "Estilo de negociación",
        type: "single",
        required: true,
        options: [
          "Consultivo educativo (explico mucho, sin presión)",
          "Directo soluciones (al grano, propuesta rápida)",
          "Empático conexión (construyo relación primero)",
          "Mixto según cliente",
        ],
      },
      {
        id: "objecion_caro",
        label: 'Cliente dice "está caro". ¿Qué respondes EXACTAMENTE?',
        help: "Escribe la frase literal. Esto va al bot.",
        type: "long",
        required: true,
        placeholder: "Ej: Te entiendo. Déjame mostrarte qué incluye y por qué cuesta esto...",
      },
      {
        id: "objecion_pensar",
        label: 'Cliente dice "déjame pensarlo". ¿Cómo respondes?',
        type: "long",
        required: true,
        placeholder: "Ej: Por supuesto. Mientras lo piensas, ¿hay alguna duda específica que pueda aclararte?",
      },
      {
        id: "objecion_otro_asesor",
        label: 'Cliente dice "ya tengo asesor". ¿Cómo respondes?',
        type: "long",
        required: true,
        placeholder: "Ej: Excelente. Te dejo mi info por si en algún momento quieres una segunda opinión...",
      },
      {
        id: "pitch_cierre",
        label: "Tu pitch de cierre en 2 líneas",
        help: "El llamado a la acción final del bot.",
        type: "long",
        required: true,
        placeholder: "Ej: ¿Te parece si lo cerramos hoy y mañana ya estás operando? Te paso link de pago.",
      },
      {
        id: "escalar_humano",
        label: "¿Qué temas SIEMPRE debe escalar a ti directamente el bot?",
        type: "multi",
        required: true,
        options: [
          "Cierre de venta (firma de contrato)",
          "Objeciones complejas",
          "Discusión de precio / descuentos",
          "Compliance / regulación",
          "Quejas / reclamos",
          "Clientes VIP marcados",
          "Cualquier cosa fuera de info básica",
          "Solo si el cliente lo pide explícito",
        ],
      },
      {
        id: "toques_cierre",
        label: "¿Cuántos toques (mensajes / llamadas) típicamente antes del cierre?",
        type: "single",
        required: true,
        options: ["1-2 toques", "3-5 toques", "6-10 toques", "Más de 10"],
      },
      {
        id: "diferenciador_uno_a_uno",
        label: "Tu diferenciador vs competencia en 1 frase",
        help: "Lo que el bot dice cuando preguntan '¿por qué tú y no otro?'",
        type: "long",
        required: true,
        placeholder: "Ej: Soy el único en la región certificado en X y mis clientes recuperan Y promedio...",
      },
    ],
  },

  // ─────────── 7 · Producto / servicio ───────────
  {
    id: "producto",
    index: 7,
    title: "Tu producto/servicio",
    subtitle: "Para generar tu propuesta y configurar tu CRM con tu catálogo.",
    questions: [
      {
        id: "servicios_principales",
        label: "Servicios principales que ofreces",
        type: "multi",
        required: true,
        options: [
          "Pensión Ley 73",
          "Modalidad 40 (M40)",
          "AFORE / retiro voluntario",
          "Seguro de Vida",
          "Seguro de Auto",
          "Seguro GMM (gastos médicos mayores)",
          "Crédito Mejoravit / Infonavit",
          "Inversión patrimonial",
          "Skandia / inversiones aseguradas",
          "Asesoría fiscal / SAT",
          "Otros",
        ],
      },
      {
        id: "comisiones_rango",
        label: "Rango de comisiones que cobras (% sobre venta)",
        type: "single",
        options: ["Menos de 5%", "5-10%", "10-20%", "20%+", "Prefiero no decir"],
      },
      {
        id: "ticket_promedio",
        label: "Ticket promedio MXN por cliente",
        type: "single",
        required: true,
        options: [
          "Menos de $5,000",
          "$5,000-20,000",
          "$20,000-50,000",
          "$50,000-150,000",
          "$150,000-500,000",
          "Más de $500,000",
        ],
      },
      {
        id: "tiempo_cierre",
        label: "Tiempo promedio cierre desde primer contacto",
        type: "single",
        required: true,
        options: ["Menos de 1 semana", "1-4 semanas", "1-3 meses", "3+ meses"],
      },
      {
        id: "casos_exito",
        label: "Casos de éxito recientes (2-3 ejemplos breves)",
        help: "El bot los va a usar como social proof. Sin nombres reales si quieres.",
        type: "long",
        required: true,
        placeholder: "1. Cliente A pasó de pensión $8K a $24K con Mod 40\n2. Cliente B...",
      },
      {
        id: "garantias",
        label: "Garantías o promesas que ofreces",
        type: "long",
        placeholder: "Ej: 'Si no logramos X, devolvemos honorarios' / 'Acompañamiento 1 año post-firma'",
      },
    ],
  },

  // ─────────── 8 · Pipeline ───────────
  {
    id: "pipeline",
    index: 8,
    title: "Tu pipeline de venta",
    subtitle: "Para configurar las etapas de tu CRM personalizado.",
    questions: [
      {
        id: "etapas_pipeline",
        label: "Etapas que usas en tu pipeline (selecciona las que aplican)",
        type: "multi",
        required: true,
        options: [
          "Lead nuevo (entró pero no contactado)",
          "Contactado (saludo enviado)",
          "Calificado (mostró interés real)",
          "Demo / diagnóstico agendado",
          "Demo / diagnóstico realizado",
          "Propuesta enviada",
          "Negociando",
          "Pendiente arranque (ya pagó, espera)",
          "Cerrado ganado",
          "Cerrado perdido",
          "Nurturing (no compra ahora pero sigo)",
        ],
      },
      {
        id: "canales_cierre",
        label: "Canales principales para cerrar venta",
        type: "multi",
        required: true,
        options: ["WhatsApp", "Email", "Llamada telefónica", "Reunión presencial", "Reunión Zoom/Meet", "DM redes sociales"],
      },
      {
        id: "manda_seguimientos_auto",
        label: "¿Mandas seguimientos automáticos hoy?",
        type: "single",
        required: true,
        options: ["Sí, los tengo configurados", "Manda manualmente cuando me acuerdo", "No mando", "Lo intenté pero no funcionó"],
      },
      {
        id: "bot_mueve_pipeline",
        label: "¿Quieres que el bot mueva contactos entre etapas automático según señales del cliente?",
        type: "single",
        required: true,
        options: [
          "Sí siempre (autonomía total)",
          "Solo con mi aprobación cada vez",
          "No, yo lo hago manual",
        ],
      },
    ],
  },

  // ─────────── 9 · Cómo nos conociste ───────────
  {
    id: "lead_source",
    index: 9,
    title: "Cómo nos conociste",
    subtitle: "Última parte. Para saber qué canales nos están funcionando.",
    questions: [
      {
        id: "source",
        label: "¿Cómo llegaste a PropelKap?",
        type: "single",
        required: true,
        options: [
          "Anuncio Instagram / Facebook",
          "Anuncio TikTok",
          "Búsqueda Google",
          "LinkedIn",
          "Referido por un cliente actual",
          "Referido por un colega",
          "Evento / podcast",
          "Otro",
        ],
      },
      {
        id: "que_te_intereso",
        label: "¿Qué fue lo que te interesó / hizo dar click?",
        type: "long",
        required: true,
        placeholder: "Ej: vi un caso de éxito en TikTok, un colega me dijo que le había funcionado...",
      },
      {
        id: "expectativa_diagnostico",
        label: "¿Qué esperas obtener de este diagnóstico?",
        type: "long",
        placeholder: "Ej: ver si esto realmente puede funcionar para mi negocio, comparar precios...",
      },
    ],
  },
];

export const TOTAL_QUESTIONS = BLOCKS.reduce((sum, b) => sum + b.questions.length, 0);
