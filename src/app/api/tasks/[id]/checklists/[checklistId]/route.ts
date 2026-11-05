import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; checklistId: string } }
) {
  try {
    const { completed } = await request.json();

    const checklist = await prisma.taskChecklist.update({
      where: { id: params.checklistId },
      data: { completed: Boolean(completed) },
    });

    return NextResponse.json({ checklist });
  } catch (error) {
    console.error("Erro ao atualizar item do checklist:", error);
    return NextResponse.json({ error: "Erro ao atualizar checklist." }, { status: 500 });
  }
}
