"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  useReactFlow,
} from "@xyflow/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import { useHistory, useCanUndo, useCanRedo, useUpdateMyPresence, useOther, useEventListener } from "@liveblocks/react"
import { useOthers } from "@liveblocks/react/suspense"
import { Cursor } from "@liveblocks/react-ui"
import { useAuth, UserButton } from "@clerk/nextjs"
import { Minus, Plus, Maximize2, Undo2, Redo2 } from "lucide-react"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"
import { CanvasNode } from "./canvas-node"
import { CanvasEdge } from "./canvas-edge"
import { ShapePanel } from "./shape-panel"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useAutosave } from "@/hooks/use-autosave"
import type { SaveStatus } from "@/hooks/use-autosave"
import { CANVAS_NODE_TYPE, CANVAS_EDGE_TYPE, DEFAULT_NODE_COLOR } from "@/types/canvas"
import type { CanvasNodeData, CanvasNodeType, ShapeDragPayload } from "@/types/canvas"
import type { CanvasTemplate } from "./starter-templates"
import type { Node, Edge } from "@xyflow/react"

type CanvasFlowNode = Node<CanvasNodeData, CanvasNodeType>

const nodeTypes = {
  [CANVAS_NODE_TYPE]: CanvasNode,
}

const edgeTypes = {
  [CANVAS_EDGE_TYPE]: CanvasEdge,
}

const defaultEdgeOptions = {
  type: CANVAS_EDGE_TYPE,
  markerEnd: { type: MarkerType.ArrowClosed },
}

const ZOOM_DURATION = 200

function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { undo, redo } = useHistory()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  useKeyboardShortcuts({
    zoomIn: () => zoomIn({ duration: ZOOM_DURATION }),
    zoomOut: () => zoomOut({ duration: ZOOM_DURATION }),
    undo,
    redo,
  })

  const btnBase =
    "cursor-pointer rounded-xl p-2 text-copy-muted transition-colors hover:bg-subtle hover:text-copy-primary"
  const btnDisabled = "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-copy-muted"

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pointer-events-auto absolute bottom-6 left-6 flex items-center gap-1 rounded-full border border-surface-border bg-elevated px-3 py-2 shadow-lg">
        <button
          onClick={() => zoomOut({ duration: ZOOM_DURATION })}
          title="Zoom out"
          className={btnBase}
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => fitView({ duration: ZOOM_DURATION })}
          title="Fit view"
          className={btnBase}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => zoomIn({ duration: ZOOM_DURATION })}
          title="Zoom in"
          className={btnBase}
        >
          <Plus className="h-4 w-4" />
        </button>

        <div className="mx-1 h-4 w-px bg-surface-border" />

        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
          className={`${btnBase} ${!canUndo ? btnDisabled : ""}`}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
          className={`${btnBase} ${!canRedo ? btnDisabled : ""}`}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function CanvasCursor({ connectionId }: { userId: string; connectionId: number }) {
  const info = useOther(connectionId, (other) => other.info)
  const thinking = useOther(connectionId, (other) => other.presence.thinking)

  const label = thinking ? (
    <span className="flex items-center gap-1">
      <span className="h-2 w-2 shrink-0 animate-spin rounded-full border border-current border-t-transparent" />
      {info?.name}
    </span>
  ) : info?.name

  return <Cursor color={info?.color} label={label} />
}

