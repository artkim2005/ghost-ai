import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/projects/[projectId]'>,
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await ctx.params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (body === null || typeof body.name !== 'string' || !body.name.trim()) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const name = body.name.trim()

  try {
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { name },
    })
    return Response.json({ project: updated })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    throw error
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<'/api/projects/[projectId]'>,
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await ctx.params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await prisma.project.delete({ where: { id: projectId } })
    return new Response(null, { status: 204 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    throw error
  }
}
