'use client';

export default function DebugEnvPage() {
  // Log ALL environment variables to console
  console.log('=== ALL PROCESS.ENV ===');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  console.log('======================');

  const envVars = {
    'Supabase URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'Supabase Anon Key': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing',
    'Stripe Publishable': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Present' : '❌ Missing',
    'Google Analytics': process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    'Enable Stripe': process.env.NEXT_PUBLIC_ENABLE_STRIPE,
    'Base URL': process.env.NEXT_PUBLIC_BASE_URL,
    'NODE_ENV': process.env.NODE_ENV,
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔍 Environment Debug</h1>
        
        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span className="text-gray-300 font-medium">{key}:</span>
              <span className="text-cyan-400 font-mono text-sm">{value || '❌ Not Set'}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Test Supabase Client</h2>
          <button
            onClick={async () => {
              try {
                const { getBrowserSupabase } = await import('@/lib/supabase');
                const supabase = getBrowserSupabase();
                
                if (!supabase) {
                  alert('❌ Supabase client is NULL');
                  return;
                }
                
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                  alert(`❌ Error: ${error.message}`);
                } else {
                  alert('✅ Supabase is working! Session: ' + (data.session ? 'Active' : 'None'));
                }
              } catch (err: any) {
                alert(`❌ Exception: ${err.message}`);
              }
            }}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Test Supabase Connection
          </button>
        </div>

        <div className="mt-4 text-center">
          <a href="/sign-in" className="text-cyan-400 hover:text-cyan-300">
            → Go to Sign In Page
          </a>
        </div>
      </div>
    </div>
  );
}
