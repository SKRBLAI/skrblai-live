/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardAuth } from '../../hooks/useDashboardAuth';
import Spinner from '../../components/ui/Spinner';
import DashboardWrapper from './DashboardWrapper';
import ErrorBoundary from '../../components/layout/ErrorBoundary';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useDashboardAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  if (isLoading) return <Spinner />;
  if (!user) return null;
  return (
    <ErrorBoundary fallback={<div className="p-8 text-center">Please log in or sign up to view your dashboard.</div>}>
      <DashboardWrapper />
    </ErrorBoundary>
  );
}

