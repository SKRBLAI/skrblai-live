import DashboardWrapper from '@/app/dashboard/DashboardWrapper';
import { ReactNode } from 'react';
import { metadata } from './metadata';

export { metadata };

export default function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardWrapper>
      {children}
    </DashboardWrapper>
  );
} 