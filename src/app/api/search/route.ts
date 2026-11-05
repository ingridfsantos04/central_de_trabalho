import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const [tasks, projects, agents, prompts, docs] = await Promise.all([
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: { project: { select: { name: true } } },
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { objective: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.agent.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: { project: { select: { name: true } } },
      }),
      prisma.prompt.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.technicalDoc.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { endpoint: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    const results = [
      ...tasks.map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: `Demanda • ${t.project ? t.project.name : "Geral"} • Status: ${t.status}`,
        type: "task" as const,
        href: `/demandas?id=${t.id}`,
      })),
      ...projects.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: `Projeto • Status: ${p.status}`,
        type: "project" as const,
        href: `/projetos/${p.id}`,
      })),
      ...agents.map((a) => ({
        id: a.id,
        title: a.name,
        subtitle: `Agente IA • Empresa: ${a.company || "Interno"} • ${a.status}`,
        type: "agent" as const,
        href: `/agentes/${a.id}`,
      })),
      ...prompts.map((pr) => ({
        id: pr.id,
        title: pr.name,
        subtitle: `Prompt • Versão ${pr.version} • ${pr.status}`,
        type: "prompt" as const,
        href: `/prompts?id=${pr.id}`,
      })),
      ...docs.map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: `Doc • Categoria: ${d.category} ${d.endpoint ? `• ${d.endpoint}` : ""}`,
        type: "doc" as const,
        href: `/documentacao?id=${d.id}`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Erro na busca global:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
