import React, { useState, useEffect } from 'react';
import {
  Clock,
  Eye,
  MapPin,
  User,
  Share2,
  Volume2,
  VolumeX,
  Type,
  ArrowLeft,
  MessageSquare,
  Send,
  Bookmark,
  Check,
  Building2,
  Copy,
  Printer
} from 'lucide-react';
import { NewsArticle } from '../types/news';
import { NewsService } from '../services/newsService';
import { NewsCard } from '../components/news/NewsCard';
import { AdvertisementContainer } from '../components/news/AdvertisementContainer';
import { handleImageError } from '../lib/imageFallback';

interface ArticleDetailPageProps {
  articleIdOrSlug: string;
  onNavigate: (path: string, params?: Record<string, string>) => void;
  onSelectArticle: (article: NewsArticle) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  articleIdOrSlug,
  onNavigate,
  onSelectArticle
}) => {
  const [article, setArticle] = useState<NewsArticle | null>(() => NewsService.getArticleByIdOrSlug(articleIdOrSlug));
  const [loading, setLoading] = useState<boolean>(() => !NewsService.getArticleByIdOrSlug(articleIdOrSlug));
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');
  const [comments, setComments] = useState<Array<{ name: string; text: string; date: string }>>([
    { name: 'रामप्रसाद शर्मा', text: 'बहुत ही सटीक और निष्पक्ष खबर। उज्जैन में यह विकास कार्य समय पर होना चाहिए।', date: '07 अगस्त 2026' }
  ]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadArticle = async () => {
      // 1. Check local cache
      const local = NewsService.getArticleByIdOrSlug(articleIdOrSlug);
      if (local) {
        if (isMounted) {
          setArticle(local);
          setLoading(false);
        }
        return;
      }

      // 2. Fetch asynchronously from server if not found in local cache
      if (isMounted) setLoading(true);
      const serverFetched = await NewsService.fetchArticleAsync(articleIdOrSlug);
      if (isMounted) {
        setArticle(serverFetched);
        setLoading(false);
      }
    };

    loadArticle();
    window.scrollTo(0, 0);

    const handleUpdate = () => {
      const updated = NewsService.getArticleByIdOrSlug(articleIdOrSlug);
      if (updated && isMounted) {
        setArticle(updated);
        setLoading(false);
      }
    };

    window.addEventListener('tds_data_updated', handleUpdate);

    if ('speechSynthesis' in window) {
      setSpeechSynth(window.speechSynthesis);
    }

    return () => {
      isMounted = false;
      window.removeEventListener('tds_data_updated', handleUpdate);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [articleIdOrSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#D71920] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 font-bold text-sm">समाचार लोड हो रहा है...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif-devanagari text-gray-800">
          समाचार उपलब्ध नहीं है या हटा दिया गया है।
        </h2>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-[#D71920] hover:bg-[#b01319] text-white rounded-lg font-bold text-sm transition shadow-sm cursor-pointer"
        >
          मुख्य पृष्ठ पर लौटें
        </button>
      </div>
    );
  }

  const handleToggleAudio = () => {
    if (!speechSynth) return;

    if (isPlayingAudio) {
      speechSynth.cancel();
      setIsPlayingAudio(false);
    } else {
      const textToRead = `${article.title}। ${article.summary}। ${article.content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      speechSynth.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      setComments([
        {
          name: commentName.trim() || 'पाठक',
          text: commentText.trim(),
          date: new Date().toLocaleDateString('hi-IN')
        },
        ...comments
      ]);
      setCommentText('');
      setCommentName('');
    }
  };

  const fontClasses = {
    sm: 'text-sm sm:text-base leading-[1.7]',
    base: 'text-base sm:text-lg leading-[1.7]',
    lg: 'text-lg sm:text-xl leading-[1.7]',
    xl: 'text-xl sm:text-2xl leading-[1.7]'
  }[fontSize];

  const relatedArticles = NewsService.getArticles({
    categorySlug: article.categorySlug,
    limit: 3
  }).filter(a => a.id !== article.id);

  const shareText = encodeURIComponent(`${article.title}\n\nपढ़ें त्रिकाल दर्शन समाचार पर: `);
  const shareUrl = encodeURIComponent(window.location.href);

  return (
    <article className="py-8 px-4 bg-white text-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button & Category Breadcrumb */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#B7652A] hover:text-[#F28C28] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्य पृष्ठ</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#151515] text-[#FFB347] font-bold px-3 py-1 rounded-md">
              {article.categoryName}
            </span>
            {(article.cityName || article.districtName) && (
              <span className="bg-amber-100 text-[#B7652A] font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#F28C28]" />
                {article.cityName || article.districtName}
              </span>
            )}
          </div>
        </div>

        {/* Headline & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif-devanagari text-[#080808] leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <h2 className="text-base sm:text-lg font-medium text-gray-600 font-serif-devanagari leading-snug border-l-4 border-[#B7652A] pl-3">
              {article.subtitle}
            </h2>
          )}
        </div>

        {/* Meta Bar: Author, Date, Views, Audio Reader & Font Size Controls */}
        <div className="bg-[#FBF8F3] border border-amber-900/10 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Reporter / Author Info */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-500 font-medium">रिपोर्ट:</span>
              <span className="font-bold text-gray-900 text-sm">{article.reporterName || article.authorName}</span>
            </div>
            <p className="text-[11px] text-gray-500">त्रिकाल दर्शन समाचार टीम</p>
          </div>

          {/* Time & Views */}
          <div className="flex items-center gap-4 text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#B7652A]" />
              {new Date(article.publishDate).toLocaleDateString('hi-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-800">
              <Eye className="w-3.5 h-3.5 text-[#F28C28]" />
              {article.views} बार देखा गया
            </span>
          </div>

          {/* Audio TTS Reader & Font Resizer */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAudio}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                isPlayingAudio
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-[#B7652A] hover:bg-[#F28C28] text-white shadow'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'ऑडियो बंद करें' : 'समाचार सुनें'}</span>
            </button>

            {/* Font Size Selector */}
            <div className="flex items-center bg-white border border-red-200 rounded-lg p-0.5 font-mono text-[11px] shadow-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${fontSize === 'sm' ? 'bg-[#D71920] text-white font-bold' : 'text-gray-700 hover:bg-red-50'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${fontSize === 'base' ? 'bg-[#D71920] text-white font-bold' : 'text-gray-700 hover:bg-red-50'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${fontSize === 'lg' ? 'bg-[#D71920] text-white font-bold' : 'text-gray-700 hover:bg-red-50'}`}
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-xl overflow-hidden shadow-lg border border-red-100">
          <img
            src={article.featuredImage}
            alt={article.title}
            onError={handleImageError}
            className="w-full h-auto max-h-[480px] object-cover"
          />
          <div className="bg-red-50/90 text-[#D71920] text-xs p-2.5 flex items-center justify-between font-bold border-t border-red-200">
            <span>फोटो: त्रिकाल दर्शन स्पेशल कवरेज</span>
            <span>{article.cityName || article.districtName || 'उज्जैन'}</span>
          </div>
        </div>

        {/* Ad Banner inside Article */}
        <AdvertisementContainer type="article" />

        {/* Article Body Content Reading Container (Constrained max 800px centered for optimal Hindi readability) */}
        <div className={`max-w-[800px] mx-auto font-serif-devanagari text-gray-900 ${fontClasses} tracking-wide my-8`}>
          {article.content.split(/\n\s*\n/).map((paragraph, idx) => (
            <p key={idx} className="leading-[1.7] text-gray-800 font-normal mb-6">
              {paragraph.trim()}
            </p>
          ))}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-4 border-t border-red-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-600">टैग्स:</span>
            {article.tags.map((tag, idx) => (
              <span key={idx} className="bg-red-50 text-[#D71920] border border-red-200 px-3 py-1 rounded-full text-xs font-bold">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Share Strip */}
        <div className="bg-gradient-to-r from-red-50/80 via-white to-red-50/80 text-gray-900 border border-red-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#D71920]" />
            <span className="font-extrabold text-sm font-serif-devanagari">इस खबर को शेयर करें:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`https://api.whatsapp.com/send?text=${shareText}${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
              </svg>
              <span>WhatsApp</span>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              Facebook
            </a>
            <a
              href={`https://telegram.me/share/url?url=${shareUrl}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              Telegram
            </a>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 bg-white border border-red-200 text-[#D71920] rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-red-50 transition shadow-xs cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'कॉपी हो गया' : 'लिंक कॉपी करें'}</span>
            </button>
          </div>
        </div>

        {/* Reader Comments Section */}
        <div className="pt-8 border-t border-gray-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-serif-devanagari text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#B7652A]" />
              <span>पाठकों की राय ({comments.length})</span>
            </h3>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="आपका नाम..."
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg p-2 text-xs focus:border-[#B7652A] outline-none"
              />
            </div>
            <textarea
              rows={3}
              placeholder="खबर पर अपनी प्रतिक्रिया व्यक्त करें..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs focus:border-[#B7652A] outline-none"
            ></textarea>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-[#B7652A] to-[#F28C28] text-white font-bold rounded-lg text-xs shadow hover:opacity-90 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>टिप्पणी भेजें</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((c, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-gray-900">
                  <span>{c.name}</span>
                  <span className="text-[10px] text-gray-400 font-normal">{c.date}</span>
                </div>
                <p className="text-gray-700 font-serif-devanagari">{c.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related News Stream */}
        {relatedArticles.length > 0 && (
          <div className="pt-8 border-t border-gray-200 space-y-4">
            <h3 className="text-xl font-bold font-serif-devanagari text-gray-900 border-l-4 border-[#B7652A] pl-3">
              संबंधित समाचार (Related News)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((art) => (
                <NewsCard key={art.id} article={art} onSelect={onSelectArticle} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
