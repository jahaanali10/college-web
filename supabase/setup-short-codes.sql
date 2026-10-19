-- College short setup codes. Run once in your existing Supabase SQL Editor.
-- Creates separate storage; does not alter college_accounts or personal records.
-- Shared setups are snapshots readable by anyone with the exact code.
begin;
create schema if not exists college_shared;
revoke all on schema college_shared from public, anon, authenticated;
create table if not exists college_shared.setup_codes (
 code text primary key check (code ~ '^[A-Z0-9][A-Z0-9_-]{3,31}$'),
 owner_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('study','timetable')),
 setup jsonb not null check(jsonb_typeof(setup)='object' and octet_length(setup::text)<=300000),
 created_at timestamptz not null default now()
);
create index if not exists setup_codes_owner_idx on college_shared.setup_codes(owner_id);
alter table college_shared.setup_codes enable row level security;
revoke all on college_shared.setup_codes from public, anon, authenticated;
create or replace function public.college_create_setup_code(chosen_code text, setup_data jsonb)
returns text language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); normalized text := upper(btrim(chosen_code)); k text;
begin
 if actor is null then raise exception 'Sign in to create a shared code.' using errcode='42501'; end if;
 if normalized is null or normalized !~ '^[A-Z0-9][A-Z0-9_-]{3,31}$' then raise exception 'Use 4–32 letters, numbers, hyphens or underscores.' using errcode='22023'; end if;
 if normalized = 'MITHIBAI-SYJC-TERM1-2026' or normalized like 'COLLEGE1-%' then raise exception 'This code is reserved. Choose another.' using errcode='22023'; end if;
 if setup_data is null or jsonb_typeof(setup_data) <> 'object' or octet_length(setup_data::text)>300000 then raise exception 'Setup is invalid or too large.' using errcode='22023'; end if;
 k := setup_data->>'kind';
 if k is null or k not in ('study','timetable') or jsonb_typeof(setup_data->'data') is distinct from 'array' then raise exception 'Invalid setup type.' using errcode='22023'; end if;
 if jsonb_array_length(setup_data->'data')<1 or jsonb_array_length(setup_data->'data')>(case when k='study' then 100 else 500 end) then raise exception 'Setup contains too many or no records.' using errcode='22023'; end if;
 -- Serialize per-account creation, so concurrent requests cannot exceed the limit.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text,0));
 if (select count(*) from college_shared.setup_codes where owner_id=actor)>=25 then raise exception 'You have reached the limit of 25 shared codes.' using errcode='22023'; end if;
 -- Store only the shared setup, never client-supplied account metadata.
 insert into college_shared.setup_codes(code,owner_id,kind,setup)
 values(normalized,actor,k,jsonb_build_object('kind',k,'name',normalized,'data',setup_data->'data'));
 return normalized;
end $$;
create or replace function public.college_get_setup_code(requested_code text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare normalized text := upper(btrim(requested_code)); result jsonb;
begin
 if normalized is null or normalized !~ '^[A-Z0-9][A-Z0-9_-]{3,31}$' then raise exception 'Invalid setup code.' using errcode='22023'; end if;
 select setup into result from college_shared.setup_codes where code=normalized;
 return result;
end $$;
revoke all on function public.college_create_setup_code(text,jsonb) from public,anon,authenticated;
revoke all on function public.college_get_setup_code(text) from public,anon,authenticated;
grant execute on function public.college_create_setup_code(text,jsonb) to authenticated;
grant execute on function public.college_get_setup_code(text) to anon,authenticated;
notify pgrst, 'reload schema';
commit;
