-- Auto Car Viseu — esquema inicial PostgreSQL / Supabase
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null, email text not null, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null, phone text not null, email text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists customers_phone_idx on public.customers(phone);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  registration text, make text, model text, year integer, engine text, fuel text, mileage integer,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists vehicles_customer_idx on public.vehicles(customer_id);
create index if not exists vehicles_registration_idx on public.vehicles(lower(registration)) where registration is not null;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, description text not null default '',
  category text not null default 'Manutenção',
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 720),
  price_mode text not null default 'quote' check (price_mode in ('fixed','estimate','quote')),
  base_price numeric(12,2) check (base_price is null or base_price >= 0),
  price_includes_vat boolean not null default false,
  vat_rate numeric(5,2) not null default 23 check (vat_rate between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.service_components (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  name text not null, component_type text not null check (component_type in ('part','material','labour','extra')),
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists service_components_service_idx on public.service_components(service_id);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  service_id uuid not null references public.services(id) on delete restrict,
  problem_description text, estimated_total numeric(12,2), workshop_quote numeric(12,2),
  currency char(3) not null default 'EUR',
  status text not null default 'received' check (status in ('received','under_review','sent','accepted','rejected','cancelled')),
  valid_until date, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  description text not null, quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0, subtotal numeric(12,2) not null default 0,
  vat_rate numeric(5,2) not null default 0, created_at timestamptz not null default now()
);
create index if not exists estimate_items_estimate_idx on public.estimate_items(estimate_id);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  service_id uuid not null references public.services(id) on delete restrict,
  start_at timestamptz not null, end_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected','cancelled','in_progress','completed')),
  notes text, google_event_id text unique,
  google_sync_status text not null default 'pending' check (google_sync_status in ('pending','synced','failed','not_configured')),
  google_sync_error text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint appointment_valid_interval check (end_at > start_at)
);
create index if not exists appointments_interval_idx on public.appointments(start_at,end_at);
create index if not exists appointments_status_idx on public.appointments(status);

create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null unique check (day_of_week between 0 and 6),
  is_open boolean not null default false,
  open_time time, close_time time, break_start time, break_end time,
  updated_at timestamptz not null default now(),
  constraint business_hours_valid check ((not is_open) or (open_time is not null and close_time is not null and close_time > open_time))
);
create table if not exists public.calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null, end_at timestamptz not null, reason text,
  created_by uuid references public.admin_users(id), created_at timestamptz not null default now(),
  constraint calendar_block_valid check (end_at > start_at)
);
create table if not exists public.business_settings (
  id integer primary key default 1 check (id = 1),
  capacity integer not null default 1 check (capacity between 1 and 50),
  currency char(3) not null default 'EUR',
  timezone text not null default 'Europe/Lisbon',
  updated_at timestamptz not null default now()
);
insert into public.business_settings(id) values (1) on conflict (id) do nothing;

create table if not exists public.google_calendar_connections (
  id integer primary key default 1 check (id = 1),
  calendar_id text not null default 'primary', connected_email text,
  encrypted_refresh_token text not null, connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.appointment_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  old_status text, new_status text not null, changed_by uuid references public.admin_users(id),
  note text, created_at timestamptz not null default now()
);
create table if not exists public.estimate_history (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  old_status text, new_status text not null, changed_by uuid references public.admin_users(id),
  note text, created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['admin_users','customers','vehicles','services','service_components','estimates','appointments','business_hours','business_settings','google_calendar_connections'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Registo transacional. O lock da configuração serializa pedidos concorrentes.
create or replace function public.create_public_appointment(
  p_name text, p_phone text, p_email text, p_registration text, p_make text, p_model text,
  p_year integer, p_service_id uuid, p_start_at timestamptz, p_notes text
)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_customer_id uuid;
  v_vehicle_id uuid;
  v_end_at timestamptz;
  v_capacity integer;
  v_busy integer;
  v_appointment public.appointments%rowtype;
begin
  select * into v_service from public.services where id = p_service_id and active = true;
  if not found then raise exception 'SERVICE_UNAVAILABLE'; end if;
  if p_start_at <= now() then raise exception 'DATE_IN_PAST'; end if;
  v_end_at := p_start_at + make_interval(mins => v_service.duration_minutes);

  select capacity into v_capacity from public.business_settings where id = 1 for update;
  if v_capacity is null then v_capacity := 1; end if;
  select count(*) into v_busy from public.appointments a
    where a.status in ('pending','confirmed','in_progress')
      and a.start_at < v_end_at and a.end_at > p_start_at;
  if v_busy >= v_capacity then raise exception 'SLOT_UNAVAILABLE'; end if;

  select id into v_customer_id from public.customers
    where phone = trim(p_phone) order by created_at desc limit 1;
  if v_customer_id is null then
    insert into public.customers(name,phone,email)
      values (trim(p_name),trim(p_phone),nullif(trim(coalesce(p_email,'')),'')) returning id into v_customer_id;
  else
    update public.customers set name=trim(p_name),
      email=coalesce(nullif(trim(coalesce(p_email,'')),''),email) where id=v_customer_id;
  end if;

  if nullif(trim(coalesce(p_registration,'')),'') is not null then
    select id into v_vehicle_id from public.vehicles
      where lower(registration)=lower(trim(p_registration)) and customer_id=v_customer_id
      order by created_at desc limit 1;
    if v_vehicle_id is null then
      insert into public.vehicles(customer_id,registration,make,model,year)
        values(v_customer_id,upper(trim(p_registration)),nullif(trim(coalesce(p_make,'')),''),nullif(trim(coalesce(p_model,'')),''),p_year)
        returning id into v_vehicle_id;
    else
      update public.vehicles set make=coalesce(nullif(trim(coalesce(p_make,'')),''),make),
        model=coalesce(nullif(trim(coalesce(p_model,'')),''),model), year=coalesce(p_year,year)
        where id=v_vehicle_id;
    end if;
  end if;

  insert into public.appointments(customer_id,vehicle_id,service_id,start_at,end_at,status,notes)
    values(v_customer_id,v_vehicle_id,p_service_id,p_start_at,v_end_at,'pending',nullif(trim(coalesce(p_notes,'')),''))
    returning * into v_appointment;
  insert into public.appointment_history(appointment_id,old_status,new_status,note)
    values(v_appointment.id,null,'pending','Solicitação recebida pelo website');
  return to_jsonb(v_appointment);
end;
$$;

revoke all on function public.create_public_appointment(text,text,text,text,text,text,integer,uuid,timestamptz,text) from public, anon, authenticated;
grant execute on function public.create_public_appointment(text,text,text,text,text,text,integer,uuid,timestamptz,text) to service_role;

alter table public.admin_users enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.services enable row level security;
alter table public.service_components enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_items enable row level security;
alter table public.appointments enable row level security;
alter table public.business_hours enable row level security;
alter table public.calendar_blocks enable row level security;
alter table public.business_settings enable row level security;
alter table public.google_calendar_connections enable row level security;
alter table public.appointment_history enable row level security;
alter table public.estimate_history enable row level security;

drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services" on public.services for select to anon, authenticated using (active = true);
drop policy if exists "Admins can read own profile" on public.admin_users;
create policy "Admins can read own profile" on public.admin_users for select to authenticated using (auth_user_id = auth.uid());

-- Sem políticas de escrita pública. O backend usa service role apenas após validação.
