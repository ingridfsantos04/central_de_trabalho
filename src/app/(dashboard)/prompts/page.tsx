"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Plus,
  Search,
  Copy,
  Check,
  Save,
  Trash2,
  History,
  Bot,
  FolderGit2,
  Loader2,
  X,
  FileCode,
  Layers,
} from "lucide-react";
import { format } from "date-fns";

function PromptsContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const [prompts, setPrompts] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [agentFilter, setAgentFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");

  // Selected prompt for editor
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [editorContent, setEditorContent] = useState("");
  const [editorName, setEditorName] = useState("");
  const [editorVersion, setEditorVersion] = useState("1.0.0");
  const [editorStatus, setEditorStatus] = useState("EM_DESENVOLVIMENTO");
  const [editorObjective, setEditorObjective] = useState("");
  const [editorExpected, setEditorExpected] = useState("");
  const [editorKnownIssues, setEditorKnownIssues] = useState("");
  const [changelog, setChangelog] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  // Modal Novo Prompt
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newAgentId, setNewAgentId] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/prompts");
      if (res.ok) {
        const data = await res.json();
        setPrompts(data.prompts || []);

        if (initialId) {
          const match = data.prompts.find((p: any) => p.id === initialId);
          if (match) selectPrompt(match);
        } else if (data.prompts.length > 0 && !selectedPrompt) {
          selectPrompt(data.prompts[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setAgents(d.agents || []))
      .catch(console.error);
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(console.error);
  }, []);

  const selectPrompt = (pr: any) => {
    setSelectedPrompt(pr);
    setEditorName(pr.name || "");
    setEditorContent(pr.content || "");
    setEditorVersion(pr.version || "1.0.0");
    setEditorStatus(pr.status || "EM_DESENVOLVIMENTO");
    setEditorObjective(pr.objective || "");
    setEditorExpected(pr.expectedResult || "");
    setEditorKnownIssues(pr.knownIssues || "");
    setChangelog("");
    setShowVersions(false);
  };

  const handleSavePrompt = async () => {
    if (!selectedPrompt) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/prompts/${selectedPrompt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editorName,
          content: editorContent,
          version: editorVersion,
          status: editorStatus,
          objective: editorObjective,
          expectedResult: editorExpected,
          knownIssues: editorKnownIssues,
          changelog: changelog || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedPrompt(data.prompt);
        fetchPrompts();
        setChangelog("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (editorContent) {
      navigator.clipboard.writeText(editorContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedPrompt) return;
    try {
      const res = await fetch(`/api/prompts/${selectedPrompt.id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        fetchPrompts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!selectedPrompt) return;
    if (!confirm("Tem certeza que deseja excluir este prompt?")) return;
    try {
      const res = await fetch(`/api/prompts/${selectedPrompt.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedPrompt(null);
        fetchPrompts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          content: newContent,
          objective: newObjective,
          agentId: newAgentId || null,
          projectId: newProjectId || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewName("");
        setNewContent("");
        setNewObjective("");
        setIsNewModalOpen(false);
        fetchPrompts();
        selectPrompt(data.prompt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  // Filtered prompts
  const filteredPrompts = prompts.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.objective?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (agentFilter !== "ALL" && p.agentId !== agentFilter) return false;
    if (projectFilter !== "ALL" && p.projectId !== projectFilter) return false;
    return true;
  });

  const charCount = editorContent.length;
  const tokenEstimate = Math.round(charCount / 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Biblioteca de Prompts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ambiente técnico de engenharia de prompts, versionamento e testes de instruções
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Prompt</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: List & Search (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar prompts..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px]"
            >
              <option value="ALL">Status: Todos</option>
              <option value="EM_DESENVOLVIMENTO">Desenvolvimento</option>
              <option value="EM_TESTES">Em Testes</option>
              <option value="APROVADO">Aprovado</option>
              <option value="PRODUCAO">Produção</option>
              <option value="RASCUNHO">Rascunho</option>
            </select>

            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px]"
            >
              <option value="ALL">Agente: Todos</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filteredPrompts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum prompt encontrado.
              </div>
            ) : (
              filteredPrompts.map((pr) => {
                const isSelected = selectedPrompt?.id === pr.id;
                return (
                  <div
                    key={pr.id}
                    onClick={() => selectPrompt(pr)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 shadow-sm"
                        : "bg-slate-50/40 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {pr.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 shrink-0">
                        v{pr.version}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {pr.objective || pr.description || "Sem descrição"}
                    </p>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/40 text-[10px] text-slate-400">
                      {pr.agent && <span>{pr.agent.name}</span>}
                      <span>•</span>
                      <span>{pr.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Editor & Inspector (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          {selectedPrompt ? (
            <>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editorName}
                    onChange={(e) => setEditorName(e.target.value)}
                    className="font-bold text-base bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 px-1 py-0.5 rounded text-slate-900 dark:text-slate-50 w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copiado!" : "Copiar"}</span>
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    title="Duplicar prompt"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500"
                    title="Excluir prompt"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleSavePrompt}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Salvar</span>
                  </button>
                </div>
              </div>

              {/* Version & Status Header row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                    Versão
                  </label>
                  <input
                    type="text"
                    value={editorVersion}
                    onChange={(e) => setEditorVersion(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                    Status
                  </label>
                  <select
                    value={editorStatus}
                    onChange={(e) => setEditorStatus(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="RASCUNHO">Rascunho</option>
                    <option value="EM_DESENVOLVIMENTO">Em Desenvolvimento</option>
                    <option value="EM_TESTES">Em Testes</option>
                    <option value="APROVADO">Aprovado</option>
                    <option value="PRODUCAO">Produção</option>
                    <option value="ARQUIVADO">Arquivado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                    Tamanho
                  </label>
                  <div className="text-slate-700 dark:text-slate-300 font-mono py-1">
                    {charCount} caracteres
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                    Tokens Estimados
                  </label>
                  <div className="text-blue-500 font-mono py-1 font-semibold">
                    ~{tokenEstimate} tokens
                  </div>
                </div>
              </div>

              {/* Objective */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Objetivo do Prompt
                </label>
                <input
                  type="text"
                  value={editorObjective}
                  onChange={(e) => setEditorObjective(e.target.value)}
                  placeholder="Finalidade desta instrução..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              {/* Code / Prompt Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase text-[11px]">Conteúdo do Prompt</span>
                  <button
                    type="button"
                    onClick={() => setShowVersions(!showVersions)}
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <History className="w-3 h-3" />
                    <span>
                      {showVersions ? "Ocultar Versões" : `Ver Histórico de Versões (${selectedPrompt.versions?.length || 1})`}
                    </span>
                  </button>
                </div>

                {showVersions ? (
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2 max-h-60 overflow-y-auto">
                    {selectedPrompt.versions?.map((ver: any) => (
                      <div
                        key={ver.id}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-mono font-bold text-amber-500 mr-2">
                            v{ver.version}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {ver.changelog || "Sem changelog"}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            ({format(new Date(ver.createdAt), "dd/MM/yyyy HH:mm")})
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setEditorContent(ver.content);
                            setEditorVersion(ver.version);
                          }}
                          className="text-[11px] text-blue-500 hover:underline"
                        >
                          Carregar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <textarea
                  rows={14}
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="Insira as instruções do prompt aqui..."
                  className="w-full p-4 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl focus:outline-none leading-relaxed"
                />
              </div>

              {/* Changelog field */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Nota da Versão / Changelog (Opcional ao salvar)
                </label>
                <input
                  type="text"
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="Ex: Ajustada regra de formatação para WhatsApp..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400">
              Selecione um prompt na lista ao lado ou crie um novo para editar.
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Prompt */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Criar Novo Prompt
              </h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrompt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Nome do Prompt *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Prompt de Extração de Intenção v1"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Agente Relacionado
                  </label>
                  <select
                    value={newAgentId}
                    onChange={(e) => setNewAgentId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="">Nenhum (Geral)</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Projeto Relacionado
                  </label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="">Nenhum (Geral)</option>
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
                  Objetivo do Prompt
                </label>
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Ex: Classificar sentimento da mensagem..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Conteúdo do Prompt *
                </label>
                <textarea
                  rows={8}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Você é um assistente..."
                  className="w-full p-3 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl"
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
                  disabled={creating || !newName.trim() || !newContent.trim()}
                  className="px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Salvar na Biblioteca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PromptsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
        </div>
      }
    >
      <PromptsContent />
    </Suspense>
  );
}
