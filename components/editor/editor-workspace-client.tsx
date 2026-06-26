"use client"

import { useState, useCallback, useRef } from "react"
import { PanelLeftOpen, PanelLeftClose, Share2, Sparkles, LayoutTemplate } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import { AiSidebar } from "@/components/editor/ai-sidebar"
import { useProjectActions } from "@/hooks/use-project-actions"
import { CanvasRoom } from "@/components/editor/canvas-room"
import type { SidebarProject } from "@/lib/projects"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import type { SaveStatus } from "@/hooks/use-autosave"

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
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<CanvasTemplate | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const handleSaveStatusChange = useCallback((s: SaveStatus) => setSaveStatus(s), [])
  const saveRef = useRef<(() => void) | null>(null)
  const handleSaveReady = useCallback((fn: () => void) => { saveRef.current = fn }, [])
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
        <Button
          variant="ghost"
          size="sm"
          disabled={saveStatus === "saving"}
          onClick={() => saveRef.current?.()}
          className="text-xs text-copy-muted hover:text-copy-primary"
        >
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
            ? "Saved"
            : saveStatus === "error"
            ? "Error"
            : "Save"}
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTemplatesOpen(true)}
            className="text-copy-muted hover:text-copy-primary"
          >
            <LayoutTemplate className="h-5 w-5" />
            <span className="sr-only">Starter Templates</span>
          </Button>
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
        </div>
      </header>

      <main className="relative flex-1 bg-base">
        <CanvasRoom
          roomId={project.id}
          pendingTemplate={pendingTemplate}
          onTemplateApplied={() => setPendingTemplate(null)}
          onSaveStatusChange={handleSaveStatusChange}
          onSaveReady={handleSaveReady}
        />
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

      <AiSidebar isOpen={aiSidebarOpen} onClose={() => setAiSidebarOpen(false)} />

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        projectId={project.id}
        projectName={project.name}
        isOwner={project.isOwner}
      />

      <StarterTemplatesModal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onImport={(template) => setPendingTemplate(template)}
      />

      <ProjectDialogs actions={actions} />
    </div>
  )
}
