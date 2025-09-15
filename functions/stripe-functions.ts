// Mock Backend Functions for Stripe Integration
// These are frontend mock implementations for development

// Mock Stripe types and functions
type MockStripe = {
  checkout: {
    sessions: {
      create: (params: any) => Promise<{ id: string; url: string }>;
      retrieve: (id: string, options?: any) => Promise<any>;
    };
  };
  customers: {
    list: (params: any) => Promise<{ data: any[] }>;
    create: (params: any) => Promise<{ id: string; email: string }>;
  };
  prices: {
    list: (params: any) => Promise<{ data: any[] }>;
    create: (params: any) => Promise<{ id: string }>;
  };
  products: {
    create: (params: any) => Promise<{ id: string }>;
  };
  subscriptions: {
    retrieve: (id: string) => Promise<any>;
  };
  webhooks: {
    constructEvent: (body: string, signature: string, secret: string) => any;
  };
};

// Mock Stripe implementation
const stripe: MockStripe = {
  checkout: {
    sessions: {
      create: async (params) => ({
        id: `cs_mock_${Date.now()}`,
        url: `https://checkout.stripe.com/pay/cs_mock_${Date.now()}`
      }),
      retrieve: async (id) => ({
        id,
        payment_status: 'paid',
        metadata: { userId: 'mock-user', type: 'credit_purchase', credits: '10', bonus: '0' },
        amount_total: 10000,
        created: Math.floor(Date.now() / 1000),
        subscription: 'sub_mock_123'
      })
    }
  },
  customers: {
    list: async () => ({ data: [] }),
    create: async (params) => ({ id: `cus_mock_${Date.now()}`, email: params.email })
  },
  prices: {
    list: async () => ({ data: [] }),
    create: async () => ({ id: `price_mock_${Date.now()}` })
  },
  products: {
    create: async () => ({ id: `prod_mock_${Date.now()}` })
  },
  subscriptions: {
    retrieve: async (id) => ({
      id,
      customer: 'cus_mock_123',
      status: 'trialing',
      trial_end: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60),
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      created: Math.floor(Date.now() / 1000),
      items: {
        data: [{ price: { unit_amount: 2999 } }]
      }
    })
  },
  webhooks: {
    constructEvent: (body, signature, secret) => ({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_mock_123' } }
    })
  }
};

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
export async function createCreditCheckout(request: {
  packageId: string;
  packageName: string;
  credits: number;
  bonus: number;
  price: number;
  userId: string;
  userEmail: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  try {
    const { packageId, userId, userEmail, returnUrl, cancelUrl } = request;
    
    // Validate package
    const packageData = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];
    if (!packageData) {
      throw new Error('Invalid package ID');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: packageData.name,
              description: `${packageData.credits} support tickets${packageData.bonus ? ` + ${packageData.bonus} bonus tickets` : ''}`,
              images: ['https://your-app-domain.com/ticket-icon.png'],
            },
            unit_amount: packageData.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        type: 'credit_purchase',
        userId,
        packageId,
        credits: packageData.credits.toString(),
        bonus: packageData.bonus.toString(),
      },
    });

    return {
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('Create credit checkout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create Stripe Checkout Session for Subscription Purchases
 */
export async function createSubscriptionCheckout(request: {
  plan: 'individual' | 'business';
  billingCycle: 'monthly' | 'yearly';
  userId: string;
  userEmail: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  try {
    const { plan, billingCycle, userId, userEmail, returnUrl, cancelUrl } = request;
    
    // Get plan key
    const planKey = `${plan}_${billingCycle}` as keyof typeof SUBSCRIPTION_PLANS;
    const planData = SUBSCRIPTION_PLANS[planKey];
    
    if (!planData) {
      throw new Error('Invalid subscription plan');
    }

    // Create or retrieve customer
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: { userId },
        });
      }
    } catch (error) {
      console.error('Customer creation error:', error);
      throw new Error('Failed to create customer');
    }

    // Create product and price if they don't exist
    let price;
    try {
      // Try to find existing price
      const prices = await stripe.prices.list({
        lookup_keys: [planKey],
        limit: 1,
      });
      
      if (prices.data.length > 0) {
        price = prices.data[0];
      } else {
        // Create product
        const product = await stripe.products.create({
          name: planData.name,
          description: planData.features.join(', '),
        });
        
        // Create price
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: planData.price,
          currency: 'usd',
          recurring: {
            interval: planData.interval as 'month' | 'year',
          },
          lookup_key: planKey,
        });
      }
    } catch (error) {
      console.error('Price creation error:', error);
      throw new Error('Failed to create subscription price');
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
        metadata: {
          userId,
          plan,
          billingCycle,
        },
      },
      metadata: {
        type: 'subscription',
        userId,
        plan,
        billingCycle,
      },
    });

    return {
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('Create subscription checkout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify Purchase and Return Details
 */
export async function verifyPurchase(request: {
  sessionId: string;
  userId: string;
}) {
  try {
    const { sessionId, userId } = request;
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Verify the session belongs to the user
    if (session.metadata?.userId !== userId) {
      throw new Error('Session does not belong to user');
    }
    
    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }
    
    const purchaseType = session.metadata?.type;
    
    if (purchaseType === 'credit_purchase') {
      // Handle credit purchase
      const credits = parseInt(session.metadata?.credits || '0');
      const bonus = parseInt(session.metadata?.bonus || '0');
      const totalCredits = credits + bonus;
      const packageId = session.metadata?.packageId;
      const packageData = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];
      
      return {
        success: true,
        purchaseDetails: {
          sessionId,
          packageName: packageData?.name || 'Unknown Package',
          credits,
          bonus,
          totalCredits,
          amount: (session.amount_total || 0) / 100, // Convert from cents
          purchaseDate: new Date(session.created * 1000).toLocaleDateString(),
        },
      };
    } else if (purchaseType === 'subscription') {
      // Handle subscription purchase
      const plan = session.metadata?.plan;
      const billingCycle = session.metadata?.billingCycle;
      
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      return {
        success: true,
        subscriptionDetails: {
          sessionId,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          plan,
          billingCycle,
          status: subscription.status === 'trialing' ? 'trial' : 'active',
          trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : undefined,
          nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
          amount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
          createdAt: new Date(subscription.created * 1000).toISOString(),
        },
      };
    } else {
      throw new Error('Unknown purchase type');
    }
  } catch (error) {
    console.error('Verify purchase error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle Stripe Webhooks
 */
export async function handleStripeWebhook(request: {
  body: string;
  signature: string;
}) {
  try {
    const { body, signature } = request;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    
    console.log('Webhook event:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any;
        console.log('Checkout session completed:', session.id);
        
        // Handle successful payment
        if (session.metadata?.type === 'credit_purchase') {
          // Update user's credit balance in database
          await updateUserCredits(
            session.metadata.userId,
            parseInt(session.metadata.credits) + parseInt(session.metadata.bonus || '0')
          );
        } else if (session.metadata?.type === 'subscription') {
          // Update user's subscription status in database
          await updateUserSubscription(session.metadata.userId, {
            subscriptionId: session.subscription as string,
            customerId: session.customer as string,
            plan: session.metadata.plan,
            billingCycle: session.metadata.billingCycle,
            status: 'trial', // Will be updated when trial ends
          });
        }
        break;
        
      case 'customer.subscription.updated':
        const subscription = event.data.object as any;
        console.log('Subscription updated:', subscription.id);
        
        // Update subscription status in database
        await updateSubscriptionStatus(subscription.id, {
          status: subscription.status === 'trialing' ? 'trial' : 
                 subscription.status === 'active' ? 'active' : 'inactive',
          nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
        });
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as any;
        console.log('Subscription cancelled:', deletedSubscription.id);
        
        // Mark subscription as cancelled in database
        await updateSubscriptionStatus(deletedSubscription.id, {
          status: 'inactive',
        });
        break;
        
      case 'invoice.payment_failed':
        const invoice = event.data.object as any;
        console.log('Payment failed for subscription:', invoice.subscription);
        
        // Handle failed payment (send notification, etc.)
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Database helper functions (implement based on your database choice)
async function updateUserCredits(userId: string, credits: number) {
  if (!userId?.trim() || credits < 0) return;
  console.log(`Adding ${credits} credits to user ${userId}`);
}

async function updateUserSubscription(userId: string, subscriptionData: any) {
  if (!userId?.trim() || !subscriptionData) return;
  console.log(`Updating subscription for user ${userId}:`, subscriptionData);
}

async function updateSubscriptionStatus(subscriptionId: string, statusData: any) {
  if (!subscriptionId?.trim() || !statusData) return;
  console.log(`Updating subscription ${subscriptionId}:`, statusData);
}

// Export functions for deployment
export const functions = {
  createCreditCheckout,
  createSubscriptionCheckout,
  verifyPurchase,
  handleStripeWebhook,
};