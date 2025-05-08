import React from 'react'
import type { Metadata } from 'next'
import DashboardWrapper from './DashboardWrapper'

export const metadata: Metadata = {
  title: 'Dashboard | SKRBL AI',
  description: 'Access all your AI-powered automation tools and manage your content creation workflow.',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardWrapper>
      {children}
    </DashboardWrapper>
  )
}
