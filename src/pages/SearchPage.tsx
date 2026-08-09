import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Eye } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { NewsService } from '../services/newsService';
import { NewsCard } from '../components/news/NewsCard';

interface SearchPageProps {
  initialQuery?: string;
  onSelectArticle: (article: NewsArticle) => void;
  onNavigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onSelectArticle, onNavigate }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<NewsArticle[]>([]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    const matched = NewsService.getArticles({
      searchQuery: trimmed,
      limit: 30
    });
    setResults(matched);
  };

  return (
    <div className="py-8 px-4 bg-[#FFFDF9] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Bar Banner */}
        <div className="bg-gradient-brand text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-red-900/40 space-y-4">
          <h1 className="text-2xl font-black font-serif-devanagari text-white drop-shadow-sm">
            समाचार खोजें (Search Portal)
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="उज्जैन, मंदिर, व्यापार, महाकाल, बजट, क्राइम खोजें..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#1A1008] border border-[#B7652A] text-white placeholder-gray-400 rounded-xl py-3 pl-4 pr-10 text-sm focus:border-[#FFB347] outline-none font-medium"
              />
              <Search className="w-5 h-5 text-[#F28C28] absolute right-3 top-3.5" />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#B7652A] to-[#F28C28] text-white font-bold rounded-xl text-sm shadow hover:opacity-95 shrink-0"
            >
              खोजें (Search)
            </button>
          </form>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 text-xs">
          <span className="font-bold text-gray-700">
            खोज परिणाम: {results.length} समाचार मिले
          </span>
        </div>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((art) => (
              <NewsCard key={art.id} article={art} onSelect={onSelectArticle} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center space-y-2">
            <Search className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-base text-gray-800 font-serif-devanagari">
              कोई समाचार नहीं मिला
            </h3>
            <p className="text-xs text-gray-500">
              अन्य कीवर्ड दर्ज करके पुनः प्रयास करें।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
