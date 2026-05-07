import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";
import { BLOCKS } from "@/lib/questions";

export const runtime = "nodejs";

type Body = {
  values: Record<string, string | string[]>;
  utm?: Record<string, string>;
  referrer?: string;
};

// ────────────────────────────────────────────────────────────────
// Helpers de resumen (text + html branded PropelKap navy/lima)
// ────────────────────────────────────────────────────────────────

function summarize(values: Record<string, string | string[]>): string {
  const lines: string[] = [];
  for (const block of BLOCKS) {
    lines.push(`\n## ${block.index}. ${block.title}\n`);
    for (const q of block.questions) {
      const v = values[q.id];
      if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) continue;
      const display = Array.isArray(v) ? v.map((x) => `  • ${x}`).join("\n") : String(v);
      lines.push(`**${q.label}**`);
      lines.push(Array.isArray(v) ? display : `  ${display}`);
      lines.push("");
    }
  }
  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

function adminEmailHtml(values: Record<string, string | string[]>, leadMeta: { score?: number; bucket?: string; bot_persona?: string }): string {
  const sections = BLOCKS.map((block) => {
    const rows = block.questions
      .map((q) => {
        const v = values[q.id];
        if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) return "";
        const valHtml = Array.isArray(v)
          ? `<ul style="margin:4px 0 0 0;padding-left:18px">${v.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
          : `<div style="white-space:pre-wrap">${escapeHtml(String(v))}</div>`;
        return `
          <tr>
            <td style="padding:10px 0;border-top:1px solid #E5E2DA;vertical-align:top">
              <div style="font-size:12px;color:#5A6573;margin-bottom:4px">${escapeHtml(q.label)}</div>
              <div style="font-size:14px;color:#1F2323">${valHtml}</div>
            </td>
          </tr>`;
      })
      .filter(Boolean)
      .join("");
    if (!rows) return "";
    return `
      <h2 style="font-family:-apple-system,Segoe UI,sans-serif;font-size:16px;color:#0A2540;margin:28px 0 8px;border-bottom:2px solid #7FFFA8;padding-bottom:6px">
        ${block.index}. ${escapeHtml(block.title)}
      </h2>
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
  }).join("");

  const scoreBadge = leadMeta.score !== undefined
    ? `<span style="display:inline-block;background:${leadMeta.bucket === 'caliente' ? '#7FFFA8' : leadMeta.bucket === 'tibio' ? '#FFE900' : '#E5E2DA'};color:#0A2540;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase">${leadMeta.bucket} · ${leadMeta.score}/100</span>`
    : '';
  const botPersona = leadMeta.bot_persona
    ? `<p style="font-size:12px;color:#5A6573;margin:4px 0 0">Bot persona detectada: <strong>${escapeHtml(leadMeta.bot_persona)}</strong></p>`
    : '';

  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;background:#F5F2EA;padding:24px;color:#1F2323;margin:0">
    <div style="max-width:640px;margin:0 auto;background:white;padding:32px;border-radius:12px;box-shadow:0 1px 3px rgba(10,37,64,0.08)">
      <p style="font-size:11px;letter-spacing:.2em;color:#0A2540;margin:0 0 8px;text-transform:uppercase;font-weight:700">PropelKap OS · Diagnóstico</p>
      <h1 style="font-size:28px;margin:0 0 12px;color:#0A2540;font-weight:700;letter-spacing:-0.5px">Lead nuevo capturado</h1>
      <div style="margin:8px 0 16px">${scoreBadge}</div>
      ${botPersona}
      <p style="color:#5A6573;font-size:14px;margin:16px 0">Respuestas completas del cuestionario:</p>
      ${sections}
    </div>
  </body></html>`;
}

function clientThankYouHtml(owner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F5F2EA;font-family:-apple-system,Segoe UI,sans-serif;color:#1F2323">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EA"><tr><td align="center" style="padding:24px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(10,37,64,0.08)">
        <tr><td align="center" style="background:#0A2540;padding:32px 24px"><img src="https://hmwikgjihesyvfsqccfs.supabase.co/storage/v1/object/public/brand-assets/logo_propelkap_real.png" alt="PropelKap" width="140" style="display:block;border:0;height:auto;max-width:140px"></td></tr>
        <tr><td style="padding:40px 32px">
          <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#0A2540;font-weight:700">Recibimos tus respuestas</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#0A2540;font-weight:700">¡Listo, ${escapeHtml(owner)}! 🚀</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Tu diagnóstico ya está en mis manos. Estoy revisando todo para mandarte una propuesta concreta y a tu medida en las próximas <strong>24-48 horas</strong>.</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5A6573">Lo que vamos a armarte:</p>
          <ul style="margin:0 0 24px;padding-left:18px;font-size:15px;color:#1F2323;line-height:1.8">
            <li>Un análisis específico de dónde te está costando más tiempo hoy</li>
            <li>Cómo se vería tu CRM personalizado con tu agente IA entrenado para sonar como tú</li>
            <li>Pricing y plan de implementación</li>
          </ul>
          <p style="margin:0 0 12px;font-size:14px;color:#5A6573;line-height:1.6">Mientras tanto, si tienes alguna duda o quieres adelantar algo, contesta este email o escríbeme por WhatsApp:</p>
          <p style="margin:0 0 24px"><a href="https://wa.me/18143348661?text=Hola%20Jorge%2C%20acabo%20de%20llenar%20el%20diagn%C3%B3stico" style="display:inline-block;padding:12px 24px;font-size:14px;color:#0A2540;text-decoration:none;border:1.5px solid #0A2540;border-radius:8px;font-weight:600">📲 WhatsApp directo</a></p>
          <p style="margin:24px 0 0;font-size:14px;color:#1F2323">— Jorge & equipo PropelKap</p>
        </td></tr>
        <tr><td style="background:#0A2540;padding:24px 32px;text-align:center">
          <p style="margin:0 0 8px;font-size:12px;color:#7FFFA8;font-weight:700;letter-spacing:1px;text-transform:uppercase">PropelKap OS</p>
          <p style="margin:0;font-size:11px;color:#A7B3C2;line-height:1.5">Producto SaaS B2B · México · 2026</p>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

// ────────────────────────────────────────────────────────────────
// Normalización de teléfono MX para WhatsApp
// ────────────────────────────────────────────────────────────────
// Móviles MX requieren +521 (no +52) para que Meta entregue mensajes WA.
// Sin el "1" después del +52, todos los templates rebotan con err 63049.
//
// Reglas:
// - +52 (10 dígitos)        → +521 + 10 dígitos
// - +521 (10 dígitos)       → ya correcto, intacto
// - 10 dígitos directos MX  → +521 + 10 dígitos
// - cualquier otro país (+1, +34, +57, etc.) → respetar tal cual
// ────────────────────────────────────────────────────────────────
function normalizeMxMobile(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  // Quitar todo excepto dígitos y +
  const cleaned = trimmed.replace(/[^\d+]/g, "");

  // Caso 1: ya tiene +521 + 10 dígitos
  if (/^\+521\d{10}$/.test(cleaned)) return cleaned;

  // Caso 2: +52 + 10 dígitos (sin el 1) → agregar 1
  if (/^\+52\d{10}$/.test(cleaned)) {
    return `+521${cleaned.slice(3)}`;
  }

  // Caso 3: 521 + 10 dígitos sin +
  if (/^521\d{10}$/.test(cleaned)) return `+${cleaned}`;

  // Caso 4: 52 + 10 dígitos sin + ni 1
  if (/^52\d{10}$/.test(cleaned)) return `+521${cleaned.slice(2)}`;

  // Caso 5: 10 dígitos directos (sin código) → asumir MX móvil
  if (/^\d{10}$/.test(cleaned)) return `+521${cleaned}`;

  // Caso 6: otro país (ej. +1, +34, +57) → respetar
  if (cleaned.startsWith("+")) return cleaned;

  // Fallback: prefix + sin tocar
  return `+${cleaned}`;
}

// ────────────────────────────────────────────────────────────────
// POST handler
// ────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const values = body.values ?? {};

  // Validación: campos críticos del Bloque 1
  const requiredMissing: string[] = [];
  for (const k of ["nombre_completo", "email", "whatsapp", "ciudad", "especialidad"]) {
    if (!values[k] || (typeof values[k] === "string" && (values[k] as string).trim() === "")) {
      requiredMissing.push(k);
    }
  }
  if (requiredMissing.length > 0) {
    return NextResponse.json(
      { error: "Faltan campos requeridos", fields: requiredMissing },
      { status: 400 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent");
  const utm = body.utm ?? {};
  const referrer = body.referrer ?? null;

  // ── 1. Insert en pk_leads ──
  const supabase = getSupabase();
  let leadId: string | null = null;
  let leadInserted = false;

  if (supabase) {
    // Helper para extraer string scalar o primer item de array
    const str = (k: string): string | null => {
      const v = values[k];
      if (Array.isArray(v)) return v[0] ?? null;
      return v ? String(v) : null;
    };
    const arr = (k: string): string[] | null => {
      const v = values[k];
      if (Array.isArray(v)) return v;
      return null;
    };
    const num = (k: string): number | null => {
      const v = values[k];
      if (!v) return null;
      const n = parseInt(String(v), 10);
      return isNaN(n) ? null : n;
    };

    const { data, error } = await supabase
      .from("pk_leads")
      .insert({
        // Identidad
        nombre_completo: str("nombre_completo"),
        email: str("email"),
        whatsapp: normalizeMxMobile(str("whatsapp")),
        ciudad: str("ciudad"),
        especialidad: str("especialidad"),
        cedula_vigente: str("cedula_vigente"),

        // Negocio
        anios_operando: num("anios_operando"),
        clientes_activos: str("clientes_activos"),
        cierres_mes: str("cierres_mes"),
        tamanio_equipo: str("tamanio_equipo"),
        software_actual: arr("software_actual"),
        canales_captacion: arr("canales_captacion"),

        // Dolor
        tareas_que_roban_tiempo: arr("tareas_que_roban_tiempo"),
        horas_operativo_semana: str("horas_operativo_semana"),
        varita_magica: str("varita_magica"),
        frustracion_clientes: str("frustracion_clientes"),

        // Capacidad
        presupuesto_herramientas: str("presupuesto_herramientas"),
        cuando_arrancas: str("cuando_arrancas"),
        decision_solo_o_equipo: str("decision_solo_o_equipo"),

        // Producto
        servicios_principales: arr("servicios_principales"),
        ticket_promedio: str("ticket_promedio"),
        tiempo_cierre: str("tiempo_cierre"),

        // Tracking
        source: str("source"),
        utm_source: utm.utm_source ?? null,
        utm_medium: utm.utm_medium ?? null,
        utm_campaign: utm.utm_campaign ?? null,
        utm_content: utm.utm_content ?? null,
        user_agent: userAgent,
        ip,
        referrer,

        // Payload completo
        payload: { ...values, utm, referrer },
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert pk_leads error:", error);
      // Si fue error de UNIQUE (duplicado), recuperar lead existente
      if (error.code === "23505") {
        const { data: existing } = await supabase
          .from("pk_leads")
          .select("id")
          .or(`email.eq.${str("email")},whatsapp.eq.${normalizeMxMobile(str("whatsapp"))}`)
          .limit(1)
          .single();
        if (existing?.id) {
          leadId = existing.id;
          leadInserted = false;
        }
      }
    } else {
      leadId = data?.id ?? null;
      leadInserted = true;
    }
  } else {
    console.warn("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set; skipping DB insert.");
  }

  // ── 2. Trigger Edge Function intake-scoring (background, fire-and-forget) ──
  let scoringResult: { score?: number; bucket?: string; bot_persona?: string } = {};
  const scoringUrl = process.env.INTAKE_SCORING_URL;
  const scoringSecret = process.env.INTAKE_SCORING_SECRET;
  if (leadId && scoringUrl && scoringSecret) {
    try {
      const r = await fetch(scoringUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-intake-secret": scoringSecret,
        },
        body: JSON.stringify({ lead_id: leadId }),
      });
      if (r.ok) {
        scoringResult = await r.json();
      } else {
        console.warn(`intake-scoring HTTP ${r.status}`);
      }
    } catch (e) {
      console.error("intake-scoring fetch error:", e);
    }
  }

  // ── 3. Email notificación admin + thank-you al cliente ──
  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.NOTIFY_EMAIL ?? "jpbriones@propelkap.com";
  const notifyCc = process.env.NOTIFY_EMAIL_CC?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const fromAddr = process.env.RESEND_FROM ?? "PropelKap OS <onboarding@propelkap.com>";

  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const owner = String(values["nombre_completo"] ?? "Cliente").split(" ")[0];
      const especialidad = String(values["especialidad"] ?? "—");
      const bucket = scoringResult.bucket ?? "—";

      // Admin: resumen completo
      await resend.emails.send({
        from: fromAddr,
        to: [notifyTo],
        cc: notifyCc.length > 0 ? notifyCc : undefined,
        subject: `🎯 Lead nuevo · ${owner} (${especialidad}) · ${bucket}`,
        html: adminEmailHtml(values, scoringResult),
        text: summarize(values),
        replyTo: String(values.email ?? notifyTo),
      });

      // Cliente: thank-you branded
      const clientEmail = String(values.email ?? "");
      if (clientEmail) {
        await resend.emails.send({
          from: fromAddr,
          to: [clientEmail],
          replyTo: notifyTo,
          subject: `Recibimos tu diagnóstico, ${owner} · próximos 24-48h`,
          html: clientThankYouHtml(owner),
        });
      }
    } catch (e) {
      console.error("Resend error:", e);
    }
  } else {
    console.warn("RESEND_API_KEY not set; skipping email notifications.");
  }

  return NextResponse.json({
    ok: true,
    lead_id: leadId,
    inserted: leadInserted,
    score: scoringResult.score,
    bucket: scoringResult.bucket,
  });
}
