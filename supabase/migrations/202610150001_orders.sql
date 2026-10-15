begin;
create table public.order_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), request_key uuid not null unique,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 100), phone text not null,
  email text not null default '', address text not null check (char_length(address) between 10 and 700),
  quantity integer not null check (quantity in (1,2,3)), total integer not null,
  status text not null default 'new' check (status in ('new','confirmed','dispatched','delivered','cancelled')),
  email_status text not null default 'pending' check (email_status in ('pending','sending','sent','failed')),
  email_id text, email_attempt_at timestamptz,
  check ((quantity=1 and total=490) or (quantity=2 and total=900) or (quantity=3 and total=1250))
);
create index orders_created_at_idx on public.orders(created_at desc);
create table public.order_rate_limits (key text primary key, window_start timestamptz not null, count integer not null);
alter table public.orders enable row level security;
alter table public.order_admins enable row level security;
alter table public.order_rate_limits enable row level security;
-- Only server-side Edge Functions can access customer orders.
revoke all on public.orders, public.order_admins, public.order_rate_limits from anon, authenticated;
grant all on public.orders, public.order_admins, public.order_rate_limits to service_role;
create function public.consume_order_limit(p_key text) returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
 insert into order_rate_limits(key,window_start,count) values(p_key,now(),1)
 on conflict(key) do update set
 count=case when order_rate_limits.window_start < now()-interval '10 minutes' then 1 else order_rate_limits.count+1 end,
 window_start=case when order_rate_limits.window_start < now()-interval '10 minutes' then now() else order_rate_limits.window_start end
 returning count into n;
 delete from order_rate_limits where window_start < now()-interval '1 day';
 return n<=10;
end $$;
revoke all on function public.consume_order_limit(text) from public, anon, authenticated;
grant execute on function public.consume_order_limit(text) to service_role;
create function public.claim_order_email(p_id uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
 update orders set email_status='sending',email_attempt_at=now()
 where id=p_id and (email_status in ('pending','failed') or (email_status='sending' and email_attempt_at < now()-interval '2 minutes'));
 get diagnostics n = row_count;
 return n=1;
end $$;
revoke all on function public.claim_order_email(uuid) from public, anon, authenticated;
grant execute on function public.claim_order_email(uuid) to service_role;
commit;
