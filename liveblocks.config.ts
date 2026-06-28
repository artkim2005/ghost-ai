import { LiveList } from "@liveblocks/client";
import type { ChatMessage } from "@/types/tasks";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {
      aiChat: LiveList<ChatMessage>;
    };

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent: {
      type: "AI_STATUS";
      status: "thinking" | "processing" | "complete" | "error";
      message: string;
    };

    ThreadMetadata: {};

    RoomInfo: {};
  }
}

export {};
