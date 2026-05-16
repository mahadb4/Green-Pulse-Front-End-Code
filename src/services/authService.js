import { auth, db } from './firebaseConfig';
import { signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function signInAnonymously() {
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
    }
}