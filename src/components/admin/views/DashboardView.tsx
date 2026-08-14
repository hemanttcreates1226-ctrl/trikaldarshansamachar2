import React from 'react';
import { Newspaper, Users, Award, UserCheck, Eye, Flame, Plus, ShieldCheck, TrendingUp } from 'lucide-react';
import { NewsService } from '../../../services/newsService';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onAddNewNews: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onAddNewNews }) => {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    window.addEventListener('tds_data_updated', handleUpdate);
    const unsubNews = NewsService.subscribeToNews(() => setTick(t => t + 1));
    return () => {
      window.removeEventListener('tds_data_updated', handleUpdate);
      unsubNews();
    };
  }, []);

  const articles = NewsService.getArticles({ status: 'published' });
  const allArticles = NewsService.getArticles({ status: 'all' });
  const breakingCount = articles.filter(a => a.isBreaking).length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const applications = NewsService.getApplications();
  const pendingApps = applications.filter(a => a.status === 'pending');
  const reporters = NewsService.getReporters();
  const idCards = NewsService.getIDCards();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white border border-red-300 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1.5 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black font-serif-devanagari text-white">
            जय श्री महाकाल, प्रधान सम्पादक जी!
          </h1>
          <p className="text-xs sm:text-sm text-red-100 font-medium">
            त्रिकाल दर्शन समाचार डिजिटल मीडिया कंट्रोल सेंटर - सत्य की त्रिकाल दृष्टि।
          </p>
        </div>

        <button
          onClick={onAddNewNews}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-gray-950" />
          <span>नया समाचार प्रकाशित करें</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-red-100 p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#D71920]">
            <span className="text-xs font-black uppercase tracking-wider">कुल प्रकाशित समाचार</span>
            <Newspaper className="w-5 h-5 text-[#D71920]" />
          </div>
          <p className="text-3xl font-black font-mono text-gray-900">{articles.length}</p>
          <p className="text-[11px] text-gray-500 font-medium">कुल ड्राफ्ट्स/पेंडिंग: {allArticles.length - articles.length}</p>
        </div>

        <div className="bg-white border border-red-100 p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#D71920]">
            <span className="text-xs font-black uppercase tracking-wider">कुल पाठक (Total Views)</span>
            <Eye className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black font-mono text-gray-900">{totalViews.toLocaleString('hi-IN')}</p>
          <p className="text-[11px] text-emerald-600 font-bold">▲ लाइव ट्रैकिंग जारी है</p>
        </div>

        <div
          onClick={() => onNavigateTab('applications')}
          className="bg-white border border-amber-200 hover:border-[#D71920] p-5 rounded-2xl space-y-2 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-black uppercase tracking-wider">पेंडिंग आवेदन पत्र</span>
            <UserCheck className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black font-mono text-amber-600">{pendingApps.length}</p>
          <p className="text-[11px] text-[#D71920] font-bold group-hover:underline">समीक्षा हेतु यहाँ क्लिक करें →</p>
        </div>

        <div className="bg-white border border-red-100 p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#D71920]">
            <span className="text-xs font-black uppercase tracking-wider">सक्रिय रिपोर्टर्स & ID</span>
            <Award className="w-5 h-5 text-[#D71920]" />
          </div>
          <p className="text-3xl font-black font-mono text-gray-900">{reporters.length}</p>
          <p className="text-[11px] text-gray-500 font-medium">जारी प्रेस ID कार्ड्स: {idCards.length}</p>
        </div>
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-red-100 pb-3">
          <h3 className="text-base font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#D71920]" />
            <span>हाल ही में प्रकाशित समाचार (Recent Published Articles)</span>
          </h3>
          <button
            onClick={() => onNavigateTab('news')}
            className="text-xs text-[#D71920] font-bold hover:underline cursor-pointer"
          >
            सभी समाचार देखें →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-red-50 text-[#D71920] font-bold uppercase border-b border-red-100">
              <tr>
                <th className="p-3">शीर्षक (Headline)</th>
                <th className="p-3">श्रेणी</th>
                <th className="p-3">स्थान</th>
                <th className="p-3">रिपोर्टर</th>
                <th className="p-3 text-center">पाठक</th>
                <th className="p-3">दिनांक</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.slice(0, 5).map((art) => (
                <tr key={art.id} className="hover:bg-red-50/50 transition">
                  <td className="p-3 font-bold font-serif-devanagari text-gray-900 max-w-xs truncate">
                    {art.title}
                  </td>
                  <td className="p-3">
                    <span className="bg-red-50 text-[#D71920] px-2 py-0.5 rounded border border-red-200 text-[10px] font-bold">
                      {art.categoryName}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {art.districtName || art.stateName || 'विशेष'}
                  </td>
                  <td className="p-3 font-medium text-gray-800">
                    {art.reporterName || art.authorName}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-[#D71920]">
                    {art.views}
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(art.publishDate).toLocaleDateString('hi-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
