import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name: string =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : "Untitled Project";
  const rawId: unknown = body.id;
  const id: string | undefined =
    typeof rawId === "string" && /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/.test(rawId)
      ? rawId
      : undefined;

  try {
    const project = await prisma.project.create({
      data: { ...(id ? { id } : {}), ownerId: userId, name },
    });
    return Response.json({ project }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return Response.json(
        { error: "Project ID already exists" },
        { status: 409 },
      );
    }
    throw err;
  }
}
