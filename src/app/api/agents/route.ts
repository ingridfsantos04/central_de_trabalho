import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        project: { select: { id: true, name: true, color: true } },
        _count: {
          select: { prompts: true, tests: true },
        },
      },
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error("Erro ao listar agentes:", error);
    return NextResponse.json({ error: "Erro ao listar agentes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      objective,
      company,
      status,
      environment,
      mainPrompt,
      procedures,
      tools,
      apis,
      businessRules,
      limitations,
      observations,
      workflowLinks,
      projectId,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nome do agente é obrigatório." }, { status: 400 });
    }

    const agent = await prisma.agent.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        objective: objective?.trim() || null,
        company: company?.trim() || null,
        status: status || "DESENVOLVIMENTO",
        environment: environment || "Produção",
        mainPrompt: mainPrompt || null,
        procedures: procedures || null,
        tools: tools || null,
        apis: apis || null,
        businessRules: businessRules || null,
        limitations: limitations || null,
        observations: observations || null,
        workflowLinks: workflowLinks ? (typeof workflowLinks === "string" ? workflowLinks : JSON.stringify(workflowLinks)) : null,
        projectId: projectId || null,
      },
    });

    await prisma.activityHistory.create({
      data: {
        action: "CRIACAO",
        entityType: "AGENT",
        entityId: agent.id,
        description: `Agente de IA cadastrado: "${agent.name}"`,
        agentId: agent.id,
        projectId: agent.projectId || undefined,
      },
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar agente:", error);
    return NextResponse.json({ error: "Erro ao criar agente." }, { status: 500 });
  }
}
