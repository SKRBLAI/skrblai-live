import "./globals.css";
import PercyWrapper from "@/components/providers/PercyWrapper";
import type { ReactNode } from "react";

export const metadata = {
  title: "SKRBL AI",
  description: "Your AI-powered automation hub",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PercyWrapper>
          {children}
        </PercyWrapper>
      </body>
    </html>
  );
}
