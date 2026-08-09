import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Award,
  UserPlus,
  ShieldCheck,
  FileText,
  ChevronRight
} from 'lucide-react';
import { TrikalLogo } from '../brand/TrikalLogo';
import { GlassySocialIcon } from './GlassySocialIcon';
import { SocialLink, WebsiteSettings } from '../../types/news';
import { NewsService } from '../../services/newsService';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(NewsService.getSettings());
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(NewsService.getSocialLinks());

  useEffect(() => {
    const updateData = () => {
      setSettings(NewsService.getSettings());
      setSocialLinks(NewsService.getSocialLinks());
    };
    window.addEventListener('tds_data_updated', updateData);
    return () => window.removeEventListener('tds_data_updated', updateData);
  }, []);

  return (
    <footer className="bg-white text-gray-800 border-t-4 border-[#D71920] shadow-inner">
      {/* Upper Footer CTA Strip */}
      <div className="bg-gradient-to-r from-red-50/80 via-white to-red-50/80 border-b border-red-100 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-gray-900">
              पत्रकारिता के क्षेत्र में अपना भविष्य बनाएं - त्रिकाल दर्शन समाचार से जुड़ें
            </h3>
            <p className="text-xs text-[#D71920] font-bold">
              जिला संवाददाता, ब्यूरो चीफ, वीडियो जर्नलिस्ट एवं फोटोग्राफर हेतु आवेदन पत्र आमंत्रित हैं।
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={() => onNavigate('/join-us')}
              className="px-5 py-2.5 rounded bg-gradient-to-r from-[#D71920] to-[#E52B32] hover:from-[#B81218] hover:to-[#D71920] text-white font-bold text-xs shadow-md shadow-red-200 hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>आवेदन पत्र भरें</span>
            </button>
            <button
              onClick={() => onNavigate('/request-id-card')}
              className="px-5 py-2.5 rounded bg-white border-2 border-red-200 text-[#D71920] font-bold text-xs hover:bg-red-50 hover:border-red-400 shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#D71920]" />
              <span>प्रेस ID कार्ड सत्यापन</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Column 1: Brand & Contact */}
        <div className="space-y-4 min-w-0">
          <TrikalLogo size="md" showTagline={true} />
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            {settings.footerAboutHindi || 'त्रिकाल दर्शन समाचार भारत का अग्रणी और निष्पक्ष डिजिटल समाचार मंच है। सत्य की खोज और जनहितकारी पत्रकारिता ही हमारा परम उद्देश्य है।'}
          </p>

          <div className="space-y-2 text-xs text-gray-700 pt-2 font-medium">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#D71920] shrink-0 mt-0.5" />
              <span>{settings.addressHindi}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#D71920] shrink-0" />
              <span>{settings.contactNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#D71920] shrink-0" />
              <span>{settings.contactEmail}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Categories */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b-2 border-red-100 pb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D71920]"></span>
            प्रमुख श्रेणियां
          </h4>
          <ul className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {[
              { name: 'ताज़ा खबर', path: '/latest-news' },
              { name: 'स्थानीय', path: '/local-news' },
              { name: 'राज्य समाचार', path: '/state-news' },
              { name: 'देश', path: '/national-news' },
              { name: 'राजनीति', path: '/politics' },
              { name: 'अपराध', path: '/crime' },
              { name: 'कृषि एवं किसान', path: '/agriculture' },
              { name: 'शिक्षा एवं परिणाम', path: '/education' },
              { name: 'धर्म एवं पंचांग', path: '/religion' },
              { name: 'विशेष रिपोर्ट', path: '/special-reports' },
              { name: 'वीडियो बुलेटिन', path: '/videos' },
              { name: 'फोटो गैलरी', path: '/photo-gallery' },
            ].map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => onNavigate(link.path)}
                  className="hover:text-[#D71920] transition flex items-center gap-1.5 text-gray-700 hover:translate-x-1 duration-200 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#D71920]" />
                  <span>{link.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Press Services & Social Media */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b-2 border-red-100 pb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D71920]"></span>
            प्रेस सेवाएं एवं सोशल मीडिया
          </h4>

          <div className="space-y-2 text-xs font-bold">
            <button
              onClick={() => onNavigate('/request-id-card')}
              className="w-full text-left p-2.5 rounded bg-white hover:bg-red-50/80 border border-red-200/80 hover:border-[#D71920] transition flex items-center justify-between group shadow-sm cursor-pointer"
            >
              <span className="text-gray-800 group-hover:text-[#D71920]">प्रेस ID कार्ड आवेदन / स्थिति</span>
              <Award className="w-4 h-4 text-[#D71920]" />
            </button>

            <button
              onClick={() => onNavigate('/request-joining-letter')}
              className="w-full text-left p-2.5 rounded bg-white hover:bg-red-50/80 border border-red-200/80 hover:border-[#D71920] transition flex items-center justify-between group shadow-sm cursor-pointer"
            >
              <span className="text-gray-800 group-hover:text-[#D71920]">नियुक्ति पत्र (Joining Letter)</span>
              <FileText className="w-4 h-4 text-[#D71920]" />
            </button>

            <button
              onClick={() => onNavigate('/about')}
              className="w-full text-left p-2.5 rounded bg-white hover:bg-red-50/80 border border-red-200/80 hover:border-[#D71920] transition flex items-center justify-between shadow-sm cursor-pointer"
            >
              <span className="text-gray-800 hover:text-[#D71920]">हमारे बारे में एवं आचार संहिता</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </button>
          </div>

          {/* Social Icons - Classic Style */}
          <div className="pt-2">
            <p className="text-xs font-black text-gray-800 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D71920]"></span>
              सोशल मीडिया नेटवर्क:
            </p>
            <div className="flex items-center gap-2.5 flex-wrap">
              {socialLinks.filter(s => s.isEnabled).map((soc) => (
                <GlassySocialIcon
                  key={soc.id}
                  platform={soc.platform}
                  url={soc.url}
                  label={soc.label}
                  size="md"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="bg-red-50/60 border-t border-red-100 py-4 px-4 text-xs text-gray-600 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 त्रिकाल दर्शन समाचार (Trikal Darshan Samachar news). सर्वाधिकार सुरक्षित।</p>
          <div className="flex items-center gap-4 text-gray-700 font-semibold flex-wrap justify-center">
            <button onClick={() => onNavigate('/about')} className="hover:text-[#D71920] cursor-pointer">गोपनीयता नीति</button>
            <span>•</span>
            <button onClick={() => onNavigate('/contact')} className="hover:text-[#D71920] cursor-pointer">संपर्क करें</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

