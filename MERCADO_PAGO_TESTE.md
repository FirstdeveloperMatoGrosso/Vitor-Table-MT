# 🧪 Como Testar PIX com Mercado Pago

## 📋 Credenciais de Teste

O Mercado Pago oferece credenciais de teste para você testar a integração sem cobrar valores reais.

### 1. Obter Credenciais de Teste

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Clique em **"Credenciais"**
3. Selecione a aba **"Credenciais de teste"**
4. Copie o **"Access Token de teste"** (começa com `TEST-`)

### 2. Configurar no Projeto

#### Desenvolvimento Local

Crie o arquivo `.env.local` na raiz do projeto:

```env
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
```

#### Produção (Vercel)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **vitor-table-mt**
3. Vá em **Settings** > **Environment Variables**
4. Adicione:
   - **Key**: `REACT_APP_MERCADO_PAGO_ACCESS_TOKEN`
   - **Value**: `TEST-seu-token-aqui`
   - **Environment**: Production, Preview, Development
5. Clique em **Save**
6. Faça um novo deploy (ou aguarde o próximo push)

## 🧪 Testar Pagamento PIX

### 1. Gerar QR Code de Teste

1. Abra o app: https://vitor-table-mt.vercel.app
2. Clique em **"Comprar Saldo"**
3. Selecione um pacote
4. Clique em **"Comprar"**
5. O QR Code PIX será gerado automaticamente

### 2. Simular Pagamento

O Mercado Pago oferece ferramentas para simular pagamentos:

#### Opção 1: API de Teste
```bash
curl -X PUT \
  'https://api.mercadopago.com/v1/payments/PAYMENT_ID' \
  -H 'Authorization: Bearer TEST-seu-token' \
  -H 'Content-Type: application/json' \
  -d '{"status": "approved"}'
```

#### Opção 2: Painel do Desenvolvedor
1. Acesse: https://www.mercadopago.com.br/developers/panel/test-payments
2. Encontre o pagamento criado
3. Clique em **"Aprovar"** ou **"Rejeitar"**

### 3. Verificar Status

Use a função `checkPaymentStatus()` para verificar:

```javascript
import { checkPaymentStatus } from './config/mercadopago';

const status = await checkPaymentStatus(transactionId);
console.log(status);
// { status: 'approved', statusDetail: '...', amount: 50.00 }
```

## 🔄 Fluxo Completo de Teste

1. **Configurar credenciais de teste** ✅
2. **Gerar QR Code PIX** ✅
3. **Copiar ID da transação** (aparece no console)
4. **Simular pagamento** via API ou painel
5. **Verificar status** com `checkPaymentStatus()`
6. **Confirmar crédito** no sistema

## ⚠️ Importante

### Diferenças entre Teste e Produção

| Aspecto | Teste | Produção |
|---------|-------|----------|
| Token | `TEST-...` | `APP_USR-...` |
| Pagamentos | Simulados | Reais |
| Cobrança | Não | Sim |
| QR Code | Válido apenas para teste | Válido para pagamento real |

### Limitações do Modo Teste

- ✅ Gera QR Code real
- ✅ Cria transação no Mercado Pago
- ✅ Retorna todos os dados (ID, status, etc)
- ❌ Não cobra dinheiro real
- ❌ Não pode ser pago por app bancário
- ❌ Precisa ser aprovado manualmente

## 🚀 Migrar para Produção

Quando estiver pronto para aceitar pagamentos reais:

1. Obtenha credenciais de **produção**:
   - Acesse: https://www.mercadopago.com.br/developers/panel
   - Aba **"Credenciais de produção"**
   - Copie o **"Access Token"** (começa com `APP_USR-`)

2. Atualize a variável de ambiente:
   ```env
   REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-seu-token-de-producao
   ```

3. Configure webhook para receber notificações automáticas

4. Teste com um pagamento real de baixo valor

## 📚 Documentação Oficial

- **API Mercado Pago**: https://www.mercadopago.com.br/developers/pt/reference
- **PIX**: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix
- **Testes**: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing

---

**VitorTable MT - Sistema PIX Pronto para Testes!** 🎉
