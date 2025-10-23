# 🔥 Como Gerar PIX REAL no Localhost

## 🎯 Objetivo
Gerar QR Code PIX real (não mock) durante o desenvolvimento local.

## 📋 Pré-requisitos

### 1. Obter Credenciais de Teste
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Clique em **"Credenciais"**
3. Selecione aba **"Credenciais de teste"**
4. Copie o **"Access Token de teste"** (começa com `TEST-`)

## 🔧 Configuração

### Passo 1: Criar arquivo .env.local
```powershell
# Na pasta do projeto
copy .env.local.example .env.local
```

### Passo 2: Editar .env.local
Abra `.env.local` e configure:
```env
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
```

### Passo 3: Reiniciar Servidor
```powershell
# Parar servidor (Ctrl+C)
# Depois:
npm start
```

## 🚀 Testando PIX Real

### 1. Abrir App
- Acesse: http://localhost:3001
- Clique em **"Comprar Saldo"**
- Selecione um pacote
- Clique em **"Comprar"**

### 2. Verificar Console
```javascript
🔧 Modo desenvolvimento: Tentando gerar PIX real
✅ PIX real gerado no desenvolvimento! 1234567890
```

### 3. Resultado Esperado
- ✅ QR Code PIX **REAL** (não mock)
- ✅ ID de transação real do Mercado Pago
- ✅ Código PIX válido para copiar

## ⚠️ Possíveis Problemas

### Problema 1: CORS Bloqueado
```
⚠️ CORS bloqueou chamada direta. Use um proxy ou extensão CORS.
```

**Solução**: Instalar extensão CORS no navegador:
- **Chrome**: "CORS Unblock" ou "Disable CORS"
- **Firefox**: "CORS Everywhere"

### Problema 2: Credenciais Não Configuradas
```
❌ Credenciais do Mercado Pago não configuradas!
```

**Solução**: 
1. Verificar se `.env.local` existe
2. Verificar se o token está correto
3. Reiniciar o servidor

### Problema 3: Token Inválido
```
Erro Mercado Pago: {"message": "Invalid access token"}
```

**Solução**:
1. Verificar se o token começa com `TEST-`
2. Gerar novo token no painel do Mercado Pago
3. Verificar se não tem espaços extras

## 🔄 Fluxo Completo

### Desenvolvimento (localhost):
1. ✅ Lê credenciais do `.env.local`
2. ✅ Chama API do Mercado Pago diretamente
3. ✅ Gera QR Code PIX real
4. ✅ Retorna dados reais da transação

### Produção (vercel.app):
1. ✅ Usa Serverless Function
2. ✅ Evita problemas de CORS
3. ✅ Credenciais seguras no servidor

## 📊 Diferenças

| Aspecto | Mock | PIX Real |
|---------|------|----------|
| QR Code | Fake | Válido |
| Transação | Simulada | Real no MP |
| ID | `MOCK-123` | `1234567890` |
| Pagamento | Não funciona | Funciona |
| Teste | Rápido | Completo |

## 🎉 Resultado Final

Após configurar:
- ✅ PIX real gerado no localhost
- ✅ QR Code válido
- ✅ Transação criada no Mercado Pago
- ✅ Pode simular pagamento no painel MP

---

**Agora você tem PIX REAL no desenvolvimento!** 🚀
