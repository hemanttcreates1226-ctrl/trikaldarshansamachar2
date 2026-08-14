import React, { useState, useEffect } from 'react';
import { Building2, MapPin, ChevronRight, Filter } from 'lucide-react';
import { NewsArticle, Category } from '../types/news';
import { NewsService } from '../services/newsService';
import { NewsCard } from '../components/news/NewsCard';
import { AdvertisementContainer } from '../components/news/AdvertisementContainer';

interface CategoryNewsPageProps {
  categorySlug: string;
  onSelectArticle: (article: NewsArticle) => void;
  onNavigate: (path: string) => void;
}

export const CategoryNewsPage: React.FC<CategoryNewsPageProps> = ({
  categorySlug,
  onSelectArticle,
  onNavigate
}) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categoryObj, setCategoryObj] = useState<Category | null>(null);

  useEffect(() => {
    const loadCategoryArticles = () => {
      const cats = NewsService.getCategories();
      const foundCat = cats.find(c => c.slug === categorySlug);
      setCategoryObj(foundCat || null);

      const fetched = NewsService.getArticles({
        categorySlug: categorySlug === 'all' ? undefined : categorySlug,
        limit: 20
      });
      setArticles(fetched);
    };

    loadCategoryArticles();
    window.scrollTo(0, 0);

    window.addEventListener('tds_data_updated', loadCategoryArticles);
    return () => window.removeEventListener('tds_data_updated', loadCategoryArticles);
  }, [categorySlug]);

  return (
    <div className="py-8 px-4 bg-[#FFFDF9] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Category Header Banner */}
        <div className="bg-gradient-brand text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-red-900/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="cursor-pointer text-amber-200 hover:text-white transition-colors" onClick={() => onNavigate('/')}>होम</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-white font-extrabold">श्रेणी: {categoryObj?.nameHindi || categorySlug}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-serif-devanagari text-white drop-shadow-sm tracking-wide">
            {categoryObj?.nameHindi || 'ताज़ा समाचार'}
          </h1>
          <p className="text-xs sm:text-sm text-red-100 font-semibold opacity-95">
            त्रिकाल दर्शन समाचार निष्पक्ष एवं विश्वसनीय मुख्य बुलेटिन
          </p>
        </div>

        <AdvertisementContainer type="top_banner" />

        {/* News Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <NewsCard key={art.id} article={art} onSelect={onSelectArticle} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-amber-900/20 rounded-2xl p-12 text-center space-y-3">
            <h3 className="font-bold text-lg text-gray-800 font-serif-devanagari">
              इस श्रेणी में समाचार अपडेट किए जा रहे हैं।
            </h3>
            <p className="text-xs text-gray-500">
              त्रिकाल दर्शन संवाददाता ग्राउंड जीरो से ताज़ा अपडेट्स भेज रहे हैं।
            </p>
            <button
              onClick={() => onNavigate('/')}
              className="px-5 py-2 bg-[#B7652A] text-white font-bold rounded-lg text-xs"
            >
              मुख्य पृष्ठ पर जाएं
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
