#!/usr/bin/env tsx

/**
 * Smoke Test for Checkout API
 * 
 * Tests the /api/checkout endpoint with various SKUs to ensure
 * proper price resolution and mode handling.
 * 
 * ONLY runs in development environment to avoid production calls.
 */

const DEV_SERVER_URL = process.env.DEV_SERVER_URL || 'http://localhost:3000';

interface CheckoutRequest {
  sku: string;
  mode?: "subscription" | "payment" | "trial" | "contact";
  vertical: "sports" | "business";
  successPath?: string;
  cancelPath?: string;
}

interface CheckoutResponse {
  ok: boolean;
  url?: string;
  sessionId?: string;
  mode?: string;
  error?: string;
}

async function testCheckoutEndpoint(request: CheckoutRequest): Promise<void> {
  try {
    console.log(`\n🧪 Testing SKU: ${request.sku} (${request.vertical})`);
    
    const response = await fetch(`${DEV_SERVER_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data: CheckoutResponse = await response.json();
    
    if (response.ok && data.ok) {
      if (data.url?.startsWith('http')) {
        console.log(`✅ SUCCESS: Stripe checkout URL received`);
        console.log(`   URL: ${data.url.substring(0, 50)}...`);
      } else if (data.url?.startsWith('/') || data.url?.startsWith('#')) {
        console.log(`✅ SUCCESS: Internal redirect to ${data.url}`);
      } else {
        console.log(`✅ SUCCESS: Response received`);
        console.log(`   Data:`, data);
      }
    } else {
      console.log(`❌ FAILED: ${data.error || 'Unknown error'}`);
      if (data.error?.includes('Stripe Not Enabled') || data.error?.includes('ENV variable')) {
        console.log(`   ℹ️  This is expected if Stripe env vars are not configured`);
      }
    }
  } catch (error) {
    console.log(`💥 ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function runSmokeTests(): Promise<void> {
  // Ensure we're not in production
  if (process.env.NODE_ENV === 'production') {
    console.log('❌ Smoke tests are disabled in production environment');
    process.exit(1);
  }

  console.log('🚀 Starting Checkout API Smoke Tests');
  console.log(`📍 Target server: ${DEV_SERVER_URL}`);

  const testCases: CheckoutRequest[] = [
    // Sports plans
    {
      sku: "sports_trial_curiosity",
      mode: "trial",
      vertical: "sports",
      successPath: "/sports?status=success",
      cancelPath: "/sports?status=cancel"
    },
    {
      sku: "sports_plan_starter",
      mode: "subscription",
      vertical: "sports",
      successPath: "/sports?status=success",
      cancelPath: "/sports?status=cancel"
    },
    {
      sku: "sports_plan_pro",
      mode: "subscription",
      vertical: "sports",
      successPath: "/sports?status=success",
      cancelPath: "/sports?status=cancel"
    },
    {
      sku: "sports_plan_elite",
      mode: "subscription",
      vertical: "sports",
      successPath: "/sports?status=success",
      cancelPath: "/sports?status=cancel"
    },
    {
      sku: "sports_plan_contact",
      mode: "contact",
      vertical: "sports"
    },
    
    // Sports add-ons
    {
      sku: "sports_addon_video",
      mode: "payment",
      vertical: "sports",
      successPath: "/sports?status=success",
      cancelPath: "/sports?status=cancel"
    },
    {
      sku: "sports_addon_emotion",
      mode: "payment",
      vertical: "sports",
      successPath: "/sports?status=success",
      cancelPath: "/sports?status=cancel"
    },
    {
      sku: "sports_addon_nutrition",
      mode: "payment",
      vertical: "sports",
      successPath: "/sports?status=success",
      cancelPath: "/sports?status=cancel"
    },
    {
      sku: "sports_addon_foundation",
      mode: "payment",
      vertical: "sports",
      successPath: "/sports?status=success",
      cancelPath: "/sports?status=cancel"
    },
    
    // Business plans
    {
      sku: "biz_plan_curiosity",
      mode: "trial",
      vertical: "business",
      successPath: "/pricing?success=1",
      cancelPath: "/pricing?canceled=1"
    },
    {
      sku: "biz_plan_starter_m",
      mode: "subscription",
      vertical: "business",
      successPath: "/pricing?success=1",
      cancelPath: "/pricing?canceled=1"
    },
    {
      sku: "biz_plan_contact",
      mode: "contact",
      vertical: "business"
    },
    
    // Business add-ons
    {
      sku: "biz_addon_adv_analytics",
      mode: "payment",
      vertical: "business",
      successPath: "/pricing?success=1",
      cancelPath: "/pricing?canceled=1"
    }
  ];

  // Run all test cases
  for (const testCase of testCases) {
    await testCheckoutEndpoint(testCase);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🏁 Smoke tests completed');
  console.log('\nℹ️  Next steps:');
  console.log('   1. Check server logs for detailed checkout flow');
  console.log('   2. Verify Stripe Dashboard for test sessions (if env vars configured)');
  console.log('   3. Test actual checkout flows in browser');
}

// Run if called directly
if (require.main === module) {
  runSmokeTests().catch(console.error);
}

export { runSmokeTests, testCheckoutEndpoint };