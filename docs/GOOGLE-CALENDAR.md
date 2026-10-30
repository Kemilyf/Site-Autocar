# Google Calendar — configuração

## Modelo de integração
- A base de dados Supabase é a fonte oficial das marcações.
- A aplicação consulta eventos ocupados criados manualmente na agenda para bloquear horários reservados por telefone/WhatsApp.
- A aplicação cria eventos próprios identificados com extendedProperties.private.app = auto-car-viseu.
- A aplicação atualiza ou cancela os eventos que ela própria criou.
- Eventos externos apenas bloqueiam disponibilidade; não são importados como clientes nem marcações internas.
- Alterações manuais a eventos criados pela aplicação devem ser feitas preferencialmente no painel para manter a base de dados consistente.

## Criar credenciais
1. Aceda a https://console.cloud.google.com/.
2. Crie ou selecione um projeto Google Cloud.
3. Ative a Google Calendar API.
4. Configure o ecrã de consentimento OAuth.
5. Crie um OAuth Client ID do tipo Web application.
6. Adicione o URI de redirecionamento local: http://localhost:3000/api/admin/google/callback
7. Em produção, adicione também https://SEU-DOMINIO/api/admin/google/callback.
8. Copie Client ID e Client Secret para as variáveis de ambiente.
9. Defina GOOGLE_REDIRECT_URI exatamente igual ao URI autorizado.
10. Defina GOOGLE_CALENDAR_ID=primary ou indique o ID de uma agenda dedicada.
11. Gere TOKEN_ENCRYPTION_KEY com openssl rand -hex 32.

Depois de publicar as variáveis, entre como administrador em /admin e selecione Ligar Google Calendar. Autorize a conta que contém a agenda da oficina.

A aplicação utiliza o scope https://www.googleapis.com/auth/calendar.events. O refresh token é cifrado antes de ser guardado em google_calendar_connections.

## Notificações
A criação de um evento não garante, por si só, uma notificação imediata ao proprietário. Configure notificações e lembretes nas definições do Google Calendar. O painel também mostra novos pedidos pendentes.

## Teste manual
1. Crie um evento manual no Google Calendar para um horário.
2. Tente marcar esse horário pelo website; deve aparecer indisponível.
3. Faça uma marcação noutro horário; deve ser criado um evento [PENDENTE].
4. Confirme no painel; o mesmo evento deve ser atualizado para [CONFIRMADO].
5. Cancele no painel; o evento da aplicação deve ser removido.
6. Verifique google_event_id e google_sync_status no Supabase.

Se o OAuth estiver em modo de teste, adicione o e-mail do proprietário como utilizador de teste. Para disponibilização pública, reveja as exigências de verificação e publicação da aplicação Google.
