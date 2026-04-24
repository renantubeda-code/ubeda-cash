-- ============================================================
-- FinançasPessoais — Schema Supabase
-- Execute este SQL no SQL Editor do Supabase Dashboard.
-- ============================================================

-- Enum para tipo de transação
create type transaction_type as enum ('income', 'expense');

-- ============================================================
-- Tabela: categories (categorias personalizadas por usuário)
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type transaction_type not null,
  color text default '#64748b',
  created_at timestamptz not null default now(),
  unique (user_id, name, type)
);

create index if not exists categories_user_id_idx on public.categories(user_id);

alter table public.categories enable row level security;

create policy "categories_select_own"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Tabela: transactions
-- ============================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type transaction_type not null,
  amount numeric(14,2) not null check (amount > 0),
  description text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_occurred_on_idx on public.transactions(occurred_on);
create index if not exists transactions_user_date_idx on public.transactions(user_id, occurred_on desc);

alter table public.transactions enable row level security;

create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Trigger para atualizar updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- ============================================================
-- Seed: categorias padrão ao criar usuário
-- ============================================================
create or replace function public.seed_default_categories()
returns trigger language plpgsql security definer as $$
begin
  insert into public.categories (user_id, name, type, color) values
    (new.id, 'Salário',     'income',  '#16a34a'),
    (new.id, 'Freelance',   'income',  '#0ea5e9'),
    (new.id, 'Investimentos','income', '#14b8a6'),
    (new.id, 'Outros',      'income',  '#64748b'),
    (new.id, 'Alimentação', 'expense', '#ef4444'),
    (new.id, 'Transporte',  'expense', '#f97316'),
    (new.id, 'Moradia',     'expense', '#8b5cf6'),
    (new.id, 'Saúde',       'expense', '#ec4899'),
    (new.id, 'Lazer',       'expense', '#f59e0b'),
    (new.id, 'Educação',    'expense', '#3b82f6'),
    (new.id, 'Assinaturas', 'expense', '#6366f1'),
    (new.id, 'Outros',      'expense', '#64748b');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.seed_default_categories();
