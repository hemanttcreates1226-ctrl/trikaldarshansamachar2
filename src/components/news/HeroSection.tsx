import React from 'react';
import { Flame, TrendingUp, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { FeaturedNewsCard, CompactNewsCard, TrendingNewsCard } from './NewsCard';

interface HeroSectionProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onNavigateCategory: (slug: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  articles,
  onSelectArticle,
  onNavigateCategory
}) => {
  if (articles.length === 0) return null;

  const primaryHero = articles[0];
  const sideLeads = articles.slice(1, 3);
  const trendingList = articles.slice(0, 5).sort((a, b) => b.views - a.views);

  return (
    <section className="py-6 px-4 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b-2 border-[#D71920] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#D71920] rounded-full"></span>
            <h2 className="text-xl sm:text-2xl font-black text-[#111111]">
              प्रमुख समाचार एवं विश्लेषणात्मक रिपोर्ट
            </h2>
          </div>
          <span className="text-xs font-bold text-[#D71920] flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-[#D71920]" />
            लाइव सम्पादकीय कवरेज
          </span>
        </div>

        {/* Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Primary Hero Article (LEFT 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            {primaryHero && (
              <FeaturedNewsCard article={primaryHero} onSelect={onSelectArticle} />
            )}
          </div>

          {/* Secondary Lead Articles (RIGHT 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="bg-gradient-to-r from-[#D71920] to-[#E52B32] text-white px-3.5 py-2 rounded-t-lg font-extrabold text-xs uppercase flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>महत्वपूर्ण खबरें</span>
            </div>
            {sideLeads.map((art) => (
              <CompactNewsCard key={art.id} article={art} onSelect={onSelectArticle} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
