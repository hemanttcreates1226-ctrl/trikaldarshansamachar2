import React, { useState, useEffect } from 'react';
import { Share2, Save, Check, ExternalLink } from 'lucide-react';
import { NewsService } from '../../../services/newsService';
import { SocialLink } from '../../../types/news';

export const SocialManagerView: React.FC = () => {
  const [links, setLinks] = useState({
    facebook: 'https://facebook.com/trikaldarshan',
    youtube: 'https://youtube.com/c/trikaldarshan',
    whatsappChannel: 'https://whatsapp.com/channel/0029VaA123',
    telegram: 'https://t.me/trikaldarshan',
    instagram: 'https://instagram.com/trikaldarshan',
    twitter: 'https://x.com/trikaldarshan'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = NewsService.getSettings();
    const socialArr = NewsService.getSocialLinks();

    const findUrl = (plat: string, fallback: string) => {
      const match = socialArr.find(item => item.platform.toLowerCase() === plat.toLowerCase());
      return match?.url || fallback;
    };

    setLinks({
      facebook: s.socialLinks?.facebook || findUrl('facebook', 'https://facebook.com/trikaldarshan'),
      youtube: s.socialLinks?.youtube || findUrl('youtube', 'https://youtube.com/c/trikaldarshan'),
      whatsappChannel: s.socialLinks?.whatsappChannel || findUrl('whatsapp', 'https://whatsapp.com/channel/0029VaA123'),
      telegram: s.socialLinks?.telegram || findUrl('telegram', 'https://t.me/trikaldarshan'),
      instagram: s.socialLinks?.instagram || findUrl('instagram', 'https://instagram.com/trikaldarshan'),
      twitter: s.socialLinks?.twitter || findUrl('twitter', 'https://x.com/trikaldarshan')
    });
  }, []);

  const sanitizeUrl = (url: string) => {
    if (!url) return '';
    let clean = url.trim();
    if (!clean) return '';
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = {
      facebook: sanitizeUrl(links.facebook),
      youtube: sanitizeUrl(links.youtube),
      whatsappChannel: sanitizeUrl(links.whatsappChannel),
      telegram: sanitizeUrl(links.telegram),
      instagram: sanitizeUrl(links.instagram),
      twitter: sanitizeUrl(links.twitter)
    };

    // 1. Update Website Settings
    const current = NewsService.getSettings();
    NewsService.updateSettings({ ...current, socialLinks: cleaned });

    // 2. Update Social Links Array for Footer Icons
    const socialArray: SocialLink[] = [
      { id: 'soc-1', platform: 'youtube', label: 'YouTube Live Channel', url: cleaned.youtube, isEnabled: true },
      { id: 'soc-2', platform: 'facebook', label: 'Facebook Official Page', url: cleaned.facebook, isEnabled: true },
      { id: 'soc-3', platform: 'whatsapp', label: 'WhatsApp Official Channel', url: cleaned.whatsappChannel, isEnabled: true },
      { id: 'soc-4', platform: 'telegram', label: 'Telegram News Alerts', url: cleaned.telegram, isEnabled: true },
      { id: 'soc-5', platform: 'instagram', label: 'Instagram Stories', url: cleaned.instagram, isEnabled: true },
      { id: 'soc-6', platform: 'twitter', label: 'X (Twitter)', url: cleaned.twitter, isEnabled: true }
    ];
    NewsService.saveSocialLinks(socialArray);

    setLinks(cleaned);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestLink = (rawUrl: string) => {
    const formatted = sanitizeUrl(rawUrl);
    if (formatted && formatted !== '#') {
      window.open(formatted, '_blank', 'noopener,noreferrer');
    } else {
      alert('कृपया वैध URL दर्ज करें!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-red-200 pb-4">
        <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-[#D71920]" />
          <span>सोशल मीडिया लिंक्स (Social Media Configuration)</span>
        </h2>
        <p className="text-xs text-gray-600 font-medium">
          वेबसाइट हेडर, फुटर एवं शेयर बटन्स में प्रयुक्त आधिकारिक सोशल मीडिया चैनल्स की लिंक प्रबंधित करें।
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl bg-white border border-red-100 rounded-2xl p-6 space-y-4 text-xs shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-gray-800 font-bold">WhatsApp चैनल लिंक (WhatsApp Channel)</label>
            <button
              type="button"
              onClick={() => handleTestLink(links.whatsappChannel)}
              className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>जांचें (Test Link)</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="https://whatsapp.com/channel/..."
            value={links.whatsappChannel}
            onChange={(e) => setLinks({ ...links, whatsappChannel: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-emerald-700 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-gray-800 font-bold">YouTube चैनल लिंक (Live Video News)</label>
            <button
              type="button"
              onClick={() => handleTestLink(links.youtube)}
              className="text-[11px] text-red-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>जांचें (Test Link)</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="https://youtube.com/c/..."
            value={links.youtube}
            onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-red-700 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-gray-800 font-bold">Telegram चैनल लिंक (Instant Updates)</label>
            <button
              type="button"
              onClick={() => handleTestLink(links.telegram)}
              className="text-[11px] text-sky-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>जांचें (Test Link)</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="https://t.me/..."
            value={links.telegram}
            onChange={(e) => setLinks({ ...links, telegram: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-sky-700 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-gray-800 font-bold">Facebook पेज लिंक</label>
            <button
              type="button"
              onClick={() => handleTestLink(links.facebook)}
              className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>जांचें (Test Link)</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="https://facebook.com/..."
            value={links.facebook}
            onChange={(e) => setLinks({ ...links, facebook: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-blue-700 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-gray-800 font-bold">Instagram प्रोफ़ाइल लिंक</label>
            <button
              type="button"
              onClick={() => handleTestLink(links.instagram)}
              className="text-[11px] text-pink-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>जांचें (Test Link)</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="https://instagram.com/..."
            value={links.instagram}
            onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-pink-700 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-gray-800 font-bold">X (Twitter) प्रोफ़ाइल लिंक</label>
            <button
              type="button"
              onClick={() => handleTestLink(links.twitter)}
              className="text-[11px] text-gray-800 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>जांचें (Test Link)</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="https://x.com/..."
            value={links.twitter}
            onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-gray-800 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs shadow-md hover:opacity-95 flex items-center gap-2 cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'सेटिंग्स सुरक्षित हो गईं!' : 'लिंक्स सुरक्षित करें (Save Changes)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
