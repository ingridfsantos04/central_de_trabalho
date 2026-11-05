import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        checklists: { orderBy: { order: "asc" } },
        attachments: true,
        activities: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Demanda não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Erro ao buscar demanda:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const currentTask = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!currentTask) {
      return NextResponse.json({ error: "Demanda não encontrada." }, { status: 404 });
    }

    const {
      title,
      description,
      objective,
      nextStep,
      observations,
      priority,
      status,
      category,
      assignee,
      externalLinks,
      deadline,
      projectId,
      checklists,
    } = body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (objective !== undefined) data.objective = objective;
    if (nextStep !== undefined) data.nextStep = nextStep;
    if (observations !== undefined) data.observations = observations;
    if (priority !== undefined) data.priority = priority;
    if (category !== undefined) data.category = category;
    if (assignee !== undefined) data.assignee = assignee;
    if (externalLinks !== undefined) {
      data.externalLinks = typeof externalLinks === "string" ? externalLinks : JSON.stringify(externalLinks);
    }
    if (projectId !== undefined) data.projectId = projectId || null;
    if (deadline !== undefined) {
      data.deadline = deadline ? new Date(deadline) : null;
    }

    if (status !== undefined) {
      data.status = status;
      if (status === "CONCLUIDO" && currentTask.status !== "CONCLUIDO") {
        data.completedAt = new Date();
      } else if (status !== "CONCLUIDO" && currentTask.status === "CONCLUIDO") {
        data.completedAt = null;
      }
    }

    // Se houver lista de checklists para atualizar
    if (Array.isArray(checklists)) {
      // Deleta checklists atuais e recria
      await prisma.taskChecklist.deleteMany({
        where: { taskId: params.id },
      });
      if (checklists.length > 0) {
        data.checklists = {
          create: checklists.map((item: any, idx: number) => ({
            title: typeof item === "string" ? item : item.title,
            completed: typeof item === "string" ? false : Boolean(item.completed),
            order: idx,
          })),
        };
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data,
      include: {
        project: true,
        checklists: { orderBy: { order: "asc" } },
      },
    });

    // Registrar no histórico se houve mudança relevante
    if (status && status !== currentTask.status) {
      await prisma.activityHistory.create({
        data: {
          action: status === "CONCLUIDO" ? "CONCLUSAO" : "STATUS_ALTERADO",
          entityType: "TASK",
          entityId: params.id,
          description: `Status da demanda alterado de "${currentTask.status}" para "${status}"`,
          taskId: params.id,
          projectId: updatedTask.projectId || undefined,
        },
      });
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Erro ao atualizar demanda:", error);
    return NextResponse.json({ error: "Erro ao atualizar demanda." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json({ error: "Demanda não encontrada." }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    await prisma.activityHistory.create({
      data: {
        action: "EXCLUSAO",
        entityType: "TASK",
        entityId: params.id,
        description: `Demanda excluída: "${task.title}"`,
        projectId: task.projectId || undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir demanda:", error);
    return NextResponse.json({ error: "Erro ao excluir demanda." }, { status: 500 });
  }
}
