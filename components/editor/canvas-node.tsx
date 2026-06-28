"use client"

import { useState, useRef, useCallback } from "react"
import type { Node, NodeProps } from "@xyflow/react"
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react"
import type { CanvasNodeData, CanvasNodeType, NodeShape, NodeColor } from "@/types/canvas"
import { NODE_COLORS, DEFAULT_NODE_COLOR } from "@/types/canvas"

type CanvasFlowNode = Node<CanvasNodeData, CanvasNodeType>

const MIN_WIDTH = 80
const MIN_HEIGHT = 40

interface ShapeBodyProps {
  shape: NodeShape
  fill: string
  stroke: string
}

export function ShapeBody({ shape, fill, stroke }: ShapeBodyProps) {
  if (shape === "rectangle") {
    return (
      <div
        className="absolute inset-0 rounded-xl border"
        style={{ background: fill, borderColor: stroke }}
      />
    )
  }

  if (shape === "pill" || shape === "circle") {
    return (
      <div
        className="absolute inset-0 rounded-full border"
        style={{ background: fill, borderColor: stroke }}
      />
    )
  }

  if (shape === "diamond") {
    return (
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="50,2 98,50 50,98 2,50"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
      </svg>
    )
  }

  if (shape === "hexagon") {
    return (
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="25,2 75,2 98,50 75,98 25,98 2,50"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
      </svg>
    )
  }

  // cylinder
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <rect x="1" y="14" width="98" height="72" fill={fill} />
      <ellipse cx="50" cy="86" rx="49" ry="13" fill={fill} stroke={stroke} strokeWidth="2" />
      <line x1="1" y1="14" x2="1" y2="86" stroke={stroke} strokeWidth="2" />
      <line x1="99" y1="14" x2="99" y2="86" stroke={stroke} strokeWidth="2" />
      <ellipse cx="50" cy="14" rx="49" ry="13" fill={fill} stroke={stroke} strokeWidth="2" />
    </svg>
  )
}

function ColorSwatch({
  color,
  active,
  onClick,
}: {
  color: NodeColor
  active: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const shadow = active
    ? `0 0 0 2px ${color.text}`
    : hovered
    ? `0 0 4px 1px ${color.text}50`
    : undefined

  return (
    <button
      className="w-4 h-4 cursor-pointer rounded-full focus:outline-none"
      aria-label={`Set color ${color.fill}`}
      title={color.fill}
      style={{ background: color.fill, boxShadow: shadow, transition: "box-shadow 0.12s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
    />
  )
}

export function CanvasNode({ id, data, selected }: NodeProps<CanvasFlowNode>) {
  const { updateNodeData } = useReactFlow()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [nodeHovered, setNodeHovered] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const colorPair = NODE_COLORS.find((c) => c.fill === data.color) ?? DEFAULT_NODE_COLOR
  const shape = (data.shape ?? "rectangle") as NodeShape
  const stroke = selected ? "var(--accent-primary)" : "var(--border-default)"

  const openEdit = useCallback(() => {
    setDraft(data.label ?? "")
    setEditing(true)
    setTimeout(() => {
      const ta = textareaRef.current
      if (ta) {
        ta.style.height = "auto"
        ta.style.height = `${ta.scrollHeight}px`
        ta.focus()
      }
    }, 0)
  }, [data.label])

  const commitEdit = useCallback(() => {
    updateNodeData(id, { label: draft })
    setEditing(false)
  }, [id, draft, updateNodeData])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation()
      if (e.key === "Escape") commitEdit()
    },
    [commitEdit],
  )

  const handleStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    background: "#ffffff",
    border: "2px solid var(--border-subtle)",
    borderRadius: "50%",
    opacity: nodeHovered ? 1 : 0,
    transition: "opacity 0.2s",
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{ overflow: "visible" }}
      onMouseEnter={() => setNodeHovered(true)}
      onMouseLeave={() => setNodeHovered(false)}
    >
      {selected && (
        <div
          className="absolute flex items-center gap-1 px-2 py-1.5 rounded-full"
          style={{
            left: "50%",
            top: 0,
            transform: "translate(-50%, calc(-100% - 8px))",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            zIndex: 50,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {NODE_COLORS.map((color) => (
            <ColorSwatch
              key={color.fill}
              color={color}
              active={colorPair.fill === color.fill}
              onClick={() => updateNodeData(id, { color: color.fill })}
            />
          ))}
        </div>
      )}
      <NodeResizer
        isVisible={!!selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        handleStyle={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "var(--accent-primary)",
          border: "none",
          opacity: 0.7,
        }}
        lineStyle={{ borderColor: "var(--accent-primary)", opacity: 0.3 }}
      />
      <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
      <ShapeBody shape={shape} fill={colorPair.fill} stroke={stroke} />
      <span
        className={`relative z-10 select-none text-sm text-center leading-tight px-2${editing ? " opacity-0 pointer-events-none" : ""}`}
        style={{ color: colorPair.text }}
        onDoubleClick={openEdit}
      >
        {data.label || <span style={{ color: "var(--text-faint)" }}>Label</span>}
      </span>
      {editing && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center px-3 nodrag"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <textarea
            ref={textareaRef}
            className="resize-none text-sm text-center leading-tight outline-none border-none w-full"
            style={{ color: colorPair.text, background: "transparent", overflow: "hidden" }}
            rows={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = `${e.target.scrollHeight}px`
            }}
            onBlur={commitEdit}
            onKeyDown={onKeyDown}
          />
        </div>
      )}
    </div>
  )
}
