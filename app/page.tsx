import Link from "next/link";
import { ArrowRight, Sparkles, Calendar, MessageCircle, Heart } from "lucide-react";
import { TOTAL_QUESTIONS, BLOCKS } from "@/lib/questions";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 md:pt-32">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--sage-deep)] mb-6 font-medium">
          PropelKap × Gina Brows
        </p>
        <h1 className="text-5xl md:text-6xl leading-[1.05] mb-6 font-semibold">
          Diseñemos juntas el ecosistema digital de{" "}
          <span className="text-[var(--primary-dark)]">Gina Brows</span>.
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] leading-relaxed max-w-2xl mb-10">
          Este cuestionario es la base de tu nuevo CRM, tus automatizaciones de
          WhatsApp, tu marketing por correo y todo lo que va a reemplazar a
          AgendaPro. Te tomará entre <strong className="text-[var(--foreground)]">15 y 25 minutos</strong>. Si te
          interrumpen, regresas y sigues donde lo dejaste — todo se guarda solo.
        </p>

        <Link
          href="/cuestionario"
          className="inline-flex items-center gap-2 bg-[var(--secondary)] text-[var(--foreground)] px-7 py-3.5 rounded-full font-medium hover:bg-[var(--primary)] transition-colors shadow-sm"
        >
          Empezar el cuestionario
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {BLOCKS.length} bloques · {TOTAL_QUESTIONS} preguntas · autoguardado activo
        </p>
      </section>

      <section className="bg-[var(--card)] border-y border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl mb-3 font-semibold">Lo que vamos a construir contigo</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              Con tus respuestas armamos una propuesta concreta de cómo
              migrar de AgendaPro a un sistema 100% tuyo, impulsado por IA, que
              te ahorra horas de WhatsApp cada semana y trae clientes de regreso
              sin que tengas que recordarlo tú.
            </p>
          </div>
          <ul className="space-y-4">
            <Item icon={<Calendar className="w-4 h-4" />}>
              Tu CRM con la agenda, los contactos y el historial de cada clienta
            </Item>
            <Item icon={<MessageCircle className="w-4 h-4" />}>
              Recordatorios de cita y de retoque automáticos por WhatsApp
            </Item>
            <Item icon={<Heart className="w-4 h-4" />}>
              Felicitaciones de cumpleaños y reactivación de clientas dormidas
            </Item>
            <Item icon={<Sparkles className="w-4 h-4" />}>
              Email marketing y reportes mensuales que te llegan solos
            </Item>
          </ul>
        </div>
      </section>

      <footer className="max-w-3xl mx-auto px-6 py-10 text-xs text-[var(--muted-foreground)] flex items-center justify-between">
        <span>© {new Date().getFullYear()} PropelKap</span>
        <a href="mailto:jpbriones@propelkap.com" className="hover:text-[var(--foreground)]">
          jpbriones@propelkap.com
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
