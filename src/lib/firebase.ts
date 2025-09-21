// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if the API key is a placeholder
if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
  console.warn(`
    *************************************************************************
    * FIREBASE IS NOT CONFIGURED!                                           *
    *                                                                       *
    * Your application will not work correctly until you provide valid      *
    * Firebase credentials.                                                 *
    *                                                                       *
    * 1. Create a project at https://console.firebase.google.com/           *
    * 2. Add a web app to your project.                                     *
    * 3. Copy the 'firebaseConfig' object.                                  *
    * 4. Paste the values into the .env file.                         *
    * 5. Restart the development server.                                    *
    *************************************************************************
  `);
}

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
