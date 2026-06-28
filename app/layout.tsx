import type { Metadata } from "next";
import { Geist, Geist_Mono, Momo_Trust_Display } from "next/font/google";
import localFont from "next/font/local";
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

const momoTrustDisplay = localFont({
  src: "./fonts/MomoTrustDisplay-Regular.ttf",
  variable: "--font-momo-trust-display",
  weight: "400",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Saturn",
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
          colorPrimary: "var(--foreground)",
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
        className={`${geistSans.variable} ${geistMono.variable} ${momoTrustDisplay.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
