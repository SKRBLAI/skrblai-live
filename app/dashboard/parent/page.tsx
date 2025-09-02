import { getOptionalServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserCheck, BarChart3, Trophy, Star, Settings, ArrowRight } from 'lucide-react';

export default async function ParentPortalPage() {
  const supabase = getOptionalServerSupabase();
  
  // Graceful fallback if Supabase is not configured
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                Parent Portal
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
    redirect('/sign-in?from=/dashboard/parent');
  }

  // Try to get parent profile (null-safe)
  let parentProfile = null;
  let profileError = null;
  
  try {
    const result = await supabase
      .from('parent_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    parentProfile = result.data;
    profileError = result.error;
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    profileError = error;
  }

  // If no profile exists, show provision link
  if (profileError || !parentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                Welcome to Parent Portal
              </h1>
              
              <p className="text-gray-300 mb-8">
                You don't have Parent access yet. Set up your parent profile to track your child's athletic progress, view training insights, and manage their sports development journey.
              </p>
              
              <div className="space-y-4">
                <Link
                  href="/api/parent/provision"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Set Up Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <div className="text-sm text-gray-400">
                  <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show parent dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Parent Portal
              </h1>
              <p className="text-gray-300">
                Monitor your child's athletic development and progress
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Scans Used</h3>
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">12 / 25</div>
            <p className="text-gray-400 text-sm">This month</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Improvements</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">8</div>
            <p className="text-gray-400 text-sm">Areas identified</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Progress Score</h3>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">87%</div>
            <p className="text-gray-400 text-sm">Overall improvement</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Video Analysis Completed</p>
                  <p className="text-gray-400 text-sm">Basketball shooting form - 3 improvements identified</p>
                  <p className="text-gray-500 text-xs">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">Training Plan Updated</p>
                  <p className="text-gray-400 text-sm">New drills added to weekly routine</p>
                  <p className="text-gray-500 text-xs">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">MOE Session Completed</p>
                  <p className="text-gray-400 text-sm">Mastery of Emotion training - confidence boost techniques</p>
                  <p className="text-gray-500 text-xs">3 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Child Progress */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Child Progress</h3>
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Shooting Accuracy</span>
                  <span className="text-green-400 font-bold">+15%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Defensive Position</span>
                  <span className="text-blue-400 font-bold">+12%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full" style={{width: '68%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Mental Focus (MOE)</span>
                  <span className="text-purple-400 font-bold">+20%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{width: '82%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/sports"
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Upload New Video</p>
                  <p className="text-gray-400 text-sm">Get instant analysis</p>
                </div>
              </div>
            </Link>

            <Link
              href="/pricing"
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 hover:border-purple-400/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Upgrade Plan</p>
                  <p className="text-gray-400 text-sm">Get more scans & features</p>
                </div>
              </div>
            </Link>

            <Link
              href="/contact"
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 hover:border-green-400/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Get Support</p>
                  <p className="text-gray-400 text-sm">Contact our team</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}