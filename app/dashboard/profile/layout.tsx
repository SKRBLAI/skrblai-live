import DashboardWrapper from '@/app/dashboard/DashboardWrapper';
import { metadata } from './metadata';

export { metadata };

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardWrapper>
      {children}
    </DashboardWrapper>
  );
} 