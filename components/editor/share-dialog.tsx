"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Link2, X, Check, UserMinus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Collaborator {
  email: string;
  name: string | null;
  imageUrl: string | null;
}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

export function ShareDialog({
  open,
  onClose,
  projectId,
  projectName,
  isOwner,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  // refs to manage aborting and staleness across calls
  const latestControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);

  const fetchCollaborators = useCallback(async () => {
    // Abort any previous in-flight request and ignore its results
    const reqId = (latestRequestIdRef.current += 1);
    // clear list as load starts to avoid showing stale data
    setCollaborators([]);
    setIsFetching(true);
    const controller = new AbortController();
    // replace previous controller and abort it
    if (latestControllerRef.current) latestControllerRef.current.abort();
    latestControllerRef.current = controller;

    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        signal: controller.signal,
      });
      // if this response is outdated, ignore it
      if (reqId !== latestRequestIdRef.current) return;

      if (res.ok) {
        const data = await res.json();
        setCollaborators(data.collaborators);
      } else {
        // clear on failure
        setCollaborators([]);
      }
    } catch (e: any) {
      // ignore abort errors, clear list on other failures
      if (e?.name !== "AbortError") {
        setCollaborators([]);
      }
    } finally {
      if (reqId === latestRequestIdRef.current) setIsFetching(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) {
      fetchCollaborators();
      setInviteEmail("");
      setInviteError(null);
    }
  }, [open, fetchCollaborators]);

  async function handleInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@") || isInviting) return;
    setIsInviting(true);
    setInviteError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error ?? "Failed to invite");
        return;
      }
      setCollaborators(data.collaborators);
      setInviteEmail("");
    } catch {
      setInviteError("Failed to invite");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemove(email: string) {
    if (removingEmail) return;
    setRemovingEmail(email);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setCollaborators((prev) => prev.filter((c) => c.email !== email));
      }
    } finally {
      setRemovingEmail(null);
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/editor/${projectId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("idle");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="rounded-3xl bg-elevated sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-copy-primary">
            Share &ldquo;{projectName}&rdquo;
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {isOwner && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-copy-muted">
                Invite collaborator
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing)
                      handleInvite();
                  }}
                  disabled={isInviting}
                />
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim().includes("@") || isInviting}
                  className="shrink-0 bg-brand text-base hover:bg-brand/90"
                >
                  {isInviting ? "Inviting…" : "Invite"}
                </Button>
              </div>
              {inviteError && (
                <p className="text-xs text-error">{inviteError}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-copy-muted">Collaborators</p>
            {isFetching ? (
              <p className="text-sm text-copy-faint">Loading…</p>
            ) : collaborators.length === 0 ? (
              <p className="text-sm text-copy-faint">No collaborators yet</p>
            ) : (
              <ScrollArea className="max-h-48">
                <ul className="flex flex-col gap-1">
                  {collaborators.map((c) => (
                    <li
                      key={c.email}
                      className="flex items-center gap-3 rounded-xl px-2 py-1.5"
                    >
                      {c.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.imageUrl}
                          alt={c.name ?? c.email}
                          className="h-7 w-7 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-medium text-copy-secondary">
                          {(c.name ?? c.email)[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        {c.name && (
                          <span className="truncate text-sm text-copy-primary">
                            {c.name}
                          </span>
                        )}
                        <span className="truncate text-xs text-copy-muted">
                          {c.email}
                        </span>
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={removingEmail === c.email}
                          onClick={() => handleRemove(c.email)}
                          className="h-7 w-7 shrink-0 text-copy-muted hover:text-error"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove {c.email}</span>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </div>

          <div className="border-t border-surface-border pt-3">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleCopyLink}
            >
              {copyStatus === "copied" ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-success">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Copy project link
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
