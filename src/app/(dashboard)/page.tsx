"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Flame,
  Calendar,
  CheckCircle2,
  FolderGit2,
  Bot,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Plus,
  ChevronRight,
  TrendingUp,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DailyPlanner from "@/components/dashboard/DailyPlanner";
import TaskDetailDrawer from "@/components/demandas/TaskDetailDrawer";
import NewTaskModal from "@/components/modals/NewTaskModal";

interface DashboardData {
  metrics: {
    totalOpenTasks: number;
    inProgressTasks: number;
    highPriorityTasks: number;
    overdueTasks: number;
    upcomingCount: number;
    completedThisMonth: number;
    activeProjects: number;
    registeredAgents: number;
    totalTasks: number;
  };
  attentionToday: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    deadline?: string;
    nextStep?: string;
    project?: { name: string; color?: string };
    checklists?: Array<{ id: string; completed: boolean }>;
  }>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    priority: string;
    deadline?: string;
    project?: { name: string };
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    description: string;
    createdAt: string;
  }>;
  recentProjects: Array<{
    id: string;
    name: string;
    description?: string;
    color?: string;
    _count: { tasks: number; agents: number };
  }>;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States for Task Drawer & Planner
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<string>("");

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "CONCLUIDO" ? "A_FAZER" : "CONCLUIDO";
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Carregando painel de controle...</span>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalOpenTasks: 0,
    inProgressTasks: 0,
    highPriorityTasks: 0,
    overdueTasks: 0,
    upcomingCount: 0,
    completedThisMonth: 0,
    activeProjects: 0,
    registeredAgents: 0,
    totalTasks: 0,
  };

  const completionRate =
    metrics.totalTasks > 0
      ? Math.round((metrics.completedThisMonth / metrics.totalTasks) * 100)
      : 0;

  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Executive Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Central de Trabalho IA
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Painel Executivo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
            {todayFormatted} • Acompanhamento em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/demandas"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition"
          >
            <span>Ver Todas as Demandas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Grid (8 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Abertas */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Demandas Abertas</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {metrics.totalOpenTasks}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total acumulado não concluído</p>
        </div>

        {/* Em Andamento */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Em Andamento</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {metrics.inProgressTasks}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Demandas ativas em execução</p>
        </div>

        {/* Alta Prioridade */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Alta Prioridade</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {metrics.highPriorityTasks}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Críticas e de alto impacto</p>
        </div>

        {/* Demandas Atrasadas */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Atrasadas</span>
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {metrics.overdueTasks}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Com prazo anterior a hoje</p>
        </div>

        {/* Próximos Vencimentos */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Próximos 7 Dias</span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {metrics.upcomingCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Entregas agendadas na semana</p>
        </div>

        {/* Concluídas no Mês */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Concluídas Mês</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics.completedThisMonth}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Finalizadas no período atual</p>
        </div>

        {/* Projetos Ativos */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Projetos Ativos</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {metrics.activeProjects}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Iniciativas em andamento</p>
        </div>

        {/* Agentes IA */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Agentes de IA</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {metrics.registeredAgents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Assistentes documentados</p>
        </div>
      </div>

      {/* Calendário Interativo: O que devo fazer no dia */}
      <DailyPlanner
        onOpenNewTaskWithDate={(dateStr) => {
          setPreselectedDate(dateStr);
          setIsNewTaskOpen(true);
        }}
        onOpenTaskDetails={(taskId) => {
          setSelectedTaskId(taskId);
          setIsDrawerOpen(true);
        }}
      />

      {/* Seção Especial: Minha Atenção Hoje */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Minha Atenção Hoje
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
              Urgências e Próximos Passos
            </span>
          </div>
          <Link
            href="/demandas?priority=CRITICA"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            Ver fila prioritária <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.attentionToday.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <span>Nenhuma demanda urgente pendente para hoje! Tudo sob controle.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.attentionToday.map((task) => {
              const isOverdue =
                task.deadline && new Date(task.deadline) < new Date();
              const isCritical = task.priority === "CRITICA";

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition group hover:shadow-md ${
                    isCritical
                      ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                      : isOverdue
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60"
                      : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                          isCritical
                            ? "bg-rose-500 text-white"
                            : task.priority === "ALTA"
                            ? "bg-amber-500 text-white"
                            : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {task.priority}
                      </span>
                      {task.project && (
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                          {task.project.name}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/demandas?id=${task.id}`}
                      className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 transition"
                    >
                      {task.title}
                    </Link>

                    {task.nextStep && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800/80">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Próximo passo:{" "}
                        </span>
                        {task.nextStep}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        isOverdue ? "text-rose-500" : "text-slate-500"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {task.deadline
                        ? format(new Date(task.deadline), "dd/MM")
                        : "Sem prazo"}
                    </span>
                    <button
                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      className="flex items-center gap-1 text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
                      title="Marcar como concluída"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[11px]">Concluir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gráficos de Produtividade & Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" /> Status das Demandas
            </h3>
            <span className="text-xs text-slate-400">Total: {metrics.totalTasks}</span>
          </div>

          <div className="space-y-3">
            {[
              { label: "A Fazer", key: "A_FAZER", color: "bg-slate-400" },
              { label: "Em Andamento", key: "EM_ANDAMENTO", color: "bg-blue-500" },
              { label: "Em Testes", key: "EM_TESTES", color: "bg-purple-500" },
              { label: "Aguardando", key: "AGUARDANDO_RETORNO", color: "bg-amber-500" },
              { label: "Concluído", key: "CONCLUIDO", color: "bg-emerald-500" },
            ].map((item) => {
              const count = data?.statusCounts?.[item.key] || 0;
              const percentage =
                metrics.totalTasks > 0
                  ? Math.round((count / metrics.totalTasks) * 100)
                  : 0;

              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prioridades */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" /> Carga por Prioridade
            </h3>
            <span className="text-xs text-slate-400">Demandas abertas</span>
          </div>

          <div className="space-y-3">
            {[
              { label: "Crítica", key: "CRITICA", color: "bg-rose-500" },
              { label: "Alta", key: "ALTA", color: "bg-amber-500" },
              { label: "Média", key: "MEDIA", color: "bg-blue-500" },
              { label: "Baixa", key: "BAIXA", color: "bg-slate-400" },
            ].map((item) => {
              const count = data?.priorityCounts?.[item.key] || 0;
              const percentage =
                metrics.totalOpenTasks > 0
                  ? Math.round((count / metrics.totalOpenTasks) * 100)
                  : 0;

              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Atividades Recentes
            </h3>
            <Link
              href="/historico"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Histórico
            </Link>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {data?.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma atividade recente.</p>
            ) : (
              data?.recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 dark:text-slate-200 leading-snug">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(act.createdAt), "dd/MM HH:mm")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Details Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTaskId(null);
        }}
        onTaskUpdated={fetchStats}
      />

      {/* New Task Modal with optional preselected date from calendar */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => {
          setIsNewTaskOpen(false);
          setPreselectedDate("");
        }}
        onTaskCreated={fetchStats}
        initialDeadline={preselectedDate}
      />
    </div>
  );
}
