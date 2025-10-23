# 🔄 Como Limpar Cache e Ver as Mudanças

## ❗ Problema
As mudanças de UI (cores, espaçamento) não aparecem no localhost mesmo após reiniciar o servidor.

## ✅ Solução: Limpar Cache do Navegador

### Opção 1: Hard Refresh (Mais Rápido)

#### Windows/Linux:
```
Ctrl + Shift + R
ou
Ctrl + F5
```

#### Mac:
```
Cmd + Shift + R
```

### Opção 2: Limpar Cache Completo

#### Chrome/Edge:
1. Pressione `F12` (abrir DevTools)
2. Clique com botão direito no ícone de **Recarregar**
3. Selecione **"Esvaziar cache e atualizar forçadamente"**

#### Firefox:
1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Cache"
3. Clique em "Limpar agora"

### Opção 3: Modo Anônimo/Privado

Abra uma janela anônima:
- **Chrome**: `Ctrl + Shift + N`
- **Firefox**: `Ctrl + Shift + P`
- **Edge**: `Ctrl + Shift + N`

Acesse: http://localhost:3000

## 🔍 Como Verificar Se Funcionou

### 1. Abra "Mesas Abertas"
Você deve ver:
- ✅ **Email em AZUL** (#5666F5)
- ✅ **Horário em LARANJA** (#F68647)

### 2. Abra "Reserva de Mesa"
Você deve ver:
- ✅ Espaçamento maior (gap 12px)
- ✅ Inputs com fundo branco
- ✅ Campos mais espaçados

### 3. Inspecionar Elemento
1. Clique com botão direito no email
2. "Inspecionar"
3. Verifique se `color: rgb(86, 102, 245)` (azul)

## 🛠️ Se Ainda Não Funcionar

### Passo 1: Parar o Servidor
```powershell
# No terminal onde o servidor está rodando
Ctrl + C
```

### Passo 2: Limpar Build Cache
```powershell
# Na pasta do projeto
Remove-Item -Recurse -Force node_modules\.cache
```

### Passo 3: Reiniciar
```powershell
npm start
```

### Passo 4: Abrir em Modo Anônimo
```
Ctrl + Shift + N
http://localhost:3000
```

## 📊 Checklist de Verificação

- [ ] Hard refresh (Ctrl + Shift + R)
- [ ] Cache limpo
- [ ] Servidor reiniciado
- [ ] Modo anônimo testado
- [ ] Email aparece em azul
- [ ] Horário aparece em laranja
- [ ] Espaçamento maior nos modais

## 🎯 Cores Para Verificar

| Elemento | Cor Esperada | RGB |
|----------|--------------|-----|
| Email | Azul | rgb(86, 102, 245) |
| Horário | Laranja | rgb(246, 134, 71) |
| Texto | Preto | rgb(31, 31, 31) |
| Muted | Cinza | rgb(107, 107, 107) |

---

**Se seguir estes passos, as mudanças vão aparecer!** 🎉
