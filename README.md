# Ubeda Cash Control

App web de gestão de finanças pessoais (receitas, despesas, categorias, dashboard e exportação CSV).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Recharts · Supabase (Postgres + Auth + RLS).

---

## 1. Pré-requisitos

- Node.js 18.17+
- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com) (para deploy)

## 2. Criar o projeto no Supabase

1. Entre em [app.supabase.com](https://app.supabase.com) e clique em **New Project**.
2. Escolha um nome (`financas-pessoais`), senha do banco e a região mais próxima.
3. Aguarde a criação (~2 min).
4. No menu lateral, vá em **SQL Editor → New query** e cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). Clique em **Run**. Isso cria:
   - Tabelas `categories` e `transactions`
   - Row Level Security (cada usuário só vê seus próprios dados)
   - Trigger que popula categorias padrão ao cadastrar novo usuário
5. Em **Authentication → Providers**, mantenha **Email** habilitado. Para agilizar o MVP, em **Authentication → Settings** você pode desativar *Confirm email* (opcional).
6. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com os valores copiados do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 4. Rodar localmente

```bash
npm install
npm run dev
```

App disponível em [http://localhost:3000](http://localhost:3000).

Fluxo: `/signup` → crie a conta → `/dashboard`.

Scripts:

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Rodar build de produção |
| `npm run typecheck` | TypeScript sem emitir arquivos |
| `npm run lint` | ESLint |

## 5. Deploy

Suporte para **Vercel** e **Netlify**. Em ambos, adicione as duas variáveis de ambiente:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://<seu-projeto>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_...` (ou `eyJ...` no formato legado)

### 5.1 Vercel

1. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
2. **Framework Preset** detecta **Next.js** automaticamente.
3. Em **Environment Variables**, adicione as duas variáveis acima (marque Production, Preview e Development).
4. Clique em **Deploy** e aguarde (~1–2 min).

### 5.2 Netlify

O repositório já contém `netlify.toml` (build command + plugin Next.js) e `.nvmrc` (Node 20).

1. Em [app.netlify.com/start](https://app.netlify.com/start), clique em **Import an existing project** → **Deploy with GitHub** → selecione o repositório.
2. As configurações de build vêm do `netlify.toml` — não precisa mudar nada.
3. Em **Add environment variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Clique em **Deploy site**. O Netlify instala o `@netlify/plugin-nextjs` automaticamente (~2–3 min).

### 5.3 Pós-deploy (qualquer plataforma)

Copie a URL gerada (ex.: `https://ubeda-cash.netlify.app`) e em **Supabase → Authentication → URL Configuration**:

- **Site URL**: cole a URL pública
- **Redirect URLs**: adicione a URL pública e `http://localhost:3000` (para dev local)

### Notas de segurança

- **Nunca comite `.env.local`** — já está no `.gitignore`.
- As duas variáveis começam com `NEXT_PUBLIC_` porque precisam ser acessíveis no cliente (SSR + navegador via `@supabase/ssr`). A chave `anon` / `publishable` é **desenhada para ser pública**; a segurança é garantida pelas policies de **Row Level Security** do Postgres (cada usuário só enxerga `auth.uid() = user_id`).
- **Nunca use a `service_role` key neste projeto** — ela bypassa RLS e só deve ser usada em funções server-only isoladas (ex.: jobs). Este app não precisa dela.
- Se trocar sua chave publishable no Supabase, atualize a variável na plataforma de deploy e redeploye.

## 6. Estrutura

```
app/
  (app)/                   # área autenticada (layout + nav)
    dashboard/             # resumo mensal + gráfico
    transacoes/            # lista, filtros, CRUD
  auth/sign-out            # logout
  api/export               # export CSV
  login/  signup/          # telas públicas
components/
  ui/                      # shadcn/ui (Button, Card, Dialog, Select, ...)
  auth/  dashboard/  transactions/  layout/
lib/
  actions/                 # server actions (auth, transactions)
  supabase/                # clients browser/server/middleware
  format.ts  types.ts  utils.ts
middleware.ts              # protege rotas via Supabase Auth
supabase/schema.sql        # schema + RLS + seed de categorias
```

## 7. Funcionalidades (MVP)

- Autenticação via Supabase Auth (email/senha)
- CRUD de transações (valor, data, categoria, descrição, tipo)
- Filtros por período, tipo e categoria
- Dashboard: total de receitas, despesas e saldo do mês
- Gráfico de despesas por categoria (Recharts)
- Exportação CSV respeitando filtros ativos
- Responsivo (mobile-first)
- Row Level Security no Postgres (isolamento por usuário)
