import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://staff-survey-psi.vercel.app"),
  title: "Staff Wellbeing Survey",
  description: "Anonymous monthly staff wellbeing survey",
  openGraph: {
    title: "Staff Wellbeing Survey",
    description: "Anonymous monthly staff wellbeing survey",
    url: "https://staff-survey-psi.vercel.app/",
    siteName: "Staff Wellbeing Survey",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Staff Wellbeing Survey",
    description: "Anonymous monthly staff wellbeing survey",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
