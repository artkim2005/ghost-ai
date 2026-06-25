"use client"

import { useRef, useCallback } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Background,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
} from "@xyflow/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"
import { CanvasNode } from "./canvas-node"
import { ShapePanel } from "./shape-panel"
import { CANVAS_NODE_TYPE, DEFAULT_NODE_COLOR } from "@/types/canvas"
import type { CanvasNodeData, CanvasNodeType, ShapeDragPayload } from "@/types/canvas"
import type { Node } from "@xyflow/react"

type CanvasFlowNode = Node<CanvasNodeData, CanvasNodeType>

const nodeTypes = {
  [CANVAS_NODE_TYPE]: CanvasNode,
}

function CanvasFlowInner() {
  const { screenToFlowPosition } = useReactFlow()
  const nodeCounter = useRef(0)

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasFlowNode>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

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
        fitView
      >
        <Cursors />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <ShapePanel />
    </div>
  )
}

export function CanvasFlow() {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner />
    </ReactFlowProvider>
  )
}
