import type { Node, Edge } from "@xyflow/react"
import { CANVAS_NODE_TYPE, CANVAS_EDGE_TYPE, NODE_COLORS } from "@/types/canvas"
import type { CanvasNodeData, CanvasEdgeData, NodeShape } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: Node<CanvasNodeData>[]
  edges: Edge<CanvasEdgeData>[]
}

function n(
  id: string,
  label: string,
  x: number,
  y: number,
  shape: NodeShape,
  colorIdx: number,
  w = 140,
  h = 52,
): Node<CanvasNodeData> {
  return {
    id,
    type: CANVAS_NODE_TYPE,
    position: { x, y },
    data: { label, color: NODE_COLORS[colorIdx]!.fill, shape },
    width: w,
    height: h,
  }
}

function e(id: string, source: string, target: string, label?: string): Edge<CanvasEdgeData> {
  return {
    id,
    source,
    target,
    type: CANVAS_EDGE_TYPE,
    data: label ? { label } : {},
  }
}

const microservices: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description: "API Gateway routes traffic to isolated services, each backed by a dedicated database and connected via a shared message bus.",
  nodes: [
    n("api-gw",   "API Gateway",     180, 0,   "rectangle", 1),
    n("auth",     "Auth Service",    0,   130,  "rectangle", 2),
    n("products", "Product Service", 180, 130,  "rectangle", 6),
    n("orders",   "Order Service",   360, 130,  "rectangle", 3),
    n("db-prod",  "Products DB",     120, 270,  "cylinder",  7, 120, 58),
    n("db-ord",   "Orders DB",       350, 270,  "cylinder",  7, 120, 58),
    n("mq",       "Message Queue",   240, 410,  "hexagon",   3, 140, 58),
  ],
  edges: [
    e("e1", "api-gw",   "auth"),
    e("e2", "api-gw",   "products"),
    e("e3", "api-gw",   "orders"),
    e("e4", "products", "db-prod"),
    e("e5", "orders",   "db-ord"),
    e("e6", "orders",   "mq"),
    e("e7", "products", "mq"),
  ],
}

const cicd: CanvasTemplate = {
  id: "cicd",
  name: "CI/CD Pipeline",
  description: "End-to-end delivery from source commit through build, test, containerization, and staged deployment to production.",
  nodes: [
    n("source",   "Source Code",  0,   60, "rectangle", 1, 120, 52),
    n("build",    "Build",        170, 60, "rectangle", 6, 110, 52),
    n("test",     "Test",         330, 60, "rectangle", 3, 110, 52),
    n("docker",   "Docker Build", 490, 60, "rectangle", 2, 125, 52),
    n("registry", "Registry",     665, 40, "cylinder",  7, 110, 70),
    n("staging",  "Staging",      830, 0,  "rectangle", 4, 120, 52),
    n("prod",     "Production",   830, 158,"rectangle", 5, 120, 52),
  ],
  edges: [
    e("e1", "source",   "build"),
    e("e2", "build",    "test"),
    e("e3", "test",     "docker"),
    e("e4", "docker",   "registry"),
    e("e5", "registry", "staging"),
    e("e6", "registry", "prod"),
  ],
}

const eventDriven: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description: "Producers publish events to a central bus. Independent consumers handle emails, push notifications, analytics, and error queues.",
  nodes: [
    n("prod-a",    "Producer A",       0,   30,  "rectangle", 1, 120, 52),
    n("prod-b",    "Producer B",       0,   180, "rectangle", 2, 120, 52),
    n("event-bus", "Event Bus",        220, 90,  "hexagon",   3, 150, 82),
    n("cons-a",    "Email Service",    470, 0,   "rectangle", 6, 130, 52),
    n("cons-b",    "Push Notifs",      470, 120, "rectangle", 7, 130, 52),
    n("cons-c",    "Analytics",        470, 240, "rectangle", 5, 130, 52),
    n("dlq",       "Error Queue",      200, 270, "cylinder",  4, 130, 58),
  ],
  edges: [
    e("e1", "prod-a",    "event-bus"),
    e("e2", "prod-b",    "event-bus"),
    e("e3", "event-bus", "cons-a"),
    e("e4", "event-bus", "cons-b"),
    e("e5", "event-bus", "cons-c"),
    e("e6", "event-bus", "dlq",    "failed"),
  ],
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [microservices, cicd, eventDriven]
