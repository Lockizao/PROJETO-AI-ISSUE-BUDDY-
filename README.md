# 🤖 AI Issue Buddy

Painel de controle Fullstack para análise de prioridade de Issues do GitHub usando Inteligência Artificial. Automatiza a leitura de issues longas (incluindo comentários), devolve um score de prioridade de 1 a 10 com um resumo executivo, e — com um clique de aprovação — publica esse resumo como comentário real na issue.

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
5. **Opcional, com aprovação manual:** o botão "Postar este resumo como comentário na issue" chama `src/app/api/comment/route.ts`, que publica o resumo formatado como um comentário de verdade na issue via Octokit. Nada é postado automaticamente — só ao clicar.
6. **Automação total (webhook):** `.github/workflows/auto-triage.yml` dispara sozinho toda vez que uma issue nova é aberta neste repositório — chama o app publicado na Vercel (`/api/analyze` → `/api/comment`) e posta o comentário sem nenhuma intervenção humana. É o ciclo completo: issue aberta → analisada → comentada, tudo automático.

## 🚀 Publicado

O app está no ar em produção via Vercel: **https://ai-issue-buddy.vercel.app**

## ⚙️ Rodando localmente

### Pré-requisitos
- Node.js e npm
- Uma chave da [Gemini API](https://aistudio.google.com/apikey) (gratuita)
- Um [GitHub Personal Access Token](https://github.com/settings/tokens) fine-grained. Duas opções:
  - **Só analisar (sem postar comentário):** acesso **"Public repositories" (read-only)** já é suficiente.
  - **Analisar + postar comentário:** acesso **"Only select repositories"**, selecionando os repositórios onde você quer permitir postar, com a permissão **Issues: Read and write** (Metadata: Read-only vem junto automaticamente). Sem isso, o botão de comentar retorna erro 403 "Resource not accessible by personal access token".

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

`POST /api/comment`
```json
{ "owner": "Lockizao", "repo": "meu-repo", "issue_number": 2, "resumo": "...", "prioridade": 1, "justificativa": "..." }
```
Resposta:
```json
{ "ok": true, "url": "https://github.com/Lockizao/meu-repo/issues/2#issuecomment-..." }
```
