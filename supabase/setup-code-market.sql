-- Public code library. Existing exact-code shares remain unlisted by default.
-- Run after setup-short-codes.sql. Personal account records are untouched.
begin;
create table if not exists college_shared.code_listings (
 code text primary key references college_shared.setup_codes(code) on delete cascade,
 title text not null check(length(btrim(title)) between 1 and 100),
 description text not null check(length(btrim(description)) between 1 and 2000),
 published_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table college_shared.code_listings enable row level security;
revoke all on college_shared.code_listings from public,anon,authenticated;
-- Public snapshots explicitly exclude marks, completion and arbitrary metadata.
create or replace function college_shared.clean_public_setup(k text, records jsonb)
returns jsonb language sql immutable set search_path='' as $$
select coalesce(jsonb_agg(case k
 when 'study' then jsonb_build_object('id',r->'id','name',r->'name','chapters',coalesce((select jsonb_agg(jsonb_build_object('id',c->'id','title',c->'title','section',c->'section','isCompleted',false)) from jsonb_array_elements(r->'chapters') c),'[]'::jsonb))
 when 'exams' then jsonb_strip_nulls(jsonb_build_object('id',r->'id','title',r->'title','group',r->'group','subject',r->'subject','date',r->'date','start',r->'start','end',r->'end','portion',coalesce((select jsonb_agg(jsonb_build_object('id',p->'id','title',p->'title','done',false)) from jsonb_array_elements(r->'portion') p),'[]'::jsonb)))
 when 'timetable' then jsonb_build_object('id',r->'id','weekday',r->'weekday','title',r->'title','start',r->'start','end',r->'end','room',r->'room','kind',r->'kind')
 end),'[]'::jsonb) from jsonb_array_elements(records) r;
$$;
revoke all on function college_shared.clean_public_setup(text,jsonb) from public,anon,authenticated;
create or replace function public.college_publish_setup_code(requested_code text,listing_title text,listing_description text)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); normalized text:=upper(btrim(requested_code)); target college_shared.setup_codes%rowtype;
begin
 if actor is null then raise exception 'Sign in to publish a code.' using errcode='42501'; end if;
 if listing_title is null or length(btrim(listing_title)) not between 1 and 100 or listing_description is null or length(btrim(listing_description)) not between 1 and 2000 then raise exception 'Add a title of up to 100 characters and a description of up to 2000 characters.' using errcode='22023'; end if;
 select * into target from college_shared.setup_codes where code=normalized and owner_id=actor for update;
 if not found then raise exception 'Only the creator can publish or edit this code.' using errcode='42501'; end if;
 update college_shared.setup_codes set setup=jsonb_build_object('kind',target.kind,'name',normalized,'data',college_shared.clean_public_setup(target.kind,target.setup->'data')) where code=normalized;
 insert into college_shared.code_listings(code,title,description) values(normalized,btrim(listing_title),btrim(listing_description)) on conflict(code) do update set title=excluded.title,description=excluded.description,updated_at=now();
 return normalized;
end $$;
create or replace function public.college_unpublish_setup_code(requested_code text)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); normalized text:=upper(btrim(requested_code));
begin
 if actor is null or not exists(select 1 from college_shared.setup_codes where code=normalized and owner_id=actor) then raise exception 'Only the creator can unlist this code.' using errcode='42501'; end if;
 delete from college_shared.code_listings where code=normalized;
 return normalized;
end $$;
create or replace function public.college_browse_setup_codes(search_text text default '',setup_kind text default '',page_offset integer default 0)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if search_text is null or length(search_text)>120 or setup_kind is null or setup_kind not in ('','study','timetable','exams') or page_offset is null or page_offset<0 or page_offset>100000 then raise exception 'Invalid library search.' using errcode='22023'; end if;
 return coalesce((select jsonb_agg(row_to_json(r)) from (
 select l.code,l.title,l.description,s.kind,l.published_at,l.updated_at,jsonb_array_length(s.setup->'data') as record_count,coalesce(s.owner_id=auth.uid(),false) as is_owner
 from college_shared.code_listings l join college_shared.setup_codes s on s.code=l.code
 where (setup_kind='' or s.kind=setup_kind) and (btrim(search_text)='' or position(lower(btrim(search_text)) in lower(l.title||' '||l.description||' '||l.code))>0)
 order by l.published_at desc,l.code asc limit 21 offset page_offset
 ) r),'[]'::jsonb);
end $$;
revoke all on function public.college_publish_setup_code(text,text,text) from public,anon,authenticated;
revoke all on function public.college_unpublish_setup_code(text) from public,anon,authenticated;
revoke all on function public.college_browse_setup_codes(text,text,integer) from public,anon,authenticated;
grant execute on function public.college_publish_setup_code(text,text,text) to authenticated;
grant execute on function public.college_unpublish_setup_code(text) to authenticated;
grant execute on function public.college_browse_setup_codes(text,text,integer) to anon,authenticated;
notify pgrst,'reload schema';
commit;
