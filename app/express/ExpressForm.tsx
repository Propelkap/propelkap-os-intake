"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

type FormValues = {
  nombre_completo: string;
  email: string;
  whatsapp: string;
  ciudad: string;
  especialidad: string;
  clientes_activos: string;
  cuando_arrancas: string;
  varita_magica: string;
};

const STORAGE_KEY = "propelkap-express-v2";

const ESPECIALIDADES = [
  "Asesor de pensiones / Modalidad 40",
  "Agente de seguros (vida, GMM, autos)",
  "Promotor AFORE",
  "Broker / asesor financiero",
  "Contador independiente",
  "Otro",
  "Busco ayuda con mi propia pensión (no soy asesor)",
];

// Opciones idénticas a las del cuestionario completo — el motor de scoring
// (intake-scoring) matchea por string exacto; cualquier variación puntúa 0.
const CLIENTES_ACTIVOS = [
  "Aún no tengo clientes",
  "Menos de 10",
  "10-30",
  "30-100",
  "100-300",
  "Más de 300",
];

const CUANDO_ARRANCAS = [
  "Esta semana",
  "Este mes",
  "Próximos 3 meses",
  "Solo estoy explorando",
];

// Gate anti-basura: estos valores identifican a quien NO es cliente potencial
// (consumidores buscando ayuda con su pensión, curiosos sin negocio). No se
// insertan al CRM ni disparan el pixel Lead — así Meta/TikTok no aprenden de ellos.
const DISQUALIFY_ESPECIALIDAD = "Busco ayuda con mi propia pensión (no soy asesor)";
const DISQUALIFY_CLIENTES = "Aún no tengo clientes";

