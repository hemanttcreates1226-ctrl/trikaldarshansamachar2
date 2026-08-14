import React from 'react';
import { TrikalLogo } from '../brand/TrikalLogo';
import { JoiningLetter } from '../../types/news';

const rajkamalSignatureSvg = '/rajkamal_signature.svg';

interface JoiningLetterViewProps {
  letter: JoiningLetter;
}

export const JoiningLetterView: React.FC<JoiningLetterViewProps> = ({ letter }) => {
  return (
    <div className="printable-area max-w-2xl mx-auto bg-white text-gray-900 border-8 border-double border-[#B7652A] p-8 sm:p-12 shadow-2xl relative font-serif-devanagari select-none space-y-6">
      {/* Official Header */}
      <div className="border-b-2 border-[#B7652A] pb-4 flex items-center justify-between gap-4">
        <TrikalLogo size="md" variant="light" showTagline={true} />
        <div className="text-right text-xs text-gray-700 font-sans">
          <p className="font-bold text-[#B7652A]">पत्र क्रमांक: {letter.letterNo}</p>
          <p>दिनांक: {letter.issueDate}</p>
        </div>
      </div>

      {/* Subject Badge */}
      <div className="text-center pt-2">
        <span className="bg-gradient-to-r from-[#151515] to-[#2A170A] text-[#FFB347] font-black text-sm px-6 py-1.5 rounded-full border border-[#B7652A] uppercase tracking-wider">
          अधिकृत नियुक्ति पत्र (OFFICIAL APPOINTMENT LETTER)
        </span>
      </div>

      {/* Recipient Details */}
      <div className="space-y-1 text-xs sm:text-sm border-l-4 border-[#B7652A] pl-3 py-1 bg-amber-50/50">
        <p><span className="font-bold text-gray-900">प्रति (To):</span> {letter.name}</p>
        <p><span className="font-bold text-gray-900">पदनाम (Designation):</span> <span className="font-bold text-[#B7652A]">{letter.designation}</span></p>
        <p><span className="font-bold text-gray-900">कार्यक्षेत्र (Region):</span> {letter.districtName}, {letter.stateName}</p>
        <p><span className="font-bold text-gray-900">सदस्यता क्रमांक (Member ID):</span> {letter.memberId}</p>
      </div>

      {/* Body Content */}
      <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-gray-800">
        <p>महोदय/महोदया,</p>
        <p>
          त्रिकाल दर्शन समाचार सम्पादकीय मंडल द्वारा आपके आवेदन पत्र, शैक्षणिक योग्यता एवं पत्रकारिता अनुभव के गहन मूल्यांकन के उपरांत आपको सहर्ष <span className="font-bold text-[#B7652A]">{letter.designation} ({letter.districtName})</span> के पद पर नियुक्त किया जाता है।
        </p>
      </div>

      {/* Responsibilities */}
      <div className="space-y-2 text-xs">
        <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-1">
          मुख्य उत्तरदायित्व एवं कार्य (Key Responsibilities):
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {letter.responsibilities.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-2 text-xs">
        <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-1">
          नियम एवं शर्तें (Terms & Conditions):
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {letter.terms.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>

      {/* Footer Signatures & Official Stamp */}
      <div className="pt-8 border-t border-gray-300 flex items-center justify-between text-xs">
        {/* Seal */}
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#B7652A] text-[#B7652A] flex items-center justify-center text-[9px] font-bold text-center p-2 rotate-12 bg-amber-50/80 shadow-sm">
          अधिकृत सील <br />TRIKAL DARSHAN <br />SAMACHAR
        </div>

        {/* Signature */}
        <div className="text-center space-y-1 flex flex-col items-center">
          <div className="h-10 w-32 flex items-center justify-center border-b border-gray-400 pb-1">
            <img src={rajkamalSignatureSvg} alt="Rajkamal Signature" className="max-h-full max-w-full object-contain" />
          </div>
          <p className="font-bold text-gray-900 text-xs">{letter.editorName || 'राजकमल पांडेय - प्रधान सम्पादक (Editor-in-Chief)'}</p>
          <p className="text-[10px] text-gray-500">त्रिकाल दर्शन समाचार मीडिया हाऊस</p>
        </div>
      </div>
    </div>
  );
};
