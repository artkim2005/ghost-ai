"use client"

import { useState, useRef, useCallback } from "react"
import {
  EdgeLabelRenderer,
  BaseEdge,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react"
import type { Edge, EdgeProps } from "@xyflow/react"
import type { CanvasEdgeData, CanvasEdgeType } from "@/types/canvas"

type CanvasFlowEdge = Edge<CanvasEdgeData, CanvasEdgeType>

export function CanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<CanvasFlowEdge>) {
  const { updateEdgeData } = useReactFlow()
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const label = data?.label ?? ""
  const isActive = hovered || !!selected

  const openEdit = useCallback(() => {
    setDraft(label)
    setEditing(true)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }, [label])

  const commitEdit = useCallback(() => {
    updateEdgeData(id, { label: draft })
    setEditing(false)
  }, [id, draft, updateEdgeData])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation()
      if (e.key === "Enter" || e.key === "Escape") commitEdit()
    },
    [commitEdit],
  )

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={openEdit}
        style={{ cursor: "pointer" }}
      />
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: isActive ? "var(--text-secondary)" : "var(--border-subtle)",
          strokeWidth: 1.5,
          strokeLinecap: "round",
          transition: "stroke 0.15s",
          pointerEvents: "none",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onDoubleClick={!editing ? openEdit : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={onKeyDown}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: "11px",
                color: "var(--text-primary)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "4px",
                padding: "2px 6px",
                outline: "none",
                minWidth: "40px",
                width: `${Math.max(40, draft.length * 8)}px`,
              }}
            />
          ) : label ? (
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "9999px",
                padding: "2px 8px",
                whiteSpace: "nowrap",
                cursor: "default",
              }}
            >
              {label}
            </div>
          ) : isActive ? (
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-faint)",
                padding: "2px 8px",
                cursor: "text",
              }}
            >
              Label...
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
