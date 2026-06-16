"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { UseProjectDialogsReturn } from "@/hooks/use-project-dialogs"

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface ProjectDialogsProps {
  dialogs: UseProjectDialogsReturn
}

export function ProjectDialogs({ dialogs }: ProjectDialogsProps) {
  const {
    openDialog,
    selectedProject,
    createName,
    renameName,
    isLoading,
    closeDialog,
    setCreateName,
    setRenameName,
  } = dialogs

  const slug = toSlug(createName)

  return (
    <>
      <Dialog
        open={openDialog === "create"}
        onOpenChange={(open) => { if (!open) closeDialog() }}
      >
        <DialogContent className="rounded-3xl bg-elevated">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Project name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && createName.trim()) closeDialog()
              }}
              autoFocus
            />
            {createName && (
              <p className="text-xs text-copy-muted">
                Slug:{" "}
                <span className="font-mono text-copy-secondary">{slug}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              disabled={!createName.trim() || isLoading}
              onClick={() => {
                // TODO: Call API to create project
                closeDialog()
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDialog === "rename"}
        onOpenChange={(open) => { if (!open) closeDialog() }}
      >
        <DialogContent className="rounded-3xl bg-elevated">
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            {selectedProject && (
              <DialogDescription>
                Renaming &ldquo;{selectedProject.name}&rdquo;
              </DialogDescription>
            )}
          </DialogHeader>
          <Input
            placeholder="Project name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && renameName.trim()) closeDialog()
            }}
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={!renameName.trim() || isLoading}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDialog === "delete"}
        onOpenChange={(open) => { if (!open) closeDialog() }}
      >
        <DialogContent className="rounded-3xl bg-elevated">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            {selectedProject && (
              <DialogDescription>
                Are you sure you want to delete &ldquo;{selectedProject.name}
                &rdquo;? This action cannot be undone.
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
               variant="destructive" 
               disabled={isLoading}
               onClick={() => {
                 // TODO: Call API to delete project
                 closeDialog()
               }}
             >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
