-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

-- Création de la table entries
create table if not exists
  entries (
    id bigint generated by default as identity primary key,
    date date not null,
    start_time time not null,
    end_time time not null,
    type text not null check (
      type in ('delegation', 'chsct', 'reunion')
    ),
    comment text default '',
    hours numeric(5, 2) not null,
    created_at timestamp with time zone default timezone ('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone ('utc'::text, now()) not null,
    check (start_time < end_time),
    check (hours = extract(epoch from (end_time - start_time)) / 3600.0)
  );

-- Trigger pour mettre à jour updated_at
create or replace function handle_updated_at() returns trigger as $$
begin
  new.updated_at = CURRENT_TIMESTAMP;
  return new;
end;
$$ language plpgsql;

create trigger entries_updated_at
before update on entries
for each row
execute procedure handle_updated_at();

-- Activer RLS
alter table entries enable row level security;

-- Politiques d'accès anonymes pour le développement
create policy "Allow anonymous access" on entries
  for select
  using (true);

create policy "Allow anonymous writes" on entries
  for insert
  with check (true);
