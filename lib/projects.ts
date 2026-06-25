import prisma from '@/lib/prisma'

export interface SidebarProject {
  id: string
  name: string
}

export async function getOwnedProjects(userId: string): Promise<SidebarProject[]> {
  return prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true },
  })
}

export async function getSharedProjects(email: string): Promise<SidebarProject[]> {
  const rows = await prisma.projectCollaborator.findMany({
    where: { email },
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => r.project)
}
