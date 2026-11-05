"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderGit2,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Bot,
  Sparkles,
  BookOpen,
  FlaskConical,
  History,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  ListTodo,
} from "lucide-react";
import { format } from "date-fns";
import NewTaskModal from "@/components/modals/NewTaskModal";
import TaskDetailDrawer from "@/components/demandas/TaskDetailDrawer";

type Tab = "demandas" | "agentes" | "prompts" | "documentacao" | "testes" | "historico";

export default function ProjetoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("demandas");

  // Modals & Drawers
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      } else {
        router.push("/projetos");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/projetos"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: project.color || "#3b82f6" }}
            />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate">
              {project.name}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
              {project.status}
            </span>
          </div>
          {project.objective && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {project.objective}
            </p>
          )}
        </div>

        <button
          onClick={() => setNewTaskOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Demanda</span>
        </button>
      </div>

      {/* Progress & Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Descrição do Escopo
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {project.description || "Nenhuma descrição detalhada informada."}
            </p>
          </div>

          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Taxa de Conclusão:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {project.progress}% ({project.completedTasks}/{project.totalTasks})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="flex justify-between pt-1 text-[11px] text-slate-500">
              <span>Prazo final:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {project.deadline
                  ? format(new Date(project.deadline), "dd/MM/yyyy")
                  : "Sem prazo"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: "demandas", label: `Demandas (${project.tasks?.length || 0})`, icon: ListTodo },
          { id: "agentes", label: `Agentes IA (${project.agents?.length || 0})`, icon: Bot },
          { id: "prompts", label: `Prompts (${project.prompts?.length || 0})`, icon: Sparkles },
          { id: "documentacao", label: `Documentação (${project.documents?.length || 0})`, icon: BookOpen },
          { id: "testes", label: `Testes (${project.tests?.length || 0})`, icon: FlaskConical },
          { id: "historico", label: `Histórico (${project.activities?.length || 0})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
                isActive
                  ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        {/* Demandas */}
        {activeTab === "demandas" && (
          <div className="space-y-3">
            {project.tasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhuma demanda vinculada a este projeto ainda.
              </div>
            ) : (
              project.tasks.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setTaskDrawerOpen(true);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                        {task.priority}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {task.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {task.title}
                    </h4>
                  </div>
                  <div className="text-xs text-slate-400 shrink-0 pl-4">
                    {task.deadline
                      ? format(new Date(task.deadline), "dd/MM/yyyy")
                      : "Sem prazo"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Agentes */}
        {activeTab === "agentes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.agents.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-xs text-slate-400">
                Nenhum agente de IA associado a este projeto.
              </div>
            ) : (
              project.agents.map((ag: any) => (
                <Link
                  key={ag.id}
                  href={`/agentes/${ag.id}`}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex items-start gap-3"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {ag.name}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {ag.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {ag.description || ag.objective}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Prompts */}
        {activeTab === "prompts" && (
          <div className="space-y-3">
            {project.prompts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum prompt vinculado a este projeto.
              </div>
            ) : (
              project.prompts.map((pr: any) => (
                <Link
                  key={pr.id}
                  href={`/prompts?id=${pr.id}`}
                  className="block p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {pr.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono">
                      v{pr.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {pr.objective || pr.description}
                  </p>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Documentação */}
        {activeTab === "documentacao" && (
          <div className="space-y-3">
            {project.documents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhuma documentação técnica registrada para este projeto.
              </div>
            ) : (
              project.documents.map((doc: any) => (
                <Link
                  key={doc.id}
                  href={`/documentacao?id=${doc.id}`}
                  className="block p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {doc.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-500">
                      {doc.category}
                    </span>
                  </div>
                  {doc.endpoint && (
                    <code className="text-[11px] font-mono text-slate-500 block truncate">
                      {doc.httpMethod || "GET"} {doc.endpoint}
                    </code>
                  )}
                </Link>
              ))
            )}
          </div>
        )}

        {/* Testes */}
        {activeTab === "testes" && (
          <div className="space-y-3">
            {project.tests.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum teste registrado para este projeto.
              </div>
            ) : (
              project.tests.map((test: any) => (
                <Link
                  key={test.id}
                  href={`/testes?id=${test.id}`}
                  className="block p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {test.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {test.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{test.scenario}</p>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Histórico */}
        {activeTab === "historico" && (
          <div className="space-y-2">
            {project.activities.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum registro de atividade.
              </div>
            ) : (
              project.activities.map((act: any) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between text-slate-600 dark:text-slate-300"
                >
                  <span>{act.description}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {format(new Date(act.createdAt), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <NewTaskModal
        isOpen={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        onTaskCreated={fetchProject}
      />

      <TaskDetailDrawer
        taskId={selectedTaskId}
        isOpen={taskDrawerOpen}
        onClose={() => {
          setTaskDrawerOpen(false);
          setSelectedTaskId(null);
        }}
        onTaskUpdated={fetchProject}
      />
    </div>
  );
}