function CollaboratorAvatar({
  name,
  avatar,
  color,
}: {
  name: string
  avatar: string
  color: string
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-base text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

function PresenceAvatars() {
  const { userId } = useAuth()
  const others = useOthers()
  const collaborators = others.filter((other) => other.id !== userId)
  const visible = collaborators.slice(0, 5)
  const overflow = collaborators.length - 5

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-10 flex items-center gap-2">
      {collaborators.length > 0 && (
        <>
          <div className="flex items-center">
            {visible.map((other, i) => (
              <div
                key={other.connectionId}
                className="relative"
                style={{
                  marginLeft: i > 0 ? "-0.5rem" : undefined,
                  zIndex: visible.length - i,
                }}
              >
                <CollaboratorAvatar
                  name={other.info.name}
                  avatar={other.info.avatar}
                  color={other.info.color}
                />
              </div>
            ))}
            {overflow > 0 && (
              <div
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-medium text-copy-primary ring-2 ring-base"
                style={{ marginLeft: "-0.5rem", zIndex: 0 }}
              >
                +{overflow}
              </div>
            )}
          </div>
          <div className="h-5 w-px bg-surface-border" />
        </>
      )}
      <div className="pointer-events-auto">
        <UserButton />
      </div>
    </div>
  )
}

type AiStatus = "thinking" | "processing" | "complete" | "error"

function AiStatusBanner() {
  const [status, setStatus] = useState<{ status: AiStatus; message: string } | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null)

  useEventListener(({ event }) => {
    if (event.type !== "AI_STATUS") return
    const { status: s, message } = event as { type: "AI_STATUS"; status: AiStatus; message: string }
    setStatus({ status: s, message })
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (s === "complete" || s === "error") {
      hideTimer.current = setTimeout(() => setStatus(null), 4000)
    }
  })

  if (!status) return null

  const colors: Record<AiStatus, string> = {
    thinking: "border-ai/40 bg-ai/10 text-ai-text",
    processing: "border-ai/40 bg-ai/10 text-ai-text",
    complete: "border-green-500/40 bg-green-500/10 text-green-400",
    error: "border-red-500/40 bg-red-500/10 text-red-400",
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center z-20">
      <div
        className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs shadow-lg backdrop-blur-sm ${colors[status.status]}`}
      >
        {(status.status === "thinking" || status.status === "processing") && (
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
        )}
        <span>{status.message}</span>
      </div>
    </div>
  )
}

interface CanvasFlowInnerProps {
  pendingTemplate?: CanvasTemplate | null
  onTemplateApplied?: () => void
  projectId: string
  onSaveStatusChange?: (status: SaveStatus) => void
  onSaveReady?: (save: () => void) => void
}

function CanvasFlowInner({ pendingTemplate, onTemplateApplied, projectId, onSaveStatusChange, onSaveReady }: CanvasFlowInnerProps) {
  const { screenToFlowPosition, fitView } = useReactFlow()
  const nodeCounter = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const updateMyPresence = useUpdateMyPresence()

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasFlowNode>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const { status: saveStatus, save } = useAutosave(projectId, nodes, edges)

  useEffect(() => {
    onSaveStatusChange?.(saveStatus)
  }, [saveStatus, onSaveStatusChange])

  useEffect(() => {
    onSaveReady?.(save)
  }, [save, onSaveReady])

  const initNodeCount = useRef(nodes.length)
  const initEdgeCount = useRef(edges.length)

  useEffect(() => {
    if (initNodeCount.current > 0 || initEdgeCount.current > 0) return

    fetch(`/api/projects/${projectId}/canvas`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.canvas) return
        const savedNodes: CanvasFlowNode[] = data.canvas.nodes ?? []
        const savedEdges: Edge[] = data.canvas.edges ?? []
        if (!savedNodes.length) return
        onNodesChange(savedNodes.map((n) => ({ type: "add" as const, item: n })))
        if (savedEdges.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onEdgesChange(savedEdges.map((e: any) => ({ type: "add" as const, item: e })))
        }
        setTimeout(() => fitView({ duration: ZOOM_DURATION }), 80)
      })
      .catch(() => {})
  // Run only on mount — check initial room emptiness captured in refs above.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!pendingTemplate) return

    // Calculate template bounding box center
    const templateNodes = pendingTemplate.nodes
    const minX = Math.min(...templateNodes.map((n) => n.position.x))
    const minY = Math.min(...templateNodes.map((n) => n.position.y))
    const maxX = Math.max(...templateNodes.map((n) => n.position.x + (n.width ?? 120)))
    const maxY = Math.max(...templateNodes.map((n) => n.position.y + (n.height ?? 52)))
    const templateCenterX = (minX + maxX) / 2
    const templateCenterY = (minY + maxY) / 2

    // Get the current viewport center in flow coordinates
    const containerEl = containerRef.current
    let viewportCenter = { x: 0, y: 0 }
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect()
      viewportCenter = screenToFlowPosition({
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      })
    }

    const offsetX = viewportCenter.x - templateCenterX
    const offsetY = viewportCenter.y - templateCenterY

    // Generate unique IDs to prevent conflicts with existing nodes/edges
    const idPrefix = `${Date.now()}-`
    const idMap = new Map<string, string>()
    const uniqueNodes = templateNodes.map((n) => {
      const newId = `${idPrefix}${n.id}`
      idMap.set(n.id, newId)
      return {
        ...n,
        id: newId,
        position: { x: n.position.x + offsetX, y: n.position.y + offsetY },
      } as CanvasFlowNode
    })
    const uniqueEdges = pendingTemplate.edges.map((e) => ({
      ...e,
      id: `${idPrefix}${e.id}`,
      source: idMap.get(e.source) ?? e.source,
      target: idMap.get(e.target) ?? e.target,
    }))

    // Add template to existing canvas without removing existing nodes/edges
    onNodesChange(uniqueNodes.map((n) => ({ type: "add" as const, item: n })))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEdgesChange(uniqueEdges.map((e) => ({ type: "add" as const, item: e as any })))
    onTemplateApplied?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTemplate])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const raw = event.dataTransfer.getData("application/canvas-shape")
      if (!raw) return

      const { shape, width, height } = JSON.parse(raw) as ShapeDragPayload
      const center = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const position = {
        x: center.x - width / 2,
        y: center.y - height / 2,
      }

      const id = `${shape}-${Date.now()}-${nodeCounter.current++}`

      onNodesChange([
        {
          type: "add",
          item: {
            id,
            type: CANVAS_NODE_TYPE,
            position,
            data: {
              label: "",
              color: DEFAULT_NODE_COLOR.fill,
              shape,
            },
            width,
            height,
          },
        },
      ])
    },
    [screenToFlowPosition, onNodesChange],
  )

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      updateMyPresence({ cursor: position })
    },
    [screenToFlowPosition, updateMyPresence],
  )

  const onMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Cursors components={{ Cursor: CanvasCursor }} />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <AiStatusBanner />
      <PresenceAvatars />
      <CanvasControls />
      <ShapePanel />
    </div>
  )
}

interface CanvasFlowProps {
  pendingTemplate?: CanvasTemplate | null
  onTemplateApplied?: () => void
  projectId: string
  onSaveStatusChange?: (status: SaveStatus) => void
  onSaveReady?: (save: () => void) => void
}

export function CanvasFlow({ pendingTemplate, onTemplateApplied, projectId, onSaveStatusChange, onSaveReady }: CanvasFlowProps) {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner
        pendingTemplate={pendingTemplate}
        onTemplateApplied={onTemplateApplied}
        projectId={projectId}
        onSaveStatusChange={onSaveStatusChange}
        onSaveReady={onSaveReady}
      />
    </ReactFlowProvider>
  )
}
