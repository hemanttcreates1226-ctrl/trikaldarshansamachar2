import React, { useState } from 'react';
import { FileText, Search, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import { MemberApplication, JoiningLetter } from '../types/news';
import { NewsService } from '../services/newsService';
import { JoiningLetterView } from '../components/press/JoiningLetterView';

interface RequestJoiningLetterPageProps {
  onNavigate: (path: string) => void;
}

export const RequestJoiningLetterPage: React.FC<RequestJoiningLetterPageProps> = ({ onNavigate }) => {
  const [appIdInput, setAppIdInput] = useState('');
  const [searchedApp, setSearchedApp] = useState<MemberApplication | null>(null);
  const [matchedLetter, setMatchedLetter] = useState<JoiningLetter | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!appIdInput.trim()) return;
    setHasSearched(true);

    const apps = NewsService.getApplications();
    const app = apps.find(a => a.id.toLowerCase() === appIdInput.trim().toLowerCase() || a.mobile === appIdInput.trim());

    if (app) {
      setSearchedApp(app);
      const letters = NewsService.getJoiningLetters();
      const letter = letters.find(l => l.applicationId === app.id);
      setMatchedLetter(letter || null);
    } else {
      setSearchedApp(null);
      setMatchedLetter(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-10 px-4 bg-[#FBF9F5] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-brand text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-red-900/40 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-black/40 border border-amber-400/50 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>नियुक्ति पत्र पोर्टल (Appointment Letter Portal)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif-devanagari text-white drop-shadow-sm">
            नियुक्ति पत्र स्थिति एवं डाउनलोड (Joining Letter)
          </h1>
          <p className="text-xs sm:text-sm text-red-100 font-medium">
            त्रिकाल दर्शन समाचार द्वारा जारी अधिकारिक नियुक्ति/नियुक्ति पत्र देखने एवं प्रिंट करने हेतु Application ID दर्ज करें।
          </p>
        </div>

        {/* Search */}
        <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Application ID (उदा. TDS-APP-2026-101)..."
              value={appIdInput}
              onChange={(e) => setAppIdInput(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm focus:border-[#B7652A] outline-none font-mono"
            />
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#B7652A] to-[#F28C28] text-white font-bold rounded-xl text-sm shadow hover:opacity-95 transition flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>खोजें (Search)</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <div>
            {searchedApp && searchedApp.status === 'approved' && matchedLetter ? (
              <div className="space-y-6">
                <div className="flex justify-end no-print">
                  <button
                    onClick={handlePrint}
                    className="px-6 py-2.5 bg-[#080808] text-[#FFB347] font-bold text-xs rounded-xl hover:bg-[#1A1A1A] transition flex items-center gap-2 shadow"
                  >
                    <Printer className="w-4 h-4 text-[#F28C28]" />
                    <span>नियुक्ति पत्र प्रिंट करें (Print / Download PDF)</span>
                  </button>
                </div>

                <JoiningLetterView letter={matchedLetter} />
              </div>
            ) : (
              <div className="bg-white border border-dashed border-amber-300 rounded-2xl p-8 text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-bold text-base text-gray-800 font-serif-devanagari">
                  नियुक्ति पत्र अभी तैयार नहीं है।
                </h3>
                <p className="text-xs text-gray-500">
                  आवेदन स्वीकृत होने के उपरांत ही सम्पादकीय विभाग द्वारा नियुक्ति पत्र जारी किया जाता है।
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
