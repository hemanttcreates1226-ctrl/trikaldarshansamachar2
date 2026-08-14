import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Upload, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { NewsService } from '../../../services/newsService';
import { DEFAULT_LOGO_BASE64 } from '../../../assets/defaultLogoData';
import { TrikalLogo } from '../../brand/TrikalLogo';

export const SettingsManagerView: React.FC = () => {
  const [form, setForm] = useState({
    logoImageUrl: '',
    brandTitle: 'त्रिकाल दर्शन',
    brandBadgeText: 'समाचार',
    siteName: 'त्रिकाल दर्शन समाचार',
    tagline: 'सत्य की त्रिकाल दृष्टि',
    contactNumber: '+91 98260 12345',
    emergencyContact: '+91 94250 99999',
    contactEmail: 'trikaldarshannews72@gmail.com',
    address: 'कोठी रोड, जिला उज्जैन (म.प्र.) 456010',
    editorName: 'राकेश शर्मा (प्रधान सम्पादक)',
    breakingTickerSpeed: 10
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = NewsService.getSettings();
    const logoToUse = (s.logoImageUrl && s.logoImageUrl !== '/logo.png') ? s.logoImageUrl : DEFAULT_LOGO_BASE64;
    setForm({
      logoImageUrl: logoToUse,
      brandTitle: s.brandTitle || 'त्रिकाल दर्शन',
      brandBadgeText: s.brandBadgeText || 'समाचार',
      siteName: s.siteName || 'त्रिकाल दर्शन समाचार',
      tagline: s.taglineHindi || s.tagline || 'सत्य की त्रिकाल दृष्टि',
      contactNumber: s.contactNumber || '+91 98260 12345',
      emergencyContact: s.emergencyContact || '+91 94250 99999',
      contactEmail: s.contactEmail || 'trikaldarshannews72@gmail.com',
      address: s.address || 'कोठी रोड, उज्जैन',
      editorName: s.editorName || 'राकेश शर्मा',
      breakingTickerSpeed: s.breakingTickerSpeed || 10
    });
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setForm(prev => ({ ...prev, logoImageUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const current = NewsService.getSettings();
    NewsService.updateSettings({
      ...current,
      logoImageUrl: form.logoImageUrl,
      brandTitle: form.brandTitle,
      brandBadgeText: form.brandBadgeText,
      siteName: `${form.brandTitle} ${form.brandBadgeText}`,
      taglineHindi: form.tagline,
      tagline: form.tagline,
      contactNumber: form.contactNumber,
      emergencyContact: form.emergencyContact,
      contactEmail: form.contactEmail,
      address: form.address,
      editorName: form.editorName,
      breakingTickerSpeed: form.breakingTickerSpeed
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-red-200 pb-4">
        <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#D71920]" />
          <span>सामान्य एवं लोगो सेटिंग्स (Brand & Portal Control)</span>
        </h2>
        <p className="text-xs text-gray-600 font-medium">वेबसाइट का लोगो, मुख्य ब्रांड शीर्षक, टैगलाइन एवं संपर्क जानकारी कंट्रोल करें।</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Controls */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white border border-red-100 rounded-2xl p-6 space-y-5 text-xs font-medium shadow-xs">
          
          {/* Logo Control Section */}
          <div className="bg-red-50/50 p-4 rounded-xl border border-red-200 space-y-3">
            <label className="block text-[#D71920] font-black text-sm flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              <span>वेबसाइट लोगो इमेज (Admin Logo Control)</span>
            </label>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D71920] bg-white shrink-0 flex items-center justify-center shadow-xs">
                <img
                  src={form.logoImageUrl || DEFAULT_LOGO_BASE64}
                  alt="Logo Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_LOGO_BASE64;
                  }}
                />
              </div>

              <div className="flex-1 space-y-2 min-w-[200px]">
                <input
                  type="text"
                  placeholder="लोगो इमेज URL दर्ज करें..."
                  value={form.logoImageUrl}
                  onChange={(e) => setForm({ ...form, logoImageUrl: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2 outline-none font-mono text-xs focus:border-[#D71920]"
                />

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] hover:opacity-95 text-white rounded-lg cursor-pointer font-bold flex items-center gap-1.5 text-xs shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>इमेज अपलोड करें</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {form.logoImageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logoImageUrl: DEFAULT_LOGO_BASE64 })}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>रीसेट (Default Logo)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Heading & Tagline Control */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-800 mb-1 font-bold">मुख्य ब्रांड शीर्षक (Heading)</label>
              <input
                type="text"
                required
                value={form.brandTitle}
                onChange={(e) => setForm({ ...form, brandTitle: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 outline-none font-bold text-sm focus:border-[#D71920]"
              />
            </div>

            <div>
              <label className="block text-gray-800 mb-1 font-bold">बैज टेक्स्ट (Badge)</label>
              <input
                type="text"
                required
                value={form.brandBadgeText}
                onChange={(e) => setForm({ ...form, brandBadgeText: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 text-[#D71920] font-black rounded-lg p-2.5 outline-none text-sm focus:border-[#D71920]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-800 mb-1 font-bold">टैगलाइन (Tagline)</label>
            <input
              type="text"
              required
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 text-amber-800 rounded-lg p-2.5 outline-none font-serif-devanagari font-bold text-sm focus:border-[#D71920]"
            />
          </div>

          {/* Additional Contact Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-gray-800 mb-1 font-bold">प्रधान संपादक का नाम</label>
              <input
                type="text"
                value={form.editorName}
                onChange={(e) => setForm({ ...form, editorName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 outline-none font-bold focus:border-[#D71920]"
              />
            </div>

            <div>
              <label className="block text-gray-800 mb-1 font-bold">मुख्य कार्यालय फोन नंबर</label>
              <input
                type="text"
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 outline-none font-mono font-bold focus:border-[#D71920]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-800 mb-1 font-bold">मुख्य कार्यालय का पूरा पता</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 outline-none font-bold focus:border-[#D71920]"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'ब्रांड सेटिंग्स अपडेट हो गईं!' : 'ब्रांड सेटिंग्स सेव करें (Save All Changes)'}</span>
            </button>
          </div>
        </form>

        {/* Live Logo Preview Box */}
        <div className="lg:col-span-5 bg-white border border-red-200 rounded-2xl p-6 text-gray-900 shadow-sm space-y-4 sticky top-6">
          <div className="border-b border-red-100 pb-2 flex items-center justify-between">
            <span className="text-xs font-black text-[#D71920] uppercase tracking-wider">
              लाइव प्रीव्यू (Real-Time Header Logo)
            </span>
            <span className="text-[10px] bg-red-100 text-[#D71920] px-2 py-0.5 rounded font-bold">
              ADMIN CONTROLLED
            </span>
          </div>

          <div className="bg-red-50/50 border border-red-100 p-6 rounded-xl flex items-center justify-center">
            <TrikalLogo size="md" showTagline={true} />
          </div>

          <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="font-bold text-gray-800">वर्तमान ब्रांड कॉन्फिगरेशन:</p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px]">
              <li>शीर्षक: <strong className="text-gray-900">{form.brandTitle}</strong></li>
              <li>बैज: <strong className="text-[#D71920]">{form.brandBadgeText}</strong></li>
              <li>टैगलाइन: <strong className="text-amber-800">{form.tagline}</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

