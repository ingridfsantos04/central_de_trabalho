import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const projectId = searchParams.get("projectId");
    const overdue = searchParams.get("overdue");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    if (projectId && projectId !== "ALL") {
      where.projectId = projectId;
    }

    if (overdue === "true") {
      where.deadline = { lt: new Date() };
      where.status = { notIn: ["CONCLUIDO", "CANCELADO"] };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "deadline") {
      orderBy = { deadline: sortOrder };
    } else if (sortBy === "priority") {
      orderBy = { priority: sortOrder };
    } else if (sortBy === "updatedAt") {
      orderBy = { updatedAt: sortOrder };
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        project: { select: { id: true, name: true, color: true } },
        checklists: { orderBy: { order: "asc" } },
        _count: { select: { attachments: true, checklists: true } },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);
    return NextResponse.json({ error: "Erro ao listar demandas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "O título da demanda é obrigatório." }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        objective: objective?.trim() || null,
        nextStep: nextStep?.trim() || null,
        observations: observations?.trim() || null,
        priority: priority || "MEDIA",
        status: status || "A_FAZER",
        category: category || "Geral",
        assignee: assignee || "Ingrid Ferreira",
        externalLinks: externalLinks ? JSON.stringify(externalLinks) : null,
        deadline: deadline ? new Date(deadline) : null,
        projectId: projectId || null,
        checklists:
          Array.isArray(checklists) && checklists.length > 0
            ? {
                create: checklists.map((item: string | { title: string; completed?: boolean }, idx: number) => ({
                  title: typeof item === "string" ? item : item.title,
                  completed: typeof item === "string" ? false : Boolean(item.completed),
                  order: idx,
                })),
              }
            : undefined,
      },
      include: {
        project: true,
        checklists: true,
      },
    });

    // Registrar no histórico de atividades
    await prisma.activityHistory.create({
      data: {
        action: "CRIACAO",
        entityType: "TASK",
        entityId: task.id,
        description: `Demanda criada: "${task.title}"`,
        taskId: task.id,
        projectId: task.projectId || undefined,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar demanda:", error);
    return NextResponse.json({ error: "Erro ao criar demanda." }, { status: 500 });
  }
}
