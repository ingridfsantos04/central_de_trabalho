"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  ArrowLeft,
  Sparkles,
  Wrench,
  BookOpen,
  FlaskConical,
  History,
  FileCode,
  Save,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  FolderGit2,
} from "lucide-react";
import { format } from "date-fns";

type Tab =
  | "visao_geral"
  | "prompts"
  | "procedimentos"
  | "ferramentas"
  | "documentacao"
  | "testes"
  | "historico";

export default function AgenteDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("visao_geral");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    status: "",
    environment: "",
    objective: "",
    description: "",
    mainPrompt: "",
    procedures: "",
    tools: "",
    apis: "",
    businessRules: "",
    limitations: "",
    observations: "",
  });

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agents/${agentId}`);
      if (res.ok) {
        const data = await res.json();
        setAgent(data.agent);
        setFormData({
          name: data.agent.name || "",
          company: data.agent.company || "",
          status: data.agent.status || "DESENVOLVIMENTO",
          environment: data.agent.environment || "Produção",
          objective: data.agent.objective || "",
          description: data.agent.description || "",
          mainPrompt: data.agent.mainPrompt || "",
          procedures: data.agent.procedures || "",
          tools: data.agent.tools || "",
          apis: data.agent.apis || "",
          businessRules: data.agent.businessRules || "",
          limitations: data.agent.limitations || "",
          observations: data.agent.observations || "",
        });
      } else {
        router.push("/agentes");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchAgent();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPrompt = () => {
    if (formData.mainPrompt) {
      navigator.clipboard.writeText(formData.mainPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/agentes"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate">
                {agent.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {agent.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {agent.company ? `${agent.company} • ` : ""}
              Ambiente: {agent.environment || "Produção"}
              {agent.project ? ` • Projeto: ${agent.project.name}` : ""}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/20 transition disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Salvar Alterações</span>
        </button>
      </div>

      {/* 7 Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: "visao_geral", label: "Visão Geral", icon: Bot },
          { id: "prompts", label: `Prompts (${agent.prompts?.length || 0})`, icon: Sparkles },
          { id: "procedimentos", label: "Procedimentos", icon: FileCode },
          { id: "ferramentas", label: "Ferramentas & APIs", icon: Wrench },
          { id: "documentacao", label: "Documentação & Links", icon: BookOpen },
          { id: "testes", label: `Testes (${agent.tests?.length || 0})`, icon: FlaskConical },
          { id: "historico", label: `Histórico (${agent.activities?.length || 0})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition whitespace-nowrap ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        {/* Aba 1: Visão Geral */}
        {activeTab === "visao_geral" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Nome do Agente
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Status Operacional
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="PLANEJAMENTO">Planejamento</option>
                  <option value="DESENVOLVIMENTO">Desenvolvimento</option>
                  <option value="EM_TESTES">Em Testes</option>
                  <option value="HOMOLOGACAO">Homologação</option>
                  <option value="EM_PRODUCAO">Em Produção</option>
                  <option value="DESCONTINUADO">Descontinuado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Objetivo Estratégico
              </label>
              <textarea
                rows={2}
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Descrição & Contexto Operacional
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Regras de Negócio
                </label>
                <textarea
                  rows={4}
                  value={formData.businessRules}
                  onChange={(e) => setFormData({ ...formData, businessRules: e.target.value })}
                  placeholder="- Regra 1: Não emitir boleto vencido há 60 dias..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Limitações do Agente
                </label>
                <textarea
                  rows={4}
                  value={formData.limitations}
                  onChange={(e) => setFormData({ ...formData, limitations: e.target.value })}
                  placeholder="- Não cancela apólices diretamente..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Aba 2: Prompts */}
        {activeTab === "prompts" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Prompt Principal (System Prompt)
                </h3>
                <p className="text-xs text-slate-400">
                  Instrução mestra injetada no início da conversa
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? "Copiado!" : "Copiar Prompt"}</span>
              </button>
            </div>

            <textarea
              rows={12}
              value={formData.mainPrompt}
              onChange={(e) => setFormData({ ...formData, mainPrompt: e.target.value })}
              className="w-full p-4 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl focus:outline-none leading-relaxed"
            />

            {/* Prompts vinculados */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-slate-400">
                Outros Prompts Vinculados ({agent.prompts?.length || 0})
              </h4>
              {agent.prompts?.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum prompt adicional vinculado.</p>
              ) : (
                agent.prompts.map((pr: any) => (
                  <Link
                    key={pr.id}
                    href={`/prompts?id=${pr.id}`}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs transition"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {pr.name}
                      </span>
                      <span className="text-slate-400 ml-2">v{pr.version}</span>
                    </div>
                    <span className="text-blue-500 hover:underline">Abrir na Biblioteca</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* Aba 3: Procedimentos */}
        {activeTab === "procedimentos" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                Procedimentos Operacionais Padrão (SOP)
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Roteiros de ação, sequência de checagens e regras para tomada de decisão
              </p>
            </div>

            <textarea
              rows={10}
              value={formData.procedures}
              onChange={(e) => setFormData({ ...formData, procedures: e.target.value })}
              placeholder="1. Validar CPF no CRM&#10;2. Consultar se há boletos pendentes&#10;3. Entregar código de barras se positivo..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none leading-relaxed"
            />
          </div>
        )}

        {/* Aba 4: Ferramentas & APIs */}
        {activeTab === "ferramentas" && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Ferramentas Integradas (Function Calling / Tools)
              </label>
              <textarea
                rows={4}
                value={formData.tools}
                onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                placeholder="ConsultaCRM, EmissaoBoleto, DisparoWebhook..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 font-mono text-xs border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                APIs e Endpoints Consumidos
              </label>
              <textarea
                rows={4}
                value={formData.apis}
                onChange={(e) => setFormData({ ...formData, apis: e.target.value })}
                placeholder="https://api.affix.com.br/v2/beneficiarios&#10;https://api.affix.com.br/v1/financeiro..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 font-mono text-xs border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Aba 5: Documentação & Links */}
        {activeTab === "documentacao" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Observações Técnicas & Links para Workflows (n8n, Make, Flowise)
              </label>
              <textarea
                rows={4}
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Links de documentação, especificações no Notion..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            {agent.workflowLinks && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Links de Workflows configurados:
                </span>
                <pre className="font-mono text-[11px] overflow-x-auto text-slate-500">
                  {agent.workflowLinks}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Aba 6: Testes */}
        {activeTab === "testes" && (
          <div className="space-y-3">
            {agent.tests?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum teste de validação registrado para este agente.
              </div>
            ) : (
              agent.tests.map((test: any) => (
                <Link
                  key={test.id}
                  href={`/testes?id=${test.id}`}
                  className="block p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {test.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        test.status === "APROVADO"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : test.status === "FALHOU"
                          ? "bg-rose-500/10 text-rose-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>
                  <p className="text-slate-500">{test.scenario}</p>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Aba 7: Histórico */}
        {activeTab === "historico" && (
          <div className="space-y-2">
            {agent.activities?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhuma alteração registrada.
              </div>
            ) : (
              agent.activities.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between text-slate-600 dark:text-slate-300"
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
    </div>
  );
}
