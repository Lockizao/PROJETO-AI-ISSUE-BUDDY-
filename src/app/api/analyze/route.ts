import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { GoogleGenAI, Type } from "@google/genai";

// Schema estruturado que pedimos pro Gemini devolver — garante que o
// front-end sempre recebe o mesmo formato, sem precisar fazer parsing frágil.
const ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        resumo: {
            type: Type.STRING,
            description: "Resumo executivo da issue e da discussão nos comentários, em português, em até 3 frases.",
        },
        prioridade: {
            type: Type.NUMBER,
            description: "Nota de prioridade de 1 (baixa) a 10 (crítica), considerando impacto, urgência e quantidade/tom dos comentários.",
        },
        justificativa: {
            type: Type.STRING,
            description: "Por que essa nota de prioridade foi dada, em português.",
        },
    },
    required: ["resumo", "prioridade", "justificativa"],
};

interface AnalyzeRequestBody {
    owner?: string;
    repo?: string;
    issue_number?: number | string;
}

export async function POST(request: NextRequest) {
    const githubToken = process.env.GITHUB_PAT;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!githubToken || !geminiKey) {
        return NextResponse.json(
            { erro: "Variáveis de ambiente GITHUB_PAT / GEMINI_API_KEY não configuradas no servidor." },
            { status: 500 }
        );
    }

    let body: AnalyzeRequestBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ erro: "Corpo da requisição inválido (esperado JSON)." }, { status: 400 });
    }

    const { owner, repo } = body;
    const issueNumber = Number(body.issue_number);

    if (!owner || !repo || !issueNumber || Number.isNaN(issueNumber)) {
        return NextResponse.json(
            { erro: "Informe owner, repo e issue_number válidos." },
            { status: 400 }
        );
    }

    // 1. Busca a issue e os comentários no GitHub
    const octokit = new Octokit({ auth: githubToken });

    let issueTitle: string;
    let issueBody: string;
    let comments: string[];

    try {
        const { data: issue } = await octokit.rest.issues.get({
            owner,
            repo,
            issue_number: issueNumber,
        });

        const { data: commentsData } = await octokit.rest.issues.listComments({
            owner,
            repo,
            issue_number: issueNumber,
            per_page: 100,
        });

        issueTitle = issue.title;
        issueBody = issue.body ?? "(sem descrição)";
        comments = commentsData.map(
            (c) => `- ${c.user?.login ?? "usuário desconhecido"}: ${c.body ?? ""}`
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        return NextResponse.json(
            { erro: `Falha ao buscar a issue no GitHub: ${message}` },
            { status: 502 }
        );
    }

    // 2. Monta o texto completo (issue + comentários) e manda pro Gemini analisar
    const textoCompleto = [
        `Título: ${issueTitle}`,
        `Descrição: ${issueBody}`,
        comments.length > 0 ? `Comentários (${comments.length}):\n${comments.join("\n")}` : "Sem comentários.",
    ].join("\n\n");

    try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text:
                                "Você é um assistente que ajuda a triar issues de repositórios GitHub. " +
                                "Analise a issue abaixo (título, descrição e comentários) e responda com um score de prioridade " +
                                "de 1 a 10 e um resumo executivo.\n\n" +
                                textoCompleto,
                        },
                    ],
                },
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: ANALYSIS_SCHEMA,
            },
        });

        const texto = response.text;
        if (!texto) {
            throw new Error("Resposta vazia do Gemini.");
        }

        const analise = JSON.parse(texto);

        return NextResponse.json({
            issue: {
                owner,
                repo,
                numero: issueNumber,
                titulo: issueTitle,
                totalComentarios: comments.length,
            },
            analise,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        return NextResponse.json(
            { erro: `Falha ao analisar a issue com o Gemini: ${message}` },
            { status: 502 }
        );
    }
}
