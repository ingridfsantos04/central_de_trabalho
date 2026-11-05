import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id: params.id },
      include: {
        agent: true,
        project: true,
        versions: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Erro ao buscar prompt:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const current = await prisma.prompt.findUnique({
      where: { id: params.id },
    });

    if (!current) {
      return NextResponse.json({ error: "Prompt não encontrado." }, { status: 404 });
    }

    const {
      name,
      objective,
      description,
      content,
      version,
      status,
      expectedResult,
      knownIssues,
      observations,
      agentId,
      projectId,
      changelog,
    } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (objective !== undefined) data.objective = objective;
    if (description !== undefined) data.description = description;
    if (content !== undefined) data.content = content;
    if (version !== undefined) data.version = version;
    if (status !== undefined) data.status = status;
    if (expectedResult !== undefined) data.expectedResult = expectedResult;
    if (knownIssues !== undefined) data.knownIssues = knownIssues;
    if (observations !== undefined) data.observations = observations;
    if (agentId !== undefined) data.agentId = agentId || null;
    if (projectId !== undefined) data.projectId = projectId || null;

    // Se o conteúdo ou a versão mudaram, arquiva nova versão
    const contentChanged = content && content !== current.content;
    const versionChanged = version && version !== current.version;

    if (contentChanged || versionChanged) {
      data.versions = {
        create: {
          version: version || current.version,
          content: content || current.content,
          changelog: changelog || "Atualização de conteúdo.",
        },
      };
    }

    const updated = await prisma.prompt.update({
      where: { id: params.id },
      data,
      include: {
        agent: true,
        project: true,
        versions: { orderBy: { createdAt: "desc" } },
      },
    });

    await prisma.activityHistory.create({
      data: {
        action: "EDICAO",
        entityType: "PROMPT",
        entityId: updated.id,
        description: `Prompt atualizado: "${updated.name}" para v${updated.version}`,
        projectId: updated.projectId || undefined,
        agentId: updated.agentId || undefined,
      },
    });

    return NextResponse.json({ prompt: updated });
  } catch (error) {
    console.error("Erro ao atualizar prompt:", error);
    return NextResponse.json({ error: "Erro ao atualizar prompt." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id: params.id },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt não encontrado." }, { status: 404 });
    }

    await prisma.prompt.delete({ where: { id: params.id } });

    await prisma.activityHistory.create({
      data: {
        action: "EXCLUSAO",
        entityType: "PROMPT",
        entityId: params.id,
        description: `Prompt excluído: "${prompt.name}"`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir prompt:", error);
    return NextResponse.json({ error: "Erro ao excluir prompt." }, { status: 500 });
  }
}
