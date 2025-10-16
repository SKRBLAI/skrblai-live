// ESLint custom rules for build-time safety
module.exports = {
  rules: {
    'no-direct-stripe-new': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow direct `new Stripe()` outside lib/stripe/**',
          category: 'Best Practices',
        },
        messages: {
          noDirectStripeNew: 
            'Direct `new Stripe()` is not allowed. Use requireStripe() or getOptionalStripe() from @/lib/stripe/stripe to ensure consistent API version.'
        },
        schema: []
      },
      create(context) {
        // Skip files in lib/stripe/**
        const filename = context.getFilename();
        if (filename.includes('/lib/stripe/') || filename.includes('\\lib\\stripe\\')) {
          return {};
        }

        return {
          NewExpression(node) {
            // Check if it's `new Stripe(...)`
            if (
              node.callee.type === 'Identifier' &&
              node.callee.name === 'Stripe'
            ) {
              context.report({
                node,
                messageId: 'noDirectStripeNew'
              });
            }
          }
        };
      }
    },
    'no-module-scope-supabase': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow calling Supabase factory functions at module scope in app/** (causes build-time crashes)',
          category: 'Best Practices',
        },
        messages: {
          noModuleScopeSupabase: 
            'Calling {{name}}() at module scope in app/** causes build-time crashes. Move the call inside a function, useEffect, or event handler. For pages, add: export const dynamic = \'force-dynamic\';'
        },
        schema: []
      },
      create(context) {
        const filename = context.getFilename();
        
        // Only check files in app/** directory
        if (!filename.includes('/app/') && !filename.includes('\\app\\')) {
          return {};
        }
        
        // Skip lib/supabase/** files
        if (filename.includes('/lib/supabase/') || filename.includes('\\lib\\supabase\\')) {
          return {};
        }

        const supabaseFunctions = [
          'getBrowserSupabase',
          'getServerSupabaseAdmin',
          'getServerSupabaseAnon',
          'createBrowserSupabaseClient',
          'createServerSupabaseClient',
          'getOptionalServerSupabase'
        ];

        let scopeDepth = 0;

        return {
          // Track function/method entry
          ':function'() {
            scopeDepth++;
          },
          ':function:exit'() {
            scopeDepth--;
          },
          
          CallExpression(node) {
            // Only flag calls at module scope (scopeDepth === 0)
            if (scopeDepth > 0) return;

            const calleeName = node.callee.type === 'Identifier' 
              ? node.callee.name 
              : null;

            if (calleeName && supabaseFunctions.includes(calleeName)) {
              context.report({
                node,
                messageId: 'noModuleScopeSupabase',
                data: { name: calleeName }
              });
            }
          }
        };
      }
    }
  }
};
