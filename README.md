# Cardápio digital - Cantinho do Céu

Projeto React/Vite, pensado para abertura direta por QR Code em celular.

## Rodar localmente

```bash
pnpm install
pnpm dev
```

## Publicar no Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Importe o repositório no Vercel.
3. O Vercel identifica Vite automaticamente; use `pnpm build` como comando de build e `dist` como diretório de saída.
4. Depois de ter a URL final, gere o QR Code estático apontando para ela.

## Links que ainda podem ser atualizados

Os links de WhatsApp, Instagram e Google Maps ficam no começo de `src/main.jsx`.

## Painel da equipe

Acesse `/painel`. O login usa Supabase Auth; nunca coloque senhas no código. Para a primeira conta, crie um usuário em **Authentication > Users > Add user** no projeto Supabase, com e-mail confirmado, e conceda acesso no SQL Editor usando o e-mail escolhido:

```sql
insert into public.team_members (user_id)
select id from auth.users where email = 'EMAIL_DA_EQUIPE'
on conflict (user_id) do nothing;
```

Troque `EMAIL_DA_EQUIPE` pelo e-mail da conta criada. A senha é definida no Supabase e não deve ser compartilhada em chat ou incluída no repositório. Depois, entre no painel com esse e-mail e senha. A equipe deve ativar o som no próprio painel e manter a aba aberta; ele verifica novos pedidos a cada 10 segundos. O navegador pode suspender a aba em segundo plano, especialmente em celulares.

O checkout envia pedidos reais de demonstração ao banco. O Pix não está integrado e não há confirmação de pagamento. A versão atual não tem as proteções antirrobô e limitação de pedidos planejadas para operação real; use-a apenas para demonstração.

O telefone e as partes do endereço são guardados como JSON no campo `address` da tabela existente, mantendo pedidos anteriores legíveis e evitando alterar o banco já criado. O painel interpreta os dois formatos.

## Retenção de pedidos concluídos

Para ativar no banco existente, execute uma vez no SQL Editor o conteúdo de `supabase/migrations/202611080001_retencao_pedidos.sql`. A migração registra a data de conclusão no banco e agenda uma limpeza por hora com Supabase Cron. Apenas pedidos que permaneçam concluídos por pelo menos 72 horas são apagados; pedidos em andamento ou cancelados não entram na limpeza. Pedidos já concluídos antes da ativação recebem um prazo novo de 72 horas porque sua data original de conclusão não foi registrada. Caso um pedido seja reaberto e concluído novamente, a contagem recomeça na nova conclusão.

A remoção do registro é permanente; cópias de segurança existentes têm retenção própria. A tarefa só funciona enquanto o projeto do Supabase estiver ativo e não será migrada automaticamente ao mudar para outro provedor.
