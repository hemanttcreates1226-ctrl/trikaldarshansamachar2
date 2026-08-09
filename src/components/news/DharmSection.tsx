import React from 'react';
import { Sparkles, Sun, Moon, Calendar, Flame, ChevronRight } from 'lucide-react';
import { NewsArticle, PanchangInfo } from '../../types/news';
import { NewsService } from '../../services/newsService';
import { CompactNewsCard } from './NewsCard';

interface DharmSectionProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onNavigateReligionPage: () => void;
}

export const DharmSection: React.FC<DharmSectionProps> = ({
  articles,
  onSelectArticle,
  onNavigateReligionPage
}) => {
  const panchang: PanchangInfo = NewsService.getPanchang();
  const dharmArticles = articles.filter(a => a.categorySlug === 'religion' || a.tags.includes('धर्म')).slice(0, 3);

  return (
    <section className="py-8 px-4 bg-white border-b border-red-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b-2 border-[#D71920] pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-[#D71920] to-[#A80F16] text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                धर्म एवं आध्यात्म (Religion & Culture)
              </h2>
              <p className="text-xs text-gray-600 font-medium">
                महाकाल ज्योतिर्लिंग, पंचांग, तीर्थ एवं धार्मिक महोत्सव समाचार
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateReligionPage}
            className="text-xs font-bold text-[#D71920] hover:text-[#A80F16] flex items-center gap-1 cursor-pointer"
          >
            <span>सभी धार्मिक समाचार</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Religious News Section */}
        <div className="space-y-4">
          <h3 className="font-black text-sm text-gray-900 border-b border-red-100 pb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D71920]"></span>
            तीर्थ क्षेत्र एवं मंदिर समाचार
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dharmArticles.length > 0 ? (
              dharmArticles.map((art) => (
                <CompactNewsCard key={art.id} article={art} onSelect={onSelectArticle} />
              ))
            ) : (
              <p className="text-xs text-gray-500 italic p-4 col-span-3">धार्मिक अपडेट्स लोड हो रहे हैं...</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
