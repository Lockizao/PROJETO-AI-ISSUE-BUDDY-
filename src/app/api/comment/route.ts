import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

interface CommentRequestBody {
    owner?: string;
    repo?: string;
    issue_number?: number | string;
    resumo?: string;
    prioridade?: number;
    justificativa?: string;
    // true quando quem chamou foi o workflow (.github/workflows/auto-triage.yml),
    // sem clique humano nenhum. Muda só o texto de rodapé, pra não mentir sobre a origem.
    automatico?: boolean;
}

// Monta o corpo do comentário que vai aparecer de verdade na issue do GitHub,
// deixando claro que foi gerado por IA (transparência com quem lê a issue)
// e sendo honesto sobre se um humano aprovou o clique ou se foi 100% automático.
function montarCorpoComentario(resumo: string, prioridade: number, justificativa: string, automatico: boolean) {
    const rodape = automatico
        ? "_Comentário gerado e publicado automaticamente pelo workflow de triagem (sem revisão humana antes de postar). Não substitui a triagem da equipe._"
        : "_Comentário gerado por IA (Gemini); a publicação foi aprovada manualmente por um humano antes de ser postada. Não substitui a triagem da equipe._";

    return [
        "### 🤖 Análise automática — AI Issue Buddy",
        "",
        `**Prioridade sugerida:** ${prioridade}/10`,
        "",
        `**Resumo:** ${resumo}`,
        "",
        `**Justificativa:** ${justificativa}`,
        "",
        "---",
        rodape,
    ].join("\n");
}

export async function POST(request: NextRequest) {
    const githubToken = process.env.GITHUB_PAT;

    if (!githubToken) {
        return NextResponse.json(
            { erro: "Variável de ambiente GITHUB_PAT não configurada no servidor." },
            { status: 500 }
        );
    }

    let body: CommentRequestBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ erro: "Corpo da requisição inválido (esperado JSON)." }, { status: 400 });
    }

    const { owner, repo, resumo, justificativa } = body;
    const issueNumber = Number(body.issue_number);
    const prioridade = Number(body.prioridade);
    const automatico = body.automatico === true;

    if (!owner || !repo || !issueNumber || Number.isNaN(issueNumber) || !resumo || !justificativa || Number.isNaN(prioridade)) {
        return NextResponse.json(
            { erro: "Informe owner, repo, issue_number, resumo, prioridade e justificativa." },
            { status: 400 }
        );
    }

    const octokit = new Octokit({ auth: githubToken });

    try {
        const { data: comentario } = await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: montarCorpoComentario(resumo, prioridade, justificativa, automatico),
        });

        return NextResponse.json({
            ok: true,
            url: comentario.html_url,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        // Erro mais comum aqui: o GITHUB_PAT não tem permissão de escrita (Issues: Read and write)
        // liberada para esse repositório específico no fine-grained token.
        return NextResponse.json(
            { erro: `Falha ao postar comentário no GitHub: ${message}` },
            { status: 502 }
        );
    }
}
