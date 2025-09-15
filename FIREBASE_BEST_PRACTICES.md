# Firebase Best Practices for RadBiz Support App

## Overview

This document outlines the recommended Firebase/Firestore architecture and best practices for the RadBiz Support application. The app supports both individual and business users with proper authentication, subscription management, and ticket tracking.

## Authentication & User Management

### Firebase Authentication Setup

The app uses Firebase Authentication with email/password sign-in. Users are automatically created in Firestore upon successful registration.

### User Collection Strategy

**Dual Collection Approach:**
- `users/{userId}` - Main user document for cross-user-type queries
- `individual_users/{userId}` - Individual plan users only
- `business_users/{userId}` - Business plan users only

This approach provides:
- Easy querying across all users
- Plan-specific access control
- Better security rule implementation
- Scalable user management

### User Document Structure

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  planType: 'individual' | 'business';
  company?: string;
  userType: 'client' | 'tech';
  createdAt: string;
  updatedAt: string;
  accountBalance: {
    ticketBalance: number;    // Available tickets
    totalTickets: number;     // Total tickets used this month
  };
  subscription?: {
    plan: 'individual' | 'business';
    billingCycle: 'monthly' | 'yearly';
    status: 'active' | 'trial' | 'expired';
    trialEndDate?: string;
    nextBillingDate: string;
  };
}
```

## Collection Structure

### Primary Collections

1. **users/{userId}** - Main user documents
2. **individual_users/{userId}** - Individual plan users
3. **business_users/{userId}** - Business plan users
4. **subscriptions/{userId}** - Subscription data
5. **tickets/{ticketId}** - Support tickets
6. **user_activities/{activityId}** - Activity logs
7. **purchases/{purchaseId}** - Purchase records
8. **checkout_sessions/{sessionId}** - Stripe sessions

### Ticket Management

```typescript
interface Ticket {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'open' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  company?: string; // For business users
}
```

### Subscription Management

```typescript
interface Subscription {
  userId: string;
  plan: 'individual' | 'business';
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'trial' | 'expired';
  trialEndDate?: string;
  nextBillingDate: string;
  subscriptionId?: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Business users can read their team members
    match /business_users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.company == 
         get(/databases/$(database)/documents/users/$(userId)).data.company);
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tickets can be read by owner or business team members
    match /tickets/{ticketId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.company == 
         get(/databases/$(database)/documents/users/$(resource.data.userId)).data.company);
    }
    
    // Subscriptions are private to user
    match /subscriptions/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Indexing Strategy

Create composite indexes for optimal query performance:

1. **Tickets Collection:**
   - `(userId, status, createdAt)`
   - `(company, status, createdAt)`
   - `(assignedTo, status, updatedAt)`

2. **User Activities:**
   - `(userId, timestamp)`
   - `(action, timestamp)`

3. **Purchases:**
   - `(userId, createdAt)`
   - `(type, createdAt)`

## Data Consistency Patterns

### Atomic Operations

Use Firestore transactions for operations affecting multiple documents:

```typescript
// Creating a ticket (updates user balance + creates ticket)
const createTicket = async (userId: string, ticketData: any) => {
  return db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);
    
    if (userDoc.data()?.accountBalance.ticketBalance <= 0) {
      throw new Error('Insufficient ticket balance');
    }
    
    // Create ticket
    const ticketRef = db.collection('tickets').doc();
    transaction.set(ticketRef, {
      ...ticketData,
      userId,
      createdAt: new Date(),
    });
    
    // Update user balance
    transaction.update(userRef, {
      'accountBalance.ticketBalance': FieldValue.increment(-1),
      'accountBalance.totalTickets': FieldValue.increment(1),
    });
  });
};
```

### Credit Purchase Processing

```typescript
const processCreditPurchase = async (userId: string, credits: number) => {
  return db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    
    // Update user balance
    transaction.update(userRef, {
      'accountBalance.ticketBalance': FieldValue.increment(credits),
      updatedAt: new Date(),
    });
    
    // Create purchase record
    const purchaseRef = db.collection('purchases').doc();
    transaction.set(purchaseRef, {
      userId,
      type: 'credit_purchase',
      credits,
      createdAt: new Date(),
    });
  });
};
```

## User Management for Business Accounts

Business users can create and manage team members:

```typescript
interface CreateUserRequest {
  adminUserId: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  lastFourSSN: string;
  role: string;
}

const createBusinessUser = async (request: CreateUserRequest) => {
  // 1. Verify admin permissions
  // 2. Create Firebase Auth user
  // 3. Create Firestore user document
  // 4. Log activity
  // 5. Send welcome email
};
```

## Subscription & Billing Integration

### Trial Management

- 14-day free trial for all new subscriptions
- Automatic conversion to paid subscription after trial
- Grace period for failed payments

### Stripe Integration

```typescript
// Webhook handling for subscription events
const handleStripeWebhook = async (event: any) => {
  switch (event.type) {
    case 'customer.subscription.created':
      // Update user subscription status
      break;
    case 'customer.subscription.updated':
      // Handle plan changes
      break;
    case 'customer.subscription.deleted':
      // Handle cancellations
      break;
    case 'invoice.payment_failed':
      // Handle failed payments
      break;
  }
};
```

## Performance Optimization

### Caching Strategy

1. **User Data:** Cache in AsyncStorage for offline access
2. **Subscription Status:** Cache with periodic refresh
3. **Ticket Counts:** Real-time listeners for dashboard

### Query Optimization

1. Use pagination for large datasets
2. Implement proper indexing
3. Use real-time listeners sparingly
4. Cache frequently accessed data

## Monitoring & Analytics

### Key Metrics to Track

1. **User Engagement:**
   - Daily/Monthly active users
   - Ticket creation rate
   - Support response times

2. **Business Metrics:**
   - Subscription conversion rates
   - Churn rate
   - Revenue per user

3. **Technical Metrics:**
   - Query performance
   - Error rates
   - Authentication success rates

## Backup & Recovery

1. **Automated Backups:** Daily Firestore exports
2. **Point-in-time Recovery:** Maintain 30-day backup retention
3. **Disaster Recovery:** Multi-region deployment strategy

## Compliance & Security

1. **Data Privacy:** GDPR/CCPA compliance
2. **Encryption:** Data encrypted at rest and in transit
3. **Access Control:** Role-based permissions
4. **Audit Logging:** Track all data access and modifications

This architecture provides a scalable, secure, and maintainable foundation for the RadBiz Support application while following Firebase best practices.