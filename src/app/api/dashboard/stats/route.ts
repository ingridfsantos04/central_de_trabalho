import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Queries paralelas para alta performance
    const [
      allTasks,
      activeProjectsCount,
      totalAgentsCount,
      recentActivities,
      recentProjects,
    ] = await Promise.all([
      prisma.task.findMany({
        include: {
          project: { select: { id: true, name: true, color: true } },
          checklists: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.project.count({
        where: { status: { in: ["EM_ANDAMENTO", "PLANEJAMENTO"] } },
      }),
      prisma.agent.count(),
      prisma.activityHistory.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        take: 4,
        where: { status: "EM_ANDAMENTO" },
        include: {
          _count: {
            select: { tasks: true, agents: true },
          },
        },
      }),
    ]);

    // Métricas calculadas
    const openTasks = allTasks.filter(
      (t) => t.status !== "CONCLUIDO" && t.status !== "CANCELADO"
    );

    const inProgressTasks = allTasks.filter((t) => t.status === "EM_ANDAMENTO");

    const highPriorityTasks = openTasks.filter(
      (t) => t.priority === "CRITICA" || t.priority === "ALTA"
    );

    const overdueTasks = openTasks.filter(
      (t) => t.deadline && new Date(t.deadline) < now
    );

    const upcomingTasks = openTasks.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline) >= now &&
        new Date(t.deadline) <= sevenDaysFromNow
    );

    const completedThisMonth = allTasks.filter(
      (t) =>
        t.status === "CONCLUIDO" &&
        t.updatedAt >= startOfMonth
    );

    // Minha atenção hoje: Críticas, atrasadas ou com prazo próximo
    const attentionToday = openTasks
      .filter((t) => {
        const isOverdue = t.deadline && new Date(t.deadline) < now;
        const isUrgent = t.priority === "CRITICA" || t.priority === "ALTA";
        const isUpcoming =
          t.deadline &&
          new Date(t.deadline) >= now &&
          new Date(t.deadline) <= sevenDaysFromNow;
        return isOverdue || isUrgent || isUpcoming;
      })
      .sort((a, b) => {
        // Priorizar críticas e atrasadas
        if (a.priority === "CRITICA") return -1;
        if (b.priority === "CRITICA") return 1;
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        return 0;
      })
      .slice(0, 6);

    // Distribuição por status
    const statusCounts: Record<string, number> = {
      IDEIA: 0,
      RASCUNHO: 0,
      A_FAZER: 0,
      EM_ANDAMENTO: 0,
      EM_TESTES: 0,
      AGUARDANDO_RETORNO: 0,
      CONCLUIDO: 0,
      CANCELADO: 0,
    };
    allTasks.forEach((t) => {
      if (statusCounts[t.status] !== undefined) {
        statusCounts[t.status]++;
      }
    });

    // Distribuição por prioridade
    const priorityCounts: Record<string, number> = {
      CRITICA: 0,
      ALTA: 0,
      MEDIA: 0,
      BAIXA: 0,
    };
    openTasks.forEach((t) => {
      if (priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      }
    });

    return NextResponse.json({
      metrics: {
        totalOpenTasks: openTasks.length,
        inProgressTasks: inProgressTasks.length,
        highPriorityTasks: highPriorityTasks.length,
        overdueTasks: overdueTasks.length,
        upcomingCount: upcomingTasks.length,
        completedThisMonth: completedThisMonth.length,
        activeProjects: activeProjectsCount,
        registeredAgents: totalAgentsCount,
        totalTasks: allTasks.length,
      },
      attentionToday,
      upcomingTasks: upcomingTasks.slice(0, 5),
      recentActivities,
      recentProjects,
      statusCounts,
      priorityCounts,
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas do dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados do dashboard." },
      { status: 500 }
    );
  }
}
