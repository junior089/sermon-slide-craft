-- Visio Divina — esquema inicial (decks por usuário).
-- Rode no Supabase: Dashboard → SQL Editor → cole e execute.
-- Seguro de rodar mais de uma vez (idempotente).

-- Tabela de decks. O conteúdo completo do deck é guardado em JSONB para
-- espelhar o modelo do app (SlideDeck) sem normalizar slide a slide.
create table if not exists public.decks (
  -- Usa o id do deck gerado pelo app (ex.: "deck-1718900000000").
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Mensagem',
  -- Documento completo do SlideDeck (inclui slides, settings, template, etc.).
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists decks_user_id_updated_at_idx
  on public.decks (user_id, updated_at desc);

-- Row Level Security: cada usuário só enxerga e altera os próprios decks.
alter table public.decks enable row level security;

drop policy if exists "decks_select_own" on public.decks;
create policy "decks_select_own" on public.decks
  for select using (auth.uid() = user_id);

drop policy if exists "decks_insert_own" on public.decks;
create policy "decks_insert_own" on public.decks
  for insert with check (auth.uid() = user_id);

drop policy if exists "decks_update_own" on public.decks;
create policy "decks_update_own" on public.decks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "decks_delete_own" on public.decks;
create policy "decks_delete_own" on public.decks
  for delete using (auth.uid() = user_id);

-- Mantém updated_at em dia.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists decks_set_updated_at on public.decks;
create trigger decks_set_updated_at
  before update on public.decks
  for each row execute function public.set_updated_at();
