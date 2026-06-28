import type { NextRequest } from "next/server";
import { get } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { getCurrentIdentity, getProjectWithAccess } from "@/lib/project-access";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/projects/[projectId]/specs/[specId]/download">,
) {
  const identity = await getCurrentIdentity();
  if (!identity) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, specId } = await ctx.params;

  const project = await getProjectWithAccess(projectId, identity);
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
    select: { id: true, projectId: true, filePath: true },
  });

  if (!spec || spec.projectId !== projectId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const blobData = await get(spec.filePath, { access: "private" });
  if (!blobData || !blobData.stream) {
    return Response.json({ error: "Spec file not found" }, { status: 404 });
  }

  return new Response(blobData.stream, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
    },
  });
}
