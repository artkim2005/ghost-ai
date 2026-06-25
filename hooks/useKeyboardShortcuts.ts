"use client"

import { useEffect } from "react"

interface Options {
  zoomIn: () => void
  zoomOut: () => void
  undo: () => void
  redo: () => void
}

function isEditableTarget(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null
  if (!target) return false
  const tag = target.tagName.toLowerCase()
  if (tag === "input" || tag === "textarea") return true
  if (target.isContentEditable) return true
  return false
}

export function useKeyboardShortcuts({ zoomIn, zoomOut, undo, redo }: Options) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event)) return

      const metaOrCtrl = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()

      if (metaOrCtrl && event.shiftKey && key === "z") {
        event.preventDefault()
        redo()
        return
      }

      if (metaOrCtrl && key === "y") {
        event.preventDefault()
        redo()
        return
      }

      if (metaOrCtrl && key === "z") {
        event.preventDefault()
        undo()
        return
      }

      if (!metaOrCtrl && (event.key === "+" || event.key === "=")) {
        event.preventDefault()
        zoomIn()
        return
      }

      if (!metaOrCtrl && event.key === "-") {
        event.preventDefault()
        zoomOut()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [zoomIn, zoomOut, undo, redo])
}
