"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface Project {
  id: string
  name: string
}

type DialogType = "create" | "rename" | "delete" | null

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8)
}

export interface UseProjectActionsReturn {
  openDialog: DialogType
  selectedProject: Project | null
  createName: string
  roomIdPreview: string
  renameName: string
  isLoading: boolean
  openCreate: () => void
  openRename: (project: Project) => void
  openDelete: (project: Project) => void
  closeDialog: () => void
  setCreateName: (name: string) => void
  setRenameName: (name: string) => void
  handleCreate: () => Promise<void>
  handleRename: () => Promise<void>
  handleDelete: () => Promise<void>
}

export function useProjectActions(): UseProjectActionsReturn {
  const router = useRouter()
  const pathname = usePathname()

  const [openDialog, setOpenDialog] = useState<DialogType>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [createName, setCreateName] = useState("")
  const [suffix, setSuffix] = useState("")
  const [renameName, setRenameName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const slug = toSlug(createName)
  const roomIdPreview = slug ? `${slug}-${suffix}` : ""

  function openCreate() {
    setCreateName("")
    setSuffix(randomSuffix())
    setOpenDialog("create")
  }

  function openRename(project: Project) {
    setSelectedProject(project)
    setRenameName(project.name)
    setOpenDialog("rename")
  }

  function openDelete(project: Project) {
    setSelectedProject(project)
    setOpenDialog("delete")
  }

  function closeDialog() {
    setOpenDialog(null)
    setSelectedProject(null)
  }

  async function handleCreate() {
    if (!createName.trim() || isLoading) return
    setIsLoading(true)
    try {
      const id = roomIdPreview || randomSuffix()
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim(), id }),
      })
      if (!res.ok) throw new Error("Failed to create project")
      const { project } = await res.json()
      closeDialog()
      router.push(`/editor/${project.id}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRename() {
    if (!selectedProject || !renameName.trim() || isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameName.trim() }),
      })
      if (!res.ok) throw new Error("Failed to rename project")
      closeDialog()
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedProject || isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete project")
      const deletedId = selectedProject.id
      closeDialog()
      if (pathname === `/editor/${deletedId}`) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    openDialog,
    selectedProject,
    createName,
    roomIdPreview,
    renameName,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    setCreateName,
    setRenameName,
    handleCreate,
    handleRename,
    handleDelete,
  }
}
