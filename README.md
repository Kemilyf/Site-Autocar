# Auto Car Serviços Viseu

Aplicação web para apresentação da oficina, simulação de orçamentos e gestão de marcações.

## Tecnologias
- Next.js App Router, React e TypeScript
- CSS responsivo próprio
- Supabase Auth e PostgreSQL
- Google Calendar API com OAuth 2.0
- Zod para validação

## Desenvolvimento local
1. Instale Node.js 20 ou superior.
2. Execute npm install.
3. Copie .env.example para .env.local e preencha as credenciais Supabase.
4. Crie um projeto Supabase e execute supabase/migrations/001_initial_schema.sql.
5. Execute supabase/seed.sql e depois supabase/migrations/002_privacy_fields.sql.
6. Crie o utilizador administrador no Supabase Auth e associe-o à tabela admin_users (consulte docs/SETUP.md).
7. Configure o Google Calendar conforme docs/GOOGLE-CALENDAR.md.
8. Execute npm run dev e abra http://localhost:3000.

## Arquitetura da agenda
O Supabase/PostgreSQL é a fonte oficial das marcações. A aplicação consulta eventos externos ocupados no Google Calendar e cria/atualiza os eventos gerados pelo website. Eventos manuais criados pelo proprietário bloqueiam horários, mas não são importados como clientes ou marcações da aplicação.

## Configuração comercial
Preços, IVA, morada completa e horários devem ser confirmados pelo proprietário. Os serviços iniciais estão sem preço e aparecem como sob orçamento. Não publique estimativas comerciais antes de configurar os preços reais.

## Segurança
Nunca publique .env.local, tokens OAuth ou a chave service role. A chave service role é usada exclusivamente no servidor. O ficheiro .gitignore exclui variáveis locais.

## Publicação
O projeto utiliza funcionalidades server-side do Next.js, pelo que GitHub Pages não é suficiente para executar a aplicação. Utilize uma plataforma com suporte a Next.js, como Vercel, e configure nela as variáveis de ambiente. O domínio de produção também deve ser adicionado aos URIs autorizados do OAuth Google.
