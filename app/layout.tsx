import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "Real-time collaborative system design workspace",
};

// The server-side ClerkProvider type strips __internal_invokeMiddlewareOnAuthStateChange,
// but the underlying client provider accepts it via ...rest at runtime. Spread as `any`
// to pass it through without a type error.
// Disabling this prevents router.refresh() from competing with Clerk's session handshake
// redirect on first login with a new account, which causes a blank page.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clerkClientProps: any = {
  __internal_invokeMiddlewareOnAuthStateChange: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      {...clerkClientProps}
      appearance={{
        theme: dark,
        variables: {
          colorBackground: "var(--bg-surface)",
          colorPrimary: "var(--accent-primary)",
          colorPrimaryForeground: "var(--bg-base)",
          colorForeground: "var(--text-primary)",
          colorMutedForeground: "var(--text-secondary)",
          colorInput: "var(--bg-elevated)",
          colorInputForeground: "var(--text-primary)",
          colorDanger: "var(--state-error)",
          colorSuccess: "var(--state-success)",
          colorWarning: "var(--state-warning)",
          fontFamily: "var(--font-geist-sans)",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
