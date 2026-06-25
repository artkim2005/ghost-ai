import { auth, currentUser } from "@clerk/nextjs/server";
import getLiveblocks, { getCursorColor } from "@/lib/liveblocks";
import { getCurrentIdentity, getProjectWithAccess } from "@/lib/project-access";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const roomId: unknown = body.room;
  if (typeof roomId !== "string" || !roomId) {
    return new Response("Bad Request", { status: 400 });
  }

  const identity = await getCurrentIdentity();
  if (!identity) {
    return new Response("Unauthorized", { status: 401 });
  }

  // The project ID is the Liveblocks room ID
  const project = await getProjectWithAccess(roomId, identity);
  if (!project) {
    return new Response("Forbidden", { status: 403 });
  }

  const user = await currentUser();
  const name =
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Anonymous";
  const avatar = user?.imageUrl ?? "";
  const color = getCursorColor(userId);

  const liveblocks = getLiveblocks();

  await liveblocks.getOrCreateRoom(roomId, { defaultAccesses: [] });

  const session = liveblocks.prepareSession(userId, {
    userInfo: { name, avatar, color },
  });
  session.allow(roomId, session.FULL_ACCESS);

  const { status, body: responseBody } = await session.authorize();
  return new Response(responseBody, { status });
}
