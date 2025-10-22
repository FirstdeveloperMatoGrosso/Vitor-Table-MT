# Configuração do Mercado Pago para Geração de QR Code PIX

## 📋 Pré-requisitos
1. Conta ativa no Mercado Pago (https://www.mercadopago.com.br)
2. Acesso ao painel de desenvolvedor

## 🔑 Obter Credenciais

### 1. Access Token
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Clique em "Credenciais"
3. Copie o "Access Token" (começa com "APP_")

### 2. User ID
1. No mesmo painel, você encontrará seu "User ID"
2. Copie este valor

### 3. Chave PIX
1. Acesse: https://www.mercadopago.com.br/settings/account/pix
2. Clique em "Adicionar chave PIX"
3. Selecione "Chave aleatória" ou use CPF/CNPJ
4. Copie a chave gerada

## 🔧 Configurar no Projeto

### 1. Abra o arquivo de configuração
```
src/config/mercadopago.js
```

### 2. Substitua as credenciais
```javascript
export const MERCADO_PAGO_CONFIG = {
  ACCESS_TOKEN: 'APP_xxxxxxxxxxxxxxxxxxxx', // Seu Access Token
  USER_ID: '123456789',                      // Seu User ID
  PIX_KEY: 'xxx@xxx.com.br',                 // Sua chave PIX
  API_URL: 'https://api.mercadopago.com/v1',
  PAYMENT_CONFIG: {
    description: 'Compra de Saldo - VitorTable MT',
    notification_url: 'https://seu-dominio.com/webhook/mercadopago'
  }
};
```

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
