"use client"

import { PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isOpen: boolean
  onToggle: () => void
}

export function EditorNavbar({ isOpen, onToggle }: EditorNavbarProps) {
  return (
    <header className="flex h-12 w-full items-center justify-between border-b border-surface-border bg-surface px-3">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-copy-muted hover:text-copy-primary"
        >
          {isOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div />
      <div />
    </header>
  )
}
