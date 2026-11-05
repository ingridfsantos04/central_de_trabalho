import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const isImplemented = searchParams.get("isImplemented");

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category && category !== "ALL") where.category = category;
    if (isImplemented !== null && isImplemented !== undefined && isImplemented !== "ALL") {
      where.isImplemented = isImplemented === "true";
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Erro ao listar anotações:", error);
    return NextResponse.json({ error: "Erro ao listar notas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category = "Ideia", projectId } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Título da ideia é obrigatório." }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content?.trim() || "",
        category,
        projectId: projectId || null,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar ideia:", error);
    return NextResponse.json({ error: "Erro ao salvar anotação." }, { status: 500 });
  }
}
