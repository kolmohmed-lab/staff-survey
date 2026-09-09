import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Staff Pulse",
  description: "Anonymous monthly staff wellbeing survey",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
