# 🚀 Deploy do Flow-Forge CMS

## 📋 Pré-requisitos

1. API deployada e funcionando (Render ou Vercel)
2. Conta no [Vercel](https://vercel.com) (recomendado para frontends)

## 🎯 Deploy no Vercel

### Passo 1: Preparar o repositório

Certifique-se que os arquivos de configuração estão commitados:
- `vercel.json` ✅
- `.env.production.example` ✅
- `vite.config.js` (otimizado) ✅

### Passo 2: Deploy via Vercel

#### Opção A: Via Dashboard (Recomendado)

1. Acesse [Vercel Dashboard](https://vercel.com/new)
2. Importe o repositório GitHub
3. Configure:
   - **Framework Preset**: Vue.js
   - **Root Directory**: `packages/cms` (se for monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Node Version**: 20.x

4. **Adicione as variáveis de ambiente:**

```env
# URL da sua API em produção
VITE_API_URL=https://flow-api-n41r.onrender.com

# URL do CMS (será preenchida após deploy)
VITE_CMS_URL=https://seu-projeto.vercel.app

# URL do Editor (se deployar separadamente)
VITE_EDITOR_URL=https://flow-editor.vercel.app
```

5. Clique em **Deploy**

#### Opção B: Via CLI

```bash
cd packages/cms
npx vercel --prod
```

### Passo 3: Configurar domínio customizado (Opcional)

1. No Dashboard do projeto
2. Settings → Domains
3. Adicione seu domínio

## 🔧 Configurações Importantes

### Variáveis de Ambiente

As variáveis devem começar com `VITE_` para serem expostas ao frontend:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL da API | `https://flow-api-n41r.onrender.com` |
| `VITE_CMS_URL` | URL do CMS | `https://flow-cms.vercel.app` |
| `VITE_EDITOR_URL` | URL do Editor | `https://flow-editor.vercel.app` |

### Otimizações de Build

O `vite.config.js` já está configurado para:
- ✅ Minificação com Terser
- ✅ Remoção de console.log em produção
- ✅ Code splitting otimizado
- ✅ Chunks separados para melhor cache

## 🐛 Troubleshooting

### API não conecta

1. Verifique se `VITE_API_URL` está correto
2. Confirme que a API está rodando
3. Verifique CORS na API (deve permitir o domínio do CMS)

### Build falha

1. Verifique Node version (20.x ou 22.x)
2. Delete `node_modules` e `package-lock.json`
3. Run `npm install` novamente

### Páginas em branco após deploy

1. Verifique o console do navegador
2. Confirme que as variáveis de ambiente estão configuradas
3. Faça redeploy após adicionar variáveis

## 🔗 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vue 3 Docs](https://vuejs.org/)

## ✅ Checklist pós-deploy

- [ ] CMS carrega corretamente
- [ ] Login funciona
- [ ] Comunicação com API está OK
- [ ] Rotas do Vue Router funcionam
- [ ] Assets carregam (imagens, fontes)
- [ ] Console sem erros críticos

---

**Tempo estimado de deploy:** 2-5 minutos no Vercel