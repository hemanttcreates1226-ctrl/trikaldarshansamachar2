import React, { useState, useEffect } from 'react';
import { MapPin, Flame, Building2, User, ChevronRight, ShieldCheck } from 'lucide-react';
import { NewsArticle, State, District } from '../../types/news';
import { NewsService } from '../../services/newsService';
import { NewsCard, CompactNewsCard } from './NewsCard';

interface LocalNewsSectionProps {
  onSelectArticle: (article: NewsArticle) => void;
  onNavigateLocalPage: () => void;
}

export const LocalNewsSection: React.FC<LocalNewsSectionProps> = ({
  onSelectArticle,
  onNavigateLocalPage
}) => {
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>('st-mp');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dt-ujn');
  const [localArticles, setLocalArticles] = useState<NewsArticle[]>([]);

  const loadData = () => {
    setStates(NewsService.getStates());
    const dts = NewsService.getDistricts(selectedStateId);
    setDistricts(dts);
    const articles = NewsService.getArticles({
      stateId: selectedStateId === 'all' ? undefined : selectedStateId,
      districtId: selectedDistrictId === 'all' ? undefined : selectedDistrictId,
      limit: 6
    });
    setLocalArticles(articles);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('tds_data_updated', loadData);
    return () => window.removeEventListener('tds_data_updated', loadData);
  }, [selectedStateId, selectedDistrictId]);

  const activeStateObj = states.find(s => s.id === selectedStateId);
  const activeDistrictObj = districts.find(d => d.id === selectedDistrictId);

  return (
    <section className="py-8 px-4 bg-gradient-to-b from-red-50/50 via-white to-red-50/30 border-y border-red-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Location Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-red-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded bg-[#D71920] text-white shadow">
                <Building2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-[#111111]">
                  आपके शहर की खबरें (Local News)
                </h2>
                <p className="text-xs text-gray-600 font-medium">
                  उज्जैन, इंदौर, भोपाल समेत म.प्र., उ.प्र. एवं राजस्थान के जिलों की सीधी रिपोर्टिंग
                </p>
              </div>
            </div>
          </div>

          {/* Quick Location Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded p-1.5 shadow-sm text-xs font-medium">
              <MapPin className="w-4 h-4 text-[#D71920]" />
              <select
                value={selectedStateId}
                onChange={(e) => {
                  setSelectedStateId(e.target.value);
                  setSelectedDistrictId('all');
                }}
                className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer"
              >
                <option value="all">समस्त राज्य</option>
                {states.map(s => (
                  <option key={s.id} value={s.id}>{s.nameHindi}</option>
                ))}
              </select>

              <span className="text-gray-300">|</span>

              <select
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                disabled={selectedStateId === 'all'}
                className="bg-transparent font-bold text-[#D71920] outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="all">समस्त जिले</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.nameHindi}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick District Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
          <span className="text-gray-500 shrink-0">त्वरित शहर:</span>
          {[
            { name: 'उज्जैन', st: 'st-mp', dt: 'dt-ujn' },
            { name: 'इंदौर', st: 'st-mp', dt: 'dt-ind' },
            { name: 'भोपाल', st: 'st-mp', dt: 'dt-bhp' },
            { name: 'जबलपुर', st: 'st-mp', dt: 'dt-jbp' },
            { name: 'ग्वालियर', st: 'st-mp', dt: 'dt-gwl' },
            { name: 'लखनऊ', st: 'st-up', dt: 'dt-lko' },
            { name: 'जयपुर', st: 'st-rj', dt: 'dt-jpr' },
          ].map((item, idx) => {
            const isSelected = selectedDistrictId === item.dt;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedStateId(item.st);
                  setSelectedDistrictId(item.dt);
                }}
                className={`px-3 py-1 rounded-full shrink-0 transition border ${
                  isSelected
                    ? 'bg-[#D71920] text-white border-[#D71920] font-bold shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#D71920] hover:text-[#D71920]'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Local News Content Grid */}
        {localArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localArticles.map((art) => (
              <NewsCard key={art.id} article={art} onSelect={onSelectArticle} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center border border-dashed border-gray-300 space-y-2">
            <p className="font-bold text-gray-700">
              {activeDistrictObj?.nameHindi || activeStateObj?.nameHindi || 'इस क्षेत्र'} हेतु वर्तमान में कोई समाचार उपलब्ध नहीं है।
            </p>
            <p className="text-xs text-gray-500">
              त्रिकाल दर्शन समाचार टीम इस क्षेत्र के संवाददाताओं द्वारा भेजी जा रही खबरों को अपडेट कर रही है।
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
