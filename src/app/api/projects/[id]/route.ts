import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: { createdAt: "desc" },
          include: { checklists: true },
        },
        agents: {
          orderBy: { createdAt: "desc" },
        },
        prompts: {
          orderBy: { updatedAt: "desc" },
        },
        documents: {
          orderBy: { updatedAt: "desc" },
        },
        tests: {
          orderBy: { createdAt: "desc" },
        },
        activities: {
          take: 15,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === "CONCLUIDO").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return NextResponse.json({
      project: {
        ...project,
        totalTasks,
        completedTasks,
        progress,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do projeto:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, objective, status, startDate, deadline, color } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (objective !== undefined) data.objective = objective;
    if (status !== undefined) data.status = status;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
    if (color !== undefined) data.color = color;

    const project = await prisma.project.update({
      where: { id: params.id },
      data,
    });

    await prisma.activityHistory.create({
      data: {
        action: "EDICAO",
        entityType: "PROJECT",
        entityId: project.id,
        description: `Projeto atualizado: "${project.name}"`,
        projectId: project.id,
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    return NextResponse.json({ error: "Erro ao atualizar projeto." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id: params.id },
    });

    await prisma.activityHistory.create({
      data: {
        action: "EXCLUSAO",
        entityType: "PROJECT",
        entityId: params.id,
        description: `Projeto excluído: "${project.name}"`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir projeto:", error);
    return NextResponse.json({ error: "Erro ao excluir projeto." }, { status: 500 });
  }
}
