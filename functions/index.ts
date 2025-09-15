// Mock Backend Functions for Stripe Integration
// These are frontend mock implementations for development

type Request = {
  method: string;
  body: any;
};

type Response = {
  status: (code: number) => Response;
  json: (data: any) => void;
};

// Mock database operations
const mockDb = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      set: async (data: any) => Promise.resolve(),
      update: async (data: any) => Promise.resolve(),
      get: async () => ({
        exists: true,
        data: () => ({
          userId: 'mock-user',
          status: 'pending',
          type: 'credit_purchase',
          packageId: 'starter',
          plan: 'individual',
          billingCycle: 'monthly',
          packageData: { credits: 10, bonus: 0, price: 10000, name: 'Starter Pack' },
          planData: { name: 'Individual Monthly', price: 2999, interval: 'month' }
        }),
        ref: {
          update: async (data: any) => Promise.resolve()
        }
      })
    }),
    add: async (data: any) => Promise.resolve({ id: 'mock-doc-id' })
  }),
  FieldValue: {
    increment: (value: number) => ({ _increment: value })
  }
};

// Mock logger
const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args)
};

// Mock onRequest function
function onRequest(options: any, handler: (req: Request, res: Response) => Promise<void>) {
  return handler;
}

// Credit Package Definitions
const CREDIT_PACKAGES = {
  starter: {
    name: 'Starter Pack',
    credits: 10,
    price: 10000, // $100.00 in cents
    bonus: 0,
  },
  professional: {
    name: 'Professional Pack', 
    credits: 30,
    price: 25000, // $250.00 in cents
    bonus: 5,
  },
  enterprise: {
    name: 'Enterprise Pack',
    credits: 65,
    price: 50000, // $500.00 in cents
    bonus: 15,
  },
  unlimited: {
    name: 'Premium Monthly',
    credits: 150,
    price: 100000, // $1000.00 in cents
    bonus: 0,
  },
};

// Subscription Plans
const SUBSCRIPTION_PLANS = {
  individual_monthly: {
    name: 'Individual Monthly',
    price: 2999, // $29.99
    interval: 'month',
    features: ['50 tickets/month', 'Email support', 'Basic security tools'],
  },
  individual_yearly: {
    name: 'Individual Yearly',
    price: 29999, // $299.99 (save $60)
    interval: 'year',
    features: ['50 tickets/month', 'Email support', 'Basic security tools', '2 months free'],
  },
  business_monthly: {
    name: 'Business Monthly',
    price: 9999, // $99.99
    interval: 'month',
    features: ['Unlimited tickets', 'Priority support', 'Advanced security tools', 'Team management'],
  },
  business_yearly: {
    name: 'Business Yearly',
    price: 99999, // $999.99 (save $200)
    interval: 'year',
    features: ['Unlimited tickets', 'Priority support', 'Advanced security tools', 'Team management', '2 months free'],
  },
};

/**
 * Create Stripe Checkout Session for Credit Purchases
 */
