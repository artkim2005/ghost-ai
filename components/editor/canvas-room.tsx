"use client"

import { Component, type ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react"
import { CanvasFlow } from "./canvas-flow"
import type { CanvasTemplate } from "./starter-templates"

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
}

export function CanvasRoom({ roomId, pendingTemplate, onTemplateApplied }: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
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
            />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
