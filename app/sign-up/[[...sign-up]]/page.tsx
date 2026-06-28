import { SignUp } from "@clerk/nextjs";
import { Cpu, Share2, FileText } from "lucide-react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

function SaturnIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 502.688 502.688"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M491.401,12.059c-23.467-23.467-70.4-9.6-145.067,42.667c-30.933-16-65.067-25.6-101.333-25.6
        c-57.6,0-112,22.4-152.533,62.933c-68.267,68.267-81.067,170.667-38.4,252.8c-69.333,99.2-57.6,131.2-42.667,145.067
        c7.467,7.467,18.133,11.733,29.867,11.733c23.467,0,54.4-13.867,98.133-40.533c7.467-5.333,16-10.667,24.533-17.067
        c25.6,10.667,53.333,16,81.067,16c57.6,0,112-22.4,152.533-62.933c62.933-62.933,78.933-155.733,46.933-233.6
        c6.4-8.533,11.733-17.067,18.133-25.6C504.201,73.925,512.734,33.392,491.401,12.059z M41.267,458.992
        c1.067-8.533,7.467-32,37.333-77.867c4.267,5.333,8.533,10.667,13.867,16c8.533,8.533,18.133,16,27.733,23.467
        C81.801,446.192,53.001,458.992,41.267,458.992z M156.467,394.992c-11.733-7.467-23.467-16-34.133-26.667
        c-68.267-68.267-68.267-178.133,0-246.4c32-33.067,75.733-51.2,122.667-51.2s90.667,18.133,123.733,50.133
        c10.667,10.667,20.267,22.4,26.667,35.2c-27.733,36.267-66.133,80-113.067,126.933
        C235.401,329.925,192.734,367.259,156.467,394.992z M368.734,367.259c-33.067,33.067-77.867,52.267-123.733,52.267
        c-13.867,0-27.733-2.133-41.6-5.333c36.267-28.8,74.667-62.933,112-100.267c37.333-37.333,70.4-74.667,99.2-110.933
        C428.467,260.592,413.534,322.459,368.734,367.259z M422.067,120.858c-7.467-10.667-14.933-20.267-24.533-28.8
        c-4.267-4.267-9.6-8.533-13.867-12.8c44.8-29.867,68.267-37.333,76.8-37.333C460.467,53.659,448.734,81.392,422.067,120.858z"
      />
    </svg>
  );
}

const features = [
  {
    icon: Cpu,
    title: "AI Architecture Generation",
    description:
      "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description:
      "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description:
      "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-base">
      <div className="hidden lg:flex lg:w-1/2 flex-col bg-[#0a0a0f] border-r border-surface-border px-16 py-12 relative overflow-hidden">
        <StarsBackground />
        <ShootingStars starColor="#9E00FF" trailColor="#2EB9DF" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-auto">
            <SaturnIcon className="w-9 h-9 shrink-0" />
            <span
              className="text-2xl tracking-tight text-copy-primary"
              style={{ fontFamily: "var(--font-momo-trust-display)" }}
            >
              Saturn
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-16">
            <h1 className="text-4xl font-bold tracking-tight text-copy-primary leading-tight mb-4">
              Design systems at the
              <br />
              speed of light.
            </h1>
            <p className="text-copy-secondary text-[1rem] mb-12">
              Describe your architecture in plain English. Saturn maps it to a
              shared canvas your whole team can edit in real time.
            </p>

            <ul className="space-y-6">
              {features.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-elevated border border-surface-border flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-copy-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-copy-primary mb-0.5">
                      {title}
                    </p>
                    <p className="text-sm text-copy-muted">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-copy-faint">
            © 2026 Saturn. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-12">
        <SignUp />
      </div>
    </div>
  );
}
