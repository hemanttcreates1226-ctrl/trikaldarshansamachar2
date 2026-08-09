import React, { useState, useEffect } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { Advertisement, AdType } from '../../../types/news';
import { NewsService } from '../../../services/newsService';

export const AdsManagerView: React.FC = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80');
  const [targetUrl, setTargetUrl] = useState('#');
  const [type, setType] = useState<AdType>('top_banner');

  useEffect(() => {
    setAds(NewsService.getAdvertisements());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    NewsService.addAdvertisement({
      title,
      imageUrl,
      targetUrl,
      type,
      isActive: true,
      startDate: new Date().toISOString()
    });

    setTitle('');
    setAds(NewsService.getAdvertisements());
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-red-200 pb-4">
        <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[#D71920]" />
          <span>विज्ञापन प्रबंधन (Ads Management)</span>
        </h2>
        <p className="text-xs text-gray-600 font-medium">वेबसाइट पर विज्ञापन बैनर एवं प्रायोजक लिंक अपलोड करें।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <form onSubmit={handleAdd} className="md:col-span-5 bg-white border border-red-100 rounded-2xl p-5 space-y-3 text-xs shadow-xs">
          <h3 className="font-black text-sm text-[#D71920] font-serif-devanagari border-b border-red-100 pb-2">नया विज्ञापन जोड़ें</h3>

          <div>
            <label className="block text-gray-800 font-bold mb-1">विज्ञापन शीर्षक *</label>
            <input
              type="text"
              required
              placeholder="उदा. महाकाल ज्वेलर्स दीपोत्सव ऑफर"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">विज्ञापन स्थान (Position)</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AdType)}
              className="w-full bg-gray-50 border border-gray-300 text-[#D71920] font-bold rounded-lg p-2.5 outline-none"
            >
              <option value="top_banner">शीर्ष बैनर (Top Header Banner)</option>
              <option value="sidebar">साइडबार बैनर (Sidebar Box)</option>
              <option value="in_feed">इन-फीड बैनर (News Feed Ad)</option>
              <option value="article">समाचार पेज बैनर (Article Reader Ad)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">बैनर इमेज URL *</label>
            <input
              type="text"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-mono text-[11px] rounded-lg p-2.5 outline-none focus:border-[#D71920]"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">टारगेट वेबसाइट URL (Link)</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-mono text-[11px] rounded-lg p-2.5 outline-none focus:border-[#D71920]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>विज्ञापन प्रकाशित करें (Save Ad)</span>
          </button>
        </form>

        <div className="md:col-span-7 bg-white border border-red-100 rounded-2xl overflow-hidden shadow-xs p-4 space-y-3">
          <h3 className="font-black text-sm text-gray-900 font-serif-devanagari border-b border-red-100 pb-2">
            सक्रिय विज्ञापन ({ads.length})
          </h3>

          <div className="space-y-3">
            {ads.map((ad) => (
              <div key={ad.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-gray-900 font-serif-devanagari">{ad.title}</span>
                  <span className="bg-red-100 text-[#D71920] px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold">
                    {ad.type}
                  </span>
                </div>
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
