import { Platform } from 'react-native';

type Environment = 'production' | 'demo';

interface EnvironmentConfig {
  environment: Environment;
  isDemoMode: boolean;
  isProduction: boolean;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  stripe: {
    publishableKey: string;
  };
  features: {
    authBypass: boolean;
    mockPayments: boolean;
    debugMode: boolean;
  };
}

function detectEnvironment(): Environment {
  if (Platform.OS === 'web') {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('demo')) {
      return 'demo';
    }
  }
  
  if (__DEV__) {
    return 'demo';
  }
  
  return 'production';
}

const environment = detectEnvironment();
const isDemoMode = environment === 'demo';
const isProduction = environment === 'production';

const config: EnvironmentConfig = {
  environment,
  isDemoMode,
  isProduction,
  firebase: {
    apiKey: isProduction 
      ? 'AIzaSyCI14WaCT69SsMq2cjQuA7rHLX-B0PX9KI' 
      : 'demo-api-key',
    authDomain: isProduction 
      ? 'radbiz-sup-app.firebaseapp.com' 
      : 'demo-project.firebaseapp.com',
    projectId: isProduction 
      ? 'radbiz-sup-app' 
      : 'demo-project',
    storageBucket: isProduction 
      ? 'radbiz-sup-app.appspot.com' 
      : 'demo-project.appspot.com',
    messagingSenderId: isProduction 
      ? '951568460779' 
      : '123456789',
    appId: isProduction 
      ? '1:951568460779:web:your-app-id' 
      : '1:123456789:web:demo-app-id',
  },
  stripe: {
    publishableKey: isProduction 
      ? 'pk_live_your_live_key' 
      : 'pk_test_51S7iP8DkNhm5wLGgx2QJNtHD9vz2jyv03kSfusRYMZAbA2ZBYlI1phQDDkV5g9gfNAHBdZxVDDAMiliGCfd1TKI300diGvsWOO',
  },
  features: {
    authBypass: isDemoMode,
    mockPayments: isDemoMode,
    debugMode: isDemoMode,
  },
};

export default config;
export { type Environment, type EnvironmentConfig };

export const {
  environment: ENV,
  isDemoMode: IS_DEMO,
  isProduction: IS_PRODUCTION,
  firebase: FIREBASE_CONFIG,
  stripe: STRIPE_CONFIG,
  features: FEATURES,
} = config;

console.log(`🚀 App running in ${environment.toUpperCase()} mode`);
if (isDemoMode) {
  console.log('🔧 Demo features enabled: Auth bypass, Mock payments, Debug mode');
}