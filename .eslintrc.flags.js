/**
 * ESLint rule to prevent direct process.env usage for feature flags
 * This ensures all flag access goes through the centralized helpers
 */

module.exports = {
  rules: {
    'no-direct-process-env-flags': {
      create(context) {
        return {
          MemberExpression(node) {
            // Check for process.env.FLAG_NAME patterns
            if (
              node.object &&
              node.object.type === 'MemberExpression' &&
              node.object.object &&
              node.object.object.name === 'process' &&
              node.object.property &&
              node.object.property.name === 'env' &&
              node.property &&
              node.property.type === 'Literal' &&
              typeof node.property.value === 'string'
            ) {
              const flagName = node.property.value;
              
              // Check if it's a known feature flag
              const knownFlags = [
                'NEXT_PUBLIC_ENABLE_STRIPE',
                'NEXT_PUBLIC_HP_GUIDE_STAR',
                'NEXT_PUBLIC_ENABLE_ORBIT',
                'NEXT_PUBLIC_ENABLE_BUNDLES',
                'NEXT_PUBLIC_FF_STRIPE_FALLBACK_LINKS',
                'NEXT_PUBLIC_SHOW_PERCY_WIDGET',
                'FF_N8N_NOOP',
                // Add more flags as needed
              ];
              
              if (knownFlags.includes(flagName)) {
                context.report({
                  node,
                  message: `Direct process.env access for flag "${flagName}" is not allowed. Use readBooleanFlag('${flagName}') or readClientFlag('${flagName}') instead.`,
                });
              }
            }
          },
        };
      },
    },
  },
};