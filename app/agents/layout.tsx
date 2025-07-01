import { ReactNode } from 'react';

export const metadata = {
  title: "SKRBL AI Agent League – Meet Your Digital Superheroes",
  description: "Discover 13+ AI-powered agents ready to transform your business. From content creation to analytics, each agent brings superhero capabilities to automate your workflows.",
  keywords: "AI agents, automation, digital marketing, content creation, business intelligence, workflow automation",
  openGraph: {
    title: "SKRBL AI Agent League – Digital Superheroes for Business",
    description: "Meet your AI-powered agent team. 13+ specialized agents ready to automate content, analyze data, and scale your business operations.",
    type: "website",
    images: [
      {
        url: "/images/agent-league-og.jpg",
        width: 1200,
        height: 630,
        alt: "SKRBL AI Agent League"
      }
    ]
  }
};

export default function AgentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
} 