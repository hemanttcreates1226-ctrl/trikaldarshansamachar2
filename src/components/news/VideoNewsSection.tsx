import React, { useState } from 'react';
import { Tv, PlayCircle, X, Eye, Flame, Share2 } from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { VideoNewsCard } from './NewsCard';

interface VideoNewsSectionProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const VideoNewsSection: React.FC<VideoNewsSectionProps> = ({
  articles,
  onSelectArticle
}) => {
  const [activeVideo, setActiveVideo] = useState<NewsArticle | null>(null);

  // Filter video articles or use first few articles
  const videoArticles = articles.filter(a => a.videoUrl || a.featuredImage).slice(0, 4);

  if (videoArticles.length === 0) return null;

  const featuredVideo = videoArticles[0];

  return (
    <section className="py-10 px-4 bg-gradient-to-b from-red-50/60 via-white to-red-50/50 text-gray-900 border-y border-red-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-red-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-[#D71920] to-[#A80F16] rounded-lg text-white shadow-md">
              <Tv className="w-6 h-6 text-white" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                त्रिकाल वीडियो बुलेटिन (Video News)
              </h2>
              <p className="text-xs text-gray-600 font-medium">
                ग्राउण्ड रिपोर्ट, ग्राउंड ज़ीरो साक्षात्कार एवं ताज़ा वीडियो बुलेटिन
              </p>
            </div>
          </div>
        </div>

        {/* Video Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Featured Video Player Box */}
          <div className="lg:col-span-7 bg-white border border-red-100 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition flex flex-col justify-between">
            <div className="relative aspect-video bg-gray-900 group cursor-pointer" onClick={() => setActiveVideo(featuredVideo)}>
              <img
                src={featuredVideo.featuredImage}
                alt={featuredVideo.title}
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D71920] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition duration-300">
                  <PlayCircle className="w-12 h-12 fill-white text-[#D71920]" />
                </div>
              </div>

              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-[#D71920] to-[#E52B32] text-white px-3 py-1 rounded text-xs font-black uppercase shadow-md">
                  विशेष वीडियो रिपोर्ट
                </span>
              </div>
            </div>

            <div className="p-5 space-y-2">
              <span className="text-xs font-bold text-[#D71920]">
                {featuredVideo.categoryName} • {featuredVideo.districtName || 'उज्जैन'}
              </span>
              <h3
                onClick={() => onSelectArticle(featuredVideo)}
                className="text-lg sm:text-xl font-extrabold text-gray-900 hover:text-[#D71920] transition cursor-pointer leading-snug"
              >
                {featuredVideo.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {featuredVideo.summary}
              </p>
            </div>
          </div>

          {/* Side Video Grid */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {videoArticles.slice(1).map((video) => (
              <VideoNewsCard key={video.id} article={video} onSelect={(art) => setActiveVideo(art)} />
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal Player Popup */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl text-gray-900">
            <div className="p-4 border-b border-red-100 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-[#D71920]" />
                <h3 className="font-bold text-sm sm:text-base line-clamp-1 text-gray-900">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-gray-500 hover:text-[#D71920] p-1 rounded-lg hover:bg-red-100 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="aspect-video bg-black relative">
              {activeVideo.videoUrl && activeVideo.videoUrl.includes('youtube') ? (
                <iframe
                  src={activeVideo.videoUrl.replace('watch?v=', 'embed/')}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-6 text-center bg-zinc-900 text-white">
                  <PlayCircle className="w-16 h-16 text-[#D71920] animate-pulse" />
                  <p className="font-bold text-base">त्रिकाल दर्शन समाचार वीडियो प्लेयर</p>
                  <p className="text-xs text-gray-300 max-w-md">
                    {activeVideo.summary || 'इस वीडियो रिपोर्ट का सम्पादकीय प्रसारण लोड हो रहा है।'}
                  </p>
                  <button
                    onClick={() => {
                      const v = activeVideo;
                      setActiveVideo(null);
                      onSelectArticle(v);
                    }}
                    className="px-5 py-2 rounded bg-[#D71920] hover:bg-[#A80F16] text-white font-bold text-xs transition cursor-pointer"
                  >
                    पूरा समाचार टेक्स्ट पढ़ें
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-red-50/80 flex items-center justify-between text-xs text-gray-700 font-medium border-t border-red-100">
              <span>संवाददाता: {activeVideo.reporterName || activeVideo.authorName}</span>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: activeVideo.title,
                      url: window.location.href
                    });
                  }
                }}
                className="flex items-center gap-1 text-[#D71920] hover:underline font-bold cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>शेयर करें</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
