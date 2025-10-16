// ESLint custom rule to block direct Stripe instantiation outside lib/stripe/**
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
    }
  }
};
