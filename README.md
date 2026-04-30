# PropelKap OS · Intake / Diagnóstico

Form único de diagnóstico para nuevos prospectos PropelKap OS. Captura
toda la información necesaria para:

1. Calificar el lead (scoring + bot persona)
2. Generar la propuesta auto-personalizada (Fase 7)
3. Provisionar el CRM del cliente cuando paga (Fase 9)
4. Configurar el system prompt del agente IA (Bloques 5-6)
5. Generar plantillas Día 3 + scripts Día 4 (Onboarding)
6. Setup pipeline default (Bloque 8)

**Filosofía:** el cliente llena UNA vez. Después no le preguntamos
nada hasta el Día 7 sesión 1:1.

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS + shadcn-style primitives
- Supabase (insert en `contacts` cuenta PropelKap)
- Resend (notificación a JP cuando llega lead)
- React Hook Form + zod validation
- Auto-save localStorage (cliente puede pausar y reanudar)

## Estructura

```
app/
  page.tsx              ← Landing del intake
  cuestionario/
    page.tsx            ← Wrapper Next.js
    IntakeForm.tsx      ← Form multi-step con autoguardado
  api/
    submit/route.ts     ← Submit handler → Supabase + Resend
lib/
  questions.ts          ← 9 bloques de preguntas (FUENTE DE VERDAD)
  supabase.ts           ← Cliente Supabase
```

## Bloques del cuestionario

1. Quién eres (identidad)
2. Tu negocio actual
3. Tu dolor real
4. Capacidad e intención
5. Agente IA · cómo debe SONAR como tú
6. Agente IA · cómo debe NEGOCIAR
7. Tu producto/servicio
8. Tu pipeline de venta
9. Cómo nos conociste

## Deploy

URL productiva: `diagnostico.propelkap.com` (CNAME → Vercel)

## Setup local

```bash
cp .env.example .env.local
# editar SUPABASE_URL, SUPABASE_ANON_KEY, RESEND_API_KEY
npm install
npm run dev
```

## Migración a producción

1. Crear proyecto Vercel `propelkap-os-intake` (team `jpbriones-3057s-projects`)
2. Conectar repo GitHub
3. Setear env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`
4. Deploy
5. DNS CNAME `diagnostico.propelkap.com` → Vercel

## Origen

Repo clonado de `gina-brows-intake` 30-abr-2026. Mismo patrón, distinto
cuestionario y branding.