export const createCreditCheckout = onRequest(
  { cors: true },
  async (request: Request, response: Response) => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { packageId, userId, userEmail, returnUrl, cancelUrl } = request.body;
      
      // Validate required fields
      if (!packageId || !userId || !userEmail || !returnUrl || !cancelUrl) {
        response.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      // Validate package
      const packageData = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];
      if (!packageData) {
        response.status(400).json({ error: 'Invalid package ID' });
        return;
      }

      // For demo purposes, return a mock checkout URL
      // In production, you would integrate with actual Stripe API
      const mockSessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const checkoutUrl = `https://checkout.stripe.com/pay/${mockSessionId}`;

      // Store session data in mock database for later verification
      await mockDb.collection('checkout_sessions').doc(mockSessionId).set({
        type: 'credit_purchase',
        userId,
        packageId,
        packageData,
        userEmail,
        returnUrl,
        cancelUrl,
        status: 'pending',
        createdAt: new Date(),
      });

      logger.info('Credit checkout session created', { sessionId: mockSessionId, userId, packageId });

      response.json({
        success: true,
        checkoutUrl,
        sessionId: mockSessionId,
      });
    } catch (error) {
      logger.error('Create credit checkout error:', error);
      response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Create Stripe Checkout Session for Subscription Purchases
 */
export const createSubscriptionCheckout = onRequest(
  { cors: true },
  async (request: Request, response: Response) => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { plan, billingCycle, userId, userEmail, returnUrl, cancelUrl } = request.body;
      
      // Validate required fields
      if (!plan || !billingCycle || !userId || !userEmail || !returnUrl || !cancelUrl) {
        response.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      // Get plan key
      const planKey = `${plan}_${billingCycle}` as keyof typeof SUBSCRIPTION_PLANS;
      const planData = SUBSCRIPTION_PLANS[planKey];
      
      if (!planData) {
        response.status(400).json({ error: 'Invalid subscription plan' });
        return;
      }

      // For demo purposes, return a mock checkout URL
      const mockSessionId = `cs_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const checkoutUrl = `https://checkout.stripe.com/pay/${mockSessionId}`;

      // Store session data in mock database
      await mockDb.collection('checkout_sessions').doc(mockSessionId).set({
        type: 'subscription',
        userId,
        plan,
        billingCycle,
        planData,
        userEmail,
        returnUrl,
        cancelUrl,
        status: 'pending',
        createdAt: new Date(),
      });

      logger.info('Subscription checkout session created', { sessionId: mockSessionId, userId, plan, billingCycle });

      response.json({
        success: true,
        checkoutUrl,
        sessionId: mockSessionId,
      });
    } catch (error) {
      logger.error('Create subscription checkout error:', error);
      response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Verify Purchase and Return Details
 */
export const verifyPurchase = onRequest(
  { cors: true },
  async (request: Request, response: Response) => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { sessionId, userId } = request.body;
      
      if (!sessionId || !userId) {
        response.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      // Retrieve the checkout session from mock database
      const sessionDoc = await mockDb.collection('checkout_sessions').doc(sessionId).get();
      
      if (!sessionDoc.exists) {
        response.status(404).json({ error: 'Session not found' });
        return;
      }
      
      const sessionData = sessionDoc.data()!;
      
      // Verify the session belongs to the user
      if (sessionData.userId !== userId) {
        response.status(403).json({ error: 'Session does not belong to user' });
        return;
      }
      
      // For demo purposes, simulate successful payment
      // In production, you would verify with Stripe API
      
      if (sessionData.type === 'credit_purchase') {
        // Handle credit purchase
        const { packageData } = sessionData;
        const credits = packageData.credits;
        const bonus = packageData.bonus || 0;
        const totalCredits = credits + bonus;
        
        // Update user's credit balance in mock database
        const userDoc = mockDb.collection('users').doc(userId);
        await userDoc.update({
          'accountBalance.ticketBalance': mockDb.FieldValue.increment(totalCredits),
          'accountBalance.totalTickets': mockDb.FieldValue.increment(totalCredits),
          updatedAt: new Date(),
        });
        
        // Mark session as completed
        await sessionDoc.ref.update({
          status: 'completed',
          completedAt: new Date(),
        });
        
        // Create purchase record
        await mockDb.collection('purchases').add({
          userId,
          sessionId,
          type: 'credit_purchase',
          packageId: sessionData.packageId,
          credits,
          bonus,
          totalCredits,
          amount: packageData.price / 100,
          createdAt: new Date(),
        });
        
        logger.info('Credit purchase verified and processed', { sessionId, userId, totalCredits });
        
        response.json({
          success: true,
          purchaseDetails: {
            sessionId,
            packageName: packageData.name,
            credits,
            bonus,
            totalCredits,
            amount: packageData.price / 100,
            purchaseDate: new Date().toLocaleDateString(),
          },
        });
      } else if (sessionData.type === 'subscription') {
        // Handle subscription purchase
        const { plan, billingCycle, planData } = sessionData;
        
        // Create subscription record
        const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const customerId = `cus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial
        
        const nextBillingDate = new Date(trialEndDate);
        if (billingCycle === 'yearly') {
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        } else {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        }
        
        const subscriptionData = {
          subscriptionId,
          customerId,
          plan,
          billingCycle,
          status: 'trial',
          trialEndDate: trialEndDate.toISOString(),
          nextBillingDate: nextBillingDate.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Update user's subscription in mock database
        const userDoc = mockDb.collection('users').doc(userId);
        await userDoc.update({
          subscription: subscriptionData,
          updatedAt: new Date(),
        });
        
        // Mark session as completed
        await sessionDoc.ref.update({
          status: 'completed',
          completedAt: new Date(),
        });
        
        logger.info('Subscription verified and processed', { sessionId, userId, subscriptionId });
        
        response.json({
          success: true,
          subscriptionDetails: {
            sessionId,
            subscriptionId,
            customerId,
            plan,
            billingCycle,
            status: 'trial',
            trialEndDate: trialEndDate.toISOString(),
            nextBillingDate: nextBillingDate.toISOString(),
            amount: planData.price / 100,
            createdAt: new Date().toISOString(),
          },
        });
      } else {
        response.status(400).json({ error: 'Unknown purchase type' });
      }
    } catch (error) {
      logger.error('Verify purchase error:', error);
      response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * Handle Stripe Webhooks (for production use)
 */
export const stripeWebhook = onRequest(
  { cors: false },
  async (request: Request, response: Response) => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      // In production, verify webhook signature here
      const event = request.body;
      
      logger.info('Webhook received:', event.type);
      
      switch (event.type) {
        case 'checkout.session.completed':
          // Handle successful payment
          logger.info('Checkout session completed:', event.data.object.id);
          break;
          
        case 'customer.subscription.updated':
          // Handle subscription updates
          logger.info('Subscription updated:', event.data.object.id);
          break;
          
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          logger.info('Subscription cancelled:', event.data.object.id);
          break;
          
        case 'invoice.payment_failed':
          // Handle failed payments
          logger.info('Payment failed:', event.data.object.subscription);
          break;
          
        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }
      
      response.json({ received: true });
    } catch (error) {
      logger.error('Webhook error:', error);
      response.status(400).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);