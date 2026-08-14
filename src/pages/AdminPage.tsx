import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  LogOut,
  UserCheck,
  AlertTriangle,
  Lock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Mail,
  User
} from 'lucide-react';
import { TrikalLogo } from '../components/brand/TrikalLogo';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AuthService, AUTHORIZED_ADMIN_EMAILS, isAuthorizedAdminEmail } from '../services/authService';
import { User as FirebaseUser } from 'firebase/auth';

import { DashboardView } from '../components/admin/views/DashboardView';
import { NewsManagerView } from '../components/admin/views/NewsManagerView';
import { CategoryManagerView } from '../components/admin/views/CategoryManagerView';
import { LocationManagerView } from '../components/admin/views/LocationManagerView';
import { ReporterManagerView } from '../components/admin/views/ReporterManagerView';
import { ApplicationsManagerView } from '../components/admin/views/ApplicationsManagerView';
import { IdCardsManagerView } from '../components/admin/views/IdCardsManagerView';
import { JoiningLettersManagerView } from '../components/admin/views/JoiningLettersManagerView';
import { AdsManagerView } from '../components/admin/views/AdsManagerView';
import { SocialManagerView } from '../components/admin/views/SocialManagerView';
import { SettingsManagerView } from '../components/admin/views/SettingsManagerView';

