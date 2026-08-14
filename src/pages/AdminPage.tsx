import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Key, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2, Building2, User } from 'lucide-react';
import { TrikalLogo } from '../components/brand/TrikalLogo';
import { AdminLayout } from '../components/admin/AdminLayout';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('tds_admin_authed') === 'true';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    const p = password;

    const isValidUser = u === 'trikaldarshansamachar' || u === 'admin';
    const isValidPass = p === 'trikal@123' || p === 'trikal123' || p === 'admin';

    if (isValidUser && isValidPass) {
      setLoginError(false);
      setIsAuthenticating(true);

      setTimeout(() => {
        setAuthSuccess(true);
        setTimeout(() => {
          sessionStorage.setItem('tds_admin_authed', 'true');
          setIsAuthenticated(true);
          setIsAuthenticating(false);
          setAuthSuccess(false);
        }, 800);
      }, 1000);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tds_admin_authed');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-red-950 text-gray-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,25,32,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.1),transparent_50%)] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-md w-full bg-white/95 backdrop-blur-xl text-gray-900 border border-red-300/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 overflow-hidden"
        >
          {/* Top Decorative Color Accent */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#D71920] via-amber-500 to-[#A80F16]" />

          {/* Welcome Branding */}
          <div className="text-center space-y-3 pt-2">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-block"
            >
              <TrikalLogo size="md" showTagline={true} />
            </motion.div>

            <div className="pt-1">
              <span className="bg-gradient-to-r from-red-50 to-amber-50 text-[#D71920] border border-red-200/80 font-black text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-2 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#D71920]" />
                <span>एडमिन कंट्रोल पैनल (Admin Welcome)</span>
              </span>
            </div>

            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              प्रशासनिक पोर्टल में आपका स्वागत है
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              कृपया अपनी आधिकारिक क्रेडेंशियल्स दर्ज करके लॉगिन करें
            </p>
          </div>


          {/* Login Error Notification */}
          <AnimatePresence>
            {loginError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded-2xl font-bold shadow-2xs flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                <span>यूज़रनेम या पासवर्ड गलत है! (कृपया सही विवरण दर्ज करें)</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Authentication Overlay Animation */}
          {isAuthenticating ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              {authSuccess ? (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-emerald-700">
                    प्रमाणीकरण सफल!
                  </h3>
                  <p className="text-xs text-gray-600 font-medium">
                    सुरक्षित एडमिन कंट्रोल रूम में प्रवेश किया जा रहा है...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full border-4 border-[#D71920] border-t-transparent animate-spin flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#D71920]" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">
                    सुरक्षा कुंजियों का सत्यापन जारी...
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4 text-left text-xs font-medium">
              <div>
                <label className="block text-gray-800 font-black mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#D71920]" />
                  <span>यूज़रनेम (Username)</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="अपना यूज़रनेम दर्ज करें"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-xl p-3 focus:border-[#D71920] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none font-sans transition"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-black mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#D71920]" />
                  <span>पासवर्ड (Password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="अपना पासवर्ड दर्ज करें"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-xl p-3 pr-10 focus:border-[#D71920] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none font-sans transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#D71920] via-red-600 to-[#A80F16] text-white font-black rounded-xl text-sm shadow-md hover:shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>एडमिन पैनल खोलें (Enter Admin Panel)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Footer Navigation Back to Home */}
          <div className="pt-4 border-t border-gray-200 text-[11px] text-gray-500 flex justify-between items-center font-medium">
            <button onClick={onNavigateHome} className="text-[#D71920] font-bold hover:underline cursor-pointer flex items-center gap-1">
              <span>← मुख्य वेबसाइट पर लौटें</span>
            </button>
            <span className="font-bold text-gray-400">सुरक्षित पोर्टल v2.4</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      onNavigateHome={onNavigateHome}
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

