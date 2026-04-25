-- Enable pgvector
create extension if not exists vector;

-- Users
create table if not exists users (
  id             uuid primary key default gen_random_uuid(),
  telegram_id    bigint unique not null,
  username       text,
  first_name     text,
  last_name      text,
  language_code  text,
  alphabet       text check (alphabet in ('latin', 'cyrillic', 'unknown')) default 'unknown',
  is_premium     boolean not null default false,
  is_banned      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table users enable row level security;

-- Conversations
create table if not exists conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table conversations enable row level security;

-- Messages (full audit log)
create table if not exists messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  user_id          uuid not null references users(id) on delete cascade,
  role             text not null check (role in ('user', 'assistant', 'system')),
  content          text not null,
  content_type     text not null default 'text' check (content_type in ('text', 'voice', 'document', 'photo')),
  model_used       text,
  tokens_in        integer,
  tokens_out       integer,
  latency_ms       integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table messages enable row level security;

-- Daily usage tracking (rate limiting)
create table if not exists usage_daily (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  date            date not null default current_date,
  message_count   integer not null default 0,
  voice_seconds   integer not null default 0,
  document_count  integer not null default 0,
  tokens_total    integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, date)
);

alter table usage_daily enable row level security;

-- Knowledge base for Azerbaijani context (RAG)
create table if not exists knowledge_chunks (
  id          uuid primary key default gen_random_uuid(),
  source      text not null,
  content     text not null,
  embedding   vector(1536),
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table knowledge_chunks enable row level security;

create index if not exists knowledge_chunks_embedding_idx
  on knowledge_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at before update on users
  for each row execute function update_updated_at();
create trigger conversations_updated_at before update on conversations
  for each row execute function update_updated_at();
create trigger messages_updated_at before update on messages
  for each row execute function update_updated_at();
create trigger usage_daily_updated_at before update on usage_daily
  for each row execute function update_updated_at();
create trigger knowledge_chunks_updated_at before update on knowledge_chunks
  for each row execute function update_updated_at();
