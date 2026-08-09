import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, MapPin, Award, CheckCircle2, Phone, Mail, Globe, Printer } from 'lucide-react';
import { IDCard } from '../../types/news';
import rajkamalSignatureSvg from '../../assets/images/rajkamal_signature.svg';

interface PressIdCardViewProps {
  idCard: IDCard;
}

export const PressIdCardView: React.FC<PressIdCardViewProps> = ({ idCard }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const verifyUrl = `${window.location.origin}/verify/${idCard.pressId}`;
    QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 }, (err, url) => {
      if (!err && url) {
        setQrCodeUrl(url);
      }
    });
  }, [idCard.pressId]);

  return (
    <div className="printable-area space-y-8 flex flex-col items-center">
      {/* Front & Back ID Card Layout */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* ================= ID CARD FRONT ================= */}
        <div className="w-[320px] h-[510px] bg-[#080808] border-2 border-[#FFB347] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col justify-between text-white select-none">
          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-[#151515] via-[#2A170A] to-[#151515] p-3 text-center border-b border-[#B7652A]">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[#FFB347] font-serif-devanagari font-black text-lg tracking-wide">
                त्रिकाल दर्शन
              </span>
              <span className="bg-[#B7652A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                समाचार
              </span>
            </div>
            <p className="text-[9px] text-[#FFB347] italic font-serif-devanagari">"सत्य की त्रिकाल दृष्टि"</p>
          </div>

          {/* Press Badge Bar */}
          <div className="bg-gradient-to-r from-red-600 via-[#F28C28] to-red-600 py-1 text-center font-black text-xs tracking-widest text-white uppercase shadow-md">
            PRESS / परिचय पत्र
          </div>

          {/* Photo & Details */}
          <div className="p-4 flex flex-col items-center text-center space-y-3 flex-1 justify-center">
            {/* Photo with Gold Frame */}
            <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-[#FFB347] shadow-lg bg-gray-800 shrink-0">
              <img
                src={idCard.photo}
                alt={idCard.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg font-serif-devanagari text-gold-gradient leading-tight">
                {idCard.name}
              </h3>
              <p className="text-xs font-bold text-[#F28C28] uppercase tracking-wider bg-[#1A1008] border border-[#B7652A]/40 px-2 py-0.5 rounded-full inline-block">
                {idCard.designation}
              </p>
            </div>

            <div className="w-full bg-[#151515] border border-[#333] rounded-lg p-2.5 text-[11px] space-y-1 text-left font-mono">
              <div className="flex justify-between border-b border-[#252525] pb-1">
                <span className="text-gray-400">प्रेस ID (Press ID):</span>
                <span className="font-bold text-[#FFB347]">{idCard.pressId}</span>
              </div>
              <div className="flex justify-between border-b border-[#252525] pb-1">
                <span className="text-gray-400">सदस्य ID (Member ID):</span>
                <span className="text-white">{idCard.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">कार्यक्षेत्र (Region):</span>
                <span className="text-amber-200 font-bold">{idCard.districtName}, {idCard.stateName}</span>
              </div>
            </div>

            {/* QR Code & Validity */}
            <div className="w-full flex items-center justify-between bg-[#100B05] border border-[#B7652A]/30 p-2 rounded-lg text-[10px]">
              <div className="text-left space-y-0.5">
                <p className="text-gray-400">जारी तिथि: <span className="text-white">{idCard.issueDate}</span></p>
                <p className="text-gray-400">वैधता: <span className="text-emerald-400 font-bold">{idCard.validUntil}</span></p>
              </div>
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="w-11 h-11 rounded border border-white p-0.5 bg-white shrink-0" />
              )}
            </div>
          </div>

          {/* Bottom Hologram Strip */}
          <div className="bg-gradient-to-r from-[#B7652A] via-[#FFB347] to-[#B7652A] text-black text-[9px] font-bold py-1 text-center uppercase tracking-widest">
            OFFICIAL MEDIA IDENTIFICATION CARD
          </div>
        </div>

        {/* ================= ID CARD BACK ================= */}
        <div className="w-[320px] h-[510px] bg-[#0A0A0A] border-2 border-[#B7652A] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col justify-between text-white p-4 select-none">
          <div className="space-y-3">
            <div className="text-center border-b border-[#222] pb-2">
              <h4 className="font-bold text-sm text-[#FFB347] font-serif-devanagari">
                नियमावली एवं निर्देश (Terms & Rules)
              </h4>
              <p className="text-[10px] text-gray-400">त्रिकाल दर्शन समाचार मीडिया हाउस</p>
            </div>

            <ul className="text-[10px] text-gray-300 space-y-1.5 list-disc pl-4 leading-snug font-serif-devanagari">
              <li>यह कार्ड त्रिकाल दर्शन समाचार की संपत्ति है तथा केवल समाचार संकलन हेतु वैध है।</li>
              <li>कार्ड गुम होने पर निकटतम पुलिस स्टेशन एवं संपादक को तुरंत सूचित करें।</li>
              <li>कार्ड का किसी भी प्रकार का अवैध या असामाजिक उपयोग दंडनीय अपराध है।</li>
              <li>संस्थान के पास कार्ड निरस्त करने का सर्वाधिकार सुरक्षित है।</li>
            </ul>

            <div className="bg-[#151515] p-2.5 rounded-lg border border-[#333] space-y-1 text-[10px]">
              <p className="font-bold text-[#FFB347]">आपातकालीन संपर्क (Headquarters):</p>
              <p className="text-gray-300">कोठी रोड, उज्जैन (म.प्र.) 456010</p>
              <p className="text-gray-300">हेल्पलाइन: +91 98260 12345 / 94250 99999</p>
              <p className="text-amber-200">वेबसाइट: www.trikaldarshan.com</p>
            </div>
          </div>

          {/* Stamp & Authorized Signature */}
          <div className="pt-2 border-t border-[#222] flex items-center justify-between text-[10px]">
            {/* Official Seal */}
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#F28C28] flex items-center justify-center text-[8px] font-bold text-[#FFB347] text-center p-1 leading-tight rotate-12">
              अधिकृत मुहर <br />TRIKAL PRESS
            </div>

            {/* Signature */}
            <div className="text-center space-y-1 flex flex-col items-center">
              <div className="h-7 w-24 flex items-center justify-center border-b border-gray-600 pb-0.5">
                <img src={rajkamalSignatureSvg} alt="Rajkamal Signature" className="max-h-full max-w-full object-contain filter invert opacity-95" />
              </div>
              <p className="text-[9px] text-gray-400 font-serif-devanagari">राजकमल (प्रधान सम्पादक)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
