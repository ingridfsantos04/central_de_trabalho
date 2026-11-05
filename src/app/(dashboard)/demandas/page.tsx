"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  List,
  Kanban,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Folder,
  ArrowUpDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Copy,
  Loader2,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import TaskDetailDrawer from "@/components/demandas/TaskDetailDrawer";
import NewTaskModal from "@/components/modals/NewTaskModal";

type ViewMode = "lista" | "kanban" | "calendario";

function DemandasContent() {
  const searchParams = useSearchParams();
  const initialPriority = searchParams.get("priority") || "ALL";
  const initialId = searchParams.get("id");

  const [view, setView] = useState<ViewMode>("lista");
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [prazoFilter, setPrazoFilter] = useState("ALL"); // ALL, ATRASADAS, HOJE, SEMANA
  const [sortBy, setSortBy] = useState("createdAt");

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal / Drawer state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialId);
  const [drawerOpen, setDrawerOpen] = useState(Boolean(initialId));
  const [newModalOpen, setNewModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (initialId) {
      setSelectedTaskId(initialId);
      setDrawerOpen(true);
    }
  }, [initialId]);

  // Filter & sort logic
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    const weekFromNow = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    return tasks
      .filter((t) => {
        // Search
        if (search.trim()) {
          const matchTitle = t.title.toLowerCase().includes(search.toLowerCase());
          const matchCategory = t.category?.toLowerCase().includes(search.toLowerCase());
          const matchDesc = t.description?.toLowerCase().includes(search.toLowerCase());
          if (!matchTitle && !matchCategory && !matchDesc) return false;
        }

        // Priority
        if (priorityFilter !== "ALL" && t.priority !== priorityFilter) {
          return false;
        }

        // Status
        if (statusFilter !== "ALL" && t.status !== statusFilter) {
          return false;
        }

        // Project
        if (projectFilter !== "ALL" && t.projectId !== projectFilter) {
          return false;
        }

        // Prazo
        if (prazoFilter === "ATRASADAS") {
          return t.deadline && new Date(t.deadline) < now && t.status !== "CONCLUIDO" && t.status !== "CANCELADO";
        }
        if (prazoFilter === "HOJE") {
          return t.deadline && format(new Date(t.deadline), "yyyy-MM-dd") === todayStr;
        }
        if (prazoFilter === "SEMANA") {
          return t.deadline && new Date(t.deadline) >= now && new Date(t.deadline) <= weekFromNow;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "deadline") {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === "priority") {
          const weights: Record<string, number> = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAIXA: 1 };
          return (weights[b.priority] || 0) - (weights[a.priority] || 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, search, priorityFilter, statusFilter, projectFilter, prazoFilter, sortBy]);

  const handleOpenTask = (id: string) => {
    setSelectedTaskId(id);
    setDrawerOpen(true);
  };

  const handleToggleComplete = async (taskId: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = currentStatus === "CONCLUIDO" ? "A_FAZER" : "CONCLUIDO";
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatusKanban = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
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
        className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${
          colors[p] || colors.MEDIA
        }`}
      >
        {p}
      </span>
    );
  };

  const getStatusBadge = (s: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      IDEIA: { label: "Ideia", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
      RASCUNHO: { label: "Rascunho", color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
      A_FAZER: { label: "A Fazer", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      EM_ANDAMENTO: { label: "Em Andamento", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
      EM_TESTES: { label: "Em Testes", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      AGUARDANDO_RETORNO: { label: "Aguardando Retorno", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      CONCLUIDO: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      CANCELADO: { label: "Cancelado", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
    };
    const current = labels[s] || { label: s, color: "bg-slate-100 text-slate-700" };
    return (
      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${current.color}`}>
        {current.label}
      </span>
    );
  };

  // Kanban columns definition
  const kanbanColumns = [
    { id: "A_FAZER", title: "A Fazer", color: "border-blue-500" },
    { id: "EM_ANDAMENTO", title: "Em Andamento", color: "border-indigo-500" },
    { id: "EM_TESTES", title: "Em Testes", color: "border-purple-500" },
    { id: "AGUARDANDO_RETORNO", title: "Aguardando", color: "border-amber-500" },
    { id: "CONCLUIDO", title: "Concluído", color: "border-emerald-500" },
  ];

  // Calendar calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Minhas Demandas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gerenciamento e acompanhamento das atividades profissionais ({filteredTasks.length} itens)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setView("lista")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                view === "lista"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                view === "kanban"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setView("calendario")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                view === "calendario"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Calendário</span>
            </button>
          </div>

          <button
            onClick={() => setNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Demanda</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search text */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar demandas por título, categoria ou descrição..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quick Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">Todas Prioridades</option>
              <option value="CRITICA">Crítica</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">Todos os Status</option>
              <option value="A_FAZER">A Fazer</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="EM_TESTES">Em Testes</option>
              <option value="AGUARDANDO_RETORNO">Aguardando Retorno</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="IDEIA">Ideia</option>
            </select>

            {/* Project */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">Todos os Projetos</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Prazo */}
            <select
              value={prazoFilter}
              onChange={(e) => setPrazoFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">Todos os Prazos</option>
              <option value="ATRASADAS">🚨 Apenas Atrasadas</option>
              <option value="HOJE">📅 Vencem Hoje</option>
              <option value="SEMANA">Próximos 7 dias</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="createdAt">Mais Recentes</option>
              <option value="deadline">Por Vencimento</option>
              <option value="priority">Por Prioridade</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Content */}
      {view === "lista" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Nenhuma demanda encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTasks.map((task) => {
                const isOverdue =
                  task.deadline &&
                  new Date(task.deadline) < new Date() &&
                  task.status !== "CONCLUIDO" &&
                  task.status !== "CANCELADO";

                const isDone = task.status === "CONCLUIDO";

                return (
                  <div
                    key={task.id}
                    onClick={() => handleOpenTask(task.id)}
                    className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer transition group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Checkbox toggle */}
                      <button
                        onClick={(e) => handleToggleComplete(task.id, task.status, e)}
                        className={`mt-0.5 p-1 rounded-lg transition ${
                          isDone
                            ? "text-emerald-500"
                            : "text-slate-400 hover:text-emerald-500"
                        }`}
                        title={isDone ? "Reabrir demanda" : "Marcar como concluída"}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                          {task.project && (
                            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <Folder className="w-3 h-3 text-slate-400" />
                              {task.project.name}
                            </span>
                          )}
                          {task.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {task.category}
                            </span>
                          )}
                        </div>

                        <h3
                          className={`text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate ${
                            isDone ? "line-through text-slate-400 dark:text-slate-500" : ""
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.nextStep && !isDone && (
                          <p className="text-xs text-slate-500 truncate mt-1">
                            <span className="font-medium text-slate-600 dark:text-slate-400">
                              Próximo passo:{" "}
                            </span>
                            {task.nextStep}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0 self-end md:self-center pl-8 md:pl-0">
                      {/* Checklist count */}
                      {task.checklists?.length > 0 && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <span>
                            {task.checklists.filter((c: any) => c.completed).length}/
                            {task.checklists.length}
                          </span>
                        </div>
                      )}

                      {/* Deadline */}
                      <div
                        className={`flex items-center gap-1.5 font-medium ${
                          isOverdue
                            ? "text-rose-500"
                            : isDone
                            ? "text-slate-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {isOverdue ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {task.deadline
                            ? format(new Date(task.deadline), "dd/MM/yyyy")
                            : "Sem prazo"}
                        </span>
                      </div>

                      <Eye className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-col max-h-[80vh]"
              >
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80 dark:border-slate-800 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {col.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400">
                      Nenhuma demanda
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const isOverdue =
                        task.deadline &&
                        new Date(task.deadline) < new Date() &&
                        task.status !== "CONCLUIDO";

                      return (
                        <div
                          key={task.id}
                          onClick={() => handleOpenTask(task.id)}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 shadow-sm hover:shadow-md cursor-pointer transition space-y-2.5 group"
                        >
                          <div className="flex items-center justify-between gap-1">
                            {getPriorityBadge(task.priority)}
                            {task.project && (
                              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[100px]">
                                {task.project.name}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition line-clamp-2">
                            {task.title}
                          </h4>

                          {task.checklists?.length > 0 && (
                            <div className="text-[10px] text-slate-400 flex items-center justify-between">
                              <span>Checklist</span>
                              <span>
                                {task.checklists.filter((c: any) => c.completed).length}/
                                {task.checklists.length}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50 text-[10px]">
                            <span
                              className={`flex items-center gap-1 ${
                                isOverdue ? "text-rose-500 font-semibold" : "text-slate-400"
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {task.deadline
                                ? format(new Date(task.deadline), "dd/MM")
                                : "Sem prazo"}
                            </span>

                            {/* Fast status move */}
                            <select
                              value={task.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleUpdateStatusKanban(task.id, e.target.value)
                              }
                              className="text-[10px] bg-slate-100 dark:bg-slate-700/80 rounded px-1.5 py-0.5 border-none focus:outline-none"
                            >
                              <option value="A_FAZER">A Fazer</option>
                              <option value="EM_ANDAMENTO">Em Andamento</option>
                              <option value="EM_TESTES">Em Testes</option>
                              <option value="AGUARDANDO_RETORNO">Aguardando</option>
                              <option value="CONCLUIDO">Concluído</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar View */}
      {view === "calendario" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hoje
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div
                key={d}
                className="text-center font-semibold text-xs text-slate-400 py-1"
              >
                {d}
              </div>
            ))}

            {daysInMonth.map((day) => {
              const dayTasks = filteredTasks.filter(
                (t) => t.deadline && isSameDay(new Date(t.deadline), day)
              );
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition ${
                    isToday
                      ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20"
                      : "border-slate-200/60 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span
                      className={`font-semibold ${
                        isToday
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] px-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 font-mono">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-y-auto max-h-16">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleOpenTask(task.id)}
                        className="text-[10px] p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 truncate cursor-pointer hover:border-blue-500 transition"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${
                            task.priority === "CRITICA"
                              ? "bg-rose-500"
                              : task.priority === "ALTA"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                        />
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTaskId(null);
        }}
        onTaskUpdated={fetchTasks}
      />

      {/* Quick Add Modal */}
      <NewTaskModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onTaskCreated={fetchTasks}
      />
    </div>
  );
}

export default function DemandasPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
        </div>
      }
    >
      <DemandasContent />
    </Suspense>
  );
}
