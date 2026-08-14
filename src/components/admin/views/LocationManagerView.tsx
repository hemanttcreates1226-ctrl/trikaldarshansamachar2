import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, AlertCircle } from 'lucide-react';
import { State, District } from '../../../types/news';
import { NewsService } from '../../../services/newsService';

export const LocationManagerView: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [selectedStateId, setSelectedStateId] = useState('st-mp');
  const [districts, setDistricts] = useState<District[]>([]);

  const [dtNameHindi, setDtNameHindi] = useState('');
  const [dtNameEnglish, setDtNameEnglish] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<District | null>(null);

  useEffect(() => {
    const refresh = () => {
      setStates(NewsService.getStates());
      setDistricts(NewsService.getDistricts(selectedStateId));
    };
    refresh();
    window.addEventListener('tds_data_updated', refresh);
    return () => window.removeEventListener('tds_data_updated', refresh);
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

  const confirmDeleteDistrict = () => {
    if (deleteTarget) {
      NewsService.deleteDistrict(deleteTarget.id);
      setDistricts(NewsService.getDistricts(selectedStateId));
      setDeleteTarget(null);
    }
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
              <div key={d.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 flex items-center justify-between gap-2 group">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#D71920] shrink-0" />
                  <span>{d.nameHindi}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(d)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                  title="जिला हटाएं"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-300 rounded-2xl max-w-md w-full p-6 text-gray-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900 font-serif-devanagari">जिला हटाने की पुष्टि करें</h3>
                <p className="text-xs text-gray-500 font-medium">यह जिला सूची से स्थायी रूप से हट जाएगा।</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs font-bold text-gray-800">
              जिला: "{deleteTarget.nameHindi}" ({deleteTarget.nameEnglish})
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={confirmDeleteDistrict}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                हाँ, जिला हटाएं (Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
