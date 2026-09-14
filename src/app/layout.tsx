import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AI Issue Buddy",
    description: "Painel de análise de prioridade de Issues do GitHub usando IA.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body>{children}</body>
        </html>
    );
}
