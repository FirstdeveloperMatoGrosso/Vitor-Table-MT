# Configuração do Mercado Pago para Geração de QR Code PIX

## 📋 Pré-requisitos
1. Conta ativa no Mercado Pago (https://www.mercadopago.com.br)
2. Acesso ao painel de desenvolvedor

## 🔑 Obter Credenciais

### 1. Access Token
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Clique em "Credenciais"
3. Copie o "Access Token" (começa com "APP_USR-")

### 2. User ID (Opcional)
1. No mesmo painel, você encontrará seu "User ID"
2. Copie este valor

### 3. Chave PIX (Opcional)
1. Acesse: https://www.mercadopago.com.br/settings/account/pix
2. Clique em "Adicionar chave PIX"
3. Selecione "Chave aleatória" ou use CPF/CNPJ
4. Copie a chave gerada

## 🔧 Configurar no Projeto

### Opção 1: Variáveis de Ambiente (Recomendado)

#### Desenvolvimento Local
1. Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Edite `.env.local` e adicione suas credenciais:
```env
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_MERCADO_PAGO_USER_ID=123456789
REACT_APP_MERCADO_PAGO_PIX_KEY=seu-email@exemplo.com
```

#### Produção (Vercel)
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione as variáveis:
   - `REACT_APP_MERCADO_PAGO_ACCESS_TOKEN`
   - `REACT_APP_MERCADO_PAGO_USER_ID`
   - `REACT_APP_MERCADO_PAGO_PIX_KEY`
5. Clique em "Save"
6. Faça um novo deploy

### Opção 2: Hardcode (Não Recomendado)
Edite `src/config/mercadopago.js` diretamente (não seguro)

## 🧪 Testar Integração

### 1. Modo Sandbox (Teste)
Para testar sem cobrar, use credenciais de teste:
- Access Token de teste: `APP_TEST_xxxxxxxxxxxxxxxxxxxx`
- Disponível em: https://www.mercadopago.com.br/developers/panel

### 2. Fluxo de Teste
1. Clique em "Comprar Saldo"
2. Selecione um pacote
3. Clique em "Comprar"
4. Clique em "Gerar QR Code PIX"
5. O QR Code será gerado e exibido

## 📱 Fluxo de Pagamento Real

1. **Geração do QR Code**
   - Clique em "Gerar QR Code PIX"
   - Sistema faz requisição ao Mercado Pago
   - QR Code é exibido em tempo real

2. **Pagamento**
   - Cliente escaneia o QR Code
   - Faz o pagamento via PIX
   - Mercado Pago confirma o pagamento

3. **Confirmação**
   - Ficha de crédito é gerada
   - Dados são salvos no sistema
   - Opção de imprimir ficha

## 🔔 Webhook (Opcional)

Para receber notificações de pagamento:

1. Configure a URL no painel do Mercado Pago
2. Implemente endpoint em seu backend para processar webhooks
3. Atualize o status do pagamento em tempo real

## ⚠️ Segurança

- **Nunca** compartilhe seu Access Token
- Use variáveis de ambiente em produção
- Armazene credenciais com segurança
- Valide todas as requisições do Mercado Pago

## 📞 Suporte

- Documentação: https://www.mercadopago.com.br/developers/pt/docs
- Comunidade: https://www.mercadopago.com.br/developers/community

---

**VitorTable MT - Sistema de Pagamento PIX Integrado!** ✅
