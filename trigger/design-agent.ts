import { task } from "@trigger.dev/sdk/v3";
import { generateText, Output } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { LiveObject, LiveMap } from "@liveblocks/node";
import getLiveblocks from "@/lib/liveblocks";
import {
  NODE_SHAPES,
  NODE_COLORS,
  CANVAS_NODE_TYPE,
  CANVAS_EDGE_TYPE,
} from "@/types/canvas";

// Flat schema for Gemini structured output (discriminated union not supported natively)
const geminiActionSchema = z.object({
  type: z.enum([
    "add_node",
    "move_node",
    "resize_node",
    "update_node_data",
    "delete_node",
    "add_edge",
    "delete_edge",
  ]),
  id: z.string(),
  label: z.string().optional(),
  shape: z.enum(NODE_SHAPES).optional(),
  color: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  source: z.string().optional(),
  target: z.string().optional(),
});

const geminiResponseSchema = z.object({
  actions: z.array(geminiActionSchema),
  summary: z.string(),
});

const FILL_COLORS = NODE_COLORS.map((c) => c.fill);

const SYSTEM_PROMPT = `You are Ghost AI, an expert system design architect. Generate canvas actions to create a clear visual architecture diagram.

## Allowed Node Shapes
- rectangle: services, APIs, generic components
- cylinder: databases and storage systems
- diamond: load balancers, decision points
- hexagon: external systems, third-party integrations
- circle: events, triggers, users
- pill: queues, streams, message buses

## Color Palette (use fill hex as the 'color' value)
- "#1F1F1F" — dark, for client/user nodes
- "#10233D" — blue, for primary services and APIs
- "#2E1938" — purple, for AI/ML components
- "#331B00" — orange, for queues and async workers
- "#3C1618" — red, for critical/error handling
- "#3A1726" — pink, for external integrations
- "#0F2E18" — green, for output or success paths
- "#062822" — teal, for databases and storage

## Layout Rules
- Use a top-to-bottom or left-to-right data flow layout
- Start around x=100, y=100 and space outward
- Horizontal spacing: 250px between columns
- Vertical spacing: 150px between rows
- Default node size: width=160, height=80
- Group related nodes close together
- All coordinates must be positive

## Output Rules
- Generate 5-15 nodes for typical prompts
- Every add_edge must reference IDs from add_node actions in the same response
- Use short labels (max 3 words per node)
- Node and edge IDs must be unique and semantic
- Always include edges connecting related nodes`;

async function setAiPresence(
  liveblocks: ReturnType<typeof getLiveblocks>,
  roomId: string,
  thinking: boolean,
  ttl: number,
) {
  await liveblocks.setPresence(roomId, {
    userId: "ai-ghost",
    data: { cursor: null, thinking },
    userInfo: { name: "Ghost AI", avatar: "", color: "#8B5CF6" },
    ttl,
  });
}

export const designAgent = task({
  id: "design-agent",
  run: async (payload: { prompt: string; roomId: string }) => {
    const liveblocks = getLiveblocks();

    await setAiPresence(liveblocks, payload.roomId, true, 300);
    await liveblocks.broadcastEvent(payload.roomId, {
      type: "AI_STATUS",
      status: "thinking",
      message: "Ghost AI is thinking...",
    });

    try {
      await liveblocks.broadcastEvent(payload.roomId, {
        type: "AI_STATUS",
        status: "processing",
        message: "Generating your architecture...",
      });

      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });

      const { output: object } = await generateText({
        model: openrouter("nvidia/nemotron-3-ultra-550b-a55b:free"),
        output: Output.object({ schema: geminiResponseSchema }),
        system: SYSTEM_PROMPT,
        prompt: payload.prompt,
      });

      await liveblocks.broadcastEvent(payload.roomId, {
        type: "AI_STATUS",
        status: "processing",
        message: "Updating the canvas...",
      });

      await liveblocks.mutateStorage(payload.roomId, ({ root }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = root as any;

        let flow = r.get("flow");
        if (!flow) {
          r.set(
            "flow",
            new LiveObject({
              nodes: new LiveMap(),
              edges: new LiveMap(),
            }),
          );
          flow = r.get("flow");
        }

        const nodes = flow.get("nodes");
        const edges = flow.get("edges");

        let nodeIndex = 0;
        for (const action of object.actions) {
          switch (action.type) {
            case "add_node": {
              const color =
                action.color && FILL_COLORS.includes(action.color)
                  ? action.color
                  : FILL_COLORS[1]!;
              const col = nodeIndex % 3;
              const row = Math.floor(nodeIndex / 3);
              const x =
                typeof action.x === "number" ? action.x : 100 + col * 250;
              const y =
                typeof action.y === "number" ? action.y : 100 + row * 150;
              nodeIndex++;
              nodes.set(
                action.id,
                new LiveObject({
                  id: action.id,
                  type: CANVAS_NODE_TYPE,
                  position: { x, y },
                  data: {
                    label: action.label ?? "",
                    color,
                    shape: action.shape ?? "rectangle",
                  },
                  width: action.width ?? 160,
                  height: action.height ?? 80,
                }),
              );
              break;
            }
            case "move_node": {
              const node = nodes.get(action.id);
              if (
                node &&
                typeof action.x === "number" &&
                typeof action.y === "number"
              ) {
                node.set("position", { x: action.x, y: action.y });
              }
              break;
            }
            case "resize_node": {
              const node = nodes.get(action.id);
              if (node) {
                node.set("width", action.width);
                node.set("height", action.height);
              }
              break;
            }
            case "update_node_data": {
              const node = nodes.get(action.id);
              if (node) {
                const data = node.get("data");
                if (data) {
                  if (action.label !== undefined)
                    data.set("label", action.label);
                  if (action.color !== undefined) {
                    const color =
                      action.color && FILL_COLORS.includes(action.color)
                        ? action.color
                        : FILL_COLORS[1]!;
                    data.set("color", color);
                  }
                  if (action.shape !== undefined)
                    data.set("shape", action.shape);
                }
              }
              break;
            }
            case "delete_node": {
              nodes.delete(action.id);
              break;
            }
            case "add_edge": {
              edges.set(
                action.id,
                new LiveObject({
                  id: action.id,
                  type: CANVAS_EDGE_TYPE,
                  source: action.source,
                  target: action.target,
                  markerEnd: { type: "arrowclosed" },
                  data: new LiveObject({ label: action.label ?? "" }),
                }),
              );
              break;
            }
            case "delete_edge": {
              edges.delete(action.id);
              break;
            }
          }
        }
      });

      await liveblocks.broadcastEvent(payload.roomId, {
        type: "AI_STATUS",
        status: "complete",
        message: object.summary,
      });

      await setAiPresence(liveblocks, payload.roomId, false, 2);

      return { success: true, summary: object.summary };
    } catch (error) {
      await liveblocks.broadcastEvent(payload.roomId, {
        type: "AI_STATUS",
        status: "error",
        message: "Ghost AI encountered an error. Please try again.",
      });
      await setAiPresence(liveblocks, payload.roomId, false, 2);
      throw error;
    }
  },
});
