/**
 * Test script for auth flow debugging
 * Run with: node scripts/test-auth-flow.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SKRBL AI Auth Flow Debug Test');
console.log('================================\n');

// Check for environment files
const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
console.log('📁 Checking for environment files:');
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${file}: ${exists ? '✅ Found' : '❌ Not found'}`);
});

console.log('\n🔧 Environment Variables Check:');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY'
];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '❌ Missing';
  const preview = value ? `(${value.substring(0, 20)}...)` : '';
  console.log(`  ${varName}: ${status} ${preview}`);
});

console.log('\n🌐 Testing API Endpoint Availability:');

// Simple endpoint test
async function testEndpoint() {
  try {
    // Check if we're in development
    if (process.env.NODE_ENV !== 'production') {
      const { spawn } = require('child_process');
      
      // Start a simple test
      console.log('  Dashboard Sign-in API: Testing local endpoint structure...');
      
      // Check if the auth files exist
      const authFiles = [
        'app/api/auth/dashboard-signin/route.ts',
        'lib/auth/dashboardAuth.ts',
        'hooks/useDashboardAuth.ts',
        'app/sign-in/page.tsx',
        'app/sign-up/page.tsx'
      ];
      
      console.log('\n📄 Auth Files Check:');
      authFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        const exists = fs.existsSync(filePath);
        console.log(`  ${file}: ${exists ? '✅ Exists' : '❌ Missing'}`);
      });
      
    }
  } catch (error) {
    console.error('  ❌ Error testing endpoint:', error.message);
  }
}

// Run tests
testEndpoint();

console.log('\n💡 Next Steps for Setup:');
console.log('1. Create a .env.local file with your Supabase credentials');
console.log('2. Add NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
console.log('3. Add NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
console.log('4. Add SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
console.log('5. Run: npm run dev');
console.log('6. Test auth flows at: http://localhost:3000/sign-in');

console.log('\n🔄 Auth Flow Test Routes:');
console.log('  Sign In: /sign-in');
console.log('  Sign Up: /sign-up');
console.log('  Dashboard: /dashboard');
console.log('  Percy Auth: /sign-in');
console.log('  API Endpoint: /api/auth/dashboard-signin'); 