interface AdminPageProps {
  onNavigateHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigateHome }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = AuthService.onAuthStateChange((user, authorized) => {
      setCurrentUser(user);
      setIsAuthorized(authorized);
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);

    try {
      const { user, isAuthorized: authorized, error } = await AuthService.signInWithGoogle();
      if (error) {
        setAuthError(error);
        setIsSigningIn(false);
        return;
      }

      setCurrentUser(user);
      setIsAuthorized(authorized);
      setIsSigningIn(false);
    } catch (err: any) {
      setAuthError(err.message || 'Google लॉगिन में कोई त्रुटि आई।');
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await AuthService.signOutAdmin();
    setCurrentUser(null);
    setIsAuthorized(false);
    setAuthError(null);
  };

  const handleSwitchAccount = async () => {
    await AuthService.signOutAdmin();
    setCurrentUser(null);
    setIsAuthorized(false);
    setAuthError(null);
    handleGoogleSignIn();
  };

  // 1. Initial Checking Loading Screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-red-950 text-gray-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-[#D71920] border-t-transparent animate-spin flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#D71920]" />
          </div>
          <p className="text-sm font-bold text-gray-300">
            सुरक्षा सत्यापन जारी है... (Verifying Authorization)
          </p>
        </div>
      </div>
    );
  }

  // 2. Logged in with an Unauthorized Gmail / Google Account
  if (currentUser && !isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-red-950 text-gray-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,25,32,0.2),transparent_50%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white text-gray-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="bg-red-100 text-red-800 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>पहुंच अस्वीकृत (Access Denied)</span>
            </span>
            <h2 className="text-xl font-black text-gray-900">
              अनाधिकृत ईमेल खाता
            </h2>
            <p className="text-xs text-gray-600 font-medium">
              आप जिस Google खाते से लॉग इन हैं, वह एडमिन पैनल के लिए अधिकृत नहीं है।
            </p>
          </div>

          {/* Current Signed In Account */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-left space-y-1 text-xs">
            <p className="text-[11px] font-bold text-gray-500">लॉग इन ईमेल खाता:</p>
            <p className="font-mono font-bold text-red-600 break-all">{currentUser.email}</p>
          </div>

          {/* Authorized Emails List */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-left space-y-2 text-xs text-amber-900">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>केवल निम्नलिखित 2 अधिकृत ईमेल से ही एडमिन खुलेगा:</span>
            </p>
            <ul className="space-y-1 font-mono font-bold text-[11px] text-gray-800 pl-2">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
                <span>trikaldarshannews72@gmail.com</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
                <span>hemanttcreates1226@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleSwitchAccount}
              className="w-full py-3.5 bg-[#D71920] hover:bg-[#A80F16] text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <RefreshCw className="w-4 h-4" />
              <span>अधिकृत Google खाते से लॉगिन करें</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट करें (Sign Out)</span>
            </button>
          </div>

          <div className="pt-2 border-t border-gray-200 text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs font-bold text-gray-600 hover:text-[#D71920] transition"
            >
              ← मुख्य वेबसाइट पर लौटें
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Not Logged In Screen - Dedicated Google Login Button Restricted to the 2 Emails
  if (!currentUser || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-red-950 text-gray-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,25,32,0.2),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.1),transparent_50%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-md w-full bg-white text-gray-900 border border-red-300 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 overflow-hidden"
        >
          {/* Top Decorative Banner */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#D71920] via-amber-500 to-[#A80F16]" />

          {/* Branding Header */}
          <div className="text-center space-y-3 pt-2">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="inline-block">
              <TrikalLogo size="md" showTagline={true} />
            </motion.div>

            <div className="pt-1">
              <span className="bg-red-50 text-[#D71920] border border-red-200 font-black text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-2 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#D71920]" />
                <span>सुरक्षित प्रशासनिक पोर्टल (Admin Portal)</span>
              </span>
            </div>

            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              एडमिन लॉगिन (Restricted Access)
            </h2>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              यह पैनल केवल अधिकृत संपादकीय Google ईमेल आईडी के लिए सुरक्षित है।
            </p>
          </div>

          {/* Whitelisted Notice Box */}
          <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl space-y-2 text-xs text-gray-800 text-left">
            <p className="font-black text-[#D71920] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>अधिकृत व्यवस्थापक ईमेल (Authorized Emails):</span>
            </p>
            <div className="space-y-1.5 pl-1">
              <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-red-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-mono font-bold text-gray-800 text-[11px] truncate">
                  trikaldarshannews72@gmail.com
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-red-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-mono font-bold text-gray-800 text-[11px] truncate">
                  hemanttcreates1226@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* Error Notification */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 bg-red-100 border border-red-300 text-red-800 text-xs rounded-2xl font-bold flex items-start gap-2 text-left"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign In Button */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 font-black rounded-2xl text-xs sm:text-sm border-2 border-gray-300 hover:border-red-400 shadow-md hover:shadow-lg transition flex items-center justify-center gap-3 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSigningIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#D71920] border-t-transparent rounded-full animate-spin" />
                  <span>Google से प्रमाणीकरण हो रहा है...</span>
                </>
              ) : (
                <>
                  {/* Google SVG Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google से सुरक्षित लॉगिन करें</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Back to Public Site */}
          <div className="pt-3 border-t border-gray-200 text-[11px] text-gray-500 flex justify-between items-center font-medium">
            <button
              onClick={onNavigateHome}
              className="text-[#D71920] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>← मुख्य वेबसाइट पर लौटें</span>
            </button>
            <span className="font-bold text-gray-400">सुरक्षित पोर्टल v2.5</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // 4. Authorized Admin is Logged In
  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      onNavigateHome={onNavigateHome}
      adminEmail={currentUser.email || undefined}
      adminName={currentUser.displayName || undefined}
      adminPhoto={currentUser.photoURL || undefined}
    >
      {activeTab === 'dashboard' && (
        <DashboardView
          onNavigateTab={setActiveTab}
          onAddNewNews={() => setActiveTab('news')}
        />
      )}
      {activeTab === 'news' && <NewsManagerView />}
      {activeTab === 'categories' && <CategoryManagerView />}
      {activeTab === 'locations' && <LocationManagerView />}
      {activeTab === 'reporters' && <ReporterManagerView />}
      {activeTab === 'applications' && <ApplicationsManagerView />}
      {activeTab === 'id-cards' && <IdCardsManagerView />}
      {activeTab === 'joining-letters' && <JoiningLettersManagerView />}
      {activeTab === 'ads' && <AdsManagerView />}
      {activeTab === 'social-links' && <SocialManagerView />}
      {activeTab === 'settings' && <SettingsManagerView />}
    </AdminLayout>
  );
};
