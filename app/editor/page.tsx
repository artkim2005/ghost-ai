"use client"

import { useState } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-base">
      <EditorNavbar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
      <ProjectSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1" />
    </div>
  )
}
