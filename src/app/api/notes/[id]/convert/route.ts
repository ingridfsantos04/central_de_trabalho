import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Anotação não encontrada." }, { status: 404 });
    }

    // Criar uma Task a partir da Note
    const task = await prisma.task.create({
      data: {
        title: note.title,
        description: note.content,
        priority: "ALTA",
        status: "A_FAZER",
        category: "Ideia Implementada",
        projectId: note.projectId,
        objective: `Implementar ideia: ${note.title}`,
      },
    });

    // Atualizar note como implementada e linkar taskId
    await prisma.note.update({
      where: { id: note.id },
      data: {
        isImplemented: true,
        convertedToTaskId: task.id,
      },
    });

    // Registrar no histórico
    await prisma.activityHistory.create({
      data: {
        action: "CONVERSAO",
        entityType: "NOTE",
        entityId: note.id,
        description: `Ideia "${note.title}" convertida na demanda "${task.title}"`,
        taskId: task.id,
        projectId: note.projectId || undefined,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Erro ao converter nota em demanda:", error);
    return NextResponse.json({ error: "Erro ao converter para demanda." }, { status: 500 });
  }
}
