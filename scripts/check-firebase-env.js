#!/usr/bin/env node

// Environment Variables Checker for WayGo Freight Firebase Config
console.log('🔍 WayGo Freight - Firebase Environment Variables Check');
console.log('================================================\n');

// Required Firebase Environment Variables
const requiredVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
];

// Optional Firebase Environment Variables
const optionalVars = [
  'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'
];

// Other Environment Variables
const otherVars = [
  'NODE_ENV',
  'EXPO_PUBLIC_API_URL'
];

let allGood = true;

// Check required variables
console.log('🔥 Required Firebase Variables:');
console.log('--------------------------------');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '❌ MISSING';
  const preview = value ? `(${value.substring(0, 20)}...)` : '';
  
  console.log(`${varName}: ${status} ${preview}`);
  
  if (!value) {
    allGood = false;
  }
});

// Check optional variables
console.log('\n🔧 Optional Firebase Variables:');
console.log('--------------------------------');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '⚠️  NOT SET';
  const preview = value ? `(${value.substring(0, 20)}...)` : '';
  
  console.log(`${varName}: ${status} ${preview}`);
});

// Check other variables
console.log('\n⚙️  Other Environment Variables:');
console.log('--------------------------------');
otherVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '⚠️  NOT SET';
  const preview = value ? `(${value.substring(0, 30)}...)` : '';
  
  console.log(`${varName}: ${status} ${preview}`);
});

// Summary
console.log('\n📋 Summary:');
console.log('===========');
if (allGood) {
  console.log('✅ All required Firebase environment variables are set!');
  console.log('🚀 Firebase should initialize properly.');
} else {
  console.log('❌ Some required Firebase environment variables are missing!');
  console.log('🔧 Please check your .env file and ensure all required variables are set.');
  console.log('\n💡 Tip: Make sure your .env file is in the root directory and follows this format:');
  console.log('EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here');
  console.log('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com');
  console.log('EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id');
  console.log('...');
}

console.log('\n🔍 Environment loaded from:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`Current working directory: ${process.cwd()}`);
console.log(`Script location: ${__filename}`);
