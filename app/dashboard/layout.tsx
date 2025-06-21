import React from 'react'
import { Metadata } from 'next';
import { ReactNode } from 'react';
import DashboardWrapper from './DashboardWrapper'

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard | SKRBL AI',
  description: 'Access all your AI-powered automation tools and manage your content creation workflow.',
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <DashboardWrapper>
      {children}
    </DashboardWrapper>
  )
}
