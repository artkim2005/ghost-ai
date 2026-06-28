import { auth } from "@clerk/nextjs/server";
import { auth as triggerAuth } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.runId !== "string" || !body.runId.trim()) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const runId: string = body.runId.trim();

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } });
  if (!taskRun) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (taskRun.userId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const publicToken = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: "1h",
  });

  return Response.json({ token: publicToken });
}
