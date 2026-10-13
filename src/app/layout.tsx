import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Founder OS — Validate before you build", description: "Customer discovery, problem validation, and paid pilot tracking for early-stage founders." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
