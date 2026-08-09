import React, { useState, useEffect } from 'react';
import { Award, Search, Printer, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { IDCard, MemberApplication } from '../types/news';
import { NewsService } from '../services/newsService';
import { PressIdCardView } from '../components/press/PressIdCardView';

interface RequestIdCardPageProps {
  initialAppId?: string;
  onNavigate: (path: string) => void;
}

export const RequestIdCardPage: React.FC<RequestIdCardPageProps> = ({ initialAppId = '', onNavigate }) => {
  const [appIdInput, setAppIdInput] = useState(initialAppId);
  const [searchedApp, setSearchedApp] = useState<MemberApplication | null>(null);
  const [matchedIdCard, setMatchedIdCard] = useState<IDCard | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialAppId) {
      handleSearch(initialAppId);
    }
  }, [initialAppId]);

  const handleSearch = (idToSearch?: string) => {
    const query = idToSearch || appIdInput.trim();
    if (!query) return;

    setHasSearched(true);
    const apps = NewsService.getApplications();
    const app = apps.find(a => a.id.toLowerCase() === query.toLowerCase() || a.mobile === query);

    if (app) {
      setSearchedApp(app);
      const cards = NewsService.getIDCards();
      const card = cards.find(c => c.applicationId === app.id);
      setMatchedIdCard(card || null);
    } else {
      setSearchedApp(null);
      setMatchedIdCard(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-10 px-4 bg-[#FBF9F5] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-brand text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-red-900/40 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-black/40 border border-amber-400/50 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>डिजिटल प्रेस ID कार्ड पोर्टल</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif-devanagari text-white drop-shadow-sm">
            प्रेस ID कार्ड स्थिति एवं डाउनलोड (Press ID Card Status)
          </h1>
          <p className="text-xs sm:text-sm text-red-100 font-medium">
            अपना आवेदन क्रमांक (Application ID) या मोबाइल नंबर दर्ज कर प्रेस कार्ड की स्थिति जांचें एवं प्रिंट करें।
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="आवेदन क्रमांक (उदा. TDS-APP-2026-101) या मोबाइल नंबर..."
              value={appIdInput}
              onChange={(e) => setAppIdInput(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm focus:border-[#B7652A] outline-none font-mono"
            />
            <button
              onClick={() => handleSearch()}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#B7652A] to-[#F28C28] text-white font-bold rounded-xl text-sm shadow hover:opacity-95 transition flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>स्थिति खोजें (Search)</span>
            </button>
          </div>
        </div>

        {/* Results Box */}
        {hasSearched && (
          <div>
            {searchedApp ? (
              <div className="space-y-6">
                {/* Application Status Banner */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-lg font-bold font-serif-devanagari text-gray-900">
                        आवेदक: {searchedApp.fullName}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">
                        Application ID: {searchedApp.id} | पद: {searchedApp.position}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {searchedApp.status === 'approved' && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>स्वीकृत (Approved)</span>
                        </span>
                      )}
                      {searchedApp.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                          <span>सत्यापन प्रक्रियाधीन (Pending Review)</span>
                        </span>
                      )}
                      {searchedApp.status === 'rejected' && (
                        <span className="bg-red-100 text-red-800 border border-red-300 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>अस्वीकृत (Rejected)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {searchedApp.status === 'pending' && (
                    <div className="p-4 bg-amber-50 rounded-xl text-xs text-amber-900 space-y-1">
                      <p className="font-bold">सत्यापन सूचना:</p>
                      <p>आपका आवेदन प्राप्त हो चुका है। सम्पादकीय मण्डल द्वारा आपके दस्तावेजों का सत्यापन जारी है। अनुमोदन के उपरांत आपका डिजिटल प्रेस कार्ड यहाँ प्रदर्शित होगा।</p>
                    </div>
                  )}

                  {searchedApp.status === 'rejected' && (
                    <div className="p-4 bg-red-50 rounded-xl text-xs text-red-900 space-y-1">
                      <p className="font-bold">अस्वीकृति टिप्पणी:</p>
                      <p>{searchedApp.adminRemarks || 'आवश्यक दस्तावेजों की कमी के कारण आवेदन अस्वीकृत किया गया है।'}</p>
                    </div>
                  )}
                </div>

                {/* Printable ID Card Component if Approved */}
                {searchedApp.status === 'approved' && matchedIdCard && (
                  <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-xl space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 no-print">
                      <h3 className="font-bold text-base font-serif-devanagari text-gray-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#B7652A]" />
                        <span>आपका अधिकृत प्रेस परिचय पत्र (Digital Press Card)</span>
                      </h3>
                      <button
                        onClick={handlePrint}
                        className="px-5 py-2 bg-[#080808] text-[#FFB347] font-bold text-xs rounded-lg hover:bg-[#1A1A1A] transition flex items-center gap-2 shadow"
                      >
                        <Printer className="w-4 h-4 text-[#F28C28]" />
                        <span>कार्ड प्रिंट करें (Print / Download)</span>
                      </button>
                    </div>

                    <PressIdCardView idCard={matchedIdCard} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-red-300 rounded-2xl p-8 text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="font-bold text-base text-gray-800 font-serif-devanagari">
                  कोई रिकॉर्ड नहीं मिला!
                </h3>
                <p className="text-xs text-gray-500">
                  कृपया सही Application ID दर्ज करें या नया आवेदन जमा करें।
                </p>
                <button
                  onClick={() => onNavigate('/join-us')}
                  className="mt-2 px-5 py-2 bg-[#B7652A] text-white rounded-lg font-bold text-xs"
                >
                  नया आवेदन पत्र भरें
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
