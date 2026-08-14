import React, { useEffect, useState } from 'react';
import { ShieldCheck, Award, MapPin, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { IDCard } from '../types/news';
import { NewsService } from '../services/newsService';
import { TrikalLogo } from '../components/brand/TrikalLogo';

interface VerifyMemberPageProps {
  pressId: string;
  onNavigate: (path: string) => void;
}

export const VerifyMemberPage: React.FC<VerifyMemberPageProps> = ({ pressId, onNavigate }) => {
  const [idCard, setIdCard] = useState<IDCard | null>(null);

  useEffect(() => {
    const fetchCard = () => {
      const cards = NewsService.getIDCards();
      const found = cards.find(c => c.pressId.toLowerCase() === pressId.toLowerCase());
      if (found) {
        setIdCard(found);
      } else {
        // Also check approved applications
        const apps = NewsService.getApplications();
        const foundApp = apps.find(a => a.pressId && a.pressId.toLowerCase() === pressId.toLowerCase());
        if (foundApp) {
          setIdCard({
            id: foundApp.id,
            applicationId: foundApp.id,
            pressId: foundApp.pressId || '',
            memberId: foundApp.memberId || '',
            name: foundApp.fullName,
            designation: foundApp.position || 'संवाददाता',
            districtName: foundApp.districtName,
            stateName: foundApp.stateName,
            issueDate: foundApp.submittedAt || '01-01-2025',
            expiryDate: '31-12-2026',
            mobile: foundApp.mobile,
            photo: foundApp.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
            qrCodeUrl: window.location.href,
            verificationUrl: window.location.href,
            status: 'active'
          });
        } else {
          setIdCard(null);
        }
      }
    };

    fetchCard();
    window.addEventListener('tds_data_updated', fetchCard);
    return () => window.removeEventListener('tds_data_updated', fetchCard);
  }, [pressId]);

  return (
    <div className="py-12 px-4 bg-[#080808] text-white min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-[#151515] border-2 border-[#B7652A] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        <TrikalLogo size="md" showTagline={true} />

        {idCard ? (
          <div className="space-y-5">
            <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="font-bold text-sm">अधिकृत एवं सत्यापित पत्रकार (VERIFIED)</p>
                <p className="text-[10px] text-emerald-200">त्रिकाल दर्शन समाचार मीडिया हाऊस</p>
              </div>
            </div>

            {/* Reporter Profile */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-24 h-28 rounded-xl border-2 border-[#FFB347] overflow-hidden shadow-lg bg-gray-800">
                <img src={idCard.photo} alt={idCard.name} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold font-serif-devanagari text-gold-gradient">
                  {idCard.name}
                </h2>
                <span className="bg-[#B7652A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  {idCard.designation}
                </span>
              </div>
            </div>

            {/* Credentials Table */}
            <div className="bg-[#0A0A0A] border border-[#333] rounded-xl p-4 text-xs font-mono space-y-2 text-left">
              <div className="flex justify-between border-b border-[#222] pb-1.5">
                <span className="text-gray-400">डिजिटल मीडिया कार्ड ID (Digital Media Card ID):</span>
                <span className="font-bold text-[#FFB347]">{idCard.pressId}</span>
              </div>
              <div className="flex justify-between border-b border-[#222] pb-1.5">
                <span className="text-gray-400">सदस्य ID (Member ID):</span>
                <span className="text-white">{idCard.memberId}</span>
              </div>
              <div className="flex justify-between border-b border-[#222] pb-1.5">
                <span className="text-gray-400">कार्यक्षेत्र (Location):</span>
                <span className="text-amber-200 font-bold">{idCard.districtName}, {idCard.stateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">कार्ड वैधता (Valid Till):</span>
                <span className="text-emerald-400 font-bold">{idCard.validUntil}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/')}
              className="w-full py-2.5 bg-gradient-to-r from-[#B7652A] to-[#F28C28] text-white font-bold rounded-xl text-xs"
            >
              मुख्य समाचार पोर्टल पर जाएं
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 bg-red-950 border border-red-500 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold font-serif-devanagari text-red-400">
              प्रेस ID {pressId} का रिकॉर्ड नहीं मिला या निरस्त कर दिया गया है।
            </h2>
            <p className="text-xs text-gray-400">
              यदि आप आधिकारिक पत्रकार हैं, तो कृपया सम्पादकीय विभाग से संपर्क करें।
            </p>
            <button
              onClick={() => onNavigate('/')}
              className="px-6 py-2 bg-[#1A1A1A] border border-[#333] text-gray-200 rounded-xl text-xs font-bold"
            >
              होमपेज पर जाएं
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
