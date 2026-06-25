"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { SidebarProject } from "@/lib/projects"

interface EditorHomeClientProps {
  myProjects: SidebarProject[]
  sharedProjects: SidebarProject[]
}

export function EditorHomeClient({ myProjects, sharedProjects }: EditorHomeClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const actions = useProjectActions()

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-base">
      <EditorNavbar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        myProjects={myProjects}
        sharedProjects={sharedProjects}
        onOpenCreate={actions.openCreate}
        onOpenRename={actions.openRename}
        onOpenDelete={actions.openDelete}
      />
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-xl font-semibold text-copy-primary">
            Create a project or open an existing one
          </h1>
          <p className="max-w-sm text-sm text-copy-muted">
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
          <Button
            onClick={actions.openCreate}
            className="gap-2 bg-brand text-base hover:bg-brand/90"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>
      <ProjectDialogs actions={actions} />
    </div>
  )
}
