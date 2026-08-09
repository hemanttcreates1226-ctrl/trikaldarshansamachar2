import React, { useState, useEffect } from 'react';
import { Share2, Save, Check } from 'lucide-react';
import { NewsService } from '../../../services/newsService';

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
    if (s.socialLinks) {
      setLinks(s.socialLinks);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const current = NewsService.getSettings();
    NewsService.updateSettings({ ...current, socialLinks: links });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          <label className="block text-gray-800 font-bold mb-1">WhatsApp चैनल लिंक (WhatsApp Channel)</label>
          <input
            type="url"
            value={links.whatsappChannel}
            onChange={(e) => setLinks({ ...links, whatsappChannel: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-emerald-700 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div>
          <label className="block text-gray-800 font-bold mb-1">YouTube चैनल लिंक (Live Video News)</label>
          <input
            type="url"
            value={links.youtube}
            onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-red-700 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div>
          <label className="block text-gray-800 font-bold mb-1">Telegram चैनल लिंक (Instant Updates)</label>
          <input
            type="url"
            value={links.telegram}
            onChange={(e) => setLinks({ ...links, telegram: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-sky-700 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div>
          <label className="block text-gray-800 font-bold mb-1">Facebook पेज लिंक</label>
          <input
            type="url"
            value={links.facebook}
            onChange={(e) => setLinks({ ...links, facebook: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-blue-700 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div>
          <label className="block text-gray-800 font-bold mb-1">Instagram प्रोफ़ाइल लिंक</label>
          <input
            type="url"
            value={links.instagram}
            onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 text-pink-700 font-mono font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
          />
        </div>

        <div>
          <label className="block text-gray-800 font-bold mb-1">X (Twitter) प्रोफ़ाइल लिंक</label>
          <input
            type="url"
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
