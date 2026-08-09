import React, { useState, useEffect } from 'react';
import { Flame, ChevronLeft, ChevronRight, Volume2, VolumeX, Pause, Play, AlertCircle } from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { NewsService } from '../../services/newsService';

interface BreakingNewsBarProps {
  onSelectArticle: (article: NewsArticle) => void;
}

export const BreakingNewsBar: React.FC<BreakingNewsBarProps> = ({ onSelectArticle }) => {
  const [breakingArticles, setBreakingArticles] = useState<NewsArticle[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal'>('slow');

  useEffect(() => {
    const fetchBreaking = () => {
      const articles = NewsService.getArticles({ isBreaking: true, limit: 10 });
      setBreakingArticles(articles);
    };

    fetchBreaking();
    window.addEventListener('tds_data_updated', fetchBreaking);
    return () => window.removeEventListener('tds_data_updated', fetchBreaking);
  }, []);

  if (breakingArticles.length === 0) return null;

  // Duplicate items for continuous seamless looping
  const tickerItems = [...breakingArticles, ...breakingArticles];
  const animationDurationSeconds = speed === 'slow' 
    ? Math.max(40, breakingArticles.length * 12) 
    : Math.max(25, breakingArticles.length * 7);

  return (
    <div className="bg-[#D71920] text-white py-2 flex shrink-0 shadow-md border-b border-red-800 relative z-20">
      <div className="max-w-7xl mx-auto flex items-center gap-3 w-full px-4 overflow-hidden">
        {/* Breaking News Badge */}
        <div className="bg-white text-[#D71920] px-3 py-1 font-black text-xs uppercase tracking-wider shrink-0 flex items-center gap-1.5 rounded-md shadow-sm border border-red-200 z-10">
          <Flame className="w-3.5 h-3.5 fill-[#D71920] text-[#D71920] animate-pulse" />
          <span>बड़ी खबर</span>
        </div>

        {/* Running Text Marquee Container */}
        <div
          className="flex-1 overflow-hidden relative cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="animate-marquee-slow flex items-center gap-8 text-sm font-semibold tracking-wide"
            style={{
              animationDuration: `${animationDurationSeconds}s`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {tickerItems.map((article, idx) => (
              <div
                key={`${article.id}-${idx}`}
                onClick={() => onSelectArticle(article)}
                className="inline-flex items-center gap-2 hover:text-yellow-200 transition-colors shrink-0 group"
              >
                <span className="bg-red-900/60 text-yellow-300 text-[11px] font-bold px-2 py-0.5 rounded border border-red-400/40">
                  {article.districtName || article.stateName || 'ताज़ा खबर'}
                </span>
                <span className="text-white group-hover:underline font-bold">
                  {article.title}
                </span>
                <span className="text-yellow-400/80 text-xs ml-2">✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
