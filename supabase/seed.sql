-- Serviços iniciais. Os preços ficam em branco até confirmação do proprietário.
insert into public.services(name,slug,description,category,duration_minutes,price_mode,base_price,active)
values
('Mecânica geral','mecanica-geral','Manutenção e reparação de componentes mecânicos.','Mecânica',90,'quote',null,true),
('Diagnóstico eletrónico','diagnostico-eletronico','Identificação de avarias e leitura de sistemas eletrónicos.','Diagnóstico',60,'quote',null,true),
('Ar condicionado','ar-condicionado','Verificação e manutenção do sistema de ar condicionado.','Conforto',60,'quote',null,true),
('Travões','travoes','Verificação e manutenção do sistema de travagem.','Segurança',90,'quote',null,true),
('Suspensão','suspensao','Verificação e reparação da suspensão.','Mecânica',90,'quote',null,true),
('Baterias','baterias','Verificação e substituição de baterias.','Elétrica',45,'quote',null,true),
('Pneus','pneus','Verificação, substituição e serviços relacionados com pneus.','Pneus',60,'quote',null,true),
('Troca de óleo','troca-de-oleo','Mudança de óleo e filtros de acordo com a viatura.','Manutenção',60,'quote',null,true),
('Revisões','revisoes','Manutenção periódica e revisão da viatura.','Manutenção',120,'quote',null,true)
on conflict(slug) do nothing;
