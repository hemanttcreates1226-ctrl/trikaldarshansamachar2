import React, { useState } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  FolderTree,
  MapPin,
  Users,
  UserCheck,
  Award,
  FileText,
  Image,
  Tv,
  Megaphone,
  Share2,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { TrikalLogo } from '../brand/TrikalLogo';

interface AdminLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  onNavigateHome,
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'डैशबोर्ड (Overview)', icon: LayoutDashboard },
    { id: 'news', label: 'समाचार प्रबंधन (News CMS)', icon: Newspaper },
    { id: 'categories', label: 'श्रेणियां (Categories)', icon: FolderTree },
    { id: 'locations', label: 'राज्य एवं जिले (Locations)', icon: MapPin },
    { id: 'reporters', label: 'संवाददाता (Reporters)', icon: Users },
    { id: 'applications', label: 'आवेदन पत्र (Applications)', icon: UserCheck },
    { id: 'id-cards', label: 'प्रेस ID कार्ड्स (ID Cards)', icon: Award },
    { id: 'joining-letters', label: 'नियुक्ति पत्र (Letters)', icon: FileText },
    { id: 'ads', label: 'विज्ञापन प्रबंधन (Ads)', icon: Megaphone },
    { id: 'social-links', label: 'सोशल मीडिया (Social)', icon: Share2 },
    { id: 'settings', label: 'वेबसाइट सेटिंग्स (Settings)', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-red-200 py-3 px-4 sticky top-0 z-40 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-[#D71920] hover:bg-red-50 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div onClick={onNavigateHome} className="cursor-pointer">
            <TrikalLogo size="sm" showTagline={false} />
          </div>

          <span className="hidden sm:inline-block bg-red-50 border border-red-200 text-[#D71920] font-bold text-xs px-2.5 py-1 rounded-md">
            एडमिन कंट्रोल पैनल v2.4
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 bg-gray-50 hover:bg-red-50 text-gray-800 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 hover:border-red-200 transition"
          >
            <span>वेबसाइट देखें →</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-[#A80F16] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">लॉगआउट</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-red-100 shadow-sm transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } transition duration-200 flex flex-col justify-between`}
        >
          <div className="p-4 space-y-2 overflow-y-auto">
            <p className="text-[11px] font-black text-[#D71920] uppercase tracking-wider px-3 py-1">
              प्रशासनिक मेनू (CMS)
            </p>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black shadow-sm'
                        : 'text-gray-700 hover:bg-red-50 hover:text-[#D71920]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#D71920]'}`} />
                      <span className="font-bold">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-red-100 bg-red-50/50 text-xs text-gray-700 space-y-1">
            <p className="font-black text-[#D71920]">प्रधान सम्पादक</p>
            <p className="text-[10px] font-mono text-gray-600">editor@trikaldarshan.com</p>
          </div>
        </aside>

        {/* Main Content View Container */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50/70">
          {children}
        </main>
      </div>
    </div>
  );
};
