import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";
import { BLOCKS } from "@/lib/questions";

export const runtime = "nodejs";

type Body = {
  values: Record<string, string | string[]>;
};

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

function summaryToHtml(values: Record<string, string | string[]>): string {
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
            <td style="padding:10px 0;border-top:1px solid #e4d3c7;vertical-align:top">
              <div style="font-size:12px;color:#6b5a52;margin-bottom:4px">${escapeHtml(q.label)}</div>
              <div style="font-size:14px;color:#1a1416">${valHtml}</div>
            </td>
          </tr>`;
      })
      .filter(Boolean)
      .join("");
    if (!rows) return "";
    return `
      <h2 style="font-family:Georgia,serif;font-size:18px;color:#1a1416;margin:28px 0 8px;border-bottom:2px solid #b07b6a;padding-bottom:6px">
        ${block.index}. ${escapeHtml(block.title)}
      </h2>
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
  }).join("");

  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;background:#fbf6f2;padding:24px;color:#1a1416">
    <div style="max-width:640px;margin:0 auto;background:white;padding:32px;border-radius:12px">
      <p style="font-size:11px;letter-spacing:.2em;color:#b07b6a;margin:0 0 8px;text-transform:uppercase">PropelKap × Gina Brows</p>
      <h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 12px">Cuestionario completado</h1>
      <p style="color:#6b5a52;font-size:14px;margin:0 0 16px">Resumen de las respuestas enviadas.</p>
      ${sections}
    </div>
  </body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const values = body.values ?? {};
  if (!values.email || !values.nombre_dueña) {
    return NextResponse.json(
      { error: "Faltan campos requeridos (nombre y email)" },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent");

  const supabase = getSupabase();
  let inserted: { id?: string } | null = null;
  if (supabase) {
    const { data, error } = await supabase
      .from("intake_submissions")
      .insert({
        email: String(values.email ?? ""),
        nombre_dueña: String(values["nombre_dueña"] ?? ""),
        nombre_estudio: String(values["nombre_estudio"] ?? ""),
        ciudad: String(values.ciudad ?? ""),
        payload: values,
        user_agent: userAgent,
        ip,
      })
      .select("id")
      .single();
    if (error) {
      console.error("Supabase insert error:", error);
    } else {
      inserted = data;
    }
  } else {
    console.warn("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set; skipping DB insert.");
  }

  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.NOTIFY_EMAIL ?? "jpbriones@propelkap.com";
  // CC opcional para que más de 1 persona reciba el aviso (ej. Gina + JP)
  const notifyCc = process.env.NOTIFY_EMAIL_CC?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const fromAddr = process.env.RESEND_FROM ?? "Gina Brows <onboarding@resend.dev>";
  const replyToAddr = process.env.REPLY_TO ?? null;

  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const html = summaryToHtml(values);
      const text = summarize(values);
      const studio = String(values["nombre_estudio"] ?? "Gina Brows");
      const owner = String(values["nombre_dueña"] ?? "Cliente");

      await resend.emails.send({
        from: fromAddr,
        to: [notifyTo],
        cc: notifyCc.length > 0 ? notifyCc : undefined,
        subject: `Cuestionario completado · ${studio} (${owner})`,
        html,
        text,
        replyTo: String(values.email ?? notifyTo),
      });

      const clientEmail = String(values.email ?? "");
      if (clientEmail) {
        await resend.emails.send({
          from: fromAddr,
          to: [clientEmail],
          replyTo: replyToAddr ?? notifyTo,
          subject: `Recibimos tus respuestas, ${owner} ✿`,
          html: `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:520px;margin:24px auto;padding:24px;background:#fbf6f2;color:#1a1416;border-radius:12px">
            <p style="font-size:11px;letter-spacing:.2em;color:#b07b6a;text-transform:uppercase">PropelKap × Gina Brows</p>
            <h1 style="font-family:Georgia,serif">¡Listo, ${escapeHtml(owner)}!</h1>
            <p>Recibimos tus respuestas. En las próximas 48 horas te mando una propuesta concreta del ecosistema digital de Gina Brows: CRM, automatizaciones, marketing y un calendario claro de implementación.</p>
            <p>Si necesitas algo antes, contéstame este correo o escríbeme por WhatsApp.</p>
            <p>— JP, PropelKap</p>
          </div>`,
        });
      }
    } catch (e) {
      console.error("Resend error:", e);
    }
  } else {
    console.warn("RESEND_API_KEY not set; skipping email notifications.");
  }

  return NextResponse.json({ ok: true, id: inserted?.id ?? null });
}
