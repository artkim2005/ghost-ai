"use client"

import type { Node } from "@xyflow/react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { NODE_COLORS, DEFAULT_NODE_COLOR } from "@/types/canvas"
import type { CanvasNodeData, NodeShape } from "@/types/canvas"
import { CANVAS_TEMPLATES } from "./starter-templates"
import type { CanvasTemplate } from "./starter-templates"

interface PreviewNodeProps {
  x: number
  y: number
  w: number
  h: number
  shape: NodeShape
  fill: string
  stroke: string
  label: string
}

function PreviewNode({ x, y, w, h, shape, fill, stroke, label }: PreviewNodeProps) {
  const cx = x + w / 2
  const cy = y + h / 2
  const fontSize = Math.min(w, h) * 0.18

  const labelEl = (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={fontSize}
      fill={stroke}
      style={{ userSelect: "none", pointerEvents: "none", fontFamily: "system-ui, sans-serif" }}
    >
      {label.length > 14 ? label.slice(0, 13) + "…" : label}
    </text>
  )

  if (shape === "rectangle") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.5} />
        {labelEl}
      </g>
    )
  }
  if (shape === "pill" || shape === "circle") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} stroke={stroke} strokeWidth={1.5} />
        {labelEl}
      </g>
    )
  }
  if (shape === "diamond") {
    return (
      <g>
        <polygon
          points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
        {labelEl}
      </g>
    )
  }
  if (shape === "hexagon") {
    return (
      <g>
        <polygon
          points={[
            `${x + w * 0.25},${y}`,
            `${x + w * 0.75},${y}`,
            `${x + w},${cy}`,
            `${x + w * 0.75},${y + h}`,
            `${x + w * 0.25},${y + h}`,
            `${x},${cy}`,
          ].join(" ")}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
        {labelEl}
      </g>
    )
  }
  // cylinder
  const rx = w / 2
  const ry = h * 0.15
  return (
    <g>
      <rect x={x} y={y + ry} width={w} height={h - ry * 2} fill={fill} />
      <ellipse cx={cx} cy={y + h - ry} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <line x1={x} y1={y + ry} x2={x} y2={y + h - ry} stroke={stroke} strokeWidth={1.5} />
      <line x1={x + w} y1={y + ry} x2={x + w} y2={y + h - ry} stroke={stroke} strokeWidth={1.5} />
      <ellipse cx={cx} cy={y + ry} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {labelEl}
    </g>
  )
}

function nodeCenter(node: Node<CanvasNodeData>) {
  return {
    x: node.position.x + (node.width ?? 120) / 2,
    y: node.position.y + (node.height ?? 52) / 2,
  }
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const { nodes, edges } = template
  const pad = 20

  const minX = Math.min(...nodes.map((n) => n.position.x)) - pad
  const minY = Math.min(...nodes.map((n) => n.position.y)) - pad
  const maxX = Math.max(...nodes.map((n) => n.position.x + (n.width ?? 120))) + pad
  const maxY = Math.max(...nodes.map((n) => n.position.y + (n.height ?? 52))) + pad
  const vw = maxX - minX
  const vh = maxY - minY

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  return (
    <svg
      viewBox={`${minX} ${minY} ${vw} ${vh}`}
      className="w-full h-full"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      {edges.map((edge) => {
        const src = nodeMap.get(edge.source)
        const tgt = nodeMap.get(edge.target)
        if (!src || !tgt) return null
        const sc = nodeCenter(src)
        const tc = nodeCenter(tgt)
        return (
          <line
            key={edge.id}
            x1={sc.x}
            y1={sc.y}
            x2={tc.x}
            y2={tc.y}
            stroke="#555"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )
      })}
      {nodes.map((node) => {
        const color = NODE_COLORS.find((c) => c.fill === node.data.color) ?? DEFAULT_NODE_COLOR
        const shape = (node.data.shape ?? "rectangle") as NodeShape
        return (
          <PreviewNode
            key={node.id}
            x={node.position.x}
            y={node.position.y}
            w={node.width ?? 120}
            h={node.height ?? 52}
            shape={shape}
            fill={color.fill}
            stroke={color.text}
            label={node.data.label}
          />
        )
      })}
    </svg>
  )
}

interface StarterTemplatesModalProps {
  open: boolean
  onClose: () => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({ open, onClose, onImport }: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Import Template</DialogTitle>
          <DialogDescription>
            Choose a starter template to pre-populate your canvas. Any existing nodes will be
            replaced — use{" "}
            <kbd className="rounded border border-surface-border bg-subtle px-1 py-0.5 font-mono text-xs text-copy-primary">
              Cmd/Ctrl+Z
            </kbd>{" "}
            to undo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-5 overflow-y-auto max-h-[75vh] py-1 pr-1">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col overflow-hidden rounded-xl border border-surface-border bg-elevated"
            >
              <div className="h-64 bg-base p-3">
                <TemplatePreview template={template} />
              </div>
              <div className="flex flex-col gap-2 p-4">
                <span className="font-semibold text-copy-primary">{template.name}</span>
                <p className="text-sm text-copy-muted leading-relaxed">{template.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full gap-2"
                  onClick={() => handleImport(template)}
                >
                  <Download className="h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
