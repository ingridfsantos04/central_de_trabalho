import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, parseISO, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD
    const targetDate = dateParam ? new Date(`${dateParam}T12:00:00`) : new Date();

    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // 1. Demandas com vencimento no dia selecionado
    const tasksDue = await prisma.task.findMany({
      where: {
        deadline: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        checklists: { orderBy: { order: "asc" } },
      },
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" },
      ],
    });

    // 2. Demandas concluídas no dia
    const tasksCompleted = await prisma.task.findMany({
      where: {
        completedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    // 3. Demandas em andamento / abertas recomendadas para o dia se não houver prazos
    const inProgressTasks = await prisma.task.findMany({
      where: {
        status: { in: ["EM_ANDAMENTO", "A_FAZER"] },
      },
      take: 5,
      include: {
        project: { select: { id: true, name: true, color: true } },
        checklists: true,
      },
      orderBy: { priority: "asc" },
    });

    // 4. Buscar todos os dias do mês atual que possuem demandas com prazo
    const monthTasks = await prisma.task.findMany({
      where: {
        deadline: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        deadline: true,
      },
    });

    const daysWithTasks = Array.from(
      new Set(
        monthTasks
          .filter((t) => t.deadline !== null)
          .map((t) => format(t.deadline!, "yyyy-MM-dd"))
      )
    );

    return NextResponse.json({
      selectedDate: format(targetDate, "yyyy-MM-dd"),
      tasksDue,
      tasksCompleted,
      inProgressTasks,
      daysWithTasks,
      totalDue: tasksDue.length,
      totalCompleted: tasksCompleted.length,
    });
  } catch (error) {
    console.error("Erro ao buscar tarefas por data:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tarefas por data." },
      { status: 500 }
    );
  }
}
