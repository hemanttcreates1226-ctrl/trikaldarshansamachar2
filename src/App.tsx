import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { BreakingNewsBar } from './components/common/BreakingNewsBar';
import { Footer } from './components/common/Footer';

// Homepage Components
import { HeroSection } from './components/news/HeroSection';
import { LocalNewsSection } from './components/news/LocalNewsSection';
import { VideoNewsSection } from './components/news/VideoNewsSection';
import { DharmSection } from './components/news/DharmSection';
import { SpecialReportsSection } from './components/news/SpecialReportsSection';
import { NewsCard, CompactNewsCard } from './components/news/NewsCard';
import { AdvertisementContainer } from './components/news/AdvertisementContainer';

// Pages
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { CategoryNewsPage } from './pages/CategoryNewsPage';
import { JoinUsPage } from './pages/JoinUsPage';
import { RequestIdCardPage } from './pages/RequestIdCardPage';
import { RequestJoiningLetterPage } from './pages/RequestJoiningLetterPage';
import { VerifyMemberPage } from './pages/VerifyMemberPage';
import { SearchPage } from './pages/SearchPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { AdminPage } from './pages/AdminPage';

// Types & Services
import { NewsArticle, Category } from './types/news';
import { NewsService } from './services/newsService';

export function App() {
  const getPathFromUrl = () => {
    const path = window.location.pathname;
    const hash = window.location.hash.replace('#', '');
    if (path === '/admin' || hash === '/admin' || hash === 'admin') return '/admin';
    if (path.length > 1) return path;
    if (hash.length > 0) return hash.startsWith('/') ? hash : `/${hash}`;
    return '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(() => getPathFromUrl());
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadData = () => {
    setArticles(NewsService.getArticles({ limit: 40 }));
    setCategories(NewsService.getCategories());
  };

  useEffect(() => {
    loadData();

    // Sync path with URL history popstate
    const handlePopState = () => {
      setCurrentPath(getPathFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Listen for data updates (e.g., from Admin edits)
    const handleUpdate = () => loadData();
    window.addEventListener('tds_data_updated', handleUpdate);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('tds_data_updated', handleUpdate);
    };
  }, []);

  const navigateTo = (path: string, params: Record<string, string> = {}) => {
    setCurrentPath(path);
    setPathParams(params);
    try {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
    } catch {
      // Fallback for isolated environments
      window.location.hash = path;
    }
    window.scrollTo(0, 0);
  };

  const handleSelectArticle = (article: NewsArticle) => {
    NewsService.incrementViews(article.id);
    navigateTo(`/article/${article.slug || article.id}`, { id: article.id });
  };

  const handleSearchSubmit = (query: string) => {
    navigateTo('/search', { q: query });
  };

  // Render Admin page separately (without public header/footer)
  if (currentPath === '/admin') {
    return <AdminPage onNavigateHome={() => navigateTo('/')} />;
  }

  // Render QR Code Press ID Card Verification Page
  if (currentPath.startsWith('/verify/')) {
    const pressId = currentPath.split('/verify/')[1] || pathParams.pressId || '';
    return <VerifyMemberPage pressId={pressId} onNavigate={navigateTo} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#B7652A] selection:text-white">
      {/* Header & Breaking News Ticker */}
      <div>
        <Header
          onNavigate={navigateTo}
          onSearchSubmit={handleSearchSubmit}
        />
        <BreakingNewsBar onSelectArticle={handleSelectArticle} />

        {/* ================= ROUTING ================= */}

        {/* 1. HOMEPAGE */}
        {currentPath === '/' && (
          <main className="space-y-6 pb-12">
            {/* Hero Section */}
            <HeroSection
              articles={articles}
              onSelectArticle={handleSelectArticle}
            />

            {/* Top Advertisement Banner */}
            <div className="max-w-7xl mx-auto px-4">
              <AdvertisementContainer type="top_banner" />
            </div>

            {/* Main USP: Local News Section */}
            <LocalNewsSection
              onSelectArticle={handleSelectArticle}
              onNavigateLocalPage={() => navigateTo('/category/local-news')}
            />

            {/* Video Bulletin Section */}
            <VideoNewsSection
              articles={articles}
              onSelectArticle={handleSelectArticle}
            />

            {/* Category Grid: State, Crime, Business & Sports */}
            <section className="py-8 px-4 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Feed (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Category Block: राज्य / प्रदेश समाचार */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-[#D71920] pb-2">
                      <h2 className="text-xl font-black text-[#111111] flex items-center gap-2">
                        <span className="w-3 h-3 bg-[#D71920] rounded-sm"></span>
                        <span>प्रदेश एवं राष्ट्रीय समाचार (State & National)</span>
                      </h2>
                      <button
                        onClick={() => navigateTo('/category/state-news')}
                        className="text-xs font-bold text-[#D71920] hover:underline"
                      >
                        और पढ़ें →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {articles
                        .filter(a => a.categorySlug === 'state-news' || a.categorySlug === 'national-news')
                        .slice(0, 4)
                        .map(art => (
                          <NewsCard key={art.id} article={art} onSelect={handleSelectArticle} />
                        ))}
                    </div>
                  </div>

                  {/* Ad Banner inside Feed */}
                  <AdvertisementContainer type="in_feed" />

                  {/* Category Block: राजनीति एवं अपराध */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-[#D71920] pb-2">
                      <h2 className="text-xl font-black text-[#111111] flex items-center gap-2">
                        <span className="w-3 h-3 bg-[#D71920] rounded-sm"></span>
                        <span>राजनीति एवं अपराध (Politics & Crime)</span>
                      </h2>
                      <button
                        onClick={() => navigateTo('/category/politics')}
                        className="text-xs font-bold text-[#D71920] hover:underline"
                      >
                        और पढ़ें →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {articles
                        .filter(a => a.categorySlug === 'politics' || a.categorySlug === 'crime')
                        .slice(0, 4)
                        .map(art => (
                          <NewsCard key={art.id} article={art} onSelect={handleSelectArticle} />
                        ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar Feed (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Sidebar Ad */}
                  <AdvertisementContainer type="sidebar" />

                  {/* Trending Bulletins Box */}
                  <div className="bg-gradient-to-br from-red-50/80 via-white to-red-50/50 text-gray-900 rounded-xl p-5 border-2 border-red-200/80 shadow-md space-y-4">
                    <h3 className="font-extrabold text-base text-gray-900 border-b border-red-200 pb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-[#D71920] rounded-full"></span>
                        <span>ट्रेडिंग बुलेटिन (Trending)</span>
                      </span>
                      <span className="text-[10px] bg-[#D71920] text-white px-2 py-0.5 rounded font-mono font-black shadow-xs">POPULAR</span>
                    </h3>

                    <div className="space-y-3">
                      {articles.slice(0, 5).map(art => (
                        <div
                          key={art.id}
                          onClick={() => handleSelectArticle(art)}
                          className="group cursor-pointer border-b border-red-100 pb-2.5 last:border-none space-y-1 hover:bg-red-50/50 p-1.5 rounded-lg transition"
                        >
                          <span className="text-[10px] font-bold text-[#D71920]">
                            {art.categoryName} • {art.cityName || art.districtName}
                          </span>
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#D71920] transition line-clamp-2 leading-snug">
                            {art.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Press Joining Quick Widget */}
                  <div className="bg-gradient-to-br from-red-600 via-[#D71920] to-[#B81218] border border-red-300 rounded-xl p-5 text-white space-y-3 shadow-lg">
                    <span className="bg-white text-[#D71920] text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                      पत्रकारिता अवसर
                    </span>
                    <h4 className="text-base font-black text-white">
                      त्रिकाल दर्शन समाचार संवाददाता बनें
                    </h4>
                    <p className="text-xs text-red-100 font-medium leading-relaxed">
                      अपने जिले/तहसील से अधिकृत प्रेस ID कार्ड प्राप्त करें।
                    </p>
                    <button
                      onClick={() => navigateTo('/join-us')}
                      className="w-full py-2.5 bg-white hover:bg-red-50 text-[#D71920] font-black rounded-lg text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>आवेदन पत्र भरें</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Special Reports */}
            <SpecialReportsSection
              articles={articles}
              onSelectArticle={handleSelectArticle}
              onNavigateSpecialPage={() => navigateTo('/category/special-reports')}
            />

            {/* Religion & Panchang Section */}
            <DharmSection
              articles={articles}
              onSelectArticle={handleSelectArticle}
              onNavigateReligionPage={() => navigateTo('/category/religion')}
            />
          </main>
        )}

        {/* 2. ARTICLE DETAIL READER PAGE */}
        {currentPath.startsWith('/article/') && (
          <ArticleDetailPage
            articleIdOrSlug={currentPath.split('/article/')[1] || pathParams.id || ''}
            onNavigate={navigateTo}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {/* 3. CATEGORY NEWS PAGE */}
        {(currentPath.startsWith('/category/') ||
          currentPath === '/local-news' ||
          currentPath === '/special-reports' ||
          categories.some(c => `/${c.slug}` === currentPath)) && (
          <CategoryNewsPage
            categorySlug={
              currentPath.startsWith('/category/')
                ? currentPath.split('/category/')[1]
                : currentPath.replace('/', '') || 'local-news'
            }
            onSelectArticle={handleSelectArticle}
            onNavigate={navigateTo}
          />
        )}

        {/* 4. JOIN US CANDIDATE FORM */}
        {currentPath === '/join-us' && (
          <JoinUsPage onNavigate={navigateTo} />
        )}

        {/* 5. REQUEST PRESS ID CARD */}
        {currentPath === '/request-id-card' && (
          <RequestIdCardPage
            initialAppId={pathParams.appId}
            onNavigate={navigateTo}
          />
        )}

        {/* 6. REQUEST JOINING LETTER */}
        {currentPath === '/request-joining-letter' && (
          <RequestJoiningLetterPage onNavigate={navigateTo} />
        )}

        {/* 7. SEARCH PAGE */}
        {currentPath === '/search' && (
          <SearchPage
            initialQuery={pathParams.q}
            onSelectArticle={handleSelectArticle}
            onNavigate={navigateTo}
          />
        )}

        {/* 8. ABOUT & CONTACT PAGE */}
        {(currentPath === '/about' || currentPath === '/contact') && (
          <AboutContactPage />
        )}
      </div>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default App;
