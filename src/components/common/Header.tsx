import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CloudSun,
  Search,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Flame,
  Tv,
  Camera,
  Layers,
  Award
} from 'lucide-react';
import { TrikalLogo } from '../brand/TrikalLogo';
import { Category, State, District } from '../../types/news';
import { NewsService } from '../../services/newsService';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string, params?: Record<string, string>) => void;
  selectedStateId?: string;
  selectedDistrictId?: string;
  onLocationChange?: (stateId: string, districtId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  selectedStateId = 'all',
  selectedDistrictId = 'all',
  onLocationChange
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  const [tempStateId, setTempStateId] = useState(selectedStateId);
  const [tempDistrictId, setTempDistrictId] = useState(selectedDistrictId);

  useEffect(() => {
    const loadHeaderData = () => {
      setCategories(NewsService.getCategories());
      setStates(NewsService.getStates());
      setDistricts(NewsService.getDistricts(selectedStateId));
    };

    loadHeaderData();
    window.addEventListener('tds_data_updated', loadHeaderData);
    const unsubCats = NewsService.subscribeToCategories((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });

    const updateDateTime = () => {
      const now = new Date();
      const optionsDate: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      setCurrentDateStr(now.toLocaleDateString('hi-IN', optionsDate));
      setCurrentTimeStr(now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('tds_data_updated', loadHeaderData);
      unsubCats();
    };
  }, [selectedStateId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('/search', { q: searchQuery.trim() });
    }
  };

  const applyLocationFilter = () => {
    if (onLocationChange) {
      onLocationChange(tempStateId, tempDistrictId);
    }
    setLocationModalOpen(false);
  };

  const activeLocationLabel = () => {
    if (selectedStateId === 'all') return 'समस्त भारत';
    const st = states.find(s => s.id === selectedStateId);
    if (!st) return 'समस्त भारत';
    if (selectedDistrictId === 'all') return st.nameHindi;
    const dt = districts.find(d => d.id === selectedDistrictId);
    return dt ? `${st.nameHindi} › ${dt.nameHindi}` : st.nameHindi;
  };

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="w-full bg-white text-[#080808] sticky top-0 z-50 shadow-md">
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-gradient-to-r from-red-50 via-white to-red-50 text-gray-800 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 border-b border-red-100 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Date & Time */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-gray-800">
              <Calendar className="w-3.5 h-3.5 text-[#D71920]" />
              <span className="truncate">{currentDateStr || 'शनिवार, 08 अगस्त 2026'}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 font-medium text-gray-600 border-l border-gray-300 pl-3">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span>{currentTimeStr || '18:30 IST'}</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 font-bold text-gray-800 bg-white px-2 py-0.5 rounded-full border border-red-100 shadow-2xs">
              <CloudSun className="w-3.5 h-3.5 text-amber-500" />
              <span>उज्जैन: 28°C</span>
            </div>
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-2">
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BRAND BAR */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-6 py-2 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Logo (Responsive size with min-w-0 flex-1 to prevent overflow) */}
          <div
            onClick={() => onNavigate('/')}
            className="cursor-pointer flex items-center min-w-0 shrink"
          >
            <TrikalLogo size="md" showTagline={true} />
          </div>

          {/* Action Buttons & Mobile Menu Navigation Trigger */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="खबरें, शहर या रिपोर्टर खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#F4F4F4] border border-gray-300 rounded-lg px-4 py-1.5 text-xs sm:text-sm w-44 lg:w-64 focus:outline-none focus:ring-2 focus:ring-[#D71920] focus:bg-white text-[#111111] transition"
              />
              <button type="submit" className="absolute right-3 text-gray-500 hover:text-[#D71920]">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-1.5 text-gray-700 hover:text-[#D71920] hover:bg-gray-100 rounded-full transition cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* ID Card Request Button */}
            <button
              onClick={() => onNavigate('/request-id-card')}
              className="hidden lg:flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 py-1.5 rounded-lg font-bold text-xs border border-gray-300 transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#D71920]" />
              <span>ID कार्ड</span>
            </button>

            {/* Join Us / Reporter Button (Compact on Mobile) */}
            <button
              onClick={() => onNavigate('/join-us')}
              className="flex items-center gap-1 bg-gradient-to-r from-[#D71920] to-[#A80F16] hover:opacity-95 text-white px-2 sm:px-3.5 py-1 sm:py-2 rounded-lg font-extrabold text-[11px] sm:text-xs shadow-xs transition cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">हमसे जुड़ें</span>
            </button>

            {/* Mobile Hamburger Toggle - Guaranteed visible & prominent */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 bg-red-50 text-[#D71920] hover:bg-red-100 active:scale-95 rounded-xl transition cursor-pointer border border-red-200 shadow-2xs shrink-0 flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#D71920]" />
              ) : (
                <Menu className="w-5 h-5 text-[#D71920]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Inline Search Overlay */}
        {mobileSearchOpen && (
          <div className="md:hidden mt-2 pt-2 border-t border-gray-100 animate-fadeIn">
            <form onSubmit={(e) => { handleSearchSubmit(e); setMobileSearchOpen(false); }} className="relative flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="खबरें, शहर या रिपोर्टर खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border border-red-300 text-gray-900 text-xs sm:text-sm rounded-xl pl-9 pr-10 py-2.5 focus:bg-white focus:ring-2 focus:ring-[#D71920] outline-none font-medium"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. CATEGORY NAVIGATION BAR */}
      <nav className="bg-white border-b-2 border-[#D71920] text-[#111111] px-2 sm:px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-xs sm:text-sm font-bold whitespace-nowrap w-full">
            {/* Home Tab */}
            <button
              onClick={() => onNavigate('/')}
              className={`px-3 sm:px-4 py-2 transition cursor-pointer flex items-center gap-1 border-b-2 ${
                currentPath === '/'
                  ? 'text-[#D71920] border-[#D71920] font-black bg-red-50/60 rounded-t-lg'
                  : 'text-gray-800 border-transparent hover:text-[#D71920] hover:bg-gray-50'
              }`}
            >
              होम
            </button>

            {/* Local News Tab */}
            <button
              onClick={() => onNavigate('/category/local-news')}
              className={`px-3 sm:px-4 py-2 transition cursor-pointer flex items-center gap-1.5 border-b-2 ${
                currentPath === '/category/local-news' || currentPath === '/local-news'
                  ? 'text-[#D71920] border-[#D71920] font-black bg-red-50/60 rounded-t-lg'
                  : 'text-[#D71920] border-transparent hover:bg-red-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#D71920]" />
              <span>आपके शहर की खबरें</span>
            </button>

            {/* Dynamic Categories */}
            {categories.filter(c => !c.isHidden).slice(0, 12).map((cat) => {
              const catPath = `/category/${cat.slug}`;
              const isActive = currentPath === catPath || currentPath === `/${cat.slug}`;
              return (
                <button
                  key={cat.id}
                  onClick={() => onNavigate(catPath)}
                  className={`px-3 sm:px-4 py-2 transition cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-[#D71920] border-[#D71920] font-black bg-red-50/60 rounded-t-lg'
                      : 'text-gray-800 border-transparent hover:text-[#D71920] hover:bg-gray-50'
                  }`}
                >
                  {cat.nameHindi}
                </button>
              );
            })}

            <button
              onClick={() => onNavigate('/category/special-reports')}
              className={`px-3 sm:px-4 py-2 transition cursor-pointer flex items-center gap-1 border-b-2 ${
                currentPath === '/category/special-reports' || currentPath === '/special-reports'
                  ? 'text-[#D71920] border-[#D71920] font-black bg-red-50/60 rounded-t-lg'
                  : 'text-gray-800 border-transparent hover:text-[#D71920] hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D71920]" />
              <span>विशेष रिपोर्ट</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE SLIDE-OUT DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b-2 border-[#D71920] shadow-2xl p-4 space-y-4 animate-fadeIn text-gray-900 max-h-[85vh] overflow-y-auto">
          {/* Quick Search */}
          <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="relative w-full">
            <input
              type="text"
              placeholder="खबरें, शहर या रिपोर्टर खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 text-gray-900 text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 border border-gray-300 focus:border-[#D71920] focus:bg-white outline-none font-medium"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </form>

          {/* Location Selector Tile */}
          <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#D71920] font-bold text-xs">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>क्षेत्र: {activeLocationLabel()}</span>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); setLocationModalOpen(true); }}
              className="px-3 py-1 bg-white text-[#D71920] border border-red-300 rounded-lg text-xs font-black shadow-2xs hover:bg-red-100 transition cursor-pointer"
            >
              बदलें
            </button>
          </div>

          {/* Navigation Links Grid */}
          <div className="space-y-1">
            <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider px-2 pt-1">
              मुख्य कैटेगरीज (Categories)
            </h4>
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs font-bold">
              <button
                onClick={() => { onNavigate('/'); setMobileMenuOpen(false); }}
                className={`text-left p-2.5 rounded-xl transition cursor-pointer ${
                  currentPath === '/' ? 'bg-[#D71920] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                🏠 होम (Home)
              </button>
              <button
                onClick={() => { onNavigate('/category/local-news'); setMobileMenuOpen(false); }}
                className="text-left p-2.5 rounded-xl bg-red-100 text-[#D71920] font-black border border-red-200 hover:bg-red-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>आपके शहर की खबरें</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onNavigate(`/category/${c.slug}`); setMobileMenuOpen(false); }}
                  className={`text-left p-2.5 rounded-xl transition cursor-pointer truncate ${
                    currentPath === `/category/${c.slug}`
                      ? 'bg-[#D71920] text-white font-black'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {c.nameHindi}
                </button>
              ))}
            </div>
          </div>

          {/* Special Actions */}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider px-2">
              विशेष सेवाएं (Press & Reporter)
            </h4>
            <button
              onClick={() => { onNavigate('/join-us'); setMobileMenuOpen(false); }}
              className="w-full bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white py-3 rounded-xl font-black text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>रिपोर्टर हेतु आवेदन करें (Join as Reporter)</span>
            </button>

            <button
              onClick={() => { onNavigate('/request-id-card'); setMobileMenuOpen(false); }}
              className="w-full bg-amber-50 border border-amber-300 text-amber-900 py-2.5 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>प्रेस ID कार्ड अनुरोध (Request Press ID Card)</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. LOCATION SELECTOR MODAL */}
      {locationModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-2 border-red-200 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl text-gray-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2 text-[#D71920]">
                <MapPin className="w-5 h-5 text-[#D71920]" />
                <h3 className="font-extrabold text-base sm:text-lg font-serif-devanagari text-gray-900">अपना क्षेत्र चुनें (Location)</h3>
              </div>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-black text-gray-800 mb-1">राज्य (State)</label>
                <select
                  value={tempStateId}
                  onChange={(e) => {
                    setTempStateId(e.target.value);
                    setTempDistrictId('all');
                  }}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-xl p-3 focus:border-[#D71920] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none transition"
                >
                  <option value="all">समस्त भारत (All India)</option>
                  {states.map(s => (
                    <option key={s.id} value={s.id}>{s.nameHindi} ({s.nameEnglish})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-black text-gray-800 mb-1">जिला (District)</label>
                <select
                  value={tempDistrictId}
                  onChange={(e) => setTempDistrictId(e.target.value)}
                  disabled={tempStateId === 'all'}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-xl p-3 focus:border-[#D71920] focus:bg-white focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-50 transition"
                >
                  <option value="all">समस्त जिले (All Districts)</option>
                  {NewsService.getDistricts(tempStateId).map(d => (
                    <option key={d.id} value={d.id}>{d.nameHindi} ({d.nameEnglish})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setLocationModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={applyLocationFilter}
                className="px-5 py-2.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs sm:text-sm shadow-md hover:opacity-95 transition cursor-pointer"
              >
                खबरें देखें
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
