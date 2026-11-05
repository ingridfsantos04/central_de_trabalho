"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  PlayCircle,
  ExternalLink,
  Bot,
  FolderGit2,
  Calendar,
  X,
  Loader2,
  Trash2,
  Edit2,
  Save,
} from "lucide-react";
import { format } from "date-fns";

function TestesContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const [tests, setTests] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [agentFilter, setAgentFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");

  // Detail Modal
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // New Test Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [scenario, setScenario] = useState("");
  const [objective, setObjective] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [actualResult, setActualResult] = useState("");
  const [status, setStatus] = useState("PLANEJADO");
  const [identifiedError, setIdentifiedError] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [appliedSolution, setAppliedSolution] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [executionLink, setExecutionLink] = useState("");
  const [agentId, setAgentId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tests");
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);

        if (initialId) {
          const match = data.tests.find((t: any) => t.id === initialId);
          if (match) {
            setSelectedTest(match);
            setIsDetailOpen(true);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setAgents(d.agents || []))
      .catch(console.error);
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(console.error);
  }, []);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          scenario,
          objective,
          expectedResult,
          actualResult,
          status,
          identifiedError,
          rootCause,
          appliedSolution,
          nextAction,
          executionLink,
          agentId: agentId || null,
          projectId: projectId || null,
        }),
      });

      if (res.ok) {
        setName("");
        setScenario("");
        setObjective("");
        setExpectedResult("");
        setActualResult("");
        setIdentifiedError("");
        setRootCause("");
        setAppliedSolution("");
        setNextAction("");
        setExecutionLink("");
        setIsNewModalOpen(false);
        fetchTests();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm("Excluir registro deste teste?")) return;
    try {
      const res = await fetch(`/api/tests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setIsDetailOpen(false);
        setSelectedTest(null);
        fetchTests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTests = tests.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.name.toLowerCase().includes(q) ||
        t.scenario?.toLowerCase().includes(q) ||
        t.identifiedError?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (agentFilter !== "ALL" && t.agentId !== agentFilter) return false;
    if (projectFilter !== "ALL" && t.projectId !== projectFilter) return false;
    return true;
  });

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "APROVADO":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
          </span>
        );
      case "FALHOU":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Falhou
          </span>
        );
      case "AGUARDANDO_CORRECAO":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Aguardando Correção
          </span>
        );
      case "EM_EXECUCAO":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <PlayCircle className="w-3.5 h-3.5" /> Em Execução
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
            <Clock className="w-3.5 h-3.5" /> Planejado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Laboratório de Testes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro sistemático de testes em agentes, APIs, validação de payloads e correções
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Teste</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por cenário, nome ou erro..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          >
            <option value="ALL">Todos os Status</option>
            <option value="APROVADO">Aprovado</option>
            <option value="FALHOU">Falhou</option>
            <option value="AGUARDANDO_CORRECAO">Aguardando Correção</option>
            <option value="EM_EXECUCAO">Em Execução</option>
            <option value="PLANEJADO">Planejado</option>
          </select>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          >
            <option value="ALL">Todos os Agentes</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          >
            <option value="ALL">Todos os Projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Test List Table / Cards */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          Nenhum teste registrado para os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              onClick={() => {
                setSelectedTest(test);
                setIsDetailOpen(true);
              }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {format(new Date(test.executionDate), "dd/MM/yyyy HH:mm")}
                  </span>
                  {getStatusBadge(test.status)}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-500 transition line-clamp-1">
                  {test.name}
                </h3>

                {test.scenario && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {test.scenario}
                  </p>
                )}

                {test.identifiedError && (
                  <div className="mt-2.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-[11px] text-rose-600 dark:text-rose-400 font-mono truncate">
                    Erro: {test.identifiedError}
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  {test.agent && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Bot className="w-3.5 h-3.5" /> {test.agent.name}
                    </span>
                  )}
                  {test.project && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <FolderGit2 className="w-3.5 h-3.5" /> {test.project.name}
                    </span>
                  )}
                </div>

                {test.executionLink && (
                  <a
                    href={test.executionLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <span>Logs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer / Modal Detalhes do Teste */}
      {isDetailOpen && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {selectedTest.name}
                </span>
                {getStatusBadge(selectedTest.status)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteTest(selectedTest.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                  title="Excluir teste"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cenário & Objetivo */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase text-slate-400">Cenário Testado</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                {selectedTest.scenario || "Sem descrição de cenário"}
              </p>
            </div>

            {/* Esperado vs Obtido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Resultado Esperado
                </span>
                <div className="text-xs p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl text-slate-800 dark:text-slate-200">
                  {selectedTest.expectedResult || "Não informado"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Resultado Obtido
                </span>
                <div className="text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200">
                  {selectedTest.actualResult || "Não informado"}
                </div>
              </div>
            </div>

            {/* Erro, Causa e Solução */}
            {(selectedTest.identifiedError || selectedTest.rootCause || selectedTest.appliedSolution) && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3 text-xs">
                {selectedTest.identifiedError && (
                  <div>
                    <span className="font-semibold text-rose-500 block mb-0.5">
                      Erro Identificado:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {selectedTest.identifiedError}
                    </p>
                  </div>
                )}
                {selectedTest.rootCause && (
                  <div>
                    <span className="font-semibold text-amber-500 block mb-0.5">
                      Causa Raiz:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">{selectedTest.rootCause}</p>
                  </div>
                )}
                {selectedTest.appliedSolution && (
                  <div>
                    <span className="font-semibold text-emerald-500 block mb-0.5">
                      Solução Aplicada:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">
                      {selectedTest.appliedSolution}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Próxima Ação & Link */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              {selectedTest.nextAction && (
                <span>
                  <strong>Próxima Ação:</strong> {selectedTest.nextAction}
                </span>
              )}
              {selectedTest.executionLink && (
                <a
                  href={selectedTest.executionLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Abrir Link da Execução</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Novo Teste */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-500" />
                Registrar Teste
              </h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Nome do Teste *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Teste de Carga de Webhook Clara"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="PLANEJADO">Planejado</option>
                    <option value="EM_EXECUCAO">Em Execução</option>
                    <option value="APROVADO">Aprovado</option>
                    <option value="FALHOU">Falhou</option>
                    <option value="AGUARDANDO_CORRECAO">Aguardando Correção</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Agente
                  </label>
                  <select
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="">Nenhum</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Projeto
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
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
                  Cenário de Teste
                </label>
                <textarea
                  rows={2}
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="Descreva as condições e entradas do teste..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Resultado Esperado
                  </label>
                  <textarea
                    rows={2}
                    value={expectedResult}
                    onChange={(e) => setExpectedResult(e.target.value)}
                    placeholder="O que deveria acontecer..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Resultado Obtido
                  </label>
                  <textarea
                    rows={2}
                    value={actualResult}
                    onChange={(e) => setActualResult(e.target.value)}
                    placeholder="O que de fato ocorreu..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Erro Identificado (se houver)
                  </label>
                  <input
                    type="text"
                    value={identifiedError}
                    onChange={(e) => setIdentifiedError(e.target.value)}
                    placeholder="Ex: Timeout HTTP 504"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Solução / Correção
                  </label>
                  <input
                    type="text"
                    value={appliedSolution}
                    onChange={(e) => setAppliedSolution(e.target.value)}
                    placeholder="Ex: Aumentado pool de conexões"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Link da Execução / Evidências (URL)
                </label>
                <input
                  type="url"
                  value={executionLink}
                  onChange={(e) => setExecutionLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
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
                  Salvar Teste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TestesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
        </div>
      }
    >
      <TestesContent />
    </Suspense>
  );
}