export default function ExpressForm() {
  const [v, setV] = useState<FormValues>({
    nombre_completo: "",
    email: "",
    whatsapp: "",
    ciudad: "",
    especialidad: "",
    clientes_activos: "",
    cuando_arrancas: "",
    varita_magica: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [disqualified, setDisqualified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utm, setUtm] = useState<Record<string, string>>({});
  const [referrer, setReferrer] = useState("");

  useEffect(() => {
    // Restaurar progreso parcial si existe
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.v) setV((prev) => ({ ...prev, ...parsed.v }));
        if (parsed.utm) setUtm(parsed.utm);
        if (parsed.referrer) setReferrer(parsed.referrer);
      }
    } catch {}

    // Captura UTM + referrer
    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search);
      const captured: Record<string, string> = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
        const val = s.get(k);
        if (val) captured[k] = val;
      });
      if (Object.keys(captured).length > 0) {
        setUtm((prev) => (Object.keys(prev).length > 0 ? prev : captured));
      }
      if (document.referrer) setReferrer((prev) => prev || document.referrer);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v, utm, referrer }));
    } catch {}
  }, [v, utm, referrer]);

  const canSubmit =
    v.nombre_completo.trim() &&
    v.email.trim() &&
    v.whatsapp.trim() &&
    v.ciudad.trim() &&
    v.especialidad.trim() &&
    v.clientes_activos.trim() &&
    v.cuando_arrancas.trim() &&
    !submitting;

  const isDisqualified =
    v.especialidad === DISQUALIFY_ESPECIALIDAD || v.clientes_activos === DISQUALIFY_CLIENTES;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // Gate: consumidores / sin negocio → descarte amable SIN insertar al CRM
    // y SIN disparar el pixel Lead (para que el algoritmo de ads no aprenda de ellos)
    if (isDisqualified) {
      setDisqualified(true);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // form_variant NO es columna de pk_leads (no rompe el insert) — viaja en
      // payload jsonb y el motor de scoring lo usa para normalizar el score.
      // No usar funnel_path/source: son columnas con constraints.
      const values = { ...v, form_variant: "express" };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values, utm, referrer }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "No pudimos guardar tu información. Intenta de nuevo.");
      }
      setSubmitted(true);

      // Meta pixel — lead event
      const w = window as unknown as { fbq?: (cmd: string, event: string, data?: Record<string, unknown>) => void };
      if (typeof window !== "undefined" && w.fbq) {
        w.fbq("track", "Lead", { content_name: "Diagnostico Express", content_category: "saas-b2b" });
      }

      // TikTok pixel — SubmitForm (FORM event para optimization WEB_CONVERSIONS)
      const tw = window as unknown as { ttq?: { track: (e: string, d: Record<string, unknown>) => void } };
      if (typeof window !== "undefined" && tw.ttq) {
        tw.ttq.track("SubmitForm", {
          content_name: "Diagnostico Express",
          content_category: "saas-b2b",
          value: 0,
          currency: "MXN",
        });
      }

      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function update<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setV((prev) => ({ ...prev, [key]: val }));
  }

  if (disqualified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
        <div className="max-w-xl w-full text-center py-20">
          <h1 className="text-2xl mb-4 font-semibold text-[var(--foreground,#0A2540)]">
            Gracias por tu interés, {v.nombre_completo.split(" ")[0] || "amigo"} 🙌
          </h1>
          <p className="text-[var(--muted-foreground,#5A6573)] leading-relaxed mb-6">
            PropelKap OS es una herramienta para <strong>asesores y agentes financieros</strong> que
            ya atienden clientes — no es un servicio de asesoría de pensiones para el público.
          </p>
          <p className="text-[var(--muted-foreground,#5A6573)] leading-relaxed">
            Si lo que buscas es orientación sobre <strong>tu propia pensión IMSS</strong>, te
            recomendamos acudir a tu AFORE o a un asesor certificado en tu ciudad. ¡Mucho éxito!
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
        <div className="max-w-xl w-full text-center py-20">
          <div className="w-16 h-16 rounded-full bg-[var(--sage-light,#E8F5EC)] mx-auto mb-6 flex items-center justify-center">
            <Check className="w-8 h-8 text-[var(--sage-deep,#0A2540)]" />
          </div>
          <h1 className="text-3xl mb-4 font-semibold text-[var(--foreground,#0A2540)]">
            ¡Listo, {v.nombre_completo.split(" ")[0]}!
          </h1>
          <p className="text-[var(--muted-foreground,#5A6573)] leading-relaxed mb-6">
            Recibimos tu información. En las próximas{" "}
            <strong className="text-[var(--foreground,#0A2540)]">24 horas</strong> te
            mandamos por WhatsApp <strong>(+52 1 {v.whatsapp.slice(-10, -7)} ...)</strong> un
            plan personalizado para tu negocio: CRM, agente IA en WhatsApp y automatizaciones.
          </p>
          <p className="text-sm text-[var(--muted-foreground,#5A6573)]">
            Si quieres adelantar, puedes responder este WhatsApp:{" "}
            <a href="https://wa.me/18143348661" className="underline">
              +1 814 334 8661
            </a>
          </p>
          <p className="mt-8 text-xs text-[var(--muted-foreground,#5A6573)]">
            — Jorge Pérez, PropelKap
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background,#F5F2EA)] py-12 px-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <p className="text-xs tracking-widest uppercase text-[var(--primary-dark,#0A2540)] font-semibold mb-3">
            PropelKap OS · Diagnóstico express
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--foreground,#0A2540)] leading-tight mb-3">
            Te mandamos un plan personalizado por WhatsApp en 24 horas.
          </h1>
          <p className="text-[var(--muted-foreground,#5A6573)] leading-relaxed">
            5 datos. Sin compromiso. Para asesores financieros, agentes de seguros y promotorías que quieren automatizar con IA.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--border,#E5E2DA)] space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--foreground,#0A2540)] mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={v.nombre_completo}
              onChange={(e) => update("nombre_completo", e.target.value)}
              placeholder="Carlos Méndez"
              className="w-full px-4 py-3 rounded-lg border border-[var(--border,#E5E2DA)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-dark,#0A2540)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground,#0A2540)] mb-2">
              Correo electrónico *
            </label>
            <input
              type="email"
              required
              value={v.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="carlos@correo.com"
              className="w-full px-4 py-3 rounded-lg border border-[var(--border,#E5E2DA)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-dark,#0A2540)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground,#0A2540)] mb-2">
              WhatsApp (con +52 1) *
            </label>
            <input
              type="tel"
              required
              value={v.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              placeholder="+52 1 81 1234 5678"
              className="w-full px-4 py-3 rounded-lg border border-[var(--border,#E5E2DA)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-dark,#0A2540)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground,#0A2540)] mb-2">
              Ciudad y estado *
            </label>
            <input
              type="text"
              required
              value={v.ciudad}
              onChange={(e) => update("ciudad", e.target.value)}
              placeholder="Monterrey, Nuevo León"
              className="w-full px-4 py-3 rounded-lg border border-[var(--border,#E5E2DA)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-dark,#0A2540)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground,#0A2540)] mb-2">
              Tu especialidad *
            </label>
            <select
              required
              value={v.especialidad}
              onChange={(e) => update("especialidad", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border,#E5E2DA)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-dark,#0A2540)]"
            >
              <option value="">Selecciona…</option>
              {ESPECIALIDADES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground,#0A2540)] mb-2">
              ¿Cuántos clientes activos manejas? *
            </label>
            <select
              required
              value={v.clientes_activos}
              onChange={(e) => update("clientes_activos", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border,#E5E2DA)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-dark,#0A2540)]"
            >
              <option value="">Selecciona…</option>
              {CLIENTES_ACTIVOS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground,#0A2540)] mb-2">
              ¿Cuándo te gustaría empezar a automatizar? *
            </label>
            <select
              required
              value={v.cuando_arrancas}
              onChange={(e) => update("cuando_arrancas", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border,#E5E2DA)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-dark,#0A2540)]"
            >
              <option value="">Selecciona…</option>
              {CUANDO_ARRANCAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground,#0A2540)] mb-2">
              ¿Qué te quita más tiempo en tu día a día? <span className="text-[var(--muted-foreground,#5A6573)] font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={v.varita_magica}
              onChange={(e) => update("varita_magica", e.target.value)}
              placeholder="Ej: contestar WhatsApps a deshoras, hacer seguimiento manual a 100+ prospectos..."
              className="w-full px-4 py-3 rounded-lg border border-[var(--border,#E5E2DA)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-dark,#0A2540)] resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-4 rounded-lg bg-[var(--primary-dark,#0A2540)] text-white font-semibold text-base hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Enviando…" : "Recibir mi plan por WhatsApp"}
          </button>

          <p className="text-xs text-center text-[var(--muted-foreground,#5A6573)]">
            Sin spam. Sin tarjeta. Tus datos solo los usa Jorge (fundador) para mandarte tu plan.
          </p>
        </form>
      </div>
    </div>
  );
}
