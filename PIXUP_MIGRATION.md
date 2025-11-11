# Migração para PixUP - Gateway de Pagamento

## O que foi modificado

A integração de pagamento foi completamente migrada de **PushinPay** para **PixUP**, mantendo toda a funcionalidade existente do sistema.

### Arquivos Modificados

1. **API Routes (api/)**
   - `api/create-pix.js` - Gera token OAuth2 e cria QR Code PIX via PixUP
   - `api/check-pix.js` - Consulta status de transação no Supabase
   - `api/webhook.js` - Processa webhook de confirmação de pagamento da PixUP
   - `api/lib/supabase.js` - Cliente Supabase para persistência de dados

2. **Frontend**
   - `src/hooks/useFictionalPix.ts` - Atualizado para enviar dados do usuário

3. **Banco de Dados**
   - Nova tabela `pix_transactions` criada no Supabase para armazenar transações

4. **Configuração**
   - `.env` - Adicionadas variáveis de ambiente do PixUP
   - `package.json` - Adicionada dependência `@supabase/supabase-js`

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no painel da Vercel:

```env
# Supabase (já configurado)
VITE_SUPABASE_URL=https://hrbaogkqayomnworabny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PixUP (OBRIGATÓRIO)
PIXUP_CLIENT_ID=fpfavila_3199112571709743
PIXUP_CLIENT_SECRET=bfa36d4bc75b9a282990f9ecb0db04a34dd7f2b5d97a5caf1dc2106a53598c8b
PIXUP_WEBHOOK_URL=https://paradisepag.shop/api/webhook
```

## Fluxo de Pagamento

### 1. Criação do PIX
- Usuário clica em "Adicionar Saldo"
- Frontend chama `/api/create-pix` com valor e dados do usuário
- API autentica com PixUP (OAuth2 Basic Auth)
- API cria QR Code PIX via endpoint `POST /v2/pix/qrcode`
- Transação é salva no Supabase com status `PENDING`
- QR Code é exibido ao usuário

### 2. Verificação de Status
- Frontend consulta `/api/check-pix?id={external_id}` a cada 3 segundos
- API consulta o Supabase para verificar status da transação
- Quando status muda para `PAID`, o saldo é liberado

### 3. Confirmação via Webhook
- PixUP envia POST para `https://paradisepag.shop/api/webhook`
- Webhook atualiza status da transação no Supabase para `PAID`
- Frontend detecta mudança de status e libera o saldo

## Estrutura da Tabela Supabase

```sql
CREATE TABLE pix_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE NOT NULL,
  transaction_id text,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  qrcode text,
  qrcode_image text,
  payer_name text,
  payer_document text,
  payer_email text,
  payment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Deploy na Vercel

1. **Configure as variáveis de ambiente** no painel da Vercel
2. **Deploy automático** - A Vercel detectará as mudanças e fará o deploy
3. **Verifique os logs** em caso de erro

## Webhook da PixUP

O webhook está configurado para receber notificações em:
```
https://paradisepag.shop/api/webhook
```

### Payload esperado do webhook:

```json
{
  "requestBody": {
    "transactionType": "RECEIVEPIX",
    "transactionId": "c327ce8bee2a18565ec2m1zdu6px2keu",
    "external_id": "55aefd02e54e785fbb5a80faa19f8802",
    "amount": 15.00,
    "paymentType": "PIX",
    "status": "PAID",
    "dateApproval": "2024-10-07 16:07:10",
    "creditParty": {
      "name": "Cliente Nome",
      "email": "cliente@email.com",
      "taxId": "999999999"
    }
  }
}
```

## Compatibilidade

A migração mantém **100% de compatibilidade** com o código frontend existente:

- Mesma estrutura de resposta nas APIs
- Mesmos endpoints (`/api/create-pix`, `/api/check-pix`, `/api/webhook`)
- Mesma interface do hook `useFictionalPix`
- Mesmos componentes React

## Testes

Para testar o pagamento:

1. Acesse o sistema e faça login
2. Clique em "Adicionar Saldo"
3. Escolha um valor (mínimo R$ 14,70)
4. Escaneie o QR Code com app do banco
5. Confirme o pagamento
6. O saldo será creditado automaticamente

## Logs e Debug

Os logs importantes estão nos seguintes locais:

- **Vercel Functions**: Painel da Vercel > Functions > Logs
- **Console do navegador**: Erros de frontend
- **Supabase**: Logs de queries no painel do Supabase

## Suporte

Em caso de problemas:

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Verifique os logs da Vercel
3. Verifique se o webhook está recebendo notificações
4. Verifique a tabela `pix_transactions` no Supabase
