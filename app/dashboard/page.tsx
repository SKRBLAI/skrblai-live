import React from 'react';
import { requireUser } from '@/lib/auth/requireUser';
import { motion } from 'framer-motion';
import { 
  Sparkles, Target, Users, Gamepad2, ArrowRight, 
  CheckCircle, BarChart3, Zap, Globe
} from 'lucide-react';
import CardShell from '../../components/ui/CardShell';
import PageLayout from '../../components/layout/PageLayout';
import DashboardClient from './DashboardClient';

// Force dynamic rendering - requires auth at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // Server-side auth guard - redirects if not authenticated
  const user = await requireUser();

  return <DashboardClient user={user} />;
}

