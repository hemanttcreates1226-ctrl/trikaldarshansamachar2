import React, { useState, useEffect } from 'react';
import { FileText, Printer, Eye } from 'lucide-react';
import { JoiningLetter } from '../../../types/news';
import { NewsService } from '../../../services/newsService';
import { JoiningLetterView } from '../../press/JoiningLetterView';

export const JoiningLettersManagerView: React.FC = () => {
  const [letters, setLetters] = useState<JoiningLetter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<JoiningLetter | null>(null);

  useEffect(() => {
    const list = NewsService.getJoiningLetters();
    setLetters(list);
    if (list.length > 0) {
      setSelectedLetter(list[0]);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-200 pb-4">
        <div>
          <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#D71920]" />
            <span>नियुक्ति पत्र प्रबंधन (Joining Letters)</span>
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            आधिकारिक नियुक्ति/मनोनयन पत्रों की समीक्षा, पीडीएफ जनरेशन एवं प्रिंटिंग।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-white border border-red-100 rounded-2xl p-4 space-y-3 shadow-xs">
          <h3 className="font-black text-sm text-[#D71920] font-serif-devanagari border-b border-red-100 pb-2">
            नियुक्ति पत्रों की सूची
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {letters.map((l) => (
              <div
                key={l.id}
                onClick={() => setSelectedLetter(l)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                  selectedLetter?.id === l.id
                    ? 'bg-red-50 border-[#D71920] text-gray-900 shadow-xs'
                    : 'bg-gray-50/50 border-gray-200 text-gray-700 hover:border-red-200 hover:bg-red-50/30'
                }`}
              >
                <div>
                  <p className="font-black font-serif-devanagari text-sm text-gray-900">{l.name}</p>
                  <p className="text-[11px] text-[#D71920] font-bold">{l.designation} • {l.districtName}</p>
                  <p className="text-[10px] font-mono text-gray-500 font-bold">पत्र क्र.: {l.letterNo}</p>
                </div>
                <Eye className="w-4 h-4 text-[#D71920]" />
              </div>
            ))}
          </div>
        </div>

        {/* Selected Letter View */}
        <div className="md:col-span-8 bg-white border border-red-100 rounded-2xl p-4 flex flex-col items-center justify-center space-y-4 shadow-xs">
          {selectedLetter ? (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between border-b border-red-100 pb-2 no-print">
                <span className="font-bold text-xs text-gray-900">नियुक्ति पत्र पूर्वावलोकन (Letter Preview):</span>
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white rounded-lg text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>डाउनलोड / प्रिंट करें</span>
                </button>
              </div>

              <div className="p-2 border border-red-200 rounded-2xl bg-gray-50/50 shadow-sm overflow-x-auto">
                <JoiningLetterView letter={selectedLetter} />
              </div>
            </div>
          ) : (
            <div className="text-center p-8 space-y-2">
              <FileText className="w-12 h-12 text-[#D71920] mx-auto opacity-50" />
              <p className="text-xs text-gray-500 font-medium">
                सूची में से किसी नियुक्ति पत्र पर क्लिक करें।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
