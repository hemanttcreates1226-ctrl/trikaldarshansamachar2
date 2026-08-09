import React, { useState, useEffect } from 'react';
import { UserPlus, Award, Upload, CheckCircle2, AlertCircle, Copy, Check, FileText } from 'lucide-react';
import { State, District, ReporterRole } from '../types/news';
import { NewsService } from '../services/newsService';

interface JoinUsPageProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export const JoinUsPage: React.FC<JoinUsPageProps> = ({ onNavigate }) => {
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    dob: '1996-01-01',
    gender: 'पुरुष',
    mobile: '',
    email: '',
    address: '',
    stateId: 'st-mp',
    districtId: 'dt-ujn',
    qualification: '',
    experience: '',
    photoUrl: '',
    documentUrl: '',
    position: 'district_reporter' as ReporterRole,
    reason: ''
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('फोटो की साइज़ 5MB से कम होनी चाहिए!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('दस्तावेज की साइज़ 8MB से कम होनी चाहिए!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, documentUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const sts = NewsService.getStates();
    setStates(sts);
    setDistricts(NewsService.getDistricts(formData.stateId));
  }, [formData.stateId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile || !formData.address) {
      alert('कृपया सभी अनिवार्य फ़ील्ड भरें!');
      return;
    }

    if (!formData.photoUrl) {
      alert('कृपया अपनी पासपोर्ट साइज़ फोटो अपलोड करें!');
      return;
    }

    const stateObj = states.find(s => s.id === formData.stateId);
    const districtObj = districts.find(d => d.id === formData.districtId);

    const app = NewsService.submitApplication({
      ...formData,
      stateName: stateObj?.nameHindi || 'मध्य प्रदेश',
      districtName: districtObj?.nameHindi || 'उज्जैन'
    });

