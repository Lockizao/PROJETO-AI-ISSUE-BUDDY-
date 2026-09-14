import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

interface CommentRequestBody {
    owner?: string;
    repo?: string;
    issue_number?: number | string;
    resumo?: string;
    prioridade?: number;
    justificativa?: string;
}

// Monta o corpo do comentário que vai aparecer de verdade na issue do GitHub,
// deixando claro que foi gerado por IA (transparência com quem lê a issue).
function montarCorpoComentario(resumo: string, prioridade: number, justificativa: string) {
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
        "_Comentário gerado por IA (Gemini) e publicado manualmente por um humano após revisão. Não substitui a triagem da equipe._",
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
            body: montarCorpoComentario(resumo, prioridade, justificativa),
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
