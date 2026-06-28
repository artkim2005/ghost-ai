import { auth, currentUser } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { designAgent } from "@/trigger/design-agent";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.prompt !== "string" ||
    !body.prompt.trim() ||
    typeof body.roomId !== "string" ||
    !body.roomId.trim() ||
    typeof body.projectId !== "string" ||
    !body.projectId.trim()
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const prompt: string = body.prompt.trim();
  const roomId: string = body.roomId.trim();
  const projectId: string = body.projectId.trim();

  const project = await prisma.project.findUnique({ where: { id: projectId } });
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

  const handle = await tasks.trigger<typeof designAgent>("design-agent", {
    prompt,
    roomId,
  });

  await prisma.taskRun.create({
    data: { runId: handle.id, projectId, userId },
  });

  return Response.json({ runId: handle.id }, { status: 201 });
}
