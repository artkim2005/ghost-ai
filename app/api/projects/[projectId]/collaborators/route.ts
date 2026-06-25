import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

async function enrichCollaborators(emails: string[]) {
  if (emails.length === 0) return [];

  try {
    const client = await clerkClient();
    const { data: clerkUsers } = await client.users.getUserList({
      emailAddress: emails,
      limit: emails.length,
    });

    const userMap = new Map(
      clerkUsers.flatMap((u) =>
        u.emailAddresses.map((ea) => [ea.emailAddress, u]),
      ),
    );

    return emails.map((email) => {
      const user = userMap.get(email);
      const name = user
        ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
        : null;
      return {
        email,
        name,
        imageUrl: user?.imageUrl ?? null,
      };
    });
  } catch {
    return emails.map((email) => ({
      email,
      name: null,
      imageUrl: null,
    }));
  }
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    const user = await currentUser();
    const email =
      user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? "";
    const collab = email
      ? await prisma.projectCollaborator.findUnique({
          where: { projectId_email: { projectId, email } },
          select: { id: true },
        })
      : null;
    if (!collab) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { email: true },
  });

  const enriched = await enrichCollaborators(rows.map((r) => r.email));
  return Response.json({ collaborators: enriched });
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || !body.email.includes("@")) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = body.email.trim().toLowerCase();

  try {
    await prisma.projectCollaborator.create({
      data: { projectId, email },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return Response.json(
        { error: "Already a collaborator" },
        { status: 409 },
      );
    }
    throw error;
  }

  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { email: true },
  });
  const enriched = await enrichCollaborators(rows.map((r) => r.email));
  return Response.json({ collaborators: enriched }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || !body.email.includes("@")) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = body.email.trim().toLowerCase();

  try {
    await prisma.projectCollaborator.delete({
      where: { projectId_email: { projectId, email } },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    throw error;
  }

  return new Response(null, { status: 204 });
}
