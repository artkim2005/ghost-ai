"use client"

import { useState } from "react"
import { PanelLeftOpen, PanelLeftClose, Share2, Sparkles, X } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { useProjectActions } from "@/hooks/use-project-actions"
import { CanvasRoom } from "@/components/editor/canvas-room"
import type { SidebarProject } from "@/lib/projects"

interface EditorWorkspaceClientProps {
  project: { id: string; name: string; isOwner: boolean }
  myProjects: SidebarProject[]
  sharedProjects: SidebarProject[]
}

export function EditorWorkspaceClient({
  project,
  myProjects,
  sharedProjects,
}: EditorWorkspaceClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const actions = useProjectActions()

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-base">
      <header className="z-10 flex h-12 w-full items-center justify-between border-b border-surface-border bg-surface px-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((o) => !o)}
            className="text-copy-muted hover:text-copy-primary"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
        </div>
        <span className="text-sm font-medium text-copy-primary">{project.name}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShareOpen(true)}
            className="text-copy-muted hover:text-copy-primary"
          >
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAiSidebarOpen((o) => !o)}
            className={
              aiSidebarOpen
                ? "text-ai-text"
                : "text-copy-muted hover:text-copy-primary"
            }
          >
            <Sparkles className="h-5 w-5" />
            <span className="sr-only">AI Assistant</span>
          </Button>
          <UserButton />
        </div>
      </header>

      <main className="relative flex-1 bg-base">
        <CanvasRoom roomId={project.id} />
      </main>

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        myProjects={myProjects}
        sharedProjects={sharedProjects}
        activeProjectId={project.id}
        onOpenCreate={actions.openCreate}
        onOpenRename={actions.openRename}
        onOpenDelete={actions.openDelete}
        onOpenProject={actions.openProject}
      />

      <aside
        className={`fixed right-0 top-12 z-30 flex h-[calc(100vh-3rem)] w-80 flex-col border-l border-surface-border bg-surface transition-transform duration-200 ease-in-out ${
          aiSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <span className="text-sm font-medium text-copy-primary">AI Assistant</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAiSidebarOpen(false)}
            className="h-7 w-7 text-copy-muted hover:text-copy-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-copy-faint">AI chat coming soon</p>
        </div>
      </aside>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        projectId={project.id}
        projectName={project.name}
        isOwner={project.isOwner}
      />

      <ProjectDialogs actions={actions} />
    </div>
  )
}
