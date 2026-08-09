import React, { useState, useEffect } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { State, District } from '../../../types/news';
import { NewsService } from '../../../services/newsService';

export const LocationManagerView: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [selectedStateId, setSelectedStateId] = useState('st-mp');
  const [districts, setDistricts] = useState<District[]>([]);

  const [dtNameHindi, setDtNameHindi] = useState('');
  const [dtNameEnglish, setDtNameEnglish] = useState('');

  useEffect(() => {
    setStates(NewsService.getStates());
    setDistricts(NewsService.getDistricts(selectedStateId));
  }, [selectedStateId]);

  const handleAddDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dtNameHindi) return;

    NewsService.addDistrict({
      stateId: selectedStateId,
      nameHindi: dtNameHindi,
      nameEnglish: dtNameEnglish || dtNameHindi,
      slug: dtNameHindi.toLowerCase().replace(/\s+/g, '-')
    });

    setDtNameHindi('');
    setDtNameEnglish('');
    setDistricts(NewsService.getDistricts(selectedStateId));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-red-200 pb-4">
        <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-[#D71920]" />
          <span>राज्य एवं जिला प्रबंधन (State & District Hierarchy)</span>
        </h2>
        <p className="text-xs text-gray-600 font-medium">
          लोकल न्यूज़ कवरेज हेतु राज्य, जिले एवं तहसीलों की सूची प्रबंधित करें।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-white border border-red-100 rounded-2xl p-5 space-y-4 text-xs shadow-xs">
          <h3 className="font-black text-sm text-[#D71920] font-serif-devanagari border-b border-red-100 pb-2">नया जिला जोड़ें</h3>

          <div>
            <label className="block text-gray-800 font-bold mb-1">राज्य का चयन करें</label>
            <select
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-[#D71920] font-bold rounded-lg p-2.5 outline-none"
            >
              {states.map(s => (
                <option key={s.id} value={s.id}>{s.nameHindi}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleAddDistrict} className="space-y-3">
            <div>
              <label className="block text-gray-800 font-bold mb-1">जिले का नाम (हिंदी) *</label>
              <input
                type="text"
                required
                placeholder="उदा. नीमच, मंदसौर"
                value={dtNameHindi}
                onChange={(e) => setDtNameHindi(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-lg p-2.5 focus:border-[#D71920] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-bold mb-1">जिले का नाम (English)</label>
              <input
                type="text"
                placeholder="e.g. Neemuch"
                value={dtNameEnglish}
                onChange={(e) => setDtNameEnglish(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:border-[#D71920] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>जिला जोड़ें (Save District)</span>
            </button>
          </form>
        </div>

        <div className="md:col-span-8 bg-white border border-red-100 rounded-2xl overflow-hidden shadow-xs p-4 space-y-3">
          <h3 className="font-black text-sm text-gray-900 font-serif-devanagari border-b border-red-100 pb-2">
            वर्तमान जिले ({districts.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {districts.map(d => (
              <div key={d.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D71920]" />
                <span>{d.nameHindi}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
