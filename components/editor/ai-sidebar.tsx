"use client"

import { useState, useRef, useCallback } from "react"
import { Bot, X, Send, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: content.trim() },
    ])
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "72px"
    }
  }, [])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        sendMessage(input)
      }
    },
    [input, sendMessage],
  )

  return (
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
            <p className="text-sm font-semibold text-copy-primary">AI Workspace</p>
            <p className="text-xs text-copy-muted">Collaborate with Ghost AI</p>
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
      <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden gap-0">
        <TabsList className="h-10 w-full rounded-none border-b border-surface-border bg-transparent px-3">
          <TabsTrigger
            value="architect"
            className="flex-1 rounded-lg text-xs data-[state=active]:bg-ai data-[state=active]:text-white data-[state=active]:shadow-none data-[state=inactive]:text-copy-muted"
          >
            AI Architect
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
          <ScrollArea className="flex-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-5 px-4 py-10">
                <Bot className="h-8 w-8 text-ai-text" />
                <div className="text-center">
                  <p className="text-sm font-medium text-copy-primary">Ask Ghost AI</p>
                  <p className="mt-1 text-xs leading-relaxed text-copy-muted">
                    Describe what you want to build and I&apos;ll help design the architecture.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {STARTER_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => sendMessage(chip)}
                      className="rounded-full bg-subtle px-4 py-2 text-xs text-ai-text transition-colors hover:bg-elevated text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-4">
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl border-2 border-brand/50 bg-brand-dim px-3 py-2 text-xs text-copy-primary">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl border border-surface-border bg-elevated px-3 py-2 text-xs text-ai-text">
                        {msg.content}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input area */}
          <div className="border-t border-surface-border p-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask Ghost AI..."
                rows={1}
                style={{ minHeight: "72px", maxHeight: "160px" }}
                className="resize-none overflow-y-auto border-surface-border bg-elevated text-xs text-copy-primary placeholder:text-copy-faint focus-visible:ring-1 focus-visible:ring-ai/50"
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="h-9 w-9 shrink-0 bg-ai text-white hover:bg-ai/90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] text-copy-faint">
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent
          value="specs"
          className="flex flex-1 flex-col gap-3 overflow-y-auto mt-0 p-4 data-[state=inactive]:hidden"
        >
          <Button className="w-full bg-ai text-white hover:bg-ai/90">Generate Spec</Button>

          {/* Demo spec card */}
          <div className="rounded-2xl border border-surface-border bg-elevated p-4">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-ai-text" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-copy-primary">System Architecture Spec</p>
                <p className="mt-1 text-xs leading-relaxed text-copy-muted line-clamp-3">
                  Microservices API gateway with authentication, rate limiting, and service mesh topology for distributed systems.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="h-7 w-7 shrink-0 text-copy-faint opacity-50"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
