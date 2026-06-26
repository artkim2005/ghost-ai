"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Node, Edge } from "@xyflow/react"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

const DEBOUNCE_MS = 2000
const RESET_MS = 2000

export function useAutosave(
  projectId: string,
  nodes: Node[],
  edges: Edge[],
): { status: SaveStatus; save: () => void } {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)
  const latestRef = useRef({ nodes, edges })

  useEffect(() => {
    latestRef.current = { nodes, edges }
  })

  const doSave = useCallback(async () => {
    setStatus("saving")
    try {
      const res = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: latestRef.current.nodes, edges: latestRef.current.edges }),
      })
      if (!res.ok) throw new Error("Save failed")
      setStatus("saved")
    } catch {
      setStatus("error")
    }
  }, [projectId])

  const save = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    doSave()
  }, [doSave])

  useEffect(() => {
    if (status !== "saved" && status !== "error") return
    const timer = setTimeout(() => setStatus("idle"), RESET_MS)
    return () => clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(doSave, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // nodes and edges change on every render — use the serialized form to avoid
  // spurious saves from object identity changes while the room syncs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(nodes), JSON.stringify(edges), projectId])

  return { status, save }
}
