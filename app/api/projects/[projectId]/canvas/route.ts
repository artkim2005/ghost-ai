import { auth, currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/projects/[projectId]/canvas">,
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

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(body), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return Response.json({ url: blob.url });
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/projects/[projectId]/canvas">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true, canvasJsonPath: true },
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

  if (!project.canvasJsonPath) {
    return Response.json({ canvas: null });
  }

  const res = await fetch(project.canvasJsonPath);
  if (!res.ok) {
    return Response.json({ error: "Failed to fetch canvas" }, { status: 502 });
  }

  const canvas = await res.json();
  return Response.json({ canvas });
}
