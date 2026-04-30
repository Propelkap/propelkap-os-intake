import Link from "next/link";
import { ArrowRight, Bot, MessageCircle, Sparkles, Target } from "lucide-react";
import { TOTAL_QUESTIONS, BLOCKS } from "@/lib/questions";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 md:pt-32">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--sage-deep)] mb-6 font-medium">
          PropelKap OS · Diagnóstico
        </p>
        <h1 className="text-5xl md:text-6xl leading-[1.05] mb-6 font-semibold">
          Configuremos juntos el ecosistema de{" "}
          <span className="text-[var(--primary-dark)]">tu negocio</span>.
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] leading-relaxed max-w-2xl mb-10">
          Este cuestionario es la base de tu CRM personalizado, tu agente IA
          que contesta WhatsApp por ti, tus plantillas de venta y todo el
          ecosistema que vas a recibir. Te tomará entre{" "}
          <strong className="text-[var(--foreground)]">7 y 10 minutos</strong>.
          Si te interrumpen, regresas y sigues donde lo dejaste — todo se
          guarda solo.
        </p>

        <Link
          href="/cuestionario"
          className="inline-flex items-center gap-2 bg-[var(--secondary)] text-[var(--foreground)] px-7 py-3.5 rounded-full font-medium hover:bg-[var(--primary)] transition-colors shadow-sm"
        >
          Empezar el diagnóstico
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {BLOCKS.length} bloques · {TOTAL_QUESTIONS} preguntas · autoguardado activo
        </p>
      </section>

      <section className="bg-[var(--card)] border-y border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl mb-3 font-semibold">Lo que vamos a construirte</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              Con tus respuestas armamos una propuesta a tu medida y, una vez
              que confirmes, configuramos automáticamente tu CRM personalizado
              con tu agente IA entrenado para sonar como tú, tus plantillas y
              tu pipeline. Sin que tengas que volver a explicarnos nada.
            </p>
          </div>
          <ul className="space-y-4">
            <Item icon={<Bot className="w-4 h-4" />}>
              Agente IA en WhatsApp que contesta y califica leads como tú
            </Item>
            <Item icon={<MessageCircle className="w-4 h-4" />}>
              Plantillas y scripts personalizados a tu especialidad
            </Item>
            <Item icon={<Target className="w-4 h-4" />}>
              CRM con tu pipeline y reportes mensuales automáticos
            </Item>
            <Item icon={<Sparkles className="w-4 h-4" />}>
              Llamadas de voz IA con tu voz clonada (opcional)
            </Item>
          </ul>
        </div>
      </section>

      <footer className="max-w-3xl mx-auto px-6 py-10 text-xs text-[var(--muted-foreground)] flex items-center justify-between">
        <span>© {new Date().getFullYear()} PropelKap OS</span>
        <a href="mailto:jp@propelkap.com" className="hover:text-[var(--foreground)]">
          jp@propelkap.com
        </a>
      </footer>
    </main>
  );
}

function Item({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 w-7 h-7 rounded-full bg-[var(--sage-light)] text-[var(--sage-deep)] flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="text-sm text-[var(--foreground)]">{children}</span>
    </li>
  );
}
