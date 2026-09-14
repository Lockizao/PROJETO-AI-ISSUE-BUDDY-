# 🤖 AI Issue Buddy

Painel de controle Fullstack para análise de prioridade de Issues do GitHub usando Inteligência Artificial. Automatiza a leitura de issues longas (incluindo comentários) e devolve um score de prioridade de 1 a 10 com um resumo executivo.

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|---|---|
| Front-End | Next.js 16 (App Router), React, TypeScript, Tailwind CSS |
| Back-End | Next.js API Route (Node.js), TypeScript |
| IA | Google Gemini API (`@google/genai`, modelo `gemini-3.5-flash-lite`) |
| Dados | GitHub API (`@octokit/rest`) |

## 🗺️ Como funciona

1. O front-end (`src/app/page.tsx`) envia `owner`, `repo` e `issue_number` para a API.
2. A API (`src/app/api/analyze/route.ts`) usa o `GITHUB_PAT` pra buscar a issue e todos os comentários via Octokit.
3. O texto completo (issue + comentários) é enviado pro Gemini, que devolve um JSON estruturado: `resumo`, `prioridade` (1-10) e `justificativa`.
4. O front-end exibe o resultado no dashboard.

## ⚙️ Rodando localmente

### Pré-requisitos
- Node.js e npm
- Uma chave da [Gemini API](https://aistudio.google.com/apikey) (gratuita)
- Um [GitHub Personal Access Token](https://github.com/settings/tokens) — um token *fine-grained* com acesso **"Public repositories" (read-only)** já é suficiente, já que o app só lê issues públicas

### Instalação
```bash
npm install
```

### Configuração
Copie `.env.local.example` para `.env.local` e preencha com suas chaves:
```env
GEMINI_API_KEY=sua_chave_aqui
GITHUB_PAT=seu_token_aqui
```

### Iniciar
```bash
npm run dev
```
🌐 Acesse http://localhost:3000

### Testando
No dashboard, use um exemplo público qualquer, ex:
- Repositório: `vercel/next.js`
- Issue: `69229`

## 🔑 API

`POST /api/analyze`
```json
{ "owner": "vercel", "repo": "next.js", "issue_number": 69229 }
```
Resposta:
```json
{
  "issue": { "owner": "vercel", "repo": "next.js", "numero": 69229, "titulo": "...", "totalComentarios": 3 },
  "analise": { "resumo": "...", "prioridade": 6, "justificativa": "..." }
}
```
