import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getOwnedProjects, getSharedProjects } from "@/lib/projects"
import { EditorHomeClient } from "@/components/editor/editor-home-client"

export default async function EditorPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ""

  const [myProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId),
    email ? getSharedProjects(email) : Promise.resolve([]),
  ])

  return <EditorHomeClient myProjects={myProjects} sharedProjects={sharedProjects} />
}
