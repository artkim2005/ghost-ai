import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="flex h-screen items-center justify-center bg-base">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated">
          <Lock className="h-8 w-8 text-copy-muted" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-copy-primary">Access Denied</h1>
          <p className="max-w-xs text-sm text-copy-muted">
            This project doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
        </div>
        <Button asChild variant="ghost" className="text-copy-muted hover:text-copy-primary">
          <Link href="/editor">Back to projects</Link>
        </Button>
      </div>
    </div>
  )
}
