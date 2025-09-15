import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "radbiz-support.firebaseapp.com",
  projectId: "radbiz-support",
  storageBucket: "radbiz-support.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

interface User {
  id: string;
  email: string;
  name: string;
  planType: 'individual' | 'business';
  company?: string;
  userType: 'client' | 'tech';
  createdAt?: string;
  updatedAt?: string;
  accountBalance?: {
    ticketBalance: number;
    totalTickets: number;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, planType: 'individual' | 'business', company?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const loadUserFromFirestore = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser({ ...userData, id: firebaseUser.uid });
        await AsyncStorage.setItem('user', JSON.stringify({ ...userData, id: firebaseUser.uid }));
      } else {
        console.log('User document does not exist in Firestore');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to load user from Firestore:', error);
      setUser(null);
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      // First try to load from AsyncStorage for offline support
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user from AsyncStorage:', error);
    }
  }, []);

  useEffect(() => {
    loadUser();
    
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser?.email);
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        await loadUserFromFirestore(firebaseUser);
      } else {
        setUser(null);
        await AsyncStorage.removeItem('user');
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [loadUser, loadUserFromFirestore]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase sign in successful:', userCredential.user.email);
      // User data will be loaded by the auth state listener
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, planType: 'individual' | 'business', company?: string) => {
    try {
      console.log('Creating Firebase user:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('Firebase user created, creating Firestore document');
      
      // Determine collection name based on plan type
      const collectionName = planType === 'individual' ? 'individual_users' : 'business_users';
      
      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email,
        name,
        planType,
        company,
        userType: 'client',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accountBalance: {
          ticketBalance: 100, // Start with 100 tickets
          totalTickets: 0,
        },
      };
      
      // Store in the appropriate collection
      await setDoc(doc(db, collectionName, firebaseUser.uid), userData);
      
      // Also store in main users collection for easy access
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      // Create user activity log
      await addDoc(collection(db, 'user_activities'), {
        userId: firebaseUser.uid,
        action: 'user_created',
        details: {
          planType,
          company: company || null,
          createdBy: 'self_registration',
        },
        timestamp: serverTimestamp(),
      });
      
      console.log('User document created successfully');
      
      // User data will be loaded by the auth state listener
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log('Signing out user');
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('subscription');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  }), [user, isLoading, signIn, signUp, signOut]);
});