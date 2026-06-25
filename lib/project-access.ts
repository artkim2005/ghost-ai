import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export interface UserIdentity {
  userId: string;
  email: string;
}

export async function getCurrentIdentity(): Promise<UserIdentity | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? "";
  return { userId, email };
}

export async function getProjectWithAccess(
  projectId: string,
  identity: UserIdentity,
): Promise<{ id: string; name: string; isOwner: boolean } | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, ownerId: true },
  });

  if (!project) return null;

  if (project.ownerId === identity.userId) {
    return { id: project.id, name: project.name, isOwner: true };
  }

  if (identity.email) {
    const collaborator = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email: identity.email } },
      select: { id: true },
    });
    if (collaborator)
      return { id: project.id, name: project.name, isOwner: false };
  }

  return null;
}
