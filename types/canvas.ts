export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  shape?: string;
}

export const CANVAS_NODE_TYPE = "canvasNode" as const;
export const CANVAS_EDGE_TYPE = "canvasEdge" as const;

export type CanvasNodeType = typeof CANVAS_NODE_TYPE;
export type CanvasEdgeType = typeof CANVAS_EDGE_TYPE;

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type NodeShape = (typeof NODE_SHAPES)[number];

export interface NodeColor {
  fill: string;
  text: string;
}

export const NODE_COLORS: NodeColor[] = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
];

export const DEFAULT_NODE_COLOR: NodeColor = NODE_COLORS[0]!;

export interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
}

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string;
}
