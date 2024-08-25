// firebase-config.js or in your main.js/renderer.js

// Import the Firebase modules
import { initializeApp } from 'firebase/app';
import { getRemoteConfig } from 'firebase/remote-config';

// Your web app's Firebase configuration (get this from your Firebase console)
const firebaseConfig = {
  apiKey: 'AIzaSyBw-rQUKDJSMUzvQtDp56eiQtRnqlYrav0',
  authDomain: 'mannco-mastermind.firebaseapp.com',
  projectId: 'mannco-mastermind',
  storageBucket: 'mannco-mastermind.appspot.com',
  messagingSenderId: '584603541625',
  appId: '1:584603541625:web:d1d4e1391bc1bac1a3b4a8',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Remote Config
const remoteConfig = getRemoteConfig(app);

// Optional: Set default values for Remote Config parameters
remoteConfig.defaultConfig = {
  weaponsdb: '{}',
};

// Set the minimum fetch interval (in seconds)
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour

export default remoteConfig;
