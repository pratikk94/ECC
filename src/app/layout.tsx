import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Content Generator",
  description: "Generate educational content and questions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.className}>
      <body>
        <nav className="main-nav">
          <div className="nav-container">
            <div className="nav-logo">
              <Link href="/">
                Educational Content Generator
              </Link>
            </div>
            <div className="nav-links">
              <Link href="/" className="nav-link">
                Home
              </Link>
              <Link href="/course-modules" className="nav-link">
                Course Modules
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
