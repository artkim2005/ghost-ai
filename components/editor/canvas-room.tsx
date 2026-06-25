"use client"

import { Component, type ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react"
import { CanvasFlow } from "./canvas-flow"

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
}

export function CanvasRoom({ roomId }: CanvasRoomProps) {
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
            <CanvasFlow />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
