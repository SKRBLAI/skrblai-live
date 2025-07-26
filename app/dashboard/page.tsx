/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React from 'react';
import { useDashboardAuth } from '../../hooks/useDashboardAuth';
import Spinner from '../../components/ui/Spinner';
import PercyOnboardingRevolution from '../../components/home/PercyOnboardingRevolution';
import DashboardWrapper from './DashboardWrapper';

export default function DashboardPage() {
  const { user, isLoading } = useDashboardAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <PercyOnboardingRevolution />;
  return <DashboardWrapper />;
}

