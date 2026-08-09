import React from 'react';
import { Clock, Eye, MapPin, User, PlayCircle, Camera, Flame } from 'lucide-react';
import { NewsArticle } from '../../types/news';

interface CardProps {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
  index?: number;
}

// 1. FEATURED HERO CARD
export const FeaturedNewsCard: React.FC<CardProps> = ({ article, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(article)}
      className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow border border-gray-200 hover:shadow-xl hover:border-[#D71920]/40 transition duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-900">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-[#D71920] text-white px-3 py-1 rounded text-xs font-bold uppercase shadow-md">
            {article.categoryName}
          </span>
          {article.isBreaking && (
            <span className="bg-white text-[#D71920] px-2.5 py-1 rounded text-xs font-black flex items-center gap-1 border-2 border-red-200 shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-[#D71920] text-[#D71920]" />
              बड़ी खबर
            </span>
          )}
        </div>

        {(article.districtName || article.stateName) && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-medium border border-gray-700">
            <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
            <span>{article.cityName || article.districtName || article.stateName}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-[#D71920] leading-snug transition">
            {article.title}
          </h2>
          {article.summary && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {article.summary}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-gray-700">
              <User className="w-3.5 h-3.5 text-[#D71920]" />
              {article.reporterName || article.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {new Date(article.publishDate).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[#D71920] font-bold">
            <Eye className="w-3.5 h-3.5" />
            {article.views}
          </span>
        </div>
      </div>
    </div>
  );
};

// 2. STANDARD NEWS CARD
export const NewsCard: React.FC<CardProps> = ({ article, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(article)}
      className="group cursor-pointer bg-white rounded-md overflow-hidden border border-gray-200 hover:border-[#D71920]/50 hover:shadow transition duration-200 flex flex-col h-full"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-[#D71920] text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {article.categoryName}
          </span>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <h3 className="font-bold text-sm lg:text-base text-gray-900 group-hover:text-[#D71920] leading-snug line-clamp-2">
          {article.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1 truncate max-w-[120px]">
            <MapPin className="w-3 h-3 text-[#D71920]" />
            {article.districtName || article.stateName || 'विशेष'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(article.publishDate).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};

// 3. COMPACT HORIZONTAL CARD
export const CompactNewsCard: React.FC<CardProps> = ({ article, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(article)}
      className="group cursor-pointer bg-white p-2.5 rounded-md border border-gray-200 hover:border-[#D71920]/40 hover:bg-red-50/30 transition flex gap-3 items-center"
    >
      <div className="w-20 h-16 sm:w-24 sm:h-18 shrink-0 rounded overflow-hidden bg-gray-200">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
          loading="lazy"
        />
      </div>
      <div className="flex-1 space-y-1">
        <span className="text-[10px] font-bold text-[#D71920] uppercase">
          {article.categoryName}
        </span>
        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#D71920] line-clamp-2 leading-snug">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span>{article.districtName || article.stateName || 'ताज़ा'}</span>
          <span>•</span>
          <span>{new Date(article.publishDate).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

// 4. TRENDING NUMBERED CARD
export const TrendingNewsCard: React.FC<CardProps> = ({ article, onSelect, index = 1 }) => {
  return (
    <div
      onClick={() => onSelect(article)}
      className="group cursor-pointer p-3 rounded hover:bg-red-50/40 transition flex items-start gap-3 border-b border-gray-100"
    >
      <span className="text-2xl font-black text-[#D71920] shrink-0 w-8 text-center font-mono">
        0{index + 1}
      </span>
      <div className="flex-1 space-y-1">
        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#D71920] line-clamp-2 leading-snug">
          {article.title}
        </h4>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="text-[#D71920] font-semibold">{article.categoryName}</span>
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3 text-gray-400" />
            {article.views}
          </span>
        </div>
      </div>
    </div>
  );
};

// 5. VIDEO NEWS CARD
export const VideoNewsCard: React.FC<CardProps> = ({ article, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(article)}
      className="group cursor-pointer bg-white border border-red-100 rounded-lg overflow-hidden hover:border-[#D71920] transition duration-300 shadow-sm hover:shadow-md text-gray-900"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-900">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 opacity-90 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition">
          <div className="w-12 h-12 rounded-full bg-[#D71920] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">
            <PlayCircle className="w-8 h-8 fill-white text-[#D71920]" />
          </div>
        </div>
        <span className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded border border-gray-700">
          VIDEO 02:45
        </span>
      </div>
      <div className="p-3.5 space-y-1.5">
        <span className="text-[10px] font-bold text-[#D71920] uppercase tracking-wider">
          {article.categoryName}
        </span>
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#D71920] line-clamp-2 leading-snug">
          {article.title}
        </h4>
      </div>
    </div>
  );
};

// 6. PHOTO STORY CARD
export const PhotoStoryCard: React.FC<CardProps> = ({ article, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(article)}
      className="group cursor-pointer relative aspect-square rounded-lg overflow-hidden shadow border border-gray-200"
    >
      <img
        src={article.featuredImage}
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      
      <div className="absolute top-3 right-3 bg-[#D71920] text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 shadow">
        <Camera className="w-3.5 h-3.5 text-white" />
        <span>फोटो स्टोरी</span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 space-y-1 text-white">
        <span className="text-[10px] font-bold text-red-300 uppercase">
          {article.cityName || article.districtName || 'फोटो कवरेज'}
        </span>
        <h4 className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-red-300">
          {article.title}
        </h4>
      </div>
    </div>
  );
};
