"use client"

import { useState } from "react"
import {
  RectangleHorizontal,
  Diamond,
  Circle,
  Pill,
  Database,
  Hexagon,
} from "lucide-react"
import type { ComponentType } from "react"
import type { NodeShape, ShapeDragPayload } from "@/types/canvas"
import { DEFAULT_NODE_COLOR } from "@/types/canvas"
import { ShapeBody } from "./canvas-node"

interface ShapeConfig {
  shape: NodeShape
  label: string
  width: number
  height: number
  Icon: ComponentType<{ className?: string }>
}

const SHAPES: ShapeConfig[] = [
  { shape: "rectangle", label: "Rectangle", width: 160, height: 80,  Icon: RectangleHorizontal },
  { shape: "diamond",   label: "Diamond",   width: 120, height: 120, Icon: Diamond },
  { shape: "circle",    label: "Circle",    width: 80,  height: 80,  Icon: Circle },
  { shape: "pill",      label: "Pill",      width: 160, height: 56,  Icon: Pill },
  { shape: "cylinder",  label: "Cylinder",  width: 100, height: 120, Icon: Database },
  { shape: "hexagon",   label: "Hexagon",   width: 120, height: 104, Icon: Hexagon },
]

interface DragState {
  shape: NodeShape
  width: number
  height: number
  x: number
  y: number
}

export function ShapePanel() {
  const [dragging, setDragging] = useState<DragState | null>(null)

  function handleDragStart(event: React.DragEvent, config: ShapeConfig) {
    const payload: ShapeDragPayload = {
      shape: config.shape,
      width: config.width,
      height: config.height,
    }
    event.dataTransfer.setData("application/canvas-shape", JSON.stringify(payload))
    event.dataTransfer.effectAllowed = "copy"

    const ghost = document.createElement("div")
    ghost.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;width:1px;height:1px"
    document.body.appendChild(ghost)
    event.dataTransfer.setDragImage(ghost, 0, 0)
    requestAnimationFrame(() => document.body.removeChild(ghost))

    setDragging({
      shape: config.shape,
      width: config.width,
      height: config.height,
      x: event.clientX,
      y: event.clientY,
    })
  }

  function handleDrag(event: React.DragEvent) {
    if (event.clientX === 0 && event.clientY === 0) return
    setDragging((prev) =>
      prev ? { ...prev, x: event.clientX, y: event.clientY } : null,
    )
  }

  function handleDragEnd() {
    setDragging(null)
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-elevated px-3 py-2 shadow-lg">
          {SHAPES.map((config) => {
            const { shape, label, Icon } = config
            return (
              <button
                key={shape}
                draggable
                onDragStart={(e) => handleDragStart(e, config)}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                title={label}
                className="cursor-grab rounded-xl p-2 text-copy-muted transition-colors hover:bg-subtle hover:text-copy-primary active:cursor-grabbing"
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      </div>

      {dragging && (
        <div
          className="pointer-events-none fixed z-50 opacity-60"
          style={{
            left: dragging.x - dragging.width / 2,
            top: dragging.y - dragging.height / 2,
            width: dragging.width,
            height: dragging.height,
          }}
        >
          <ShapeBody
            shape={dragging.shape}
            fill={DEFAULT_NODE_COLOR.fill}
            stroke="var(--accent-primary)"
          />
        </div>
      )}
    </>
  )
}
