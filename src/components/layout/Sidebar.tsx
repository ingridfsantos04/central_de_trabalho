"use client";

import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  Bot,
  Sparkles,
  FlaskConical,
  BookOpen,
  Lightbulb,
  History,
  LogOut,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import NextLink from "next/link";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Minhas Demandas", href: "/demandas", icon: CheckSquare },
    { label: "Projetos", href: "/projetos", icon: FolderGit2 },
    { label: "Agentes de IA", href: "/agentes", icon: Bot },
    { label: "Biblioteca Prompts", href: "/prompts", icon: Sparkles },
    { label: "Laboratório Testes", href: "/testes", icon: FlaskConical },
    { label: "Documentação", href: "/documentacao", icon: BookOpen },
    { label: "Ideias e Rascunhos", href: "/ideias", icon: Lightbulb },
    { label: "Histórico & Concluídos", href: "/historico", icon: History },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      router.push("/login");
    }
  };

  return (
    <aside className="w-64 h-screen flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
      {/* Brand header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            Central IA
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              v1.0
            </span>
          </span>
          <span className="text-xs text-slate-400">Ambiente de Trabalho</span>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Módulos Principais
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <NextLink
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </NextLink>
          );
        })}
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate">
                Ingrid Ferreira
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair do sistema"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
