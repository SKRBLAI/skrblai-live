import { db } from '@/utils/firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

// Define input interface for Payment Manager Agent
interface AgentInput {
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

// Define response interface
interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Payment Manager Agent - Handles payment processing and management
 * @param input - Payment processing parameters
 * @returns Promise with success status, message and optional data
 */
export async function runAgent(input: AgentInput): Promise<AgentResponse> {
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
      customInstructions: input.customInstructions || ''
    };

    // Validate payment details based on payment method
    validatePaymentDetails(paymentParams.paymentMethod, paymentParams.paymentDetails);

    // Check user account if needed
    const userAccount = await getUserAccount(input.userId);

    // Process payment based on type
    const paymentResult = await processPayment(
      input.paymentType,
      input.amount,
      paymentParams,
      userAccount
    );

    // Generate receipt
    const receipt = generateReceipt(
      input.paymentType,
      input.amount,
      paymentParams,
      paymentResult
    );

    // Log the payment processing to Firestore
    await addDoc(collection(db, 'agent-logs'), {
      agent: 'paymentManagerAgent',
      input: {
        userId: input.userId,
        paymentType: input.paymentType,
        amount: input.amount,
        currency: paymentParams.currency,
        paymentMethod: paymentParams.paymentMethod
      },
      timestamp: new Date().toISOString()
    });

    // Save the payment record to Firestore
    const paymentRef = await addDoc(collection(db, 'payments'), {
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
      createdAt: new Date().toISOString()
    });

    // Update user account if needed
    if (input.paymentType === 'subscription') {
      await updateUserSubscription(input.userId, input.amount, paymentParams);
    }

    return {
      success: true,
      message: `Payment ${paymentResult.status} for ${paymentParams.currency} ${input.amount}`,
      data: {
        paymentId: paymentRef.id,
        transactionId: paymentResult.transactionId,
        status: paymentResult.status,
        receipt
      }
    };
  } catch (error) {
    console.error('Payment manager agent failed:', error);
    return {
      success: false,
      message: `Payment manager agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      if (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCVC) {
        throw new Error('Missing required credit card details: cardNumber, cardExpiry, and cardCVC');
      }
      // In a real implementation, we would validate the card number format, expiry date, etc.
      break;
    case 'bank_transfer':
      if (!paymentDetails.accountNumber || !paymentDetails.routingNumber) {
        throw new Error('Missing required bank transfer details: accountNumber and routingNumber');
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
 * Get user account information
 * @param userId - User identifier
 * @returns User account information
 */
async function getUserAccount(userId: string): Promise<any> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User account not found for userId: ${userId}`);
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Error fetching user account:', error);
    throw new Error(`Failed to retrieve user account: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  params: any,
  userAccount: any
): Promise<any> {
  // In a real implementation, this would integrate with a payment processor API
  // For now, we'll simulate payment processing
  
  // Generate a unique transaction ID
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Determine payment status (success rate of 95%)
  const isSuccessful = Math.random() < 0.95;
  
  if (!isSuccessful) {
    return {
      transactionId,
      status: 'failed',
      errorCode: 'payment_declined',
      errorMessage: 'The payment was declined. Please check your payment details and try again.',
      timestamp: new Date().toISOString()
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
        timestamp: new Date().toISOString()
      };
    case 'invoice':
      return {
        transactionId,
        status: 'completed',
        invoiceId: params.invoiceId || `inv_${Date.now()}`,
        paidAmount: amount,
        timestamp: new Date().toISOString()
      };
    case 'refund':
      return {
        transactionId,
        status: 'completed',
        refundId: `ref_${Date.now()}`,
        originalTransactionId: params.paymentDetails.originalTransactionId || 'unknown',
        refundedAmount: amount,
        timestamp: new Date().toISOString()
      };
    case 'one_time':
    default:
      return {
        transactionId,
        status: 'completed',
        paymentMethod: params.paymentMethod,
        paidAmount: amount,
        timestamp: new Date().toISOString()
      };
  }
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
  // In a real implementation, this would generate a formatted receipt
  // For now, we'll generate a basic receipt structure
  
  const receiptId = `rcpt_${Date.now()}`;
  const issueDate = new Date().toISOString();
  
  const receipt = {
    receiptId,
    transactionId: paymentResult.transactionId,
    issueDate,
    paymentType,
    paymentMethod: params.paymentMethod,
    amount,
    currency: params.currency,
    status: paymentResult.status,
    items: []
  };
  
  // Add receipt items based on payment type
  switch (paymentType) {
    case 'subscription':
      receipt.items = [
        {
          description: 'Monthly Subscription',
          amount,
          currency: params.currency
        }
      ];
      receipt.subscriptionId = paymentResult.subscriptionId;
      receipt.nextBillingDate = paymentResult.nextBillingDate;
      break;
    case 'invoice':
      receipt.items = [
        {
          description: `Invoice #${params.invoiceId || paymentResult.invoiceId}`,
          amount,
          currency: params.currency
        }
      ];
      receipt.invoiceId = params.invoiceId || paymentResult.invoiceId;
      break;
    case 'refund':
      receipt.items = [
        {
          description: 'Refund',
          amount,
          currency: params.currency
        }
      ];
      receipt.refundId = paymentResult.refundId;
      receipt.originalTransactionId = paymentResult.originalTransactionId;
      break;
    case 'one_time':
    default:
      receipt.items = [
        {
          description: 'One-time Payment',
          amount,
          currency: params.currency
        }
      ];
  }
  
  // Add billing address if available
  if (params.billingAddress) {
    receipt.billingAddress = params.billingAddress;
  }
  
  return receipt;
}

/**
 * Update user subscription information
 * @param userId - User identifier
 * @param amount - Subscription amount
 * @param params - Payment parameters
 */
async function updateUserSubscription(userId: string, amount: number, params: any): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // Get next billing date
    const nextBillingDate = getNextBillingDate();
    
    // Update user subscription information
    await updateDoc(userDocRef, {
      'subscription.active': true,
      'subscription.plan': 'premium', // This would be dynamic in a real implementation
      'subscription.amount': amount,
      'subscription.currency': params.currency,
      'subscription.paymentMethod': params.paymentMethod,
      'subscription.subscriptionId': params.subscriptionId || `sub_${Date.now()}`,
      'subscription.startDate': new Date().toISOString(),
      'subscription.nextBillingDate': nextBillingDate,
      'subscription.updatedAt': new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    // We don't throw here to avoid failing the payment process if subscription update fails
    // Instead, we log the error and would typically trigger a background job to retry
  }
}

/**
 * Get next billing date (1 month from now)
 * @returns Next billing date in ISO format
 */
function getNextBillingDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

export const paymentManagerAgent = {
  processPayment: async (paymentDetails: any) => {
    // Create a basic input with the payment details
    const input: AgentInput = {
      userId: paymentDetails.userId || 'system',
      paymentType: paymentDetails.paymentType || 'one_time',
      amount: paymentDetails.amount || 0,
      currency: paymentDetails.currency,
      paymentMethod: paymentDetails.paymentMethod,
      paymentDetails: paymentDetails.paymentDetails,
      billingAddress: paymentDetails.billingAddress
    };
    
    return runAgent(input);
  }
};