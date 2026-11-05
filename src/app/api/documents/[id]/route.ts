import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await prisma.technicalDoc.findUnique({
      where: { id: params.id },
      include: { project: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "Documentação não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ document: doc });
  } catch (error) {
    console.error("Erro ao buscar documentação:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const doc = await prisma.technicalDoc.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ document: doc });
  } catch (error) {
    console.error("Erro ao atualizar documentação:", error);
    return NextResponse.json({ error: "Erro ao atualizar documentação." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.technicalDoc.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir documentação:", error);
    return NextResponse.json({ error: "Erro ao excluir documentação." }, { status: 500 });
  }
}
