// Lightweight role system for basic RBAC routing after auth callback.
// Note: lib/founders/roles.ts provides comprehensive founder role checks (creator/heir/founder + VIP).
// This file is kept simple for auth flow routing; complex role logic should use lib/founders/roles.ts.

export type AppRole = 'founder' | 'heir' | 'vip' | 'parent' | 'user';

export function routeForRole(role: AppRole): string {
  switch (role) {
    case 'founder': return '/dashboard/founder';
    case 'heir':    return '/dashboard/heir';
    case 'vip':     return '/dashboard/vip';
    case 'parent':  return '/dashboard/parent';
    default:        return '/dashboard';
  }
}

export async function getUserAndRole(supabase: any): Promise<{ user?: any | null; role: AppRole }> {
  if (!supabase) return { user: null, role: 'user' };
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, role: 'user' };

    const { data: roleRows } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id);

    const roles: string[] = (roleRows || []).map((r: any) => r.role?.toLowerCase?.() || '');
    // Priority order: founder > heir > vip > parent > user
    const priority: AppRole[] = ['founder', 'heir', 'vip', 'parent', 'user'];
    const found = priority.find(r => roles.includes(r)) || 'user';
    
    return { user, role: found };
  } catch (error) {
    console.error('Error getting user and role:', error);
    return { user: null, role: 'user' };
  }
}