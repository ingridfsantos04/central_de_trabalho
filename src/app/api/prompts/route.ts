import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const agentId = searchParams.get("agentId");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { objective: { contains: search, mode: "insensitive" } },
      ];
    }
    if (agentId && agentId !== "ALL") where.agentId = agentId;
    if (projectId && projectId !== "ALL") where.projectId = projectId;
    if (status && status !== "ALL") where.status = status;

    const prompts = await prisma.prompt.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        agent: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        versions: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("Erro ao listar prompts:", error);
    return NextResponse.json({ error: "Erro ao listar prompts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      objective,
      description,
      content,
      version = "1.0.0",
      status = "EM_DESENVOLVIMENTO",
      expectedResult,
      knownIssues,
      observations,
      agentId,
      projectId,
    } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "Nome e conteúdo do prompt são obrigatórios." },
        { status: 400 }
      );
    }

    const prompt = await prisma.prompt.create({
      data: {
        name: name.trim(),
        objective: objective?.trim() || null,
        description: description?.trim() || null,
        content: content.trim(),
        version: version.trim(),
        status,
        expectedResult: expectedResult?.trim() || null,
        knownIssues: knownIssues?.trim() || null,
        observations: observations?.trim() || null,
        agentId: agentId || null,
        projectId: projectId || null,
        versions: {
          create: [
            {
              version: version.trim(),
              content: content.trim(),
              changelog: "Versão inicial cadastrada.",
            },
          ],
        },
      },
      include: {
        agent: true,
        project: true,
        versions: true,
      },
    });

    await prisma.activityHistory.create({
      data: {
        action: "CRIACAO",
        entityType: "PROMPT",
        entityId: prompt.id,
        description: `Prompt criado: "${prompt.name}" (v${prompt.version})`,
        projectId: prompt.projectId || undefined,
        agentId: prompt.agentId || undefined,
      },
    });

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar prompt:", error);
    return NextResponse.json({ error: "Erro ao cadastrar prompt." }, { status: 500 });
  }
}
