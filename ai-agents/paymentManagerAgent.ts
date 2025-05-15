import { supabase } from '@/utils/supabase';
import type { Agent, AgentInput as BaseAgentInput, AgentFunction, AgentResponse } from '@/types/agent';

// Define input interface for Payment Manager Agent
interface PaymentAgentInput extends Omit<BaseAgentInput, 'goal'> {
  userId: string;
  projectId?: string;
  paymentType: 'subscription' | 'one_time' | 'invoice' | 'refund';
  amount: number;
  currency?: string;
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'paypal' | 'crypto' | 'other';
  paymentDetails?: {
    cardNumber?: string;
    cardExpiry?: string;
    cardCVC?: string;
    accountNumber?: string;
    routingNumber?: string;
    paypalEmail?: string;
    cryptoAddress?: string;
    [key: string]: any;
  };
  billingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  invoiceId?: string;
  subscriptionId?: string;
  customInstructions?: string;
}

// Define ReceiptItem interface
interface ReceiptItem {
  description: string;
  amount: number;
  currency: string;
}

// Define stubs for missing functions
async function updateUserSubscription(userId: string, amount: number): Promise<void> {
  // Stub implementation
  console.log(`Updating user subscription for userId: ${userId} with amount: ${amount}`);
}

function getNextBillingDate(): string {
  // Stub implementation - Next billing date 30 days from now
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Generate payment receipt
 * @param paymentType - Type of payment
 * @param amount - Payment amount
 * @param params - Payment parameters
 * @param paymentResult - Payment processing result
 * @returns Generated receipt
 */
function generateReceipt(
  paymentType: string,
  amount: number,
  params: any,
  paymentResult: any
): any {
  // Generate a basic receipt structure

  const receiptId = `rcpt_${Date.now()}`;
  const issueDate = new Date().toISOString();

  const receipt: any = {
    receiptId,
    transactionId: paymentResult.transactionId,
    issueDate,
    paymentType,
    paymentMethod: params.paymentMethod,
    amount,
    currency: params.currency,
    status: paymentResult.status,
    items: [] as ReceiptItem[], // Ensure items is typed as ReceiptItem[]
  };

  // Add receipt items based on payment type
  switch (paymentType) {
    case 'subscription': {
      const items: ReceiptItem[] = [
        {
          description: 'Monthly Subscription',
          amount,
          currency: params.currency,
        },
      ];
      receipt.items = items;
      receipt.subscriptionId = paymentResult.subscriptionId;
      receipt.nextBillingDate = paymentResult.nextBillingDate;
      break;
    }
    case 'invoice': {
      const items: ReceiptItem[] = [
        {
          description: `Invoice #${params.invoiceId || paymentResult.invoiceId}`,
          amount,
          currency: params.currency,
        },
      ];
      receipt.items = items;
      receipt.invoiceId = params.invoiceId || paymentResult.invoiceId;
      break;
    }
    case 'refund': {
      const items: ReceiptItem[] = [
        {
          description: 'Refund',
          amount,
          currency: params.currency,
        },
      ];
      receipt.items = items;
      receipt.refundId = paymentResult.refundId;
      receipt.originalTransactionId = paymentResult.originalTransactionId;
      break;
    }
    case 'one_time':
    default: {
      const items: ReceiptItem[] = [
        {
          description: 'One-time Payment',
          amount,
          currency: params.currency,
        },
      ];
      receipt.items = items;
    }
  }

  // Add billing address if available
  if (params.billingAddress) {
    receipt.billingAddress = params.billingAddress;
  }

  return receipt;
}

/**
 * Payment Manager Agent - Handles payment processing and management
 * @param input - Payment processing parameters
 * @returns Promise with success status, message and optional data
 */
const runPaymentAgent = async (input: PaymentAgentInput): Promise<AgentResponse> => {
  try {
    // Validate input
    if (!input.userId || !input.paymentType || !input.amount) {
      throw new Error('Missing required fields: userId, paymentType, and amount');
    }

    // Set defaults for optional parameters
    const paymentParams = {
      currency: input.currency || 'USD',
      paymentMethod: input.paymentMethod || 'credit_card',
      paymentDetails: input.paymentDetails || {},
      billingAddress: input.billingAddress,
      invoiceId: input.invoiceId,
      subscriptionId: input.subscriptionId,
      customInstructions: input.customInstructions || '',
    };

    // Validate payment details based on payment method
    validatePaymentDetails(paymentParams.paymentMethod, paymentParams.paymentDetails);

    // Process payment based on type
    const paymentResult = await processPayment(
      input.paymentType,
      input.amount,
      paymentParams
    );

    // Generate receipt
    const receipt = generateReceipt(
      input.paymentType,
      input.amount,
      paymentParams,
      paymentResult
    );

    // Log the payment processing to Supabase
    const { error: logError } = await supabase
      .from('agent-logs')
      .insert({
        agent: 'paymentManagerAgent',
        input: {
          userId: input.userId,
          paymentType: input.paymentType,
          amount: input.amount,
          currency: paymentParams.currency,
          paymentMethod: paymentParams.paymentMethod,
        },
        timestamp: new Date().toISOString(),
      });
    if (logError) throw logError;

    // Save the payment record to Supabase
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        userId: input.userId,
        projectId: input.projectId || 'general',
        paymentType: input.paymentType,
        amount: input.amount,
        currency: paymentParams.currency,
        paymentMethod: paymentParams.paymentMethod,
        billingAddress: paymentParams.billingAddress,
        invoiceId: paymentParams.invoiceId,
        subscriptionId: paymentParams.subscriptionId,
        paymentResult,
        receipt,
        status: paymentResult.status,
        createdAt: new Date().toISOString(),
      })
      .select();
    if (paymentError) throw paymentError;

    // Update user account if needed
    if (input.paymentType === 'subscription') {
      await updateUserSubscription(input.userId, input.amount);
    }

    return {
      success: true,
      message: `Payment ${paymentResult.status} for ${paymentParams.currency} ${input.amount}`,
      data: {
        paymentId: paymentData[0].id,
        transactionId: paymentResult.transactionId,
        status: paymentResult.status,
        receipt
      }
    };
  } catch (error) {
    console.error('Payment manager agent failed:', error);
    return {
      success: false,
      message: `Payment manager agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      agentName: 'paymentManager',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Validate payment details based on payment method
 * @param paymentMethod - Method of payment
 * @param paymentDetails - Payment details
 */
function validatePaymentDetails(paymentMethod: string, paymentDetails: any): void {
  switch (paymentMethod) {
    case 'credit_card':
      if (
        !paymentDetails.cardNumber ||
        !paymentDetails.cardExpiry ||
        !paymentDetails.cardCVC
      ) {
        throw new Error(
          'Missing required credit card details: cardNumber, cardExpiry, and cardCVC'
        );
      }
      // Validate card number format, expiry date, etc.
      break;
    case 'bank_transfer':
      if (!paymentDetails.accountNumber || !paymentDetails.routingNumber) {
        throw new Error(
          'Missing required bank transfer details: accountNumber and routingNumber'
        );
      }
      break;
    case 'paypal':
      if (!paymentDetails.paypalEmail) {
        throw new Error('Missing required PayPal details: paypalEmail');
      }
      break;
    case 'crypto':
      if (!paymentDetails.cryptoAddress) {
        throw new Error('Missing required crypto details: cryptoAddress');
      }
      break;
    // For 'other' payment methods, we don't enforce specific validations
  }
}

/**
 * Process payment based on payment type
 * @param paymentType - Type of payment
 * @param amount - Payment amount
 * @param params - Payment parameters
 * @param userAccount - User account information
 * @returns Payment processing result
 */
async function processPayment(
  paymentType: string,
  amount: number,
  params: any
): Promise<any> {
  // Simulate payment processing

  // Generate a unique transaction ID
  const transactionId = `txn_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 10)}`;

  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Determine payment status (success rate of 95%)
  const isSuccessful = Math.random() < 0.95;

  if (!isSuccessful) {
    return {
      transactionId,
      status: 'failed',
      errorCode: 'payment_declined',
      errorMessage:
        'The payment was declined. Please check your payment details and try again.',
      timestamp: new Date().toISOString(),
    };
  }

  // Process based on payment type
  switch (paymentType) {
    case 'subscription':
      return {
        transactionId,
        status: 'completed',
        subscriptionId: params.subscriptionId || `sub_${Date.now()}`,
        nextBillingDate: getNextBillingDate(),
        timestamp: new Date().toISOString(),
      };
    case 'invoice':
      return {
        transactionId,
        status: 'completed',
        invoiceId: params.invoiceId || `inv_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
    case 'refund':
      return {
        transactionId,
        status: 'completed',
        refundId: `ref_${Date.now()}`,
        originalTransactionId: params.originalTransactionId,
        timestamp: new Date().toISOString(),
      };
    case 'one_time':
    default:
      return {
        transactionId,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };
  }
}

const paymentManagerAgent: Agent = {
  id: 'payment-manager-agent',
  name: 'Payment Manager',
  category: 'Finance',
  description: 'Handles payment processing and management',
  visible: true,
  agentCategory: ['finance', 'payments'],
  config: {
    name: 'Payment Manager',
    description: 'Handles payment processing and management',
    capabilities: ['Payment Processing', 'Subscription Management', 'Receipt Generation', 'Payment Validation']
  },
  runAgent: async (input: BaseAgentInput) => {
    // Cast the base input to payment agent input
    const paymentInput: PaymentAgentInput = {
      ...input,
      paymentType: (input as any).paymentType || 'one_time',
      amount: (input as any).amount || 0,
      currency: (input as any).currency || 'USD',
      paymentMethod: (input as any).paymentMethod,
      paymentDetails: (input as any).paymentDetails,
      billingAddress: (input as any).billingAddress,
      invoiceId: (input as any).invoiceId,
      subscriptionId: (input as any).subscriptionId
    };
    return runPaymentAgent(paymentInput);
  }
};

export { paymentManagerAgent };
export default paymentManagerAgent;