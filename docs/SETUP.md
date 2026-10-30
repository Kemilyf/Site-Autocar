# Configuração do sistema

## 1. Supabase
1. Crie um projeto em https://supabase.com/.
2. Em Project Settings > API, copie a Project URL, a chave anon/publishable e a chave service_role.
3. Coloque os valores no .env.local localmente e nas variáveis de ambiente do alojamento.
4. No SQL Editor execute, por esta ordem:
   - supabase/migrations/001_initial_schema.sql
   - supabase/seed.sql
   - supabase/migrations/002_privacy_fields.sql

A chave service_role ignora RLS. Deve existir apenas no servidor e nunca ser prefixada com NEXT_PUBLIC_.

## 2. Criar o primeiro administrador
1. No Supabase, abra Authentication > Users.
2. Crie o utilizador com o e-mail do proprietário ou administrador.
3. Copie o UUID do utilizador.
4. No SQL Editor execute, substituindo os dois valores:

    insert into public.admin_users(auth_user_id,name,email)
    values ('UUID_DO_AUTH_USER','Administrador Auto Car','EMAIL_DO_ADMIN');

O utilizador poderá entrar em /admin/login. Não existe registo público de administradores.

## 3. Horário e capacidade
Depois de entrar no painel /admin, configure os dias e horas de funcionamento. O website não apresenta horários enquanto a oficina não tiver configurado o horário.
A capacidade inicial é 1 atendimento simultâneo. Ajuste public.business_settings.capacity apenas depois de confirmar a capacidade real da oficina.
O fuso horário é Europe/Lisbon.

## 4. Preços e serviços
Os serviços iniciais estão configurados como Sob orçamento porque a oficina ainda não forneceu preços. No painel, configure preço base, modo de preço, duração e informação de IVA.
Os cálculos incluem a taxa de IVA configurada para cada serviço. Confirme a taxa e se os valores inseridos incluem IVA com a oficina/contabilista antes da utilização comercial.

## 5. Variáveis de ambiente
Consulte .env.example. Gere a chave de encriptação com:

    openssl rand -hex 32

O valor deve ter 64 caracteres hexadecimais. Não reutilize a chave noutro projeto e nunca a envie para o GitHub.

## 6. Execução local

    npm install
    npm run typecheck
    npm run lint
    npm run build
    npm run dev

Abra http://localhost:3000.
