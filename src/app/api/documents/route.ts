import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const projectId = searchParams.get("projectId");

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { endpoint: { contains: search, mode: "insensitive" } },
        { businessRules: { contains: search, mode: "insensitive" } },
        { procedures: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category && category !== "ALL") where.category = category;
    if (projectId && projectId !== "ALL") where.projectId = projectId;

    const documents = await prisma.technicalDoc.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    return NextResponse.json({ error: "Erro ao listar documentos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category = "API",
      endpoint,
      httpMethod = "GET",
      authentication,
      requestHeaders,
      requestPayload,
      responsePayload,
      businessRules,
      procedures,
      technicalNotes,
      externalLinks,
      projectId,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "O título da documentação é obrigatório." }, { status: 400 });
    }

    const doc = await prisma.technicalDoc.create({
      data: {
        title: title.trim(),
        category,
        endpoint: endpoint?.trim() || null,
        httpMethod: httpMethod?.trim() || null,
        authentication: authentication?.trim() || null,
        requestHeaders: requestHeaders?.trim() || null,
        requestPayload: requestPayload?.trim() || null,
        responsePayload: responsePayload?.trim() || null,
        businessRules: businessRules?.trim() || null,
        procedures: procedures?.trim() || null,
        technicalNotes: technicalNotes?.trim() || null,
        externalLinks: externalLinks?.trim() || null,
        projectId: projectId || null,
      },
    });

    await prisma.activityHistory.create({
      data: {
        action: "CRIACAO",
        entityType: "DOC",
        entityId: doc.id,
        description: `Documentação técnica criada: "${doc.title}"`,
        projectId: doc.projectId || undefined,
      },
    });

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar documentação:", error);
    return NextResponse.json({ error: "Erro ao cadastrar documentação." }, { status: 500 });
  }
}
