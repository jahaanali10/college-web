begin;
create schema if not exists college_social;
revoke all on schema college_social from public, anon, authenticated;
create table if not exists college_social.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 code text unique not null default upper(left(replace(gen_random_uuid()::text,'-',''),16)),
 sharing boolean not null default false
);
create table if not exists college_social.requests (
 id uuid primary key default gen_random_uuid(),
 sender uuid not null references college_social.profiles(id) on delete cascade,
 recipient uuid not null references college_social.profiles(id) on delete cascade,
 accepted boolean not null default false,
 check(sender<>recipient)
);
create unique index if not exists college_friend_pair on college_social.requests(least(sender,recipient),greatest(sender,recipient));
alter table college_social.profiles enable row level security;
alter table college_social.requests enable row level security;
revoke all on college_social.profiles,college_social.requests from public,anon,authenticated;

create or replace function public.college_friends(action text, target text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); peer uuid; changed uuid; profile college_social.profiles%rowtype;
begin
 if actor is null then raise exception 'Sign in to use Friends.' using errcode='42501'; end if;
 insert into college_social.profiles(id) values(actor) on conflict(id) do nothing;
 if action='send' then
  select id into peer from college_social.profiles where code=upper(btrim(target));
  if peer is null then raise exception 'Friend code not found. Ask them to open Friends first.'; end if;
  if peer=actor then raise exception 'That is your own friend code.'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text,1));
  if (select count(*) from college_social.requests where sender=actor and not accepted)>=25 then raise exception 'Cancel a pending request before sending more.'; end if;
  insert into college_social.requests(sender,recipient) values(actor,peer) on conflict do nothing returning id into changed;
  if changed is null then raise exception 'You already have a request or friendship with this person.'; end if;
 elsif action='accept' then
  update college_social.requests set accepted=true where id::text=target and recipient=actor and not accepted returning id into changed;
  if changed is null then raise exception 'This request is no longer available.'; end if;
 elsif action in ('decline','cancel','remove') then
  delete from college_social.requests where id::text=target and (
   (action='decline' and recipient=actor and not accepted) or
   (action='cancel' and sender=actor and not accepted) or
   (action='remove' and accepted and actor in(sender,recipient))
  ) returning id into changed;
  if changed is null then raise exception 'This connection is no longer available.'; end if;
 elsif action in ('share-on','share-off') then
  update college_social.profiles set sharing=(action='share-on') where id=actor;
 elsif action is distinct from 'list' then raise exception 'Unknown friends action.';
 end if;
 select * into profile from college_social.profiles where id=actor;
 return jsonb_build_object('code',profile.code,'sharing',profile.sharing,'connections',coalesce((
  select jsonb_agg(jsonb_build_object('id',r.id,'name',coalesce(nullif(left(btrim(u.raw_user_meta_data->>'display_name'),80),''),'Student '||right(p.code,4)),
   'status',case when r.accepted then 'friend' when r.sender=actor then 'outgoing' else 'incoming' end,
   'progress',case when r.accepted and p.sharing then (
    select coalesce(jsonb_agg(jsonb_build_object('subject',left(s->>'name',500),'total',jsonb_array_length(ch.items),'done',(
     select count(*) from jsonb_array_elements(ch.items) c where c->'isCompleted'='true'::jsonb
    ))),'[]'::jsonb)
    from public.college_accounts a
    cross join lateral jsonb_array_elements(case when jsonb_typeof(a.app_state->'subjects')='array' then a.app_state->'subjects' else '[]'::jsonb end) s
    cross join lateral (select case when jsonb_typeof(s->'chapters')='array' then s->'chapters' else '[]'::jsonb end as items) ch
    where a.user_id=p.id
   ) else null end))
  from college_social.requests r
  join college_social.profiles p on p.id=case when r.sender=actor then r.recipient else r.sender end
  join auth.users u on u.id=p.id
  where actor in(r.sender,r.recipient)
 ),'[]'::jsonb));
end $$;
revoke all on function public.college_friends(text,text) from public,anon,authenticated;
grant execute on function public.college_friends(text,text) to authenticated;
notify pgrst,'reload schema';
commit;
