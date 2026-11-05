"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Plus,
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Trash2,
  Edit2,
  FolderGit2,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { format } from "date-fns";

export default function IdeiasPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, IMPLEMENTED

  // Quick Create
  const [quickTitle, setQuickTitle] = useState("");
  const [quickContent, setQuickContent] = useState("");
  const [quickCategory, setQuickCategory] = useState("Ideia");
  const [quickProjectId, setQuickProjectId] = useState("");
  const [savingQuick, setSavingQuick] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(console.error);
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setSavingQuick(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickTitle,
          content: quickContent,
          category: quickCategory,
          projectId: quickProjectId || null,
        }),
      });

      if (res.ok) {
        setQuickTitle("");
        setQuickContent("");
        setQuickProjectId("");
        fetchNotes();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingQuick(false);
    }
  };

  const handleConvert = async (noteId: string) => {
    setConvertingId(noteId);
    try {
      const res = await fetch(`/api/notes/${noteId}/convert`, {
        method: "POST",
      });
      if (res.ok) {
        fetchNotes();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConvertingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNotes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleImplemented = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isImplemented: !current }),
      });
      fetchNotes();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (categoryFilter !== "ALL" && n.category !== categoryFilter) return false;
    if (statusFilter === "PENDING" && n.isImplemented) return false;
    if (statusFilter === "IMPLEMENTED" && !n.isImplemented) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Ideias & Rascunhos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Espaço para captura rápida de insights, melhorias futuras e conversão direta em demandas
          </p>
        </div>
      </div>

      {/* Quick Add Sticky Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-amber-500">
          <Lightbulb className="w-4 h-4" />
          <span>Captura Rápida de Ideia</span>
        </div>

        <form onSubmit={handleCreateNote} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                required
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Qual é a ideia ou insight? *"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="Ideia">Ideia</option>
                <option value="Rascunho">Rascunho</option>
                <option value="Melhoria">Melhoria</option>
                <option value="Anotação">Anotação Rápida</option>
              </select>
            </div>

            <div>
              <select
                value={quickProjectId}
                onChange={(e) => setQuickProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="">Vincular a Projeto (Opcional)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <textarea
              rows={2}
              value={quickContent}
              onChange={(e) => setQuickContent(e.target.value)}
              placeholder="Detalhes adicionais, links ou raciocínio inicial..."
              className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
            <button
              type="submit"
              disabled={savingQuick || !quickTitle.trim()}
              className="px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
            >
              {savingQuick ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Salvar Ideia</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ideias ou anotações..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
        >
          <option value="ALL">Todas as Ideias</option>
          <option value="PENDING">Pendentes / Novas</option>
          <option value="IMPLEMENTED">Já Implementadas</option>
        </select>
      </div>

      {/* Grid of Notes */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          Nenhuma ideia ou anotação cadastrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const isDone = note.isImplemented;

            return (
              <div
                key={note.id}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between group ${
                  isDone
                    ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-70"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {note.category || "Ideia"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleImplemented(note.id, note.isImplemented)}
                        className={`p-1 rounded transition ${
                          isDone ? "text-emerald-500" : "text-slate-400 hover:text-emerald-500"
                        }`}
                        title={isDone ? "Marcar como pendente" : "Marcar como implementada"}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3
                    className={`font-bold text-sm text-slate-900 dark:text-slate-100 ${
                      isDone ? "line-through text-slate-400 dark:text-slate-500" : ""
                    }`}
                  >
                    {note.title}
                  </h3>

                  {note.content && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  {note.project ? (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <FolderGit2 className="w-3.5 h-3.5" /> {note.project.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Geral</span>
                  )}

                  {/* 1-click Convert Button */}
                  {!isDone ? (
                    <button
                      onClick={() => handleConvert(note.id)}
                      disabled={convertingId === note.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition text-[11px] font-medium"
                    >
                      {convertingId === note.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>Virar Demanda</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-500 font-medium">
                      ✓ Implementada
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
