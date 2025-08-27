import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://skilllens.app"),
  title: {
    default: "SkillLens — Modern Resume Skill Extractor",
    template: "%s — SkillLens",
  },
  description:
    "Parse resumes, extract skills and insights with a sleek, modern interface.",
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#0b1020",
  colorScheme: "dark",
  openGraph: {
    title: "SkillLens",
    description:
      "Parse resumes, extract skills and insights with a sleek, modern interface.",
    url: "https://skilllens.app",
    siteName: "SkillLens",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillLens — Resume Skill Extractor",
    description:
      "Parse resumes, extract skills and insights with a sleek, modern interface.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
