import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Central de Trabalho IA",
  description: "Plataforma pessoal de produtividade, gestão de demandas, agentes e projetos.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-slate-50 dark:bg-slate-950 font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
