import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const agentId = searchParams.get("agentId");
    const projectId = searchParams.get("projectId");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { scenario: { contains: search, mode: "insensitive" } },
        { identifiedError: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status && status !== "ALL") where.status = status;
    if (agentId && agentId !== "ALL") where.agentId = agentId;
    if (projectId && projectId !== "ALL") where.projectId = projectId;

    const tests = await prisma.testExecution.findMany({
      where,
      orderBy: { executionDate: "desc" },
      include: {
        agent: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ tests });
  } catch (error) {
    console.error("Erro ao listar testes:", error);
    return NextResponse.json({ error: "Erro ao listar testes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      scenario,
      objective,
      expectedResult,
      actualResult,
      status = "PLANEJADO",
      identifiedError,
      rootCause,
      appliedSolution,
      nextAction,
      executionLink,
      observations,
      executionDate,
      agentId,
      projectId,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "O nome do teste é obrigatório." }, { status: 400 });
    }

    const test = await prisma.testExecution.create({
      data: {
        name: name.trim(),
        scenario: scenario?.trim() || null,
        objective: objective?.trim() || null,
        expectedResult: expectedResult?.trim() || null,
        actualResult: actualResult?.trim() || null,
        status,
        identifiedError: identifiedError?.trim() || null,
        rootCause: rootCause?.trim() || null,
        appliedSolution: appliedSolution?.trim() || null,
        nextAction: nextAction?.trim() || null,
        executionLink: executionLink?.trim() || null,
        observations: observations?.trim() || null,
        executionDate: executionDate ? new Date(executionDate) : new Date(),
        agentId: agentId || null,
        projectId: projectId || null,
      },
    });

    await prisma.activityHistory.create({
      data: {
        action: "CRIACAO",
        entityType: "TEST",
        entityId: test.id,
        description: `Teste registrado: "${test.name}" (${test.status})`,
        projectId: test.projectId || undefined,
        agentId: test.agentId || undefined,
      },
    });

    return NextResponse.json({ test }, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar teste:", error);
    return NextResponse.json({ error: "Erro ao registrar teste." }, { status: 500 });
  }
}
