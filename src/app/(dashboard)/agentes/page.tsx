"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Plus,
  Search,
  Sparkles,
  FlaskConical,
  ExternalLink,
  ArrowRight,
  Shield,
  Layers,
  X,
  Loader2,
} from "lucide-react";

export default function AgentesPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [status, setStatus] = useState("DESENVOLVIMENTO");
  const [environment, setEnvironment] = useState("Produção");
  const [projectId, setProjectId] = useState("");
  const [mainPrompt, setMainPrompt] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(console.error);
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          description,
          objective,
          status,
          environment,
          projectId: projectId || null,
          mainPrompt,
        }),
      });

      if (res.ok) {
        setName("");
        setCompany("");
        setDescription("");
        setObjective("");
        setMainPrompt("");
        setIsModalOpen(false);
        fetchAgents();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const filteredAgents = agents.filter((ag) => {
    if (search.trim()) {
      const matchName = ag.name.toLowerCase().includes(search.toLowerCase());
      const matchCompany = ag.company?.toLowerCase().includes(search.toLowerCase());
      const matchObj = ag.objective?.toLowerCase().includes(search.toLowerCase());
      if (!matchName && !matchCompany && !matchObj) return false;
    }
    if (statusFilter !== "ALL" && ag.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (s: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      PLANEJAMENTO: { label: "Planejamento", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      DESENVOLVIMENTO: { label: "Desenvolvimento", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      EM_TESTES: { label: "Em Testes", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      HOMOLOGACAO: { label: "Homologação", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
      EM_PRODUCAO: { label: "Em Produção", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      DESCONTINUADO: { label: "Descontinuado", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
    };
    const current = badges[s] || { label: s, color: "bg-slate-100 text-slate-700" };
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
            Agentes de IA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Documentação técnica, regras de negócio e procedimentos dos agentes inteligentes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Agente</span>
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
            placeholder="Buscar por nome do agente, empresa ou objetivo..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">Todos os Status</option>
          <option value="PLANEJAMENTO">Planejamento</option>
          <option value="DESENVOLVIMENTO">Desenvolvimento</option>
          <option value="EM_TESTES">Em Testes</option>
          <option value="HOMOLOGACAO">Homologação</option>
          <option value="EM_PRODUCAO">Em Produção</option>
          <option value="DESCONTINUADO">Descontinuado</option>
        </select>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          Nenhum agente cadastrado ou encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((ag) => (
            <Link
              key={ag.id}
              href={`/agentes/${ag.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        {ag.company || "Interno"}
                      </span>
                      <span className="text-xs text-slate-500">
                        Ambiente: {ag.environment || "Produção"}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(ag.status)}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 transition line-clamp-1 mt-1">
                  {ag.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {ag.description || ag.objective || "Sem descrição cadastrada."}
                </p>

                {ag.project && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                    <Layers className="w-3 h-3" />
                    <span className="truncate">{ag.project.name}</span>
                  </div>
                )}
              </div>

              {/* Stats Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {ag._count.prompts} prompts
                  </span>
                  <span className="flex items-center gap-1">
                    <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
                    {ag._count.tests} testes
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Cadastrar Agente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-500" />
                Cadastrar Agente de IA
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Nome do Agente *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Clara, Alter Bot..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Empresa / Unidade
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: Affix, Alter, Interno..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                    <option value="DESENVOLVIMENTO">Desenvolvimento</option>
                    <option value="EM_TESTES">Em Testes</option>
                    <option value="HOMOLOGACAO">Homologação</option>
                    <option value="EM_PRODUCAO">Em Produção</option>
                    <option value="DESCONTINUADO">Descontinuado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Ambiente
                  </label>
                  <input
                    type="text"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    placeholder="Ex: Produção, Staging"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Projeto
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="">Nenhum</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Descrição & Contexto
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Visão geral e finalidade do agente..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Objetivo Principal
                </label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: Automatizar 60% das dúvidas de beneficiários..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Prompt Principal (System Prompt)
                </label>
                <textarea
                  rows={4}
                  value={mainPrompt}
                  onChange={(e) => setMainPrompt(e.target.value)}
                  placeholder="Você é um assistente..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
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
                  Cadastrar Agente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
