📄 Log de Projeto: AI Issue Buddy 🤖
1. Propósito do Projeto
O AI Issue Buddy é um painel de controle Fullstack para análise de prioridade de Issues do GitHub usando Inteligência Artificial. Ele automatiza a leitura de Issues longas (incluindo comentários) para fornecer um score de prioridade de 1 a 10 e um resumo executivo.

2. Arquitetura e Tecnologias
Este é um projeto Fullstack (Next.js App Router) que integra três serviços distintos.

🛠️ Tecnologias Utilizadas
Front-End: Next.js 16 (React), TypeScript, Tailwind CSS.

Back-End (API Route): Next.js Serverless Function (Node.js), TypeScript.

Inteligência Artificial: Google Gemini API (@google/genai) usando o modelo Gemini 2.5 Pro para análise e JSON estruturado.

Dados: GitHub API (@octokit/rest) para buscar Issues e comentários.

🗺️ Fluxo de Dados (Fullstack)
O Front-End (page.tsx) envia uma requisição POST com owner/repo e issue_number para a API Route.

A API Route (route.ts) usa o GITHUB_PAT para buscar a Issue e os comentários.

A API envia o texto completo (Issue + Comentários) para o Gemini AI.

O Gemini retorna um objeto JSON estruturado (resumo, prioridade, justificativa).

A API envia este JSON de volta para o Front-End.

O Front-End exibe o painel de resultados.

3. Estrutura de Arquivos Principal
Esta é a estrutura de pastas e arquivos necessária para o projeto:

ai-issue-buddy/
├── .env.local             <-- Chaves de segurança (Gemini e GitHub)
├── package.json           <-- Dependências
└── src/
    └── app/
        ├── api/
        │   └── analyze/
        │       └── route.ts  <-- BACK-END (Node.js/Gemini/GitHub)
        └── page.tsx          <-- FRONT-END (Dashboard React/Tailwind)
4. Instruções de Execução (Próxima Vez)
Para rodar este projeto em qualquer ambiente (local ou nuvem), os passos são:

1. Instalar Dependências
Estando no diretório raiz (ai-issue-buddy/):

Bash

npm install
2. Configurar Variáveis de Ambiente
Crie o arquivo .env.local e insira suas chaves (este foi o ponto de falha que corrigimos):

GEMINI_API_KEY: Chave gerada no Google AI Studio.

GITHUB_PAT: Token de Acesso Pessoal do GitHub, gerado com a permissão repo marcada.

Snippet de código

GEMINI_API_KEY=sua_chave_aqui
GITHUB_PAT=seu_token_aqui
3. Iniciar o Servidor
Execute o comando de desenvolvimento. O servidor estará rodando em http://localhost:3000.

Bash

npm run dev
4. Teste Final (Exemplo)
Acesse a URL e utilize as seguintes credenciais para verificar o sucesso da conexão API ➡️ IA:

Repositório: vercel/next.js

Número da Issue: 69229
