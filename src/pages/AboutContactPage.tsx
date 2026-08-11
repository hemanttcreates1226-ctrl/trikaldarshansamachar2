import React, { useState } from 'react';
import { Building2, Phone, Mail, MapPin, Send, ShieldCheck, Award, HeartHandshake } from 'lucide-react';
import { TrikalLogo } from '../components/brand/TrikalLogo';

export const AboutContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.mobile) {
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setForm({ name: '', mobile: '', email: '', message: '' });
    }
  };

  return (
    <div className="py-10 px-4 bg-[#FFFDF9] min-h-screen space-y-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Banner */}
        <div className="bg-gradient-brand text-white p-8 sm:p-10 rounded-2xl shadow-xl border border-red-900/40 text-center space-y-4">
          <TrikalLogo size="lg" showTagline={true} />
          <p className="text-xs sm:text-sm text-red-100 font-medium max-w-2xl mx-auto leading-relaxed pt-2">
            त्रिकाल दर्शन समाचार मालवा-निमाड़, मध्य प्रदेश, उत्तर प्रदेश एवं राजस्थान का अग्रणी स्वतंत्र हिंदी डिजिटल समाचार नेटवर्क है। हमारा लक्ष्य बिना किसी दबाव के जनता तक सत्य पहुँचाना है।
          </p>
        </div>

        {/* 2-Column: About Us vs Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* About Us */}
          <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-md space-y-4 text-xs leading-relaxed text-gray-700">
            <h2 className="text-xl font-bold font-serif-devanagari text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#B7652A]" />
              <span>संस्थान का उद्देश्य (Our Vision)</span>
            </h2>

            <p>
              "सत्य की त्रिकाल दृष्टि" सिद्धांत पर आधारित त्रिकाल दर्शन समाचार की स्थापना ग्राउंड लेवल की निष्पक्ष स्थानीय पत्रकारिता को बढ़ावा देने हेतु की गई है।
            </p>

            <ul className="space-y-2 font-serif-devanagari">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-[#F28C28] rounded-full mt-1.5 shrink-0"></span>
                <span>ग्राउंड रिपोर्टिंग: तहसील एवं जिला स्तर के प्रमुख जनमुद्दों को प्राथमिकता देना।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-[#F28C28] rounded-full mt-1.5 shrink-0"></span>
                <span>धार्मिक एवं सांस्कृतिक धरोहर: उज्जैन महाकाल मंदिर एवं प्रमुख तीर्थों की त्वरित जानकारी।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-[#F28C28] rounded-full mt-1.5 shrink-0"></span>
                <span>विश्वसनीयता: बिना सनसनी फैलाए सत्यापित खबरें प्रस्तुत करना।</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-gray-100 font-bold text-gray-900">
              <p>प्रधान सम्पादक: राजकमल पांडेय</p>
              <p className="text-gray-500 font-normal">रजिस्ट्रेशन संख्या: UDYAM-MP-34-0003439</p>
            </div>
          </div>

          {/* Contact Details & Inquiry Form */}
          <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-md space-y-6">
            <h2 className="text-xl font-bold font-serif-devanagari text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#B7652A]" />
              <span>मुख्यालय एवं संपर्क सूत्र (Contact Us)</span>
            </h2>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#F28C28] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">मुख्य प्रशासनिक कार्यालय:</p>
                  <p>कोठी रोड, प्रशासनिक संकुल के पास, जिला उज्जैन (म.प्र.) 456010</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#F28C28] shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">हेल्पलाइन एवं विज्ञापन बुकिंग:</p>
                  <p className="font-mono text-gray-800">+91 6232876013</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#F28C28] shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">संपादकीय ईमेल:</p>
                  <p className="font-mono text-gray-800">trikaldarshannews72@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <form onSubmit={handleSubmit} className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3 text-xs">
              <h3 className="font-bold text-gray-900 font-serif-devanagari">हमें सन्देश भेजें (Send Message)</h3>

              {sent && (
                <p className="text-emerald-700 font-bold bg-emerald-100 p-2 rounded">
                  आपका सन्देश सम्पादकीय विभाग को भेज दिया गया है!
                </p>
              )}

              <input
                type="text"
                required
                placeholder="आपका नाम *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 outline-none"
              />

              <input
                type="tel"
                required
                placeholder="मोबाइल नंबर *"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 outline-none"
              />

              <textarea
                rows={2}
                placeholder="खबर/सुझाव/विज्ञापन सम्बन्धी सन्देश..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 outline-none"
              ></textarea>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-[#B7652A] to-[#F28C28] text-white font-bold rounded-lg shadow hover:opacity-95"
              >
                सन्देश प्रेषित करें
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
