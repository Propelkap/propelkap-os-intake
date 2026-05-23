"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Save } from "lucide-react";
import { BLOCKS, TOTAL_QUESTIONS, type Question } from "@/lib/questions";
import { trackMetaLead } from "../MetaPixel";

type FormValues = Record<string, string | string[]>;

const STORAGE_KEY = "gina-brows-intake-v1";

function isQuestionVisible(q: Question, values: FormValues): boolean {
  if (!q.showIf) return true;
  const dep = values[q.showIf.id];
  if (q.showIf.equals !== undefined) return dep === q.showIf.equals;
  if (q.showIf.includes !== undefined) {
    if (Array.isArray(dep)) return dep.some((v) => v.includes(q.showIf!.includes!));
    if (typeof dep === "string") return dep.includes(q.showIf.includes);
    return false;
  }
  return true;
}

function visibleQuestions(blockIdx: number, values: FormValues): Question[] {
  return BLOCKS[blockIdx].questions.filter((q) => isQuestionVisible(q, values));
}

function isAnswered(q: Question, values: FormValues): boolean {
  const v = values[q.id];
  if (Array.isArray(v)) return v.length > 0;
  return typeof v === "string" && v.trim().length > 0;
}

export default function IntakeForm() {
  const [values, setValues] = useState<FormValues>({});
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.values) setValues(parsed.values);
        if (typeof parsed.step === "number") setStep(parsed.step);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ values, step, updatedAt: Date.now() })
      );
      setSavedAt(new Date());
    } catch {}
  }, [values, step, hydrated]);

  const totalSteps = BLOCKS.length;
  const block = BLOCKS[step];
  const qs = useMemo(() => visibleQuestions(step, values), [step, values]);

  const answeredCount = useMemo(() => {
    let n = 0;
    BLOCKS.forEach((b) => {
      b.questions.forEach((q) => {
        if (isQuestionVisible(q, values) && isAnswered(q, values)) n++;
      });
    });
    return n;
  }, [values]);

  const overallPct = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);

  const requiredMissing = qs.filter((q) => q.required && !isAnswered(q, values));
  const canAdvance = requiredMissing.length === 0;
  const isLast = step === totalSteps - 1;

  const update = (id: string, v: string | string[]) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const goNext = () => {
    if (!canAdvance) return;
    if (isLast) return submit();
    setStep((s) => Math.min(totalSteps - 1, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goPrev = () => {
    setStep((s) => Math.max(0, s - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "No pudimos guardar tus respuestas. Intenta de nuevo.");
      }
      setSubmitted(true);
      trackMetaLead({ content_name: "PropelKap OS Intake", content_category: "saas-b2b" });
      // TikTok pixel — dispara FORM event para optimization de campañas WEB_CONVERSIONS
      if (typeof window !== "undefined") {
        const w = window as unknown as { ttq?: { track: (event: string, data: Record<string, unknown>) => void } };
        if (w.ttq) {
          w.ttq.track("SubmitForm", {
            content_name: "PropelKap OS Intake",
            content_category: "saas-b2b",
            value: 0,
            currency: "MXN",
          });
        }
      }
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    } catch (e) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-muted-foreground">Cargando…</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-[var(--sage-light)] mx-auto mb-6 flex items-center justify-center">
          <Check className="w-7 h-7 text-[var(--sage-deep)]" />
        </div>
        <h1 className="text-3xl mb-3 font-semibold">¡Listo!</h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Recibimos tus respuestas. En las próximas <strong className="text-[var(--foreground)]">24-48 horas</strong> te
          mando un diagnóstico personalizado por WhatsApp con la propuesta concreta para tu negocio:
          CRM personalizado, agente IA, landing y plan de implementación en 7 días.
        </p>
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">
          — Jorge Pérez, PropelKap
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 md:py-16">
      {/* Top progress */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between text-xs uppercase tracking-[0.22em] text-[var(--sage-deep)] mb-3 font-medium">
          <span>Bloque {block.index} de {totalSteps}</span>
          <span>{overallPct}% completado</span>
        </div>
        <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-[width] duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      <header className="mb-8">
        <h2 className="text-3xl md:text-4xl mb-2 font-semibold">{block.title}</h2>
        <p className="text-[var(--muted-foreground)]">{block.subtitle}</p>
      </header>

      <div className="space-y-7">
        {qs.map((q) => (
          <Field
            key={q.id}
            q={q}
            value={values[q.id]}
            onChange={(v) => update(q.id, v)}
          />
        ))}
      </div>

      {submitError && (
        <div className="mt-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {submitError}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
          <Save className="w-3 h-3" />
          {savedAt ? "Guardado automáticamente" : "Tus respuestas se guardan solas"}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!canAdvance || submitting}
          className="inline-flex items-center gap-2 bg-[var(--secondary)] text-[var(--foreground)] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {submitting ? "Enviando…" : isLast ? "Enviar respuestas" : "Siguiente"}
          {!submitting && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {!canAdvance && (
        <p className="mt-4 text-xs text-[var(--muted-foreground)] text-right">
          Completa los campos marcados con * para continuar.
        </p>
      )}
    </div>
  );
}

function Field({
  q,
  value,
  onChange,
}: {
  q: Question;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  const id = `f-${q.id}`;
  const v = value ?? (q.type === "multi" ? [] : "");

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {q.label}
        {q.required && <span className="text-[var(--primary-dark)] ml-1">*</span>}
      </label>
      {q.help && (
        <p className="text-xs text-[var(--muted-foreground)] mb-2">{q.help}</p>
      )}

      {(q.type === "short" || q.type === "email" || q.type === "tel" ||
        q.type === "number" || q.type === "url" || q.type === "date" ||
        q.type === "currency") && (
        <input
          id={id}
          type={
            q.type === "email" ? "email" :
            q.type === "tel" ? "tel" :
            q.type === "number" || q.type === "currency" ? "number" :
            q.type === "url" ? "url" :
            q.type === "date" ? "date" : "text"
          }
          inputMode={q.type === "currency" || q.type === "number" ? "decimal" : undefined}
          placeholder={q.placeholder}
          value={typeof v === "string" ? v : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {q.type === "long" && (
        <textarea
          id={id}
          placeholder={q.placeholder}
          value={typeof v === "string" ? v : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {q.type === "single" && q.options && (
        <div className="grid gap-2">
          {q.options.map((opt) => {
            const checked = v === opt;
            return (
              <label
                key={opt}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                  checked
                    ? "border-[var(--primary)] bg-[var(--secondary)]/35"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--muted)]"
                }`}
              >
                <input
                  type="radio"
                  name={id}
                  value={opt}
                  checked={checked}
                  onChange={() => onChange(opt)}
                  className="accent-[var(--primary-dark)]"
                />
                <span className="text-sm">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {q.type === "multi" && q.options && (
        <div className="grid gap-2">
          {q.options.map((opt) => {
            const arr = Array.isArray(v) ? v : [];
            const checked = arr.includes(opt);
            return (
              <label
                key={opt}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                  checked
                    ? "border-[var(--primary)] bg-[var(--secondary)]/35"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--muted)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? arr.filter((x) => x !== opt) : [...arr, opt];
                    onChange(next);
                  }}
                  className="accent-[var(--primary-dark)]"
                />
                <span className="text-sm">{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
