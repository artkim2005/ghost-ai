import { schemaTask, metadata, logger } from "@trigger.dev/sdk/v3";
import { generateText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { z } from "zod";

const nodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    label: z.string(),
    color: z.string().optional(),
    shape: z.string().optional(),
  }),
  width: z.number().optional(),
  height: z.number().optional(),
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: z.object({ label: z.string().optional() }).optional(),
});

const chatMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
  source: z.enum(["architect", "chat"]).optional(),
});

const inputSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(chatMessageSchema).default([]),
  nodes: z.array(nodeSchema).default([]),
  edges: z.array(edgeSchema).default([]),
});

function buildCanvasDescription(
  nodes: z.infer<typeof nodeSchema>[],
  edges: z.infer<typeof edgeSchema>[],
): string {
  const nodeLines = nodes.map(
    (n) =>
      `- ${n.id} [${n.data.shape ?? "rectangle"}]: "${n.data.label}"` +
      (n.data.color ? ` (color: ${n.data.color})` : ""),
  );

  const nodeMap = new Map(nodes.map((n) => [n.id, n.data.label]));
  const edgeLines = edges.map((e) => {
    const sourceLabel = nodeMap.get(e.source) ?? e.source;
    const targetLabel = nodeMap.get(e.target) ?? e.target;
    const label = e.data?.label ? ` [${e.data.label}]` : "";
    return `- ${sourceLabel} → ${targetLabel}${label}`;
  });

  const parts: string[] = [];
  if (nodeLines.length > 0) {
    parts.push("## Components\n" + nodeLines.join("\n"));
  }
  if (edgeLines.length > 0) {
    parts.push("## Connections\n" + edgeLines.join("\n"));
  }
  return parts.join("\n\n");
}

function buildChatSummary(
  chatHistory: z.infer<typeof chatMessageSchema>[],
): string {
  const architectMessages = chatHistory.filter(
    (m) => !m.source || m.source === "architect",
  );
  if (architectMessages.length === 0) return "";

  const lines = architectMessages.map(
    (m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`,
  );
  return "## Design Conversation\n" + lines.join("\n");
}

const SYSTEM_PROMPT = `You are Ghost AI, a senior software architect. Generate a thorough technical specification document in Markdown for the system architecture shown in the canvas.

The specification should include:
1. **System Overview** — purpose, high-level summary, and key design goals
2. **Architecture Components** — description of each component, its role, and responsibilities
3. **Data Flow** — how data moves between components, including key interactions
4. **API Contracts** — notable interfaces or communication patterns between services
5. **Technology Considerations** — relevant tech stack choices, protocols, or constraints implied by the design
6. **Scalability & Reliability** — potential bottlenecks, failure modes, and mitigation strategies
7. **Security Considerations** — authentication, authorization, and data protection concerns

Write in clear technical prose. Use headers, bullet points, and code blocks where appropriate. Output plain Markdown only — no preamble or explanation outside the document itself.`;

export const generateSpec = schemaTask({
  id: "generate-spec",
  schema: inputSchema,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10_000,
    randomize: true,
  },
  run: async (payload) => {
    logger.info("generate-spec started", {
      projectId: payload.projectId,
      roomId: payload.roomId,
      nodeCount: payload.nodes.length,
      edgeCount: payload.edges.length,
    });

    metadata.set("status", "generating").set("progress", 0);

    const canvasDescription = buildCanvasDescription(
      payload.nodes,
      payload.edges,
    );
    const chatSummary = buildChatSummary(payload.chatHistory);

    const userPrompt = [
      "Generate a technical specification for the following system architecture.",
      "",
      canvasDescription,
      chatSummary ? "\n" + chatSummary : "",
    ]
      .filter(Boolean)
      .join("\n");

    metadata.set("progress", 25).set("status", "calling_ai");

    logger.info("Calling Gemini for spec generation");

    const { text } = await generateText({
      model: openrouter("nvidia/nemotron-3-ultra-550b-a55b:free"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    metadata.set("progress", 90).set("status", "finalizing");

    logger.info("generate-spec complete", { specLength: text.length });

    const specId = randomUUID();
    const blob = await put(`specs/${payload.projectId}/${specId}.md`, text, {
      access: "private",
      contentType: "text/markdown",
      addRandomSuffix: false,
      allowOverwrite: false,
    });

    const record = await prisma.projectSpec.create({
      data: {
        id: specId,
        projectId: payload.projectId,
        filePath: blob.url,
      },
    });

    logger.info("spec persisted", { specId: record.id, url: blob.url });

    metadata.set("progress", 100).set("status", "complete");

    return { spec: text, specId: record.id };
  },
});
