"use client"

import type { Node, NodeProps } from "@xyflow/react"
import { Handle, Position } from "@xyflow/react"
import type { CanvasNodeData, CanvasNodeType } from "@/types/canvas"
import { NODE_COLORS, DEFAULT_NODE_COLOR } from "@/types/canvas"

type CanvasFlowNode = Node<CanvasNodeData, CanvasNodeType>

export function CanvasNode({ data, selected }: NodeProps<CanvasFlowNode>) {
  const colorPair =
    NODE_COLORS.find((c) => c.fill === data.color) ?? DEFAULT_NODE_COLOR

  return (
    <div
      className={`relative flex min-h-[40px] min-w-[80px] items-center justify-center rounded-xl border px-3 py-2 text-sm ${selected ? "border-brand" : "border-surface-border"}`}
      style={{ background: colorPair.fill, color: colorPair.text }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <span className="select-none text-center leading-tight">
        {data.label}
      </span>
    </div>
  )
}
