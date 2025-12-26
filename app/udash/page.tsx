import { getServerSupabaseAnon, getServerSupabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  Sparkles, Target, Users, Gamepad2, ArrowRight, 
  CheckCircle, BarChart3, Zap, Globe, Calendar,
  Clock, Star, Trophy, Settings
} from 'lucide-react';
import CardShell from '@/components/ui/CardShell';
import PageLayout from '@/components/layout/PageLayout';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  created_at: string;
  due_date?: string;
}

interface UserRole {
  role: string;
  created_at: string;
}

export default async function UniversalDashboardPage() {
  const supabase = getServerSupabaseAnon();
  
  if (!supabase) {
    console.error('[UDASH] Supabase not configured');
    redirect('/auth2/sign-in?error=configuration');
  }

  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.log('[UDASH] No authenticated user found, redirecting to sign-in');
    redirect('/auth2/sign-in');
  }

  // Get user roles and tasks
  const admin = getServerSupabaseAdmin();
  if (!admin) {
    console.error('[UDASH] Admin client not available');
    redirect('/auth2/sign-in?error=configuration');
  }

  let roles: UserRole[] = [];
  let tasks: Task[] = [];

  try {
    // Get user roles
    const { data: roleData } = await admin
      .from('user_roles')
      .select('role, created_at')
      .eq('user_id', user.id);

    roles = roleData || [];

    // Get latest 10 tasks
    const { data: taskData } = await admin
      .from('tasks')
      .select('id, title, description, status, priority, created_at, due_date')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    tasks = taskData || [];
  } catch (error) {
    console.error('[UDASH] Error fetching user data:', error);
    // Continue with empty data rather than failing
  }

  const userRoles = roles.map(r => r.role.toLowerCase());
  const isFounder = userRoles.includes('founder');
  const isHeir = userRoles.includes('heir');
  const isVip = userRoles.includes('vip');
  const isParent = userRoles.includes('parent');

  // Role-based tiles
  const roleTiles = [
    {
      title: 'My Profile',
      description: 'Manage your account settings',
      icon: Users,
      href: '/udash/profile',
      color: 'from-blue-500 to-cyan-500',
      available: true
    },
    {
      title: 'AI Agents',
      description: 'Access your AI assistants',
      icon: Sparkles,
      href: '/udash/agents',
      color: 'from-purple-500 to-pink-500',
      available: true
    },
    {
      title: 'Analytics',
      description: 'View your performance metrics',
      icon: BarChart3,
      href: '/udash/analytics',
      color: 'from-green-500 to-emerald-500',
      available: isVip || isFounder || isHeir
    },
    {
      title: 'Premium Features',
      description: 'Unlock advanced capabilities',
      icon: Star,
      href: '/udash/premium',
      color: 'from-yellow-500 to-orange-500',
      available: isVip || isFounder || isHeir
    },
    {
      title: 'Founder Tools',
      description: 'Exclusive founder resources',
      icon: Trophy,
      href: '/udash/founder',
      color: 'from-red-500 to-rose-500',
      available: isFounder
    },
    {
      title: 'Settings',
      description: 'Configure your preferences',
      icon: Settings,
      href: '/udash/settings',
      color: 'from-gray-500 to-slate-500',
      available: true
    }
  ].filter(tile => tile.available);

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-gray-300">
              Your universal dashboard for all SKRBL AI features
            </p>
          </div>

          {/* Role Tiles Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roleTiles.map((tile, index) => (
                <CardShell key={index} className="group hover:scale-105 transition-transform duration-200">
                  <a href={tile.href} className="block p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tile.color} flex items-center justify-center mb-4`}>
                      <tile.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{tile.title}</h3>
                    <p className="text-gray-300 text-sm">{tile.description}</p>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors mt-4" />
                  </a>
                </CardShell>
              ))}
            </div>
          </div>

          {/* My Tasks Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">My Tasks</h2>
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <CardShell key={task.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-1">{task.title}</h3>
                        {task.description && (
                          <p className="text-gray-300 text-sm mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {task.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <Clock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardShell>
                ))}
              </div>
            ) : (
              <CardShell className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No tasks yet</h3>
                <p className="text-gray-300">Your tasks will appear here once you start using SKRBL AI features.</p>
              </CardShell>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardShell className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Active Tasks</p>
                  <p className="text-2xl font-bold text-white">{tasks.filter(t => t.status !== 'completed').length}</p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
            </CardShell>
            
            <CardShell className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{tasks.filter(t => t.status === 'completed').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardShell>
            
            <CardShell className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Your Role</p>
                  <p className="text-2xl font-bold text-white capitalize">
                    {isFounder ? 'Founder' : isHeir ? 'Heir' : isVip ? 'VIP' : isParent ? 'Parent' : 'User'}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardShell>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
