begin;
-- Add customer-facing references while preserving existing UUID keys and all orders.
alter table public.orders add column order_sequence bigint generated always as identity;
alter table public.orders add column order_number text generated always as
 ('VH' || lpad(order_sequence::text, greatest(6,length(order_sequence::text)), '0')) stored;
grant usage,select on sequence public.orders_order_sequence_seq to service_role;
create unique index orders_order_number_idx on public.orders(order_number);
alter table public.orders add column tracking_token uuid not null default gen_random_uuid();
create unique index orders_tracking_token_idx on public.orders(tracking_token);
alter table public.orders add column region text not null default '';
alter table public.orders add column city text not null default '';
alter table public.orders add column street text not null default '';
alter table public.orders add column landmark text not null default '';
alter table public.orders add column digital_address text not null default '';
alter table public.orders add column email_error text;
create table public.order_customer_notifications (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 event text not null check(event in ('received','status-new','status-confirmed','status-dispatched','status-delivered','status-cancelled')),
 state text not null default 'pending' check(state in ('pending','sending','sent','failed')),
 email_id text, error text, attempted_at timestamptz,
 unique(order_id,event)
);
alter table public.order_customer_notifications enable row level security;
revoke all on public.order_customer_notifications from anon,authenticated;
grant all on public.order_customer_notifications to service_role;
create function public.claim_customer_notification(p_order_id uuid,p_event text) returns boolean
language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 insert into order_customer_notifications(order_id,event) values(p_order_id,p_event) on conflict(order_id,event) do nothing;
 update order_customer_notifications set state='sending',attempted_at=now(),error=null
 where order_id=p_order_id and event=p_event and
 (state in ('pending','failed') or (state='sending' and attempted_at < now()-interval '2 minutes'));
 get diagnostics n = row_count;
 return n=1;
end $$;
revoke all on function public.claim_customer_notification(uuid,text) from public,anon,authenticated;
grant execute on function public.claim_customer_notification(uuid,text) to service_role;
commit;
