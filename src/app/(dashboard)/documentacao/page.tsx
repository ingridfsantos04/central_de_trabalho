"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Code,
  Copy,
  Check,
  FolderGit2,
  X,
  Loader2,
  Trash2,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";

function DocumentacaoContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const [docs, setDocs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");

  // View / Detail Modal
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Create Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("API");
  const [endpoint, setEndpoint] = useState("");
  const [httpMethod, setHttpMethod] = useState("POST");
  const [authentication, setAuthentication] = useState("Bearer Token");
  const [requestHeaders, setRequestHeaders] = useState("");
  const [requestPayload, setRequestPayload] = useState("");
  const [responsePayload, setResponsePayload] = useState("");
  const [businessRules, setBusinessRules] = useState("");
  const [procedures, setProcedures] = useState("");
  const [technicalNotes, setTechnicalNotes] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocs(data.documents || []);

        if (initialId) {
          const match = data.documents.find((d: any) => d.id === initialId);
          if (match) {
            setSelectedDoc(match);
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
    fetchDocs();
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(console.error);
  }, []);

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          endpoint,
          httpMethod,
          authentication,
          requestHeaders,
          requestPayload,
          responsePayload,
          businessRules,
          procedures,
          technicalNotes,
          projectId: projectId || null,
        }),
      });

      if (res.ok) {
        setTitle("");
        setEndpoint("");
        setRequestPayload("");
        setResponsePayload("");
        setBusinessRules("");
        setProcedures("");
        setTechnicalNotes("");
        setIsNewModalOpen(false);
        fetchDocs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este documento?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setIsDetailOpen(false);
        setSelectedDoc(null);
        fetchDocs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const filteredDocs = docs.filter((d) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        d.title.toLowerCase().includes(q) ||
        d.endpoint?.toLowerCase().includes(q) ||
        d.businessRules?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (categoryFilter !== "ALL" && d.category !== categoryFilter) return false;
    if (projectFilter !== "ALL" && d.projectId !== projectFilter) return false;
    return true;
  });

  const getMethodBadge = (m: string) => {
    const colors: Record<string, string> = {
      GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      PUT: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      DELETE: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return (
      <span
        className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${
          colors[m] || "bg-slate-100 text-slate-700"
        }`}
      >
        {m || "GET"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Documentação Técnica
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Especificações de APIs, contratos de webhooks, payloads, autenticação e regras
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Documentação</span>
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
            placeholder="Buscar por endpoint, título ou regra..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
        >
          <option value="ALL">Todas as Categorias</option>
          <option value="API">APIs & Webhooks</option>
          <option value="Arquitetura">Arquitetura</option>
          <option value="Procedimento">Procedimento</option>
          <option value="Regras de Negócio">Regras de Negócio</option>
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

      {/* Docs Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          Nenhuma documentação encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                setSelectedDoc(doc);
                setIsDetailOpen(true);
              }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
                    {doc.category}
                  </span>
                  {doc.httpMethod && getMethodBadge(doc.httpMethod)}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-500 transition line-clamp-1">
                  {doc.title}
                </h3>

                {doc.endpoint && (
                  <p className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg mt-2 truncate">
                    {doc.endpoint}
                  </p>
                )}

                {doc.businessRules && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {doc.businessRules}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{doc.project ? doc.project.name : "Geral"}</span>
                <span className="text-blue-500 group-hover:underline text-[11px]">
                  Ver detalhes →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detalhes do Documento */}
      {isDetailOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                {selectedDoc.httpMethod && getMethodBadge(selectedDoc.httpMethod)}
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedDoc.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedDoc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500"
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

            {/* Endpoint & Auth */}
            {selectedDoc.endpoint && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
                <span>{selectedDoc.endpoint}</span>
                <span className="text-[10px] text-slate-400">
                  Auth: {selectedDoc.authentication || "Nenhuma"}
                </span>
              </div>
            )}

            {/* Headers */}
            {selectedDoc.requestHeaders && (
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-400">Headers</span>
                <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                  {selectedDoc.requestHeaders}
                </pre>
              </div>
            )}

            {/* Payloads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDoc.requestPayload && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold uppercase">Payload de Requisição (JSON)</span>
                    <button
                      onClick={() => handleCopy(selectedDoc.requestPayload)}
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPayload ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 text-xs font-mono text-sky-300 border border-slate-800 overflow-x-auto max-h-60">
                    {selectedDoc.requestPayload}
                  </pre>
                </div>
              )}

              {selectedDoc.responsePayload && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-slate-400">
                    Payload de Resposta (JSON)
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-950 text-xs font-mono text-emerald-300 border border-slate-800 overflow-x-auto max-h-60">
                    {selectedDoc.responsePayload}
                  </pre>
                </div>
              )}
            </div>

            {/* Business Rules & Procedures */}
            {selectedDoc.businessRules && (
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-400">
                  Regras de Negócio
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {selectedDoc.businessRules}
                </p>
              </div>
            )}

            {selectedDoc.procedures && (
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-400">
                  Procedimentos de Integração
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {selectedDoc.procedures}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Criar Documentação */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-500" />
                Nova Documentação Técnica
              </h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Título da Documentação *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: API de Emissão de Boletos v2"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="API">API</option>
                    <option value="Arquitetura">Arquitetura</option>
                    <option value="Procedimento">Procedimento</option>
                    <option value="Regras de Negócio">Regras de Negócio</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Método HTTP
                  </label>
                  <select
                    value={httpMethod}
                    onChange={(e) => setHttpMethod(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
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
                    <option value="">Nenhum (Geral)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://api.exemplo.com/v1/recurso"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Autenticação
                  </label>
                  <input
                    type="text"
                    value={authentication}
                    onChange={(e) => setAuthentication(e.target.value)}
                    placeholder="Ex: Bearer Token, API Key..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Payload de Requisição (JSON)
                </label>
                <textarea
                  rows={4}
                  value={requestPayload}
                  onChange={(e) => setRequestPayload(e.target.value)}
                  placeholder="{\n  &quot;campo&quot;: &quot;valor&quot;\n}"
                  className="w-full p-3 bg-slate-950 font-mono text-xs text-sky-300 border border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Regras de Negócio & Procedimentos
                </label>
                <textarea
                  rows={3}
                  value={businessRules}
                  onChange={(e) => setBusinessRules(e.target.value)}
                  placeholder="Instruções de validação e regras de envio..."
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
                  disabled={saving || !title.trim()}
                  className="px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Salvar Documentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocumentacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto" />
        </div>
      }
    >
      <DocumentacaoContent />
    </Suspense>
  );
}
