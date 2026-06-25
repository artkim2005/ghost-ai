"use client"

import { useRef, useCallback, useEffect } from "react"
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
import { useHistory, useCanUndo, useCanRedo } from "@liveblocks/react"
import { Minus, Plus, Maximize2, Undo2, Redo2 } from "lucide-react"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"
import { CanvasNode } from "./canvas-node"
import { CanvasEdge } from "./canvas-edge"
import { ShapePanel } from "./shape-panel"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { CANVAS_NODE_TYPE, CANVAS_EDGE_TYPE, DEFAULT_NODE_COLOR } from "@/types/canvas"
import type { CanvasNodeData, CanvasNodeType, ShapeDragPayload } from "@/types/canvas"
import type { CanvasTemplate } from "./starter-templates"
import type { Node } from "@xyflow/react"

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
    "rounded-xl p-2 text-copy-muted transition-colors hover:bg-subtle hover:text-copy-primary"
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

interface CanvasFlowInnerProps {
  pendingTemplate?: CanvasTemplate | null
  onTemplateApplied?: () => void
}

function CanvasFlowInner({ pendingTemplate, onTemplateApplied }: CanvasFlowInnerProps) {
  const { screenToFlowPosition, fitView } = useReactFlow()
  const nodeCounter = useRef(0)

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasFlowNode>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  useEffect(() => {
    if (!pendingTemplate) return
    onNodesChange([
      ...nodes.map((n) => ({ type: "remove" as const, id: n.id })),
      ...pendingTemplate.nodes.map((n) => ({ type: "add" as const, item: n as CanvasFlowNode })),
    ])
    onEdgesChange([
      ...edges.map((e) => ({ type: "remove" as const, id: e.id })),
      // eslint-disable-next-line `@typescript-eslint/no-explicit-any`
      ...pendingTemplate.edges.map((e) => ({ type: "add" as const, item: e as any })),
    ])
    onTemplateApplied?.()
    const fitTimer = setTimeout(() => fitView({ duration: ZOOM_DURATION }), 80)
    return () => clearTimeout(fitTimer)
    // Run only when a new template is selected, not on every nodes/edges change.
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
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

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

  return (
    <div
      className="relative h-full w-full"
      onDragOver={onDragOver}
      onDrop={onDrop}
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
        fitView
      >
        <Cursors />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <CanvasControls />
      <ShapePanel />
    </div>
  )
}

interface CanvasFlowProps {
  pendingTemplate?: CanvasTemplate | null
  onTemplateApplied?: () => void
}

export function CanvasFlow({ pendingTemplate, onTemplateApplied }: CanvasFlowProps) {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner
        pendingTemplate={pendingTemplate}
        onTemplateApplied={onTemplateApplied}
      />
    </ReactFlowProvider>
  )
}
