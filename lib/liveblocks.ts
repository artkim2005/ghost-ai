import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#F87171", // red
  "#FB923C", // orange
  "#FBBF24", // amber
  "#34D399", // emerald
  "#38BDF8", // sky
  "#818CF8", // indigo
  "#E879F9", // fuchsia
  "#F472B6", // pink
];

export function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

declare global {
  // eslint-disable-next-line no-var
  var _liveblocks: Liveblocks | undefined;
}

function getLiveblocks(): Liveblocks {
  if (!globalThis._liveblocks) {
    globalThis._liveblocks = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY!,
    });
  }
  return globalThis._liveblocks;
}

export default getLiveblocks;
