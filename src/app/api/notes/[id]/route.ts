import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const note = await prisma.note.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ note });
  } catch (error) {
    console.error("Erro ao atualizar anotação:", error);
    return NextResponse.json({ error: "Erro ao atualizar." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.note.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir anotação:", error);
    return NextResponse.json({ error: "Erro ao excluir." }, { status: 500 });
  }
}
