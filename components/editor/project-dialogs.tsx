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
import type { UseProjectActionsReturn } from "@/hooks/use-project-actions"

interface ProjectDialogsProps {
  actions: UseProjectActionsReturn
}

export function ProjectDialogs({ actions }: ProjectDialogsProps) {
  const {
    openDialog,
    selectedProject,
    createName,
    roomIdPreview,
    renameName,
    isLoading,
    closeDialog,
    setCreateName,
    setRenameName,
    handleCreate,
    handleRename,
    handleDelete,
  } = actions

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
                if (e.key === "Enter" && !e.nativeEvent.isComposing && createName.trim()) handleCreate()
              }}
              autoFocus
            />
            {roomIdPreview && (
              <p className="text-xs text-copy-muted">
                Room ID:{" "}
                <span className="font-mono text-copy-secondary">{roomIdPreview}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={!createName.trim() || isLoading}
              onClick={handleCreate}
            >
              {isLoading ? "Creating…" : "Create"}
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
              if (e.key === "Enter" && !e.nativeEvent.isComposing && renameName.trim()) handleRename()
            }}
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={!renameName.trim() || isLoading}
              onClick={handleRename}
            >
              {isLoading ? "Renaming…" : "Rename"}
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
              onClick={handleDelete}
            >
              {isLoading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
