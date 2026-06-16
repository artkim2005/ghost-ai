import { SignIn } from "@clerk/nextjs";
import { Cpu, Share2, FileText } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-base">
      <div className="hidden lg:flex lg:w-1/2 flex-col bg-surface border-r border-surface-border px-16 py-12">
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-8 h-8 rounded-lg bg-brand shrink-0" />
          <span className="text-sm font-semibold tracking-tight text-copy-primary">Ghost AI</span>
        </div>

        <div className="flex-1 flex flex-col justify-center py-16">
          <h1 className="text-4xl font-bold tracking-tight text-copy-primary leading-tight mb-4">
            Design systems at the<br />speed of thought.
          </h1>
          <p className="text-copy-secondary text-[1rem] mb-12">
            Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time.
          </p>

          <ul className="space-y-6">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-elevated border border-surface-border flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-copy-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-copy-primary mb-0.5">{title}</p>
                  <p className="text-sm text-copy-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-copy-faint">© 2026 Ghost AI. All rights reserved.</p>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-12">
        <SignIn />
      </div>
    </div>
  );
}
