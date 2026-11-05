"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Folder,
  Flag,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  ListTodo,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addDays,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyPlannerProps {
  onOpenNewTaskWithDate?: (dateStr: string) => void;
  onOpenTaskDetails?: (taskId: string) => void;
}

export default function DailyPlanner({
  onOpenNewTaskWithDate,
  onOpenTaskDetails,
}: DailyPlannerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    selectedDate: string;
    tasksDue: any[];
    tasksCompleted: any[];
    inProgressTasks: any[];
    daysWithTasks: string[];
    totalDue: number;
    totalCompleted: number;
  } | null>(null);

  const formattedDateParam = format(selectedDate, "yyyy-MM-dd");

  const fetchDayTasks = async (dateStr: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks/by-date?date=${dateStr}`);
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
    fetchDayTasks(formattedDateParam);
  }, [formattedDateParam]);

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    if (!isSameMonth(day, calendarMonth)) {
      setCalendarMonth(day);
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "CONCLUIDO" ? "A_FAZER" : "CONCLUIDO";
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchDayTasks(formattedDateParam);
    } catch (e) {
      console.error(e);
    }
  };

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const isToday = isSameDay(selectedDate, new Date());
  const selectedDateFormatted = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const getPriorityBadge = (p: string) => {
    const colors: Record<string, string> = {
      CRITICA: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      ALTA: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      MEDIA: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      BAIXA: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    };
    return (
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
          colors[p] || colors.MEDIA
        }`}
      >
        {p}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <CalendarIcon className="w-3.5 h-3.5" /> Agenda Diária
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            O que devo fazer no dia?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Selecione qualquer data no calendário para consultar e gerenciar as atividades daquele dia
          </p>
        </div>

        {/* Quick Day Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleSelectDay(subDays(new Date(), 1))}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            Ontem
          </button>
          <button
            onClick={() => handleSelectDay(new Date())}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition ${
              isToday
                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => handleSelectDay(addDays(new Date(), 1))}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            Amanhã
          </button>
          <button
            onClick={() => fetchDayTasks(formattedDateParam)}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
            title="Atualizar agenda deste dia"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (4 cols), Day's Agenda on Right (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Mini Calendar Picker (4 cols) */}
        <div className="lg:col-span-5 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          {/* Month Navigator */}
          <div className="flex items-center justify-between pb-2">
            <span className="font-bold text-xs capitalize text-slate-800 dark:text-slate-200">
              {format(calendarMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <span key={i} className="text-[10px] font-semibold text-slate-400 py-1">
                {d}
              </span>
            ))}

            {daysInMonth.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isSameDay(day, new Date());
              const hasTasks = data?.daysWithTasks.includes(dayStr);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleSelectDay(day)}
                  className={`h-9 rounded-xl text-xs font-medium flex flex-col items-center justify-center relative transition ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                      : isCurrentDay
                      ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <span>{format(day, "d")}</span>
                  {hasTasks && (
                    <span
                      className={`w-1 h-1 rounded-full absolute bottom-1 ${
                        isSelected ? "bg-white" : "bg-blue-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-200/80 dark:border-slate-700/60">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Dias com entregas
            </span>
            <span className="text-[10px] font-mono">{formattedDateParam}</span>
          </div>
        </div>

        {/* Right: What to do on Selected Day (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <span className="text-xs text-slate-400 font-medium">Programação para:</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 capitalize">
                {selectedDateFormatted}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {onOpenNewTaskWithDate && (
                <button
                  onClick={() => onOpenNewTaskWithDate(formattedDateParam)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agendar para este dia</span>
                </button>
              )}
            </div>
          </div>

          {/* Content Lists */}
          {data?.tasksDue.length === 0 ? (
            <div className="space-y-4">
              {/* Empty state for this specific day */}
              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nenhuma entrega agendada para {format(selectedDate, "dd/MM/yyyy")}.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Você pode agendar uma nova demanda com este prazo ou focar nas tarefas em andamento.
                </p>
              </div>

              {/* Recommended tasks to work on */}
              {data.inProgressTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Demandas em andamento recomendadas:
                    </span>
                    <Link
                      href="/demandas"
                      className="text-blue-500 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Ver todas <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {data.inProgressTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onOpenTaskDetails && onOpenTaskDetails(t.id)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getPriorityBadge(t.priority)}
                            {t.project && (
                              <span className="text-[10px] text-slate-400">
                                {t.project.name}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {t.title}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(t.id, t.status);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-500 transition"
                          title="Concluir"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">
                  {data?.tasksDue.length} demanda{data?.tasksDue.length === 1 ? "" : "s"} agendada{data?.tasksDue.length === 1 ? "" : "s"}
                </span>
                <span className="text-[11px] text-emerald-500 font-medium">
                  {data?.tasksDue.filter((t) => t.status === "CONCLUIDO").length} de{" "}
                  {data?.tasksDue.length} concluídas
                </span>
              </div>

              {data?.tasksDue.map((task) => {
                const isDone = task.status === "CONCLUIDO";

                return (
                  <div
                    key={task.id}
                    onClick={() => onOpenTaskDetails && onOpenTaskDetails(task.id)}
                    className={`p-3.5 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                      isDone
                        ? "bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/50 dark:border-slate-800/50 opacity-70"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(task.id, task.status);
                      }}
                      className={`mt-0.5 p-1 rounded-lg transition ${
                        isDone ? "text-emerald-500" : "text-slate-400 hover:text-emerald-500"
                      }`}
                      title={isDone ? "Reabrir demanda" : "Marcar como concluída"}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getPriorityBadge(task.priority)}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {task.status}
                        </span>
                        {task.project && (
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <Folder className="w-3 h-3 text-slate-400" />
                            {task.project.name}
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-xs font-semibold text-slate-900 dark:text-slate-100 ${
                          isDone ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.nextStep && !isDone && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                          <strong>Próximo passo: </strong>
                          {task.nextStep}
                        </p>
                      )}

                      {task.checklists?.length > 0 && (
                        <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                          <ListTodo className="w-3 h-3" />
                          <span>
                            {task.checklists.filter((c: any) => c.completed).length}/
                            {task.checklists.length} subtarefas
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
