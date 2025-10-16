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
          description: 'Disallow module-scope Supabase client creation in app/** and components/**',
          category: 'Best Practices',
        },
        messages: {
          noModuleScopeSupabase: 
            'CRITICAL: Do NOT create Supabase clients at module scope. This causes build-time env explosion. Move client creation inside functions, useEffect, or request handlers.'
        },
        schema: []
      },
      create(context) {
        const filename = context.getFilename();
        // Only check app/** and components/** files, skip lib/supabase/**
        const shouldCheck = (filename.includes('/app/') || filename.includes('\\app\\') || 
                           filename.includes('/components/') || filename.includes('\\components\\')) &&
                           !(filename.includes('/lib/supabase/') || filename.includes('\\lib\\supabase\\'));
        
        if (!shouldCheck) {
          return {};
        }

        return {
          VariableDeclarator(node) {
            // Check if it's a top-level variable declaration calling Supabase functions
            if (node.init && 
                node.init.type === 'CallExpression' &&
                node.init.callee &&
                node.init.callee.type === 'Identifier') {
              const callName = node.init.callee.name;
              if (callName === 'getBrowserSupabase' || 
                  callName === 'getServerSupabaseAdmin' || 
                  callName === 'getServerSupabaseAnon' ||
                  callName === 'createClient') {
                // Check if this is at module scope (not inside a function)
                let scope = context.getScope();
                while (scope.upper) {
                  scope = scope.upper;
                }
                if (scope.type === 'module' || scope.type === 'global') {
                  context.report({
                    node,
                    messageId: 'noModuleScopeSupabase'
                  });
                }
              }
            }
          }
        };
      }
    }
  }
};
