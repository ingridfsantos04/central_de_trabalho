import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            tasks: true,
            agents: true,
            prompts: true,
            documents: true,
            tests: true,
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    const projectsWithMetrics = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === "CONCLUIDO").length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...p,
        totalTasks,
        completedTasks,
        progress,
      };
    });

    return NextResponse.json({ projects: projectsWithMetrics });
  } catch (error) {
    console.error("Erro ao listar projetos:", error);
    return NextResponse.json({ error: "Erro ao listar projetos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, objective, status, startDate, deadline, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "O nome do projeto é obrigatório." }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        objective: objective?.trim() || null,
        status: status || "EM_ANDAMENTO",
        startDate: startDate ? new Date(startDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        color: color || "#3b82f6",
      },
    });

    await prisma.activityHistory.create({
      data: {
        action: "CRIACAO",
        entityType: "PROJECT",
        entityId: project.id,
        description: `Projeto criado: "${project.name}"`,
        projectId: project.id,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return NextResponse.json({ error: "Erro ao criar projeto." }, { status: 500 });
  }
}
