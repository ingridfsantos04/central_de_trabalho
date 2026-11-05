"use client";

import { useState, useEffect } from "react";
import {
  X,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  Calendar,
  Clock,
  Folder,
  Flag,
  User,
  ListTodo,
  ExternalLink,
  Save,
  Loader2,
  History,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

interface TaskDetailDrawerProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export default function TaskDetailDrawer({
  taskId,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskDetailDrawerProps) {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  // Form states for edit
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editObjective, setEditObjective] = useState("");
  const [editNextStep, setEditNextStep] = useState("");
  const [editObservations, setEditObservations] = useState("");
  const [editPriority, setEditPriority] = useState("MEDIA");
  const [editStatus, setEditStatus] = useState("A_FAZER");
  const [editProjectId, setEditProjectId] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const fetchTask = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        // Pre-fill edit
        setEditTitle(data.task.title || "");
        setEditDesc(data.task.description || "");
        setEditObjective(data.task.objective || "");
        setEditNextStep(data.task.nextStep || "");
        setEditObservations(data.task.observations || "");
        setEditPriority(data.task.priority || "MEDIA");
        setEditStatus(data.task.status || "A_FAZER");
        setEditProjectId(data.task.projectId || "");
        setEditDeadline(
          data.task.deadline ? data.task.deadline.split("T")[0] : ""
        );
        setEditCategory(data.task.category || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTask();
      fetch("/api/projects")
        .then((r) => r.json())
        .then((d) => setProjects(d.projects || []))
        .catch(console.error);
    } else {
      setTask(null);
      setEditing(false);
      setConfirmDelete(false);
    }
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  const handleToggleChecklist = async (checklistId: string, current: boolean) => {
    try {
      await fetch(`/api/tasks/${taskId}/checklists/${checklistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      });
      fetchTask();
      onTaskUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          objective: editObjective,
          nextStep: editNextStep,
          observations: editObservations,
          priority: editPriority,
          status: editStatus,
          projectId: editProjectId || null,
          deadline: editDeadline || null,
          category: editCategory,
        }),
      });
      if (res.ok) {
        setEditing(false);
        fetchTask();
        onTaskUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        onTaskUpdated();
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onTaskUpdated();
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPriorityBadge = (p: string) => {
    const colors: Record<string, string> = {
      CRITICA: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      ALTA: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      MEDIA: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      BAIXA: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    };
    return (
      <span
        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
          colors[p] || colors.MEDIA
        }`}
      >
        {p}
      </span>
    );
  };

  const getStatusBadge = (s: string) => {
    const labels: Record<string, string> = {
      IDEIA: "Ideia",
      RASCUNHO: "Rascunho",
      A_FAZER: "A Fazer",
      EM_ANDAMENTO: "Em Andamento",
      EM_TESTES: "Em Testes",
      AGUARDANDO_RETORNO: "Aguardando Retorno",
      CONCLUIDO: "Concluído",
      CANCELADO: "Cancelado",
    };
    return (
      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        {labels[s] || s}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Detalhes da Demanda
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Editar demanda"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDuplicate}
                  className="p-2 rounded-lg text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Duplicar demanda"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  title="Excluir demanda"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {confirmDelete && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Tem certeza que deseja excluir esta demanda? Esta ação não pode ser desfeita.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-2.5 py-1 rounded bg-rose-600 text-white font-medium hover:bg-rose-500"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        )}

        {/* Content body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {editing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    >
                      <option value="IDEIA">Ideia</option>
                      <option value="RASCUNHO">Rascunho</option>
                      <option value="A_FAZER">A Fazer</option>
                      <option value="EM_ANDAMENTO">Em Andamento</option>
                      <option value="EM_TESTES">Em Testes</option>
                      <option value="AGUARDANDO_RETORNO">Aguardando Retorno</option>
                      <option value="CONCLUIDO">Concluído</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    >
                      <option value="CRITICA">Crítica</option>
                      <option value="ALTA">Alta</option>
                      <option value="MEDIA">Média</option>
                      <option value="BAIXA">Baixa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Projeto
                    </label>
                    <select
                      value={editProjectId}
                      onChange={(e) => setEditProjectId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    >
                      <option value="">Nenhum (Geral)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Prazo
                    </label>
                    <input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Descrição
                  </label>
                  <textarea
                    rows={4}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Objetivo
                  </label>
                  <input
                    type="text"
                    value={editObjective}
                    onChange={(e) => setEditObjective(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Próximo Passo
                  </label>
                  <input
                    type="text"
                    value={editNextStep}
                    onChange={(e) => setEditNextStep(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Observações
                  </label>
                  <textarea
                    rows={2}
                    value={editObservations}
                    onChange={(e) => setEditObservations(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-4 py-2 text-xs rounded-xl bg-blue-600 text-white font-medium flex items-center gap-1.5"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Salvar Alterações
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                    {task.project && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium border border-blue-500/20">
                        {task.project.name}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    {task.title}
                  </h1>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      Prazo:{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {task.deadline
                          ? format(new Date(task.deadline), "dd/MM/yyyy")
                          : "Não definido"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>
                      Responsável:{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {task.assignee || "Ingrid Ferreira"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Descrição & Detalhes
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Objective & Next step */}
                {(task.objective || task.nextStep) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.objective && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400">Objetivo</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          {task.objective}
                        </p>
                      </div>
                    )}
                    {task.nextStep && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400">Próximo Passo</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                          {task.nextStep}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ListTodo className="w-4 h-4" /> Checklist de Atividades
                    </h3>
                    {task.checklists?.length > 0 && (
                      <span className="text-xs text-slate-500 font-mono">
                        {task.checklists.filter((c: any) => c.completed).length}/
                        {task.checklists.length} concluídas
                      </span>
                    )}
                  </div>

                  {task.checklists?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhuma atividade no checklist.</p>
                  ) : (
                    <div className="space-y-2">
                      {task.checklists?.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleChecklist(item.id, item.completed)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span
                            className={`text-xs flex-1 transition ${
                              item.completed
                                ? "line-through text-slate-400"
                                : "text-slate-700 dark:text-slate-200 font-medium"
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Observations */}
                {task.observations && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Observações
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      {task.observations}
                    </p>
                  </div>
                )}

                {/* Activity History */}
                {task.activities?.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <History className="w-4 h-4" /> Histórico da Demanda
                    </h3>
                    <div className="space-y-2">
                      {task.activities.map((act: any) => (
                        <div key={act.id} className="text-xs flex items-center justify-between text-slate-500">
                          <span>{act.description}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {format(new Date(act.createdAt), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
