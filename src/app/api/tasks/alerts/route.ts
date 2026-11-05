import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const pendingTasks = await prisma.task.findMany({
      where: {
        status: {
          notIn: ["CONCLUIDO", "CANCELADO"],
        },
      },
      select: {
        id: true,
        title: true,
        priority: true,
        deadline: true,
      },
    });

    const overdue = pendingTasks.filter(
      (t) => t.deadline && new Date(t.deadline) < now
    );

    const urgent = pendingTasks.filter(
      (t) =>
        (t.priority === "CRITICA" || t.priority === "ALTA") &&
        (!t.deadline || new Date(t.deadline) >= now)
    );

    const items = [
      ...overdue.map((t) => ({
        id: t.id,
        title: t.title,
        type: "overdue" as const,
        deadline: t.deadline?.toISOString(),
      })),
      ...urgent.map((t) => ({
        id: t.id,
        title: t.title,
        type: "urgent" as const,
        deadline: t.deadline?.toISOString(),
      })),
    ].slice(0, 10);

    return NextResponse.json({
      overdueCount: overdue.length,
      urgentCount: urgent.length,
      items,
    });
  } catch (error) {
    console.error("Erro ao buscar alertas:", error);
    return NextResponse.json(
      { overdueCount: 0, urgentCount: 0, items: [] },
      { status: 500 }
    );
  }
}
