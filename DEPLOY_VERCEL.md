# 🚀 Deploy no Vercel - VitorTable MT

## 📋 Pré-requisitos
- Conta no Vercel (https://vercel.com)
- Repositório GitHub com o código
- Node.js instalado

## 🔧 Método 1: Deploy via Vercel CLI (Recomendado)

### 1. Instalar Vercel CLI
```powershell
npm install -g vercel
```

### 2. Login no Vercel
```powershell
vercel login
```

### 3. Deploy
```powershell
# Na pasta do projeto
cd "d:\backup\mesas nova\cloe-app"

# Primeiro deploy
vercel

# Seguir as instruções:
# - Set up and deploy? Yes
# - Which scope? Selecione sua conta
# - Link to existing project? No
# - What's your project's name? vitor-table-mt
# - In which directory is your code located? ./
# - Want to override the settings? No
```

### 4. Deploy em Produção
```powershell
vercel --prod
```

## 🌐 Método 2: Deploy via Dashboard Vercel

### 1. Acessar Vercel
1. Vá para: https://vercel.com/new
2. Faça login com GitHub

### 2. Importar Repositório
1. Clique em "Import Project"
2. Selecione "Import Git Repository"
3. Cole a URL: `https://github.com/FirstdeveloperMatoGrosso/Vitor-Table-MT`
4. Clique em "Import"

### 3. Configurar Projeto
```
Project Name: vitor-table-mt
Framework Preset: Other
Root Directory: ./
Build Command: npm run build
Output Directory: web-build
Install Command: npm install
```

### 4. Variáveis de Ambiente (Opcional)
Se necessário, adicione:
```
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
MERCADO_PAGO_USER_ID=seu_user_id_aqui
```

### 5. Deploy
1. Clique em "Deploy"
2. Aguarde o build (2-5 minutos)
3. Acesse a URL gerada

## 📱 Após o Deploy

### URL do Projeto
Seu projeto estará disponível em:
```
https://vitor-table-mt.vercel.app
```

### Domínio Customizado (Opcional)
1. Vá em "Settings" > "Domains"
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

## 🔄 Atualizações Automáticas

Após o primeiro deploy, toda vez que você fizer push para o GitHub:
```powershell
git add -A
git commit -m "update"
git push
```

O Vercel automaticamente:
1. Detecta o push
2. Faz build
3. Deploy automático

## ⚙️ Configurações Importantes

### Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `web-build`
- **Install Command**: `npm install`
- **Development Command**: `npm start`

### Environment Variables
Configure no dashboard Vercel:
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_USER_ID`
- `MERCADO_PAGO_PIX_KEY`

## 🐛 Troubleshooting

### Erro: "Build failed"
```powershell
# Limpar cache e reinstalar
rm -rf node_modules
npm install
npm run build
```

### Erro: "Module not found"
Verifique se todas as dependências estão no `package.json`

### Erro: "Expo export failed"
```powershell
# Instalar expo-cli globalmente
npm install -g expo-cli
```

## 📊 Monitoramento

### Analytics
- Acesse: https://vercel.com/dashboard
- Veja métricas de acesso, performance, etc.

### Logs
- Clique no deploy
- Vá em "Functions" > "Logs"

## 🔒 Segurança

### Variáveis Sensíveis
- Nunca commite tokens no código
- Use Environment Variables no Vercel
- Atualize tokens periodicamente

## 📞 Suporte

- Documentação: https://vercel.com/docs
- Comunidade: https://github.com/vercel/vercel/discussions

---

**VitorTable MT - Pronto para Produção!** ✅
