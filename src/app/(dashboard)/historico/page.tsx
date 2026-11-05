"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  CheckCircle2,
  FolderGit2,
  Bot,
  Sparkles,
  Search,
  Calendar,
  Loader2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

type Tab = "atividades" | "demandas" | "projetos" | "agentes" | "prompts";

export default function HistoricoPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("atividades");
  const [search, setSearch] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/history");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const activities = (data?.activities || []).filter((act: any) => {
    if (!search.trim()) return true;
    return act.description.toLowerCase().includes(search.toLowerCase());
  });

  const completedTasks = (data?.completedTasks || []).filter((t: any) => {
    if (!search.trim()) return true;
    return t.title.toLowerCase().includes(search.toLowerCase());
  });

  const finishedProjects = data?.finishedProjects || [];
  const discontinuedAgents = data?.discontinuedAgents || [];
  const archivedPrompts = data?.archivedPrompts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Histórico & Concluídos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Trilha de auditoria, histórico de alterações e repositório de entregas finalizadas
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: "atividades", label: `Timeline (${activities.length})`, icon: History },
          { id: "demandas", label: `Demandas Concluídas (${completedTasks.length})`, icon: CheckCircle2 },
          { id: "projetos", label: `Projetos Finalizados (${finishedProjects.length})`, icon: FolderGit2 },
          { id: "agentes", label: `Agentes Descontinuados (${discontinuedAgents.length})`, icon: Bot },
          { id: "prompts", label: `Prompts Arquivados (${archivedPrompts.length})`, icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
                isActive
                  ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar histórico..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
          </div>
        ) : activeTab === "atividades" ? (
          /* Timeline de Atividades */
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum evento registrado no histórico.
              </div>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6 py-2">
                {activities.map((act: any) => (
                  <div key={act.id} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {format(new Date(act.createdAt), "dd/MM/yyyy HH:mm:ss")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "demandas" ? (
          /* Demandas Concluídas */
          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhuma demanda concluída encontrada.
              </div>
            ) : (
              completedTasks.map((t: any) => (
                <Link
                  key={t.id}
                  href={`/demandas?id=${t.id}`}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition">
                        {t.title}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {t.project ? t.project.name : "Geral"} • Concluída em{" "}
                        {format(new Date(t.updatedAt), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </Link>
              ))
            )}
          </div>
        ) : activeTab === "projetos" ? (
          /* Projetos Finalizados */
          <div className="space-y-3">
            {finishedProjects.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum projeto finalizado até o momento.
              </div>
            ) : (
              finishedProjects.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/projetos/${p.id}`}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{p.description}</p>
                  </div>
                  <span className="text-emerald-500 font-medium">Finalizado</span>
                </Link>
              ))
            )}
          </div>
        ) : activeTab === "agentes" ? (
          /* Agentes Descontinuados */
          <div className="space-y-3">
            {discontinuedAgents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum agente descontinuado.
              </div>
            ) : (
              discontinuedAgents.map((ag: any) => (
                <Link
                  key={ag.id}
                  href={`/agentes/${ag.id}`}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                      {ag.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">{ag.company}</span>
                  </div>
                  <span className="text-slate-400">Descontinuado</span>
                </Link>
              ))
            )}
          </div>
        ) : (
          /* Prompts Arquivados */
          <div className="space-y-3">
            {archivedPrompts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum prompt arquivado.
              </div>
            ) : (
              archivedPrompts.map((pr: any) => (
                <Link
                  key={pr.id}
                  href={`/prompts?id=${pr.id}`}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                      {pr.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">v{pr.version}</span>
                  </div>
                  <span className="text-slate-400">Arquivado</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
