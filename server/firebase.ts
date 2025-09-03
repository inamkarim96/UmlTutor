import admin from "firebase-admin";

function initializeFirebaseAdmin(): admin.app.App {
  if (admin.apps.length) return admin.app();

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;

  let credentials: admin.ServiceAccount | undefined = undefined;

  try {
    if (serviceAccountJson) {
      credentials = JSON.parse(serviceAccountJson);
    } else if (serviceAccountB64) {
      const decoded = Buffer.from(serviceAccountB64, "base64").toString("utf8");
      credentials = JSON.parse(decoded);
    }
  } catch (error) {
    console.error("Failed to parse Firebase service account JSON:", error);
  }

  if (credentials) {
    return admin.initializeApp({
      credential: admin.credential.cert(credentials)
    });
  }

  // Fallback to application default credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS)
  return admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

export const firebaseApp = initializeFirebaseAdmin();
export const firebaseAuth = admin.auth();


