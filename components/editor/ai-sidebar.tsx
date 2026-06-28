"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Bot, X, Send, FileText, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useEventListener,
  useStorage,
  useMutation,
  useSelf,
} from "@liveblocks/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { aiStatusFeedPayloadSchema, chatMessageSchema } from "@/types/tasks";
import type { ChatMessage } from "@/types/tasks";
import { marked } from "marked";

interface ProjectSpecItem {
  id: string;
  createdAt: string;
  filename: string;
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

interface RunTrackerProps {
  runId: string;
  token: string;
  onComplete: (summary: string) => void;
  onError: () => void;
}

function RunTracker({ runId, token, onComplete, onError }: RunTrackerProps) {
  const { run, error } = useRealtimeRun(runId, { accessToken: token });

  useEffect(() => {
    if (!run) return;
    if (run.status === "COMPLETED") {
      const output = run.output as { summary?: string } | undefined;
      onComplete(output?.summary ?? "Architecture design complete.");
    } else if (
      run.status === "FAILED" ||
      run.status === "CRASHED" ||
      run.status === "CANCELED" ||
      run.status === "TIMED_OUT"
    ) {
      onError();
    }
  }, [run, onComplete, onError]);

  useEffect(() => {
    if (error) onError();
  }, [error, onError]);

  return null;
}

interface SpecRunTrackerProps {
  runId: string;
  token: string;
  onComplete: () => void;
  onError: () => void;
}

function SpecRunTracker({
  runId,
  token,
  onComplete,
  onError,
}: SpecRunTrackerProps) {
  const { run, error } = useRealtimeRun(runId, { accessToken: token });

  useEffect(() => {
    if (!run) return;
    if (run.status === "COMPLETED") {
      onComplete();
    } else if (
      run.status === "FAILED" ||
      run.status === "CRASHED" ||
      run.status === "CANCELED" ||
      run.status === "TIMED_OUT"
    ) {
      onError();
    }
  }, [run, onComplete, onError]);

  useEffect(() => {
    if (error) onError();
  }, [error, onError]);

  return null;
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  roomId: string;
}

export function AiSidebar({
  isOpen,
  onClose,
  projectId,
  roomId,
}: AiSidebarProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [runState, setRunState] = useState<{
    runId: string;
    token: string;
  } | null>(null);
  const [feedActive, setFeedActive] = useState(false);
  const [feedMessage, setFeedMessage] = useState<string | null>(null);
  const feedTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const architectScrollRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [chatInput, setChatInput] = useState("");
  const [chatSendError, setChatSendError] = useState(false);
  const me = useSelf();

  const [activeTab, setActiveTab] = useState("architect");
  const [specs, setSpecs] = useState<ProjectSpecItem[]>([]);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<ProjectSpecItem | null>(
    null,
  );
  const [specContent, setSpecContent] = useState<string | null>(null);
  const [specContentLoading, setSpecContentLoading] = useState(false);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [specRunState, setSpecRunState] = useState<{
    runId: string;
    token: string;
  } | null>(null);

  // ai-chat feed via Liveblocks Storage
  const rawMessages = useStorage((root) => root.aiChat);
  const allMessages = rawMessages
    ? rawMessages.flatMap((m) => {
        const r = chatMessageSchema.safeParse(m);
        return r.success ? [r.data] : [];
      })
    : [];

  // Architect tab: design messages only
  const designMessages = allMessages.filter((m) => m.source === "architect");
  // Chat tab: room chat messages (no source or explicit "chat")
  const chatMessages = allMessages.filter(
    (m) => !m.source || m.source === "chat",
  );

  const pushChatMessage = useMutation(({ storage }, message: ChatMessage) => {
    const chat = storage.get("aiChat");
    if (chat) chat.push(message);
  }, []);

  // Auto-scroll architect tab on new design messages or generating state
  useEffect(() => {
    if (architectScrollRef.current) {
      architectScrollRef.current.scrollTop =
        architectScrollRef.current.scrollHeight;
    }
  }, [designMessages.length, isGenerating]);

  // Auto-scroll chat tab on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages.length]);

  const refreshSpecs = useCallback(() => {
    setSpecsLoading(true);
    fetch(`/api/projects/${projectId}/specs`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ProjectSpecItem[]) => setSpecs(data))
      .catch(() => {})
      .finally(() => setSpecsLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (activeTab !== "specs") return;
    refreshSpecs();
  }, [activeTab, refreshSpecs]);

  const handleGenerateSpec = useCallback(async () => {
    if (isGeneratingSpec) return;
    setIsGeneratingSpec(true);
    try {
      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory: allMessages,
          nodes: [],
          edges: [],
        }),
      });
      if (!res.ok) throw new Error("Failed to start spec generation");
      const { runId } = (await res.json()) as { runId: string };

      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      if (!tokenRes.ok) throw new Error("Failed to get token");
      const { token } = (await tokenRes.json()) as { token: string };
      setSpecRunState({ runId, token });
    } catch {
      setIsGeneratingSpec(false);
    }
  }, [isGeneratingSpec, roomId, allMessages]);

  const handleSpecComplete = useCallback(() => {
    setIsGeneratingSpec(false);
    setSpecRunState(null);
    refreshSpecs();
  }, [refreshSpecs]);

  const handleSpecError = useCallback(() => {
    setIsGeneratingSpec(false);
    setSpecRunState(null);
  }, []);

  const openSpec = useCallback(
    async (spec: ProjectSpecItem) => {
      setSelectedSpec(spec);
      setSpecContent(null);
      setSpecContentLoading(true);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/specs/${spec.id}/download`,
        );
        if (res.ok) {
          const text = await res.text();
          const html = await marked.parse(text);
          setSpecContent(html);
        }
      } catch {
        // leave specContent null; modal shows error state
      } finally {
        setSpecContentLoading(false);
      }
    },
    [projectId],
  );

  const downloadSpec = useCallback(
    (spec: ProjectSpecItem, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const a = document.createElement("a");
      a.href = `/api/projects/${projectId}/specs/${spec.id}/download`;
      a.download = spec.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [projectId],
  );

  useEventListener(({ event }) => {
    if (event.type !== "AI_STATUS") return;

    const parsed = aiStatusFeedPayloadSchema.safeParse({ text: event.message });
    const text =
      parsed.success && parsed.data.text ? parsed.data.text : event.message;

    if (event.status === "thinking" || event.status === "processing") {
      if (feedTimerRef.current) clearTimeout(feedTimerRef.current);
      setFeedActive(true);
      setFeedMessage(text);
    } else {
      setFeedActive(false);
      setFeedMessage(text);
      if (feedTimerRef.current) clearTimeout(feedTimerRef.current);
      feedTimerRef.current = setTimeout(() => setFeedMessage(null), 3000);
    }
  });

  const blocked = isGenerating || feedActive;

  const handleRunComplete = useCallback(
    (summary: string) => {
      setIsGenerating(false);
      setRunState(null);
      pushChatMessage({
        id: makeId(),
        sender: "Ghost AI",
        role: "assistant",
        content: summary,
        timestamp: new Date().toISOString(),
        source: "architect",
      });
    },
    [pushChatMessage],
  );

  const handleRunError = useCallback(() => {
    setIsGenerating(false);
    setRunState(null);
    pushChatMessage({
      id: makeId(),
      sender: "Ghost AI",
      role: "assistant",
      content: "Something went wrong. Please try again.",
      timestamp: new Date().toISOString(),
      source: "architect",
    });
  }, [pushChatMessage]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || blocked) return;

      const userContent = content.trim();

      // Push user message to ai-chat feed
      pushChatMessage({
        id: makeId(),
        sender: me?.info?.name ?? "You",
        role: "user",
        content: userContent,
        timestamp: new Date().toISOString(),
        source: "architect",
      });

      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "72px";
      setIsGenerating(true);

      try {
        const triggerRes = await fetch("/api/ai/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userContent, roomId, projectId }),
        });

        if (!triggerRes.ok) {
          const err = await triggerRes.json().catch(() => ({}));
          throw new Error(
            (err as { error?: string }).error ?? "Failed to start design agent",
          );
        }

        const { runId } = (await triggerRes.json()) as { runId: string };

        const tokenRes = await fetch("/api/ai/design/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId }),
        });

        if (!tokenRes.ok) throw new Error("Failed to get run token");

        const { token } = (await tokenRes.json()) as { token: string };
        setRunState({ runId, token });
      } catch {
        setIsGenerating(false);
        pushChatMessage({
          id: makeId(),
          sender: "Ghost AI",
          role: "assistant",
          content: "Failed to reach Ghost AI. Please try again.",
          timestamp: new Date().toISOString(),
          source: "architect",
        });
      }
    },
    [blocked, roomId, projectId, me, pushChatMessage],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage],
  );

  const sendChatMessage = useCallback(() => {
    const content = chatInput.trim();
    if (!content || rawMessages === null) return;

    setChatSendError(false);
    const message: ChatMessage = {
      id: makeId(),
      sender: me?.info?.name ?? "You",
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      source: "chat",
    };

    try {
      pushChatMessage(message);
      setChatInput("");
    } catch {
      setChatSendError(true);
    }
  }, [chatInput, rawMessages, me, pushChatMessage]);

  const handleChatKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    },
    [sendChatMessage],
  );

  return (
    <>
      {runState && (
        <RunTracker
          runId={runState.runId}
          token={runState.token}
          onComplete={handleRunComplete}
          onError={handleRunError}
        />
      )}
      {specRunState && (
        <SpecRunTracker
          runId={specRunState.runId}
          token={specRunState.token}
          onComplete={handleSpecComplete}
          onError={handleSpecError}
        />
      )}

      <Dialog
        open={selectedSpec !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSpec(null);
            setSpecContent(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl border-surface-border bg-base text-copy-primary overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-copy-primary">
              {selectedSpec?.filename}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-base [&::-webkit-scrollbar-thumb]:bg-elevated [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-corner]:bg-base">
            {specContentLoading ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-xs text-copy-faint">Loading…</span>
              </div>
            ) : specContent === null ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-xs text-copy-faint">
                  Failed to load spec content.
                </span>
              </div>
            ) : (
              <div
                className="prose prose-invert prose-sm max-w-none px-1 py-2 text-copy-muted [&_h1]:text-copy-primary [&_h2]:text-copy-primary [&_h3]:text-copy-primary [&_code]:bg-elevated [&_code]:px-1 [&_code]:rounded [&_pre]:bg-elevated [&_pre]:rounded-lg [&_pre]:p-3"
                dangerouslySetInnerHTML={{ __html: specContent }}
              />
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSpec(null);
                setSpecContent(null);
              }}
              className="text-copy-muted hover:text-copy-primary"
            >
              Close
            </Button>
            {selectedSpec && (
              <Button
                size="sm"
                onClick={() => downloadSpec(selectedSpec)}
                className="bg-ai text-white hover:bg-ai/90"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <aside
        className={`fixed right-0 top-12 z-30 flex h-[calc(100vh-3rem)] w-80 flex-col border-l border-surface-border bg-base/95 shadow-2xl backdrop-blur-sm transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-surface-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Bot className="h-4 w-4 shrink-0 text-ai-text" />
            <div>
              <p className="text-sm font-semibold text-copy-primary">
                AI Workspace
              </p>
              <p className="text-xs text-copy-muted">
                Collaborate with Saturn AI
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 shrink-0 text-copy-muted hover:text-copy-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="architect"
          className="flex flex-1 flex-col overflow-hidden gap-0"
          onValueChange={setActiveTab}
        >
          <TabsList className="h-10 w-full rounded-none border-b border-surface-border bg-transparent px-2">
            <TabsTrigger
              value="architect"
              className="flex-1 rounded-lg text-xs data-[state=active]:bg-ai data-[state=active]:text-white data-[state=active]:shadow-none data-[state=inactive]:text-copy-muted"
            >
              Architect
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex-1 rounded-lg text-xs data-[state=active]:bg-ai data-[state=active]:text-white data-[state=active]:shadow-none data-[state=inactive]:text-copy-muted"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="flex-1 rounded-lg text-xs data-[state=active]:bg-ai data-[state=active]:text-white data-[state=active]:shadow-none data-[state=inactive]:text-copy-muted"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          {/* AI Architect Tab */}
          <TabsContent
            value="architect"
            className="flex flex-1 flex-col overflow-hidden mt-0 data-[state=inactive]:hidden"
          >
            <ScrollArea className="flex-1" ref={architectScrollRef}>
              {rawMessages === null ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-xs text-copy-faint">Connecting…</p>
                </div>
              ) : designMessages.length === 0 && !isGenerating ? (
                <div className="flex flex-col items-center gap-5 px-4 py-10">
                  <Bot className="h-8 w-8 text-ai-text" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-copy-primary">
                      Ask Saturn AI
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-copy-muted">
                      Describe what you want to build and I&apos;ll help design
                      the architecture.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {STARTER_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        disabled={blocked}
                        className="cursor-pointer rounded-full bg-subtle px-4 py-2 text-xs text-ai-text transition-colors hover:bg-elevated text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-4">
                  {designMessages.map((msg) =>
                    msg.role === "user" ? (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl bg-accent-green px-3 py-2 text-xs text-white">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div key={msg.id} className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl bg-elevated px-3 py-2 text-xs text-copy-muted">
                          {msg.content}
                        </div>
                      </div>
                    ),
                  )}
                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1.5 rounded-2xl border border-surface-border bg-elevated px-3 py-2">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ai-text [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ai-text [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ai-text [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Status strip — above input, only while run is active */}
            {blocked && (
              <div className="flex items-center gap-2 border-t border-accent-green/20 bg-elevated px-3 py-2">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent-green" />
                <span className="truncate text-xs text-copy-muted">
                  {feedMessage ?? "Saturn AI is working…"}
                </span>
              </div>
            )}

            {/* Input area */}
            <div className="border-t border-surface-border p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    blocked ? "Saturn AI is working..." : "Ask Saturn AI..."
                  }
                  disabled={blocked}
                  rows={1}
                  style={{ minHeight: "72px", maxHeight: "160px" }}
                  className="resize-none overflow-y-auto border-surface-border bg-elevated text-xs text-copy-primary placeholder:text-copy-faint focus-visible:ring-1 focus-visible:ring-accent-green/50 disabled:opacity-60"
                />
                <Button
                  size="icon"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || blocked}
                  className="h-9 w-9 shrink-0 bg-accent-green text-white hover:bg-accent-green/90 disabled:opacity-40"
                >
                  {blocked ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-1.5 text-[10px] text-copy-faint">
                Enter to send · Shift+Enter for newline
              </p>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent
            value="chat"
            className="flex flex-1 flex-col overflow-hidden mt-0 data-[state=inactive]:hidden"
          >
            <ScrollArea className="flex-1" ref={chatScrollRef}>
              {rawMessages === null ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-xs text-copy-faint">Connecting…</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-4 py-10">
                  <MessageSquare className="h-8 w-8 text-copy-faint" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-copy-primary">
                      Room Chat
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-copy-muted">
                      Send messages to everyone in this room.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 p-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex flex-col gap-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium text-copy-primary">
                          {msg.sender}
                        </span>
                        <span className="text-[10px] text-copy-faint">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-copy-muted">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Chat input */}
            <div className="border-t border-surface-border p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Message collaborators..."
                  disabled={rawMessages === null}
                  rows={1}
                  style={{ minHeight: "72px", maxHeight: "160px" }}
                  className="resize-none overflow-y-auto border-surface-border bg-elevated text-xs text-copy-primary placeholder:text-copy-faint focus-visible:ring-1 focus-visible:ring-brand/50 disabled:opacity-60"
                />
                <Button
                  size="icon"
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || rawMessages === null}
                  className="h-9 w-9 shrink-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {chatSendError ? (
                <p className="mt-1.5 text-[10px] text-red-400">
                  Failed to send. Please try again.
                </p>
              ) : (
                <p className="mt-1.5 text-[10px] text-copy-faint">
                  Enter to send · Shift+Enter for newline
                </p>
              )}
            </div>
          </TabsContent>

          {/* Specs Tab */}
          <TabsContent
            value="specs"
            className="flex flex-1 flex-col overflow-hidden mt-0 data-[state=inactive]:hidden"
          >
            <div className="shrink-0 border-b border-surface-border p-3">
              <Button
                className="w-full bg-ai text-white hover:bg-ai/90 disabled:opacity-60"
                onClick={handleGenerateSpec}
                disabled={isGeneratingSpec}
              >
                {isGeneratingSpec ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating…
                  </span>
                ) : (
                  "Generate Spec"
                )}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="flex flex-col gap-2 p-4">
                {specsLoading ? (
                  <p className="text-center text-xs text-copy-faint py-6">
                    Loading specs…
                  </p>
                ) : specs.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10">
                    <FileText className="h-8 w-8 text-copy-faint" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-copy-primary">
                        No specs yet
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-copy-muted">
                        Generate a spec from the Architect tab.
                      </p>
                    </div>
                  </div>
                ) : (
                  specs.map((spec) => (
                    <div
                      key={spec.id}
                      onClick={() => openSpec(spec)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && openSpec(spec)}
                      className="flex w-full min-w-0 cursor-pointer overflow-hidden items-center gap-3 rounded-xl border border-surface-border bg-elevated px-3 py-2.5 text-left transition-colors hover:bg-subtle"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-ai-text" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-copy-primary">
                          {spec.filename}
                        </p>
                        <p className="mt-0.5 text-[10px] text-copy-faint">
                          {new Date(spec.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => downloadSpec(spec, e)}
                        className="h-6 w-6 shrink-0 text-copy-faint hover:text-copy-primary"
                        aria-label="Download spec"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </aside>
    </>
  );
}
