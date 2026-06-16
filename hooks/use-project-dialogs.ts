"use client"

import { useState } from "react"
import type { MockProject } from "@/lib/mock-projects"

type DialogType = "create" | "rename" | "delete" | null

export interface UseProjectDialogsReturn {
  openDialog: DialogType
  selectedProject: MockProject | null
  createName: string
  renameName: string
  isLoading: boolean
  openCreate: () => void
  openRename: (project: MockProject) => void
  openDelete: (project: MockProject) => void
  closeDialog: () => void
  setCreateName: (name: string) => void
  setRenameName: (name: string) => void
}

export function useProjectDialogs(): UseProjectDialogsReturn {
  const [openDialog, setOpenDialog] = useState<DialogType>(null)
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(null)
  const [createName, setCreateName] = useState("")
  const [renameName, setRenameName] = useState("")
  const [isLoading] = useState(false)

  function openCreate() {
    setCreateName("")
    setOpenDialog("create")
  }

  function openRename(project: MockProject) {
    setSelectedProject(project)
    setRenameName(project.name)
    setOpenDialog("rename")
  }

  function openDelete(project: MockProject) {
    setSelectedProject(project)
    setOpenDialog("delete")
  }

  function closeDialog() {
    setOpenDialog(null)
    setSelectedProject(null)
  }

  return {
    openDialog,
    selectedProject,
    createName,
    renameName,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    setCreateName,
    setRenameName,
  }
}
