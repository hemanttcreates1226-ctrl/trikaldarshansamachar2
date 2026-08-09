import React from 'react';
import { ShieldAlert, ChevronRight, Award, Flame } from 'lucide-react';
import { NewsArticle } from '../../types/news';

interface SpecialReportsSectionProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onNavigateSpecialPage: () => void;
}

export const SpecialReportsSection: React.FC<SpecialReportsSectionProps> = ({
  articles,
  onSelectArticle,
  onNavigateSpecialPage
}) => {
  const specials = articles.filter(a => a.isSpecialReport || a.categorySlug === 'special-reports').slice(0, 3);

  if (specials.length === 0) return null;

  return (
    <section className="py-10 px-4 bg-gradient-to-b from-red-50/70 via-white to-red-50/40 text-gray-900 border-y border-red-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-red-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-[#D71920] to-[#A80F16] text-white rounded-lg shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                विशेष रिपोर्ट एवं ग्राउंड इन्वेस्टिगेशन (Special Reports)
              </h2>
              <p className="text-xs text-gray-600 font-medium">
                निष्पक्ष पत्रकारिता, खोजी रिपोर्टिंग और सत्य की पड़ताल
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateSpecialPage}
            className="text-xs font-bold text-[#D71920] hover:text-[#A80F16] flex items-center gap-1 cursor-pointer"
          >
            <span>सभी विशेष रिपोर्ट</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Special Reports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {specials.map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="group cursor-pointer bg-white border border-red-100 hover:border-[#D71920] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <span className="absolute top-3 left-3 bg-gradient-to-r from-[#D71920] to-[#E52B32] text-white font-black text-[10px] px-2.5 py-1 rounded shadow-md uppercase tracking-wider">
                  EXCLUSIVE
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#D71920]">
                    {art.cityName || art.districtName || 'ग्राउंड रिपोर्ट'}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#D71920] line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-red-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span>रिपोर्टर: {art.authorName}</span>
                  <span className="text-[#D71920] font-black">पढ़ें →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
