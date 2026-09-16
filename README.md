# AI Issue Buddy

Painel fullstack que lê issues longas do GitHub — título, descrição e todos os comentários — e devolve uma nota de prioridade de 1 a 10 com um resumo curto. Se a análise fizer sentido, dá pra publicar esse resumo como comentário de verdade na issue, com um clique.

## Tecnologias

- Front-end: Next.js 16 (App Router), React, TypeScript, Tailwind
- Back-end: API Routes do próprio Next.js
- IA: API do Gemini (`@google/genai`, modelo gemini-3.5-flash-lite)
- Dados: API do GitHub via Octokit

## Como funciona

O front-end manda owner, repo e número da issue pra `/api/analyze`. Essa rota busca a issue inteira e os comentários usando um token do GitHub, monta um prompt com tudo isso e manda pro Gemini, que devolve um JSON com resumo, prioridade e justificativa. O front-end mostra esse resultado na tela.

Se eu quiser, tem um botão pra publicar aquele resumo como comentário na issue — isso chama `/api/comment`, que usa o mesmo token (mas com permissão de escrita) pra postar de verdade. Nada acontece sozinho aqui, só quando clico.

Tem também um workflow no GitHub Actions (`.github/workflows/auto-triage.yml`) que dispara automaticamente toda vez que uma issue nova é aberta nesse repositório — ele chama o app publicado na Vercel e faz o ciclo completo sozinho: analisa e comenta sem eu precisar abrir nada.

## No ar

https://ai-issue-buddy.vercel.app

## Rodando localmente

Precisa de Node, npm, uma chave da API do Gemini (grátis, em aistudio.google.com/apikey) e um token do GitHub.

Pro token, duas opções dependendo do que você quer fazer: se é só pra analisar, um token fine-grained com acesso "Public repositories" (somente leitura) já resolve. Se quiser também postar comentário, precisa escolher os repositórios específicos onde você tem permissão e dar acesso de leitura e escrita em Issues — sem isso o botão de comentar retorna 403.

```bash
npm install
```

Copie `.env.local.example` pra `.env.local` e preencha:

```
GEMINI_API_KEY=sua_chave_aqui
GITHUB_PAT=seu_token_aqui
```

```bash
npm run dev
```

Acessa localhost:3000. Pra testar, um exemplo qualquer serve — usei bastante o repositório vercel/next.js, issue 69229, durante o desenvolvimento.

## API

`POST /api/analyze`
```json
{ "owner": "vercel", "repo": "next.js", "issue_number": 69229 }
```
devolve
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
devolve
```json
{ "ok": true, "url": "https://github.com/Lockizao/meu-repo/issues/2#issuecomment-..." }
```
