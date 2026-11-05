import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const original = await prisma.prompt.findUnique({
      where: { id: params.id },
    });

    if (!original) {
      return NextResponse.json({ error: "Prompt não encontrado." }, { status: 404 });
    }

    const duplicate = await prisma.prompt.create({
      data: {
        name: `${original.name} (Cópia)`,
        objective: original.objective,
        description: original.description,
        content: original.content,
        version: "1.0.0",
        status: "RASCUNHO",
        expectedResult: original.expectedResult,
        knownIssues: original.knownIssues,
        observations: original.observations,
        agentId: original.agentId,
        projectId: original.projectId,
        versions: {
          create: [
            {
              version: "1.0.0",
              content: original.content,
              changelog: `Cópia criada a partir de "${original.name}"`,
            },
          ],
        },
      },
    });

    return NextResponse.json({ prompt: duplicate }, { status: 201 });
  } catch (error) {
    console.error("Erro ao duplicar prompt:", error);
    return NextResponse.json({ error: "Erro ao duplicar prompt." }, { status: 500 });
  }
}
