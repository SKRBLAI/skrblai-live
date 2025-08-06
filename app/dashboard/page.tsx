/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardAuth } from '../../hooks/useDashboardAuth';
import Spinner from '../../components/ui/Spinner';
import DashboardWrapper from './DashboardWrapper';
import ErrorBoundary from '../../components/layout/ErrorBoundary';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../components/context/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user: dbUser, isLoading } = useDashboardAuth();
  const { user: authUser } = useAuth();
  const searchParams = useSearchParams();
  // Role-based redirect for multi-page dashboard
  useEffect(() => {
    if (!isLoading && dbUser) {
      const queryRole = searchParams.get('role');
      const userRole = authUser?.user_metadata?.role;
      const roleToUse = userRole || queryRole;
      switch (roleToUse) {
        case 'vip':
          router.replace('/dashboard/vip');
          break;
        case 'founder':
          router.replace('/dashboard/founder');
          break;
        default:
          router.replace('/dashboard/user');
      }
    }
  }, [isLoading, dbUser, authUser, searchParams, router]);

  if (isLoading) return <Spinner />;
  if (!dbUser) return null;
  return (
    <ErrorBoundary fallback={<div className="p-8 text-center">Please log in or sign up to view your dashboard.</div>}>
      <DashboardWrapper />
    </ErrorBoundary>
  );
}

