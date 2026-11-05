import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const original = await prisma.task.findUnique({
      where: { id: params.id },
      include: { checklists: true },
    });

    if (!original) {
      return NextResponse.json({ error: "Demanda não encontrada." }, { status: 404 });
    }

    const duplicate = await prisma.task.create({
      data: {
        title: `${original.title} (Cópia)`,
        description: original.description,
        objective: original.objective,
        nextStep: original.nextStep,
        observations: original.observations,
        priority: original.priority,
        status: "A_FAZER",
        category: original.category,
        assignee: original.assignee,
        externalLinks: original.externalLinks,
        deadline: original.deadline,
        projectId: original.projectId,
        checklists: {
          create: original.checklists.map((c) => ({
            title: c.title,
            completed: false,
            order: c.order,
          })),
        },
      },
      include: {
        project: true,
        checklists: true,
      },
    });

    await prisma.activityHistory.create({
      data: {
        action: "CRIACAO",
        entityType: "TASK",
        entityId: duplicate.id,
        description: `Demanda duplicada a partir de "${original.title}"`,
        taskId: duplicate.id,
        projectId: duplicate.projectId || undefined,
      },
    });

    return NextResponse.json({ task: duplicate }, { status: 201 });
  } catch (error) {
    console.error("Erro ao duplicar demanda:", error);
    return NextResponse.json({ error: "Erro ao duplicar demanda." }, { status: 500 });
  }
}
