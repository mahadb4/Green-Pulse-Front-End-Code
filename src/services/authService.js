import { auth, db } from '../firebase';
import { signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function signInAnonymously() {
    try {
        const userCredential = await firebaseSignInAnonymously(auth);
        const uid = userCredential.user.uid;

        const childRef = doc(db, 'children', uid);
        const childSnap = await getDoc(childRef);

        if (!childSnap.exists()) {
            await setDoc(childRef, {
                energy_points: 0,
                current_streak: 0,
                parent_approved: false,
                nickname: null,
                garden_id: 'garden_karachi_01',
                last_action_at: null,
                fcm_token: null,
            });
            console.log('[authService] Created new child profile for uid:', uid);
        } else {
            console.log('[authService] Existing child profile loaded for uid:', uid);
        }

        return userCredential;
    } catch (error) {
        if (error && error.code === 'auth/configuration-not-found') {
            console.warn('[authService] ⚠️ Anonymous Authentication is not enabled in Firebase Console!');
            console.warn('[authService] To fix: Firebase Console → Authentication → Sign-in method → Anonymous → Enable');
            console.warn('[authService] App will continue in limited/demo mode.');
            return null;
        }
        if (error && error.code === 'auth/network-request-failed') {
            console.warn('[authService] Network error, continuing without auth.');
            return null;
        }
        console.error('[authService] Unexpected auth error:', error);
        return null; // Don't crash the app on auth errors
    }
}