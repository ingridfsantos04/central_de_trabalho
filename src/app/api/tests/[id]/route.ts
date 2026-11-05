import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.testExecution.findUnique({
      where: { id: params.id },
      include: {
        agent: true,
        project: true,
        attachments: true,
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Teste não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ test });
  } catch (error) {
    console.error("Erro ao buscar teste:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const test = await prisma.testExecution.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ test });
  } catch (error) {
    console.error("Erro ao atualizar teste:", error);
    return NextResponse.json({ error: "Erro ao atualizar teste." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.testExecution.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir teste:", error);
    return NextResponse.json({ error: "Erro ao excluir teste." }, { status: 500 });
  }
}