    setSubmittedAppId(app.id);
  };

  const handleCopyAppId = () => {
    if (submittedAppId) {
      navigator.clipboard.writeText(submittedAppId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="py-10 px-4 bg-[#FBF9F5] min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-brand text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-red-900/40 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-black/40 border border-amber-400/50 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>पत्रकारिता आवेदन पोर्टल</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif-devanagari text-white drop-shadow-sm">
            त्रिकाल दर्शन समाचार से जुड़ें (Join Our Media Team)
          </h1>
          <p className="text-xs sm:text-sm text-red-100 font-medium leading-relaxed max-w-2xl">
            यदि आप निष्पक्ष स्थानीय पत्रकारिता में रुचि रखते हैं और अपने जिला/तहसील क्षेत्र से सत्य की आवाज़ बनना चाहते हैं, तो नीचे दिया गया आवेदन पत्र भरें।
          </p>
        </div>

        {/* Successful Application Screen */}
        {submittedAppId ? (
          <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-serif-devanagari text-gray-900">
                आपका आवेदन सफलतापूर्वक प्राप्त हो गया है!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                त्रिकाल दर्शन सम्पादकीय मंडल द्वारा आपके आवेदन का सत्यापन किया जा रहा है।
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto space-y-2">
              <span className="text-xs font-bold text-gray-500 block">आपकी आवेदन क्रमांक ID (Application ID):</span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl font-bold text-[#B7652A]">{submittedAppId}</span>
                <button
                  onClick={handleCopyAppId}
                  className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                  title="आईडी कॉपी करें"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                </button>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onNavigate('/request-id-card', { appId: submittedAppId })}
                className="px-6 py-2.5 bg-gradient-to-r from-[#B7652A] to-[#F28C28] text-white font-bold rounded-lg text-xs shadow hover:opacity-90 flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>प्रेस ID कार्ड की स्थिति देखें</span>
              </button>

              <button
                onClick={() => setSubmittedAppId(null)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs hover:bg-gray-200"
              >
                नया आवेदन करें
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="bg-white border border-amber-900/15 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
            <h2 className="text-lg font-bold font-serif-devanagari text-gray-900 border-b border-gray-200 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#B7652A] rounded-full"></span>
              आवेदक का व्यक्तिगत विवरण (Personal Details)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-gray-700">
              <div>
                <label className="block mb-1">पूरा नाम (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. विक्रम सिंह सोलंकी"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">पिता/पति का नाम (Father's Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. श्री मानसिंह सोलंकी"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">जन्म तिथि (DOB) *</label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">लिंग (Gender)</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none"
                >
                  <option value="पुरुष">पुरुष (Male)</option>
                  <option value="महिला">महिला (Female)</option>
                  <option value="अन्य">अन्य (Other)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">मोबाइल नंबर (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="10 अंकों का मोबाइल नंबर"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">ईमेल (Email Address) *</label>
                <input
                  type="email"
                  required
                  placeholder="ईमेल आई डी"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none"
                />
              </div>
            </div>

            <h2 className="text-lg font-bold font-serif-devanagari text-gray-900 border-b border-gray-200 pb-3 flex items-center gap-2 pt-2">
              <span className="w-2.5 h-2.5 bg-[#F28C28] rounded-full"></span>
              पद एवं कार्यक्षेत्र का चयन (Position & Region)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-gray-700">
              <div>
                <label className="block mb-1">वांछित पद (Position)</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as ReporterRole })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none font-bold text-[#B7652A]"
                >
                  <option value="district_reporter">जिला संवाददाता (District Reporter)</option>
                  <option value="bureau_chief">ब्यूरो चीफ (Bureau Chief)</option>
                  <option value="reporter">तहसील/ब्लॉक संवाददाता</option>
                  <option value="video_journalist">वीडियो जर्नलिस्ट (Video Journalist)</option>
                  <option value="photographer">छायाकार (Photographer)</option>
                  <option value="contributor">विशेष अंशदाता (Contributor)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">राज्य (State)</label>
                <select
                  value={formData.stateId}
                  onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none"
                >
                  {states.map(s => (
                    <option key={s.id} value={s.id}>{s.nameHindi}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">जिला (District)</label>
                <select
                  value={formData.districtId}
                  onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none"
                >
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.nameHindi}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">पूरा डाक पता (Full Residential Address) *</label>
              <textarea
                required
                rows={2}
                placeholder="मकान नं, गली/मोहल्ला, तहसील, जिला एवं पिन कोड"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:border-[#B7652A] outline-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-gray-700">
              <div>
                <label className="block mb-1">शैक्षणिक योग्यता (Qualification)</label>
                <input
                  type="text"
                  placeholder="उदा. पत्रकारिता में स्नातक (BJMC/MJMC)"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">पत्रकारिता अनुभव (Experience)</label>
                <input
                  type="text"
                  placeholder="उदा. 3 वर्ष प्रिंट/डिजिटल मीडिया"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:border-[#B7652A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                पत्रकारिता में जुड़ने का कारण (Reason for Joining)
              </label>
              <textarea
                rows={2}
                placeholder="आप हमारे संस्थान से क्यों जुड़ना चाहते हैं?"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:border-[#B7652A] outline-none"
              ></textarea>
            </div>

            {/* Passport Photo Upload Section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-lg font-bold font-serif-devanagari text-gray-900 border-b border-gray-200 pb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></span>
                पासपोर्ट फोटो अपलोड (Passport Photo Upload)
              </h2>

              {/* Passport Size Photo Upload */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-gray-800">
                  पासपोर्ट साइज फोटो (Passport Size Photo) <span className="text-red-500">*</span>
                </label>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-24 h-28 bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-inner relative group">
                    {formData.photoUrl ? (
                      <>
                        <img
                          src={formData.photoUrl}
                          alt="Passport Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-1 rounded">बदलें</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2 text-gray-400">
                        <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                        <span className="text-[10px] block font-medium">फोटो अपलोड करें</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-[11px] text-gray-500 leading-snug">
                      अपनी स्पष्ट पासपोर्ट आकार की फोटो अपलोड करें (JPEG/PNG, अधिकतम 5MB)। डिजिटल प्रेस ID कार्ड में यही फोटो उपयोग होगी।
                    </p>
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 hover:border-[#B7652A] rounded-lg text-xs font-bold text-gray-700 hover:text-[#B7652A] cursor-pointer shadow-xs transition">
                      <Upload className="w-3.5 h-3.5 text-[#B7652A]" />
                      <span>{formData.photoUrl ? 'फोटो बदलें (Change Photo)' : 'पासपोर्ट फोटो चुनें (Upload Photo)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#B7652A] to-[#F28C28] text-white font-bold rounded-xl shadow-lg hover:opacity-95 transition text-sm flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>आवेदन जमा करें (Submit Application)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
