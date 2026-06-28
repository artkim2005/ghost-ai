import { z } from "zod"

export const aiStatusFeedPayloadSchema = z.object({
  text: z.string().optional(),
})

export type AiStatusFeedPayload = z.infer<typeof aiStatusFeedPayloadSchema>

export const chatMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
  source: z.enum(["architect", "chat"]).optional(),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>
