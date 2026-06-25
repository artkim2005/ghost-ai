"use client"

import { X, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { SidebarProject } from "@/lib/projects"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  myProjects: SidebarProject[]
  sharedProjects: SidebarProject[]
  onOpenCreate: () => void
  onOpenRename: (project: SidebarProject) => void
  onOpenDelete: (project: SidebarProject) => void
}

export function ProjectSidebar({
  isOpen,
  onClose,
  myProjects,
  sharedProjects,
  onOpenCreate,
  onOpenRename,
  onOpenDelete,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 sm:bg-transparent"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-72 flex-col border-r border-surface-border bg-surface transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <span className="text-sm font-medium text-copy-primary">Projects</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-copy-muted hover:text-copy-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden px-3 py-3">
          <Tabs defaultValue="my-projects" className="flex flex-1 flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="my-projects" className="flex-1">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-projects" className="mt-2 flex flex-1 flex-col overflow-y-auto">
              {myProjects.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-copy-faint">No projects yet</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-0.5">
                  {myProjects.map((project) => (
                    <li
                      key={project.id}
                      className="group flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-elevated"
                    >
                      <span className="flex-1 truncate text-sm text-copy-primary">
                        {project.name}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-copy-muted hover:text-copy-primary"
                          onClick={() => onOpenRename(project)}
                        >
                          <Pencil className="h-3 w-3" />
                          <span className="sr-only">Rename</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-copy-muted hover:text-error"
                          onClick={() => onOpenDelete(project)}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="shared" className="mt-2 flex flex-1 flex-col overflow-y-auto">
              {sharedProjects.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-copy-faint">No shared projects</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-0.5">
                  {sharedProjects.map((project) => (
                    <li
                      key={project.id}
                      className="flex items-center rounded-xl px-2 py-1.5 hover:bg-elevated"
                    >
                      <span className="flex-1 truncate text-sm text-copy-primary">
                        {project.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t border-surface-border p-3">
          <Button
            className="w-full gap-2 bg-brand text-base hover:bg-brand/90"
            onClick={onOpenCreate}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
