#!/usr/bin/env node

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Production Setup Script');
console.log('=====================================\n');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: Firebase service account file not found!');
  console.error(`   Expected location: ${serviceAccountPath}`);
  console.error('\n📝 To get your service account key:');
  console.error('   1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('   2. Click "Generate New Private Key"');
  console.error('   3. Save the file as firebase-service-account.json in the project root');
  console.error('   4. Add firebase-service-account.json to .gitignore\n');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = require(path.resolve(serviceAccountPath));
} catch (error) {
  console.error('❌ Error reading service account file:', error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

const db = admin.firestore();
const storage = admin.storage();

async function createCollections() {
  console.log('📦 Creating Firestore collections...\n');

  const collections = [
    {
      name: 'users',
      description: 'Main user documents',
      sampleDoc: {
        email: 'demo@example.com',
        name: 'Demo User',
        planType: 'individual',
        userType: 'client',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        accountBalance: {
          ticketBalance: 100,
          totalTickets: 0
        }
      }
    },
    {
      name: 'individual_users',
      description: 'Individual plan users',
      sampleDoc: null
    },
    {
      name: 'business_users',
      description: 'Business plan users',
      sampleDoc: null
    },
    {
      name: 'subscriptions',
      description: 'User subscriptions',
      sampleDoc: {
        userId: 'demo-user-id',
        plan: 'individual',
        billingCycle: 'monthly',
        status: 'trial',
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      name: 'tickets',
      description: 'Support tickets',
      sampleDoc: {
        userId: 'demo-user-id',
        title: 'Sample Support Ticket',
        description: 'This is a sample ticket for testing',
        status: 'pending',
        priority: 'medium',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      name: 'user_activities',
      description: 'User activity logs',
      sampleDoc: {
        userId: 'demo-user-id',
        action: 'user_login',
        details: {
          platform: 'web',
          ipAddress: '192.168.1.1'
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      name: 'purchases',
      description: 'Purchase records',
      sampleDoc: {
        userId: 'demo-user-id',
        type: 'credit_purchase',
        credits: 50,
        amount: 49.99,
        currency: 'USD',
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      name: 'checkout_sessions',
      description: 'Stripe checkout sessions',
      sampleDoc: {
        userId: 'demo-user-id',
        sessionId: 'cs_test_123',
        type: 'subscription',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      name: 'support_chats',
      description: 'Support chat sessions',
      sampleDoc: {
        userId: 'demo-user-id',
        techId: null,
        status: 'waiting',
        messages: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      name: 'tech_support_users',
      description: 'Technical support staff',
      sampleDoc: {
        email: 'tech@example.com',
        name: 'Tech Support',
        status: 'available',
        activeChats: 0,
        maxChats: 5,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    }
  ];

  for (const collection of collections) {
    try {
      const collectionRef = db.collection(collection.name);
      const snapshot = await collectionRef.limit(1).get();
      
      if (snapshot.empty && collection.sampleDoc) {
        await collectionRef.add(collection.sampleDoc);
        console.log(`✅ Created collection: ${collection.name} (${collection.description})`);
      } else {
        console.log(`ℹ️  Collection exists: ${collection.name} (${collection.description})`);
      }
    } catch (error) {
      console.error(`❌ Error creating collection ${collection.name}:`, error.message);
    }
  }
}

async function createStorageFolders() {
  console.log('\n📁 Creating Storage folders...\n');

  const folders = [
    'user-uploads/',
    'ticket-attachments/',
    'profile-pictures/',
    'chat-attachments/',
    'security-reports/',
    'backups/'
  ];

  const bucket = storage.bucket();

  for (const folder of folders) {
    try {
      const file = bucket.file(`${folder}.keep`);
      const exists = await file.exists();
      
      if (!exists[0]) {
        await file.save('', {
          metadata: {
            contentType: 'text/plain'
          }
        });
        console.log(`✅ Created storage folder: ${folder}`);
      } else {
        console.log(`ℹ️  Storage folder exists: ${folder}`);
      }
    } catch (error) {
      console.error(`❌ Error creating folder ${folder}:`, error.message);
    }
  }
}

async function setupSecurityRules() {
  console.log('\n🔒 Security Rules Setup\n');
  console.log('⚠️  Security rules must be deployed manually using:');
  console.log('   firebase deploy --only firestore:rules');
  console.log('   firebase deploy --only storage:rules\n');
  console.log('   Rules files are located in:');
  console.log('   - firestore.rules');
  console.log('   - storage.rules\n');
}

async function setupIndexes() {
  console.log('📊 Firestore Indexes Setup\n');
  console.log('⚠️  Indexes must be deployed manually using:');
  console.log('   firebase deploy --only firestore:indexes\n');
  console.log('   Index configuration is in firestore.indexes.json\n');
}

async function createAdminUser() {
  console.log('👤 Creating Admin User\n');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@radbiz.app';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';
  
  try {
    let user;
    try {
      user = await admin.auth().getUserByEmail(adminEmail);
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
    } catch (error) {
      user = await admin.auth().createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'System Administrator',
        emailVerified: true
      });
      console.log(`✅ Created admin user: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!\n`);
    }

    await db.collection('users').doc(user.uid).set({
      email: adminEmail,
      name: 'System Administrator',
      planType: 'business',
      userType: 'tech',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      accountBalance: {
        ticketBalance: 999999,
        totalTickets: 0
      }
    }, { merge: true });

    await admin.auth().setCustomUserClaims(user.uid, { admin: true, tech: true });
    console.log(`✅ Set admin claims for user\n`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

async function verifySetup() {
  console.log('🔍 Verifying Setup\n');
  
  const checks = [
    { name: 'Firestore Connection', test: async () => await db.collection('users').limit(1).get() },
    { name: 'Storage Connection', test: async () => await storage.bucket().exists() },
    { name: 'Auth Connection', test: async () => await admin.auth().listUsers(1) }
  ];

  for (const check of checks) {
    try {
      await check.test();
      console.log(`✅ ${check.name}: OK`);
    } catch (error) {
      console.log(`❌ ${check.name}: FAILED - ${error.message}`);
    }
  }
}

async function main() {
  try {
    console.log(`📱 Project: ${serviceAccount.project_id}\n`);
    
    await createCollections();
    await createStorageFolders();
    await createAdminUser();
    await setupSecurityRules();
    await setupIndexes();
    await verifySetup();
    
    console.log('\n✨ Firebase setup completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Deploy security rules: firebase deploy --only firestore:rules,storage:rules');
    console.log('   2. Deploy indexes: firebase deploy --only firestore:indexes');
    console.log('   3. Update environment variables in your app');
    console.log('   4. Change the admin password immediately');
    console.log('   5. Test the application thoroughly\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
