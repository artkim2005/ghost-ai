"use client"

import { Component, type ReactNode } from "react"
import { ClientSideSuspense } from "@liveblocks/react"
import { CanvasFlow } from "./canvas-flow"
import type { CanvasTemplate } from "./starter-templates"
import type { SaveStatus } from "@/hooks/use-autosave"

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

interface CanvasRoomProps {
  roomId: string
  pendingTemplate?: CanvasTemplate | null
  onTemplateApplied?: () => void
  onSaveStatusChange?: (status: SaveStatus) => void
  onSaveReady?: (save: () => void) => void
}

export function CanvasRoom({ roomId, pendingTemplate, onTemplateApplied, onSaveStatusChange, onSaveReady }: CanvasRoomProps) {
  return (
    <CanvasErrorBoundary
      fallback={
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-copy-faint">
            Connection error. Please reload.
          </p>
        </div>
      }
    >
      <ClientSideSuspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-copy-faint">Loading canvas…</p>
          </div>
        }
      >
        <CanvasFlow
          pendingTemplate={pendingTemplate}
          onTemplateApplied={onTemplateApplied}
          projectId={roomId}
          onSaveStatusChange={onSaveStatusChange}
          onSaveReady={onSaveReady}
        />
      </ClientSideSuspense>
    </CanvasErrorBoundary>
  )
}
