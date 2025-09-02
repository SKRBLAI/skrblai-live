export type AppRole = 'founder' | 'vip' | 'parent' | 'user';

export function routeForRole(role: AppRole): string {
  switch (role) {
    case 'founder': return '/dashboard/founders';
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
    const priority: AppRole[] = ['founder', 'vip', 'parent', 'user'];
    const found = priority.find(r => roles.includes(r)) || 'user';
    
    return { user, role: found };
  } catch (error) {
    console.error('Error getting user and role:', error);
    return { user: null, role: 'user' };
  }
}