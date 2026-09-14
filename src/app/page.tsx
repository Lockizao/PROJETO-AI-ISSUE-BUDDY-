"use client";

import { useState, FormEvent } from "react";

interface Analise {
    resumo: string;
    prioridade: number;
    justificativa: string;
}

interface AnalyzeResponse {
    issue: {
        owner: string;
        repo: string;
        numero: number;
        titulo: string;
        totalComentarios: number;
    };
    analise: Analise;
}

// Cor do badge de prioridade: verde (baixa) -> amarelo (média) -> vermelho (alta)
function corPrioridade(nota: number) {
    if (nota >= 8) return "bg-red-500/15 text-red-400 border-red-500/30";
    if (nota >= 5) return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
    return "bg-green-500/15 text-green-400 border-green-500/30";
}

export default function Home() {
    const [owner, setOwner] = useState("vercel");
    const [repo, setRepo] = useState("next.js");
    const [issueNumber, setIssueNumber] = useState("69229");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [resultado, setResultado] = useState<AnalyzeResponse | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setCarregando(true);
        setErro(null);
        setResultado(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ owner, repo, issue_number: issueNumber }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErro(data.erro ?? "Erro desconhecido ao analisar a issue.");
                return;
            }

            setResultado(data);
        } catch {
            setErro("Não foi possível conectar à API. Verifique sua conexão e tente novamente.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center px-4 py-16">
            <div className="w-full max-w-2xl">
                <h1 className="text-3xl font-semibold mb-1">🤖 AI Issue Buddy</h1>
                <p className="text-neutral-400 mb-8">
                    Cola o repositório e o número de uma issue pra ver um score de prioridade e um resumo gerados por IA.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end mb-10">
                    <div className="flex-1">
                        <label className="block text-sm text-neutral-400 mb-1" htmlFor="owner">
                            Owner
                        </label>
                        <input
                            id="owner"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 outline-none focus:border-neutral-400"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-neutral-400 mb-1" htmlFor="repo">
                            Repositório
                        </label>
                        <input
                            id="repo"
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                            className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 outline-none focus:border-neutral-400"
                            required
                        />
                    </div>
                    <div className="w-full sm:w-32">
                        <label className="block text-sm text-neutral-400 mb-1" htmlFor="issue">
                            Issue #
                        </label>
                        <input
                            id="issue"
                            value={issueNumber}
                            onChange={(e) => setIssueNumber(e.target.value)}
                            inputMode="numeric"
                            className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 outline-none focus:border-neutral-400"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={carregando}
                        className="rounded-md bg-white text-black font-medium px-4 py-2 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {carregando ? "Analisando..." : "Analisar"}
                    </button>
                </form>

                {erro && (
                    <div className="rounded-md border border-red-500/30 bg-red-500/10 text-red-400 px-4 py-3 mb-6">
                        {erro}
                    </div>
                )}

                {resultado && (
                    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <p className="text-sm text-neutral-500">
                                    {resultado.issue.owner}/{resultado.issue.repo} #{resultado.issue.numero} ·{" "}
                                    {resultado.issue.totalComentarios} comentário(s)
                                </p>
                                <h2 className="text-lg font-medium">{resultado.issue.titulo}</h2>
                            </div>
                            <span
                                className={`shrink-0 rounded-full border px-3 py-1 text-sm font-semibold ${corPrioridade(
                                    resultado.analise.prioridade
                                )}`}
                            >
                                Prioridade {resultado.analise.prioridade}/10
                            </span>
                        </div>

                        <p className="text-neutral-200 mb-3">{resultado.analise.resumo}</p>
                        <p className="text-neutral-400 text-sm">{resultado.analise.justificativa}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
