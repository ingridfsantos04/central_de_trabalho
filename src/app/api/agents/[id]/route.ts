import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        prompts: {
          orderBy: { updatedAt: "desc" },
          include: { versions: { orderBy: { createdAt: "desc" } } },
        },
        tests: {
          orderBy: { createdAt: "desc" },
        },
        activities: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error("Erro ao buscar agente:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const current = await prisma.agent.findUnique({ where: { id: params.id } });
    if (!current) {
      return NextResponse.json({ error: "Agente não encontrado." }, { status: 404 });
    }

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

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (objective !== undefined) data.objective = objective;
    if (company !== undefined) data.company = company;
    if (status !== undefined) data.status = status;
    if (environment !== undefined) data.environment = environment;
    if (mainPrompt !== undefined) data.mainPrompt = mainPrompt;
    if (procedures !== undefined) data.procedures = procedures;
    if (tools !== undefined) data.tools = tools;
    if (apis !== undefined) data.apis = apis;
    if (businessRules !== undefined) data.businessRules = businessRules;
    if (limitations !== undefined) data.limitations = limitations;
    if (observations !== undefined) data.observations = observations;
    if (workflowLinks !== undefined) {
      data.workflowLinks = typeof workflowLinks === "string" ? workflowLinks : JSON.stringify(workflowLinks);
    }
    if (projectId !== undefined) data.projectId = projectId || null;

    const agent = await prisma.agent.update({
      where: { id: params.id },
      data,
    });

    await prisma.activityHistory.create({
      data: {
        action: status && status !== current.status ? "STATUS_ALTERADO" : "EDICAO",
        entityType: "AGENT",
        entityId: agent.id,
        description: `Agente "${agent.name}" atualizado`,
        agentId: agent.id,
        projectId: agent.projectId || undefined,
      },
    });

    return NextResponse.json({ agent });
  } catch (error) {
    console.error("Erro ao atualizar agente:", error);
    return NextResponse.json({ error: "Erro ao atualizar agente." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({ where: { id: params.id } });
    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado." }, { status: 404 });
    }

    await prisma.agent.delete({ where: { id: params.id } });

    await prisma.activityHistory.create({
      data: {
        action: "EXCLUSAO",
        entityType: "AGENT",
        entityId: params.id,
        description: `Agente excluído: "${agent.name}"`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir agente:", error);
    return NextResponse.json({ error: "Erro ao excluir agente." }, { status: 500 });
  }
}
