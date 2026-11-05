import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const search = searchParams.get("search") || "";

    const [
      completedTasks,
      finishedProjects,
      discontinuedAgents,
      archivedPrompts,
      activities,
    ] = await Promise.all([
      prisma.task.findMany({
        where: { status: "CONCLUIDO" },
        orderBy: { updatedAt: "desc" },
        include: { project: { select: { name: true } } },
      }),
      prisma.project.findMany({
        where: { status: "CONCLUIDO" },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.agent.findMany({
        where: { status: "DESCONTINUADO" },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.prompt.findMany({
        where: { status: "ARQUIVADO" },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.activityHistory.findMany({
        where: {
          ...(entityType && entityType !== "ALL" ? { entityType } : {}),
          ...(search
            ? { description: { contains: search, mode: "insensitive" } }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          task: { select: { id: true, title: true } },
          project: { select: { id: true, name: true } },
          agent: { select: { id: true, name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      completedTasks,
      finishedProjects,
      discontinuedAgents,
      archivedPrompts,
      activities,
    });
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return NextResponse.json({ error: "Erro ao carregar histórico." }, { status: 500 });
  }
}
