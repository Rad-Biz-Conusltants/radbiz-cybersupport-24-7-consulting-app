// Firebase Best Practices for RadBiz Support App
// This file documents the recommended Firebase/Firestore structure and provides mock functions

/**
 * FIREBASE BEST PRACTICES FOR RADBIZ SUPPORT APP
 * 
 * 1. COLLECTION STRUCTURE:
 * 
 * Primary Collections:
 * - users/{userId} - Main user document (for easy access across user types)
 * - individual_users/{userId} - Individual plan users
 * - business_users/{userId} - Business plan users
 * - subscriptions/{userId} - User subscription data
 * - tickets/{ticketId} - Support tickets
 * - user_activities/{activityId} - User activity logs
 * - purchases/{purchaseId} - Purchase records
 * - checkout_sessions/{sessionId} - Stripe checkout sessions
 * 
 * 2. USER DOCUMENT STRUCTURE:
 * 
 * users/{userId}:
 * {
 *   id: string,
 *   email: string,
 *   name: string,
 *   planType: 'individual' | 'business',
 *   company?: string,
 *   userType: 'client' | 'tech',
 *   createdAt: string,
 *   updatedAt: string,
 *   accountBalance: {
 *     ticketBalance: number,
 *     totalTickets: number
 *   },
 *   subscription?: {
 *     plan: 'individual' | 'business',
 *     billingCycle: 'monthly' | 'yearly',
 *     status: 'active' | 'trial' | 'expired',
 *     trialEndDate?: string,
 *     nextBillingDate: string
 *   }
 * }
 * 
 * 3. COLLECTION STRATEGY:
 * 
 * Individual Users: Store in both 'users' and 'individual_users' collections
 * Business Users: Store in both 'users' and 'business_users' collections
 * 
 * This dual storage approach allows for:
 * - Easy querying across all users via 'users' collection
 * - Plan-specific queries via type-specific collections
 * - Better security rules and access control
 * 
 * 4. SECURITY RULES:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Users can read/write their own data
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *     
 *     // Business users can read their team members
 *     match /business_users/{userId} {
 *       allow read: if request.auth != null && 
 *         (request.auth.uid == userId || 
 *          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.company == 
 *          get(/databases/$(database)/documents/users/$(userId)).data.company);
 *       allow write: if request.auth != null && request.auth.uid == userId;
 *     }
 *     
 *     // Tickets can be read by owner or business team members
 *     match /tickets/{ticketId} {
 *       allow read, write: if request.auth != null && 
 *         (resource.data.userId == request.auth.uid ||
 *          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.company == 
 *          get(/databases/$(database)/documents/users/$(resource.data.userId)).data.company);
 *     }
 *   }
 * }
 * 
 * 5. INDEXING STRATEGY:
 * 
 * Create composite indexes for:
 * - tickets: (userId, status, createdAt)
 * - tickets: (company, status, createdAt) 
 * - user_activities: (userId, timestamp)
 * - purchases: (userId, createdAt)
 * 
 * 6. DATA CONSISTENCY:
 * 
 * Use Firestore transactions for operations that affect multiple documents:
 * - Creating tickets (update user balance + create ticket)
 * - Processing purchases (update balance + create purchase record)
 * - User creation by admin (create user + log activity)
 */

// Mock implementations for development
// In production, these would be Firebase Cloud Functions

export interface CreditPackage {
  name: string;
  credits: number;
  price: number; // in cents
  bonus: number;
}

export interface SubscriptionPlan {
  name: string;
  price: number; // in cents
  interval: 'month' | 'year';
  features: string[];
}

export const CREDIT_PACKAGES: Record<string, CreditPackage> = {
  starter: {
    name: 'Starter Pack',
    credits: 10,
    price: 10000, // $100.00
    bonus: 0,
  },
  professional: {
    name: 'Professional Pack', 
    credits: 30,
    price: 25000, // $250.00
    bonus: 5,
  },
  enterprise: {
    name: 'Enterprise Pack',
    credits: 65,
    price: 50000, // $500.00
    bonus: 15,
  },
  unlimited: {
    name: 'Premium Monthly',
    credits: 150,
    price: 100000, // $1000.00
    bonus: 0,
  },
};

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  individual_monthly: {
    name: 'Individual Monthly',
    price: 2999, // $29.99
    interval: 'month',
    features: ['50 tickets/month', 'Email support', 'Basic security tools'],
  },
  individual_yearly: {
    name: 'Individual Yearly',
    price: 29999, // $299.99
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
    price: 99999, // $999.99
    interval: 'year',
    features: ['Unlimited tickets', 'Priority support', 'Advanced security tools', 'Team management', '2 months free'],
  },
};

// Mock function signatures for Firebase Cloud Functions
// These would be implemented as actual Cloud Functions in production

export interface CreateCreditCheckoutRequest {
  packageId: string;
  userId: string;
  userEmail: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreateSubscriptionCheckoutRequest {
  plan: 'individual' | 'business';
  billingCycle: 'monthly' | 'yearly';
  userId: string;
  userEmail: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreateUserRequest {
  adminUserId: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  lastFourSSN: string;
  role: string;
}

// Mock implementations for development
export const createCreditCheckout = async (request: CreateCreditCheckoutRequest) => {
  // In production, this would create a Stripe checkout session
  const mockSessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    success: true,
    checkoutUrl: `https://checkout.stripe.com/pay/${mockSessionId}`,
    sessionId: mockSessionId,
  };
};

export const createSubscriptionCheckout = async (request: CreateSubscriptionCheckoutRequest) => {
  // In production, this would create a Stripe subscription checkout
  const mockSessionId = `cs_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    success: true,
    checkoutUrl: `https://checkout.stripe.com/pay/${mockSessionId}`,
    sessionId: mockSessionId,
  };
};

export const createUser = async (request: CreateUserRequest) => {
  // In production, this would create a Firebase Auth user and Firestore document
  const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    success: true,
    user: {
      id: newUserId,
      email: request.email,
      name: request.fullName,
      role: request.role,
      createdAt: new Date().toISOString(),
    },
  };
};