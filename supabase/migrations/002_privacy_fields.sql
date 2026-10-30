-- Registo da versão do aviso de privacidade aceite no envio de pedidos.
alter table public.appointments add column if not exists privacy_accepted_at timestamptz;
alter table public.appointments add column if not exists privacy_policy_version text;
alter table public.estimates add column if not exists privacy_accepted_at timestamptz;
alter table public.estimates add column if not exists privacy_policy_version text;
