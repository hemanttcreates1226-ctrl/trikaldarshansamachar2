import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  'trikaldarshannews72@gmail.com',
  'hemanttcreates1226@gmail.com'
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some(e => e.toLowerCase() === normalized);
}

export class AuthService {
  private static googleProvider = new GoogleAuthProvider();

  static {
    // Configure prompt to let user pick account if needed
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }

  static async signInWithGoogle(): Promise<{ user: User | null; isAuthorized: boolean; error?: string }> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const user = result.user;
      const email = user.email || '';
      const isAuthorized = isAuthorizedAdminEmail(email);

      if (isAuthorized) {
        sessionStorage.setItem('tds_admin_authed_email', email);
        sessionStorage.setItem('tds_admin_authed', 'true');
      } else {
        sessionStorage.removeItem('tds_admin_authed');
        sessionStorage.removeItem('tds_admin_authed_email');
      }

      return { user, isAuthorized };
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      // If popup was blocked or closed
      if (err.code === 'auth/popup-blocked') {
        return { user: null, isAuthorized: false, error: 'पॉपअप ब्लॉक हो गया है। कृपया ब्राउज़र में पॉपअप अनुमति दें।' };
      }
      if (err.code === 'auth/popup-closed-by-user') {
        return { user: null, isAuthorized: false, error: 'लॉगिन विंडो बंद कर दी गई थी।' };
      }
      return { user: null, isAuthorized: false, error: err.message || 'Google प्रमाणीकरण में त्रुटि आई।' };
    }
  }

  static async signOutAdmin(): Promise<void> {
    try {
      sessionStorage.removeItem('tds_admin_authed');
      sessionStorage.removeItem('tds_admin_authed_email');
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static isCurrentSessionAuthorized(): boolean {
    const user = auth.currentUser;
    if (user && isAuthorizedAdminEmail(user.email)) return true;
    
    // Check session fallback only if matched with stored authorized email
    const storedEmail = sessionStorage.getItem('tds_admin_authed_email');
    return isAuthorizedAdminEmail(storedEmail) && sessionStorage.getItem('tds_admin_authed') === 'true';
  }

  static onAuthStateChange(callback: (user: User | null, isAuthorized: boolean) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      const isAuthorized = user ? isAuthorizedAdminEmail(user.email) : false;
      if (isAuthorized && user?.email) {
        sessionStorage.setItem('tds_admin_authed_email', user.email);
        sessionStorage.setItem('tds_admin_authed', 'true');
      } else if (!user) {
        sessionStorage.removeItem('tds_admin_authed');
        sessionStorage.removeItem('tds_admin_authed_email');
      }
      callback(user, isAuthorized);
    });
  }
}
