"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Bot,
  Sparkles,
  BookOpen,
  ArrowRight,
  MoreVertical,
  X,
  Loader2,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

export default function ProjetosPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [status, setStatus] = useState("EM_ANDAMENTO");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          objective,
          status,
          startDate: startDate || null,
          deadline: deadline || null,
          color,
        }),
      });
      if (res.ok) {
        setName("");
        setDescription("");
        setObjective("");
        setStartDate("");
        setDeadline("");
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (search.trim()) {
      const matchName = p.name.toLowerCase().includes(search.toLowerCase());
      const matchDesc = p.description?.toLowerCase().includes(search.toLowerCase());
      if (!matchName && !matchDesc) return false;
    }
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (s: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      PLANEJAMENTO: { label: "Planejamento", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      EM_ANDAMENTO: { label: "Em Andamento", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      PAUSADO: { label: "Pausado", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      CONCLUIDO: { label: "Concluído", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      CANCELADO: { label: "Cancelado", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
    };
    const current = labels[s] || { label: s, color: "bg-slate-100 text-slate-700" };
    return (
      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${current.color}`}>
        {current.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Projetos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organização estruturada das frentes de trabalho, agentes e integrações
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Projeto</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar projetos por nome ou objetivo..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">Todos os Status</option>
          <option value="EM_ANDAMENTO">Em Andamento</option>
          <option value="PLANEJAMENTO">Planejamento</option>
          <option value="PAUSADO">Pausado</option>
          <option value="CONCLUIDO">Concluído</option>
        </select>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          Nenhum projeto encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projetos/${project.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.color || "#3b82f6" }}
                    />
                    {getStatusBadge(project.status)}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-500 transition line-clamp-1">
                  {project.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {project.description || "Sem descrição informada."}
                </p>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Progresso de Demandas</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {project.progress}% ({project.completedTasks}/{project.totalTasks})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Counts footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-4 gap-1 text-center text-xs">
                <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="block font-bold text-slate-800 dark:text-slate-200">
                    {project._count.tasks}
                  </span>
                  <span className="text-[10px] text-slate-400">Demandas</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="block font-bold text-slate-800 dark:text-slate-200">
                    {project._count.agents}
                  </span>
                  <span className="text-[10px] text-slate-400">Agentes</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="block font-bold text-slate-800 dark:text-slate-200">
                    {project._count.prompts}
                  </span>
                  <span className="text-[10px] text-slate-400">Prompts</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="block font-bold text-slate-800 dark:text-slate-200">
                    {project._count.documents}
                  </span>
                  <span className="text-[10px] text-slate-400">Docs</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Novo Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-500" />
                Novo Projeto
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Clara - Affix, Alter, Automações n8n..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contexto geral e escopo do projeto..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Objetivo Estratégico
                </label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: Automatizar 60% das dúvidas frequentes..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="PLANEJAMENTO">Planejamento</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="PAUSADO">Pausado</option>
                    <option value="CONCLUIDO">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Prazo
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Criar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
