import { redirect } from "next/navigation"
import { getCurrentIdentity, getProjectWithAccess } from "@/lib/project-access"
import { getOwnedProjects, getSharedProjects } from "@/lib/projects"
import { AccessDenied } from "@/components/editor/access-denied"
import { EditorWorkspaceClient } from "@/components/editor/editor-workspace-client"

export default async function EditorRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params

  const identity = await getCurrentIdentity()
  if (!identity) redirect("/sign-in")

  const [project, myProjects, sharedProjects] = await Promise.all([
    getProjectWithAccess(roomId, identity),
    getOwnedProjects(identity.userId),
    identity.email ? getSharedProjects(identity.email) : Promise.resolve([]),
  ])

  if (!project) return <AccessDenied />

  return (
    <EditorWorkspaceClient
      project={project}
      myProjects={myProjects}
      sharedProjects={sharedProjects}
    />
  )
}
