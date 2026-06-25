"use client"

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

interface ShapeConfig {
  shape: NodeShape
  label: string
  width: number
  height: number
  Icon: ComponentType<{ className?: string }>
}

const SHAPES: ShapeConfig[] = [
  { shape: "rectangle", label: "Rectangle", width: 160, height: 80, Icon: RectangleHorizontal },
  { shape: "diamond",   label: "Diamond",   width: 120, height: 120, Icon: Diamond },
  { shape: "circle",    label: "Circle",    width: 80,  height: 80,  Icon: Circle },
  { shape: "pill",      label: "Pill",      width: 160, height: 56,  Icon: Pill },
  { shape: "cylinder",  label: "Cylinder",  width: 100, height: 120, Icon: Database },
  { shape: "hexagon",   label: "Hexagon",   width: 120, height: 104, Icon: Hexagon },
]

export function ShapePanel() {
  function handleDragStart(event: React.DragEvent, payload: ShapeDragPayload) {
    event.dataTransfer.setData(
      "application/canvas-shape",
      JSON.stringify(payload),
    )
    event.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-elevated px-3 py-2 shadow-lg">
        {SHAPES.map(({ shape, label, width, height, Icon }) => (
          <button
            key={shape}
            draggable
            onDragStart={(e) => handleDragStart(e, { shape, width, height })}
            title={label}
            className="cursor-grab rounded-xl p-2 text-copy-muted transition-colors hover:bg-subtle hover:text-copy-primary active:cursor-grabbing"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  )
}
