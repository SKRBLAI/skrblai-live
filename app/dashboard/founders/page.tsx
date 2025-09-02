import { getOptionalServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Crown, TrendingUp, Users, Zap, Settings, ArrowRight, BarChart3 } from 'lucide-react';

export default async function FoundersDashboardPage() {
  const supabase = getOptionalServerSupabase();
  
  // Graceful fallback if Supabase is not configured
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                Founders Dashboard
              </h1>
              
              <p className="text-gray-300 mb-8">
                Service temporarily unavailable. Please try again later.
              </p>
              
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Back to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/sign-in?from=/dashboard/founders');
  }

  // Check if user has founder role (optional - can show message if not)
  const { data: roleRows } = await supabase
    .from('user_roles')
    .select('role')
    .eq('userId', user.id);

  const roles = (roleRows || []).map((r: any) => r.role?.toLowerCase?.() || '');
  const isFounder = roles.includes('founder');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Founders Dashboard
                </h1>
                <p className="text-gray-300">
                  Strategic insights and founder-level controls
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Access Check */}
        {!isFounder && (
          <div className="mb-8 p-6 bg-orange-500/20 border border-orange-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="text-lg font-semibold text-orange-300">Founder Access Required</h3>
                <p className="text-orange-200 text-sm">
                  You don't have founder privileges yet. Contact support to upgrade your account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Founder Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Revenue Growth</h3>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">+127%</div>
            <p className="text-gray-400 text-sm">This quarter</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Active Users</h3>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">2,847</div>
            <p className="text-gray-400 text-sm">+23% this month</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">AI Deployments</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">156</div>
            <p className="text-gray-400 text-sm">Active agents</p>
          </div>
        </div>

        {/* Founder Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strategic Overview */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-6">Strategic Overview</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Product Roadmap Q1</p>
                  <p className="text-gray-400 text-sm">AI agent marketplace launch scheduled</p>
                  <p className="text-gray-500 text-xs">On track</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Team Expansion</p>
                  <p className="text-gray-400 text-sm">Engineering team growing by 40%</p>
                  <p className="text-gray-500 text-xs">In progress</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Series A Funding</p>
                  <p className="text-gray-400 text-sm">$15M round closing next month</p>
                  <p className="text-gray-500 text-xs">Final stages</p>
                </div>
              </div>
            </div>
          </div>

          {/* Founder Controls */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Founder Controls</h3>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <Link
                href="/admin"
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Admin Panel</p>
                    <p className="text-gray-400 text-sm">System administration</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/dashboard/analytics"
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Advanced Analytics</p>
                    <p className="text-gray-400 text-sm">Deep business insights</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/pricing"
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Pricing Strategy</p>
                    <p className="text-gray-400 text-sm">Revenue optimization</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}