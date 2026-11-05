const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // 1. Usuário padrão
  const email = process.env.ADMIN_EMAIL || "ingrid.ferreira@headsetbrasil.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email,
      name: "Ingrid Ferreira",
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`Usuário pronto: ${user.email}`);

  // Verificar se já temos projetos criados
  const existingProjects = await prisma.project.count();
  if (existingProjects > 0) {
    console.log("Banco de dados já contém registros. Seed ignorado.");
    return;
  }

  // 2. Projetos
  const p1 = await prisma.project.create({
    data: {
      name: "Clara - Affix",
      description: "Agente de inteligência artificial para atendimento, triagem e resolução de dúvidas de clientes Affix.",
      objective: "Automatizar 65% das dúvidas frequentes de beneficiários e integrar com CRM.",
      status: "EM_ANDAMENTO",
      startDate: new Date("2025-01-10"),
      deadline: new Date("2025-04-30"),
      color: "#3b82f6",
    },
  });

  const p2 = await prisma.project.create({
    data: {
      name: "Alter",
      description: "Plataforma de processamento inteligente e orquestração de assistentes corporativos.",
      objective: "Melhorar a retenção e o tempo de resposta em fluxos de onboarding.",
      status: "EM_ANDAMENTO",
      startDate: new Date("2025-01-15"),
      deadline: new Date("2025-05-15"),
      color: "#8b5cf6",
    },
  });

  const p3 = await prisma.project.create({
    data: {
      name: "Automações n8n",
      description: "Centralização e monitoramento de webhooks, pipelines de dados e sincronizações automáticas.",
      objective: "Garantir 99.8% de confiabilidade nas execuções de rotinas diárias.",
      status: "EM_ANDAMENTO",
      startDate: new Date("2025-02-01"),
      deadline: new Date("2025-06-30"),
      color: "#ec4899",
    },
  });

  const p4 = await prisma.project.create({
    data: {
      name: "Integrações e APIs",
      description: "Padronização de gateways, autenticações OAuth/Bearer e barramento de serviços.",
      objective: "Documentar e estruturar contratos de integração entre parceiros e serviços internos.",
      status: "PLANEJAMENTO",
      startDate: new Date("2025-02-10"),
      deadline: new Date("2025-07-31"),
      color: "#10b981",
    },
  });

  const p5 = await prisma.project.create({
    data: {
      name: "Projetos Pessoais",
      description: "Desenvolvimento de ferramentas próprias, automações de produtividade e laboratórios.",
      objective: "Construir sistemas eficientes para otimização de tempo e organização pessoal.",
      status: "EM_ANDAMENTO",
      startDate: new Date("2025-01-01"),
      color: "#f59e0b",
    },
  });

  const p6 = await prisma.project.create({
    data: {
      name: "Estudos e Desenvolvimento",
      description: "Aprofundamento em LLMs, Function Calling, RAG avançado, arquiteturas de agentes e TypeScript.",
      objective: "Manter-se na fronteira tecnológica em inteligência artificial aplicada.",
      status: "EM_ANDAMENTO",
      startDate: new Date("2025-01-01"),
      color: "#06b6d4",
    },
  });

  // 3. Agentes de IA
  const a1 = await prisma.agent.create({
    data: {
      name: "Clara - Atendimento Affix",
      description: "Assistente conversacional especializada em planos de saúde, boletos, carências e rede credenciada.",
      objective: "Responder dúvidas contratuais com precisão e encaminhar casos complexos para atendente humano.",
      company: "Affix",
      status: "HOMOLOGACAO",
      environment: "Homologação / Staging",
      projectId: p1.id,
      mainPrompt: `Você é Clara, a assistente virtual oficial da Affix. Seu tom deve ser acolhedor, profissional e direto. 
Suas diretrizes:
1. Sempre cumprimente o beneficiário pelo nome se informado.
2. Forneça instruções passo a passo para emissão de 2ª via de boleto.
3. Não forneça diagnósticos médicos nem dados confidenciais de terceiros.
4. Se o usuário estiver frustrado, ofereça transferência imediata para o setor de ouvidoria.`,
      procedures: "1. Validar CPF do titular no CRM\n2. Consultar status da apólice no sistema legado\n3. Gerar código de barras ou link seguro",
      tools: "ConsultaCRM, EmissaoBoletoAPI, BuscaRedeCredenciada, WebhookNotificacao",
      apis: "https://api.affix.com.br/v2/beneficiarios, https://api.affix.com.br/v1/financeiro/boletos",
      businessRules: "- Não enviar boleto vencido há mais de 60 dias sem autorização prévia.\n- Requer confirmação de data de nascimento para dados sensíveis.",
      limitations: "Não realiza cancelamento definitivo de contrato diretamente.",
      observations: "Em fase final de testes de carga para lançamento no WhatsApp.",
      workflowLinks: JSON.stringify([
        { label: "Workflow n8n - Triagem Clara", url: "https://n8n.internal/workflow/clara-triagem" },
        { label: "Documentação no Notion", url: "https://notion.so/affix/clara-spec" },
      ]),
    },
  });

  const a2 = await prisma.agent.create({
    data: {
      name: "Alter Triagem & Onboarding",
      description: "Agente responsável por coletar requisitos de novos usuários e configurar o espaço de trabalho.",
      objective: "Reduzir o tempo de ativação de 45 minutos para menos de 5 minutos.",
      company: "Alter",
      status: "EM_TESTES",
      environment: "Desenvolvimento",
      projectId: p2.id,
      mainPrompt: `Você é o agente de Onboarding do Alter. Guie o usuário pelas etapas fundamentais de configuração da conta corporativa de forma fluida.`,
      procedures: "Coleta de e-mail corporativo, criação de workspace, definição de papéis e permissões.",
      tools: "WorkspaceCreator, EmailValidator, SlackNotifier",
      apis: "https://api.alter.internal/v1/workspaces",
      businessRules: "Apenas domínios corporativos permitidos.",
      limitations: "Máximo de 5 convites simultâneos no plano inicial.",
      observations: "Necessário calibrar taxa de fallback para suporte.",
    },
  });

  const a3 = await prisma.agent.create({
    data: {
      name: "n8n Workflow Auditor",
      description: "Agente que inspeciona diariamente os nós com erro nas automações n8n e gera relatórios de anomalias.",
      objective: "Detectar falhas silenciosas antes que impactem a operação.",
      company: "Interno",
      status: "DESENVOLVIMENTO",
      environment: "Local",
      projectId: p3.id,
      mainPrompt: `Analise o log JSON de execuções com erro do n8n. Isole a mensagem de erro da API externa, o payload que causou a falha e sugira o fix.`,
      procedures: "Consome webhook de erro n8n, analisa stack trace e posta no canal #alertas-tech.",
      tools: "N8nApiReader, DiscordAlert, TelegramBot",
      apis: "http://localhost:5678/api/v1/executions",
      businessRules: "Disparar alerta com prioridade alta para falhas consecutivas > 3.",
    },
  });

  // 4. Prompts
  const pr1 = await prisma.prompt.create({
    data: {
      name: "System Prompt Principal - Clara Affix",
      objective: "Definir a persona, restrições e regras de ouro do atendimento da Clara.",
      description: "Prompt base injetado na primeira mensagem do agente no canal WhatsApp.",
      content: `Você é a Clara, inteligência artificial da Affix Benefícios.
Seu papel é acolher o beneficiário com empatia, agilidade e total clareza.

REGRAS DE CONVERSAÇÃO:
- Responda em no máximo 3 parágrafos curtos.
- Use emojis de forma moderada e profissional.
- Nunca invente coberturas não existentes no rol ANS.
- Para segunda via de boleto, solicite apenas o CPF cadastrado.`,
      version: "2.1.0",
      status: "PRODUCAO",
      expectedResult: "Respostas gentis, sem alucinações e com encaminhamento correto de ações.",
      knownIssues: "Eventualmente repete a saudação quando o webhook reenvia a mensagem.",
      projectId: p1.id,
      agentId: a1.id,
      versions: {
        create: [
          {
            version: "1.0.0",
            content: "Você é a Clara da Affix. Ajude o usuário a tirar dúvidas sobre o plano.",
            changelog: "Versão preliminar de teste de conceito.",
          },
          {
            version: "2.0.0",
            content: "Você é a Clara da Affix. Seja acolhedora e responda sobre boletos e rede credenciada.",
            changelog: "Adicionadas regras de boletos.",
          },
          {
            version: "2.1.0",
            content: `Você é a Clara, inteligência artificial da Affix Benefícios...`,
            changelog: "Ajuste na formatação para o WhatsApp e proteção contra alucinações.",
          },
        ],
      },
    },
  });

  const pr2 = await prisma.prompt.create({
    data: {
      name: "Extrator de Intenção & Entidades - n8n",
      objective: "Receber a mensagem bruta do usuário e retornar JSON puro com intention e entities.",
      description: "Prompt estruturado para Function Calling sem texto solto.",
      content: `Dada a mensagem do usuário, identifique a intenção principal e extraia as variáveis necessárias.
Retorne EXCLUSIVAMENTE um JSON com as chaves:
{
  "intencao": "SEGUNDA_VIA_BOLETO" | "REDE_CREDENCIADA" | "STATUS_CARENCIA" | "CANCELAMENTO" | "OUTROS",
  "confianca": 0.0 a 1.0,
  "cpf": string | null,
  "especialidade": string | null,
  "cidade": string | null
}`,
      version: "1.2.0",
      status: "APROVADO",
      expectedResult: "JSON parseável sem crases ou texto introdutório.",
      projectId: p3.id,
      agentId: a1.id,
    },
  });

  // 5. Demandas (Tasks)
  const today = new Date();
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000);

  const t1 = await prisma.task.create({
    data: {
      title: "Configurar fallback automático para atendente humano na Clara",
      description: "Quando o usuário expressar insatisfação repetida ou solicitar atendimento humano por 2 vezes seguidas, o bot deve transferir a fila no Chatwoot.",
      objective: "Evitar atrito com o cliente e manter satisfação acima de 4.8 estrelas.",
      priority: "CRITICA",
      status: "EM_ANDAMENTO",
      category: "Agente IA",
      deadline: tomorrow,
      projectId: p1.id,
      assignee: "Ingrid Ferreira",
      nextStep: "Implementar nó de decisão no fluxo n8n para avaliar score de sentimento.",
      observations: "Testado localmente com 10 amostras; validação com equipe técnica amanhã.",
      checklists: {
        create: [
          { title: "Criar endpoint de transferência no webhook", completed: true, order: 0 },
          { title: "Ajustar prompt de detecção de frustração", completed: true, order: 1 },
          { title: "Testar no ambiente de homologação da Affix", completed: false, order: 2 },
          { title: "Documentar regra de negócio no módulo de Docs", completed: false, order: 3 },
        ],
      },
    },
  });

  const t2 = await prisma.task.create({
    data: {
      title: "Validar taxa de entrega de Webhooks de boletos atrasados",
      description: "Verificar se as notificações de boletos vencidos estão caindo com delay acima de 15 minutos.",
      objective: "Garantir pontualidade e evitar cobrança indevida de clientes adimplentes.",
      priority: "ALTA",
      status: "A_FAZER",
      category: "Integrações",
      deadline: nextWeek,
      projectId: p4.id,
      assignee: "Ingrid Ferreira",
      nextStep: "Executar script de carga com 50 webhooks simultâneos.",
      checklists: {
        create: [
          { title: "Capturar logs dos últimos 7 dias", completed: false, order: 0 },
          { title: "Identificar gargalos de I/O no banco", completed: false, order: 1 },
        ],
      },
    },
  });

  const t3 = await prisma.task.create({
    data: {
      title: "Criar pipeline de monitoramento de custos de OpenAI e Anthropic",
      description: "Configurar alerta diário no Telegram quando o consumo de tokens ultrapassar $15 no dia.",
      objective: "Manter controle financeiro das automações.",
      priority: "MEDIA",
      status: "A_FAZER",
      category: "Automação",
      deadline: nextWeek,
      projectId: p3.id,
      assignee: "Ingrid Ferreira",
      nextStep: "Consumir API de usage da OpenAI via cronjob n8n.",
      checklists: {
        create: [
          { title: "Gerar chave de API com escopo de leitura de billing", completed: true, order: 0 },
          { title: "Construir workflow n8n", completed: false, order: 1 },
        ],
      },
    },
  });

  const t4 = await prisma.task.create({
    data: {
      title: "Implementar autenticação JWT e criptografia de senhas na Central de Trabalho",
      description: "Criar rota de login segura com cookie HttpOnly e middleware de proteção de rotas.",
      objective: "Garantir privacidade e proteção das informações de trabalho.",
      priority: "ALTA",
      status: "CONCLUIDO",
      completedAt: yesterday,
      category: "Arquitetura",
      deadline: yesterday,
      projectId: p5.id,
      assignee: "Ingrid Ferreira",
      observations: "Estruturado com jose e bcryptjs.",
      checklists: {
        create: [
          { title: "Definir rota de API /api/auth/login", completed: true, order: 0 },
          { title: "Configurar middleware de sessão", completed: true, order: 1 },
        ],
      },
    },
  });

  const t5 = await prisma.task.create({
    data: {
      title: "Revisar diretrizes de Prompt Engineering para modelos de raciocínio",
      description: "Estudar o impacto do uso de Chain-of-Thought versus instruções diretas em chamadas de agentes.",
      objective: "Otimizar latência e precisão nas respostas técnicas.",
      priority: "BAIXA",
      status: "EM_TESTES",
      category: "Estudos",
      deadline: nextWeek,
      projectId: p6.id,
      assignee: "Ingrid Ferreira",
    },
  });

  // 6. Testes (TestExecution)
  await prisma.testExecution.create({
    data: {
      name: "Teste de Carga - Emissão de Boleto Clara",
      scenario: "Simulação de 30 usuários requisitando segunda via de boleto em menos de 1 minuto.",
      objective: "Verificar se a API da Affix suporta as requisições em paralelo do webhook.",
      expectedResult: "100% de sucesso com código de resposta 200 e tempo médio de resposta < 1.8s.",
      actualResult: "28 de 30 requisições retornaram com sucesso. 2 requisições sofreram timeout na consulta SOAP interna.",
      status: "AGUARDANDO_CORRECAO",
      identifiedError: "Timeout na conexão HTTP com o barramento legado da operadora.",
      rootCause: "Pool de conexões simultâneas do backend legado estava limitado a 10.",
      appliedSolution: "Solicitado aumento do pool de conexões para 50 para a equipe de infra.",
      nextAction: "Repetir o teste após o deploy da infra na quinta-feira.",
      executionLink: "https://k6.io/reports/clara-boleto-carga-01",
      agentId: a1.id,
      projectId: p1.id,
    },
  });

  await prisma.testExecution.create({
    data: {
      name: "Validação de Sanitização de CPF",
      scenario: "Envio de CPFs formatados com pontos, traços, espaços e letras acidentais.",
      objective: "Garantir que a regex de extração normaliza para 11 dígitos numéricos.",
      expectedResult: "Apenas dígitos de 0 a 9 preservados.",
      actualResult: "Aprovado com 100% de precisão nos 25 casos de teste.",
      status: "APROVADO",
      agentId: a1.id,
      projectId: p1.id,
    },
  });

  // 7. Documentação Técnica
  await prisma.technicalDoc.create({
    data: {
      title: "API de Emissão de 2ª Via de Boleto - Affix",
      category: "API",
      endpoint: "https://api.affix.com.br/v2/financeiro/boletos/segunda-via",
      httpMethod: "POST",
      authentication: "Bearer JWT",
      requestHeaders: "Content-Type: application/json\nAuthorization: Bearer {{TOKEN_SERVICO}}",
      requestPayload: JSON.stringify(
        {
          cpf: "12345678900",
          origem: "WHATSAPP_CLARA",
          competencia: "2025-03",
        },
        null,
        2
      ),
      responsePayload: JSON.stringify(
        {
          sucesso: true,
          linhaDigitavel: "23790.00000 00000.000000 00000.000000 1 95000000000000",
          linkPdf: "https://boletos.affix.com.br/doc/202503-abc.pdf",
          valor: 589.4,
          vencimento: "2025-03-10",
        },
        null,
        2
      ),
      businessRules: "Caso o contrato esteja em suspensão temporária, a API retorna código 422 com mensagem amigável.",
      procedures: "1. Obter token M2M no endpoint de auth.\n2. Chamar o POST com CPF limpo.\n3. Entregar linha digitável ao usuário.",
      technicalNotes: "A API possui rate limit de 120 requisições por minuto por IP.",
      projectId: p1.id,
    },
  });

  await prisma.technicalDoc.create({
    data: {
      title: "Padrão de Webhook n8n para Agentes de IA",
      category: "Arquitetura",
      endpoint: "https://n8n.internal/webhook/v1/agent-event",
      httpMethod: "POST",
      authentication: "Header 'X-Webhook-Secret'",
      requestPayload: JSON.stringify(
        {
          agentId: "clara-v2",
          userId: "5511999999999",
          message: "Preciso da minha fatura de março",
          timestamp: "2025-03-01T14:32:00Z",
        },
        null,
        2
      ),
      businessRules: "Sempre responder com HTTP 200 imediatamente e processar em fila assíncrona se durar mais de 3 segundos.",
      projectId: p3.id,
    },
  });

  // 8. Ideias e Rascunhos
  await prisma.note.create({
    data: {
      title: "Adicionar síntese de voz (TTS) para respostas de áudio da Clara",
      content: "Beneficiários que enviam áudio no WhatsApp têm 3x mais engajamento se receberem uma resposta curta em áudio também. Estudar ElevenLabs ou OpenAI TTS.",
      category: "Ideia",
      isImplemented: false,
      projectId: p1.id,
    },
  });

  const implementedNote = await prisma.note.create({
    data: {
      title: "Criar central de trabalho pessoal completa com Docker",
      content: "Desenvolver uma central própria com Dashboard, Demandas, Agentes, Prompts, Testes e Documentação para gestão diária de alta performance.",
      category: "Ideia",
      isImplemented: true,
      convertedToTaskId: t4.id,
      projectId: p5.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "Rascunho de prompt para auditoria automática de contratos de planos",
      content: "Prompt que recebe PDF de contrato e resume carências de parto, internação e urgência em uma tabela simplificada para o usuário.",
      category: "Rascunho",
      isImplemented: false,
      projectId: p6.id,
    },
  });

  // 9. Histórico de Atividades
  await prisma.activityHistory.createMany({
    data: [
      {
        action: "CRIACAO",
        entityType: "TASK",
        entityId: t1.id,
        description: "Demanda criada: 'Configurar fallback automático para atendente humano na Clara'",
        taskId: t1.id,
        projectId: p1.id,
      },
      {
        action: "CONCLUSAO",
        entityType: "TASK",
        entityId: t4.id,
        description: "Demanda concluída: 'Implementar autenticação JWT e criptografia de senhas na Central de Trabalho'",
        taskId: t4.id,
        projectId: p5.id,
      },
      {
        action: "STATUS_ALTERADO",
        entityType: "AGENT",
        entityId: a1.id,
        description: "Agente 'Clara - Atendimento Affix' promovido para status 'HOMOLOGACAO'",
        agentId: a1.id,
        projectId: p1.id,
      },
      {
        action: "CONVERSAO",
        entityType: "NOTE",
        entityId: implementedNote.id,
        description: "Ideia 'Criar central de trabalho pessoal completa' convertida em demanda de trabalho.",
        projectId: p5.id,
      },
    ],
  });

  console.log("Seed concluído com sucesso! Banco populado com dados realistas.");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
