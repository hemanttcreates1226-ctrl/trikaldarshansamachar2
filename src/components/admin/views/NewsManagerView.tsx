import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Search, Edit3, Trash2, Eye, Flame, Sparkles, Check, X, MapPin, Upload, Video, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { NewsArticle, Category, State, District, Reporter } from '../../../types/news';
import { NewsService } from '../../../services/newsService';

interface NewsManagerViewProps {
  initialOpenModal?: boolean;
}

export const NewsManagerView: React.FC<NewsManagerViewProps> = ({ initialOpenModal = false }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(initialOpenModal);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    content: '',
    summary: '',
    featuredImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80',
    videoUrl: '',
    categorySlug: 'local-news',
    stateId: 'st-mp',
    districtId: 'dt-ujn',
    cityName: 'उज्जैन',
    reporterId: '',
    authorName: 'सम्पादकीय मण्डल',
    isBreaking: false,
    isFeatured: false,
    isSpecialReport: false,
    tagsStr: 'उज्जैन, समाचार, विकास'
  });

  const loadAll = () => {
    setArticles(NewsService.getArticles({ status: 'all' }));
    setCategories(NewsService.getCategories());
    setStates(NewsService.getStates());
    setDistricts(NewsService.getDistricts(form.stateId));
    setReporters(NewsService.getReporters());
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    setDistricts(NewsService.getDistricts(form.stateId));
  }, [form.stateId]);

  // Handle direct file upload for Image
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setForm(prev => ({ ...prev, featuredImage: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle direct file upload for Video
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setForm(prev => ({ ...prev, videoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingArticle(null);
    setForm({
      title: '',
      subtitle: '',
      content: '',
      summary: '',
      featuredImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80',
      videoUrl: '',
      categorySlug: 'local-news',
      stateId: 'st-mp',
      districtId: 'dt-ujn',
      cityName: 'उज्जैन',
      reporterId: '',
      authorName: 'सम्पादकीय मण्डल',
      isBreaking: false,
      isFeatured: false,
      isSpecialReport: false,
      tagsStr: 'उज्जैन, समाचार'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (article: NewsArticle) => {
    setEditingArticle(article);
    const stateId = article.stateId || 'st-mp';
    setDistricts(NewsService.getDistricts(stateId));
    setForm({
      title: article.title,
      subtitle: article.subtitle || '',
      content: article.content,
      summary: article.summary,
      featuredImage: article.featuredImage,
      videoUrl: article.videoUrl || '',
      categorySlug: article.categorySlug,
      stateId: stateId,
      districtId: article.districtId || 'dt-ujn',
      cityName: article.cityName || '',
      reporterId: article.reporterId || '',
      authorName: article.authorName,
      isBreaking: article.isBreaking,
      isFeatured: article.isFeatured,
      isSpecialReport: !!article.isSpecialReport,
      tagsStr: article.tags?.join(', ') || ''
    });
    setModalOpen(true);
  };

  const handleToggleBreaking = (article: NewsArticle) => {
    NewsService.saveArticle({
      id: article.id,
      isBreaking: !article.isBreaking
    });
    loadAll();
  };

  const handleToggleFeatured = (article: NewsArticle) => {
    NewsService.saveArticle({
      id: article.id,
      isFeatured: !article.isFeatured
    });
    loadAll();
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('कृपया समाचार का शीर्षक एवं विवरण भरें!');
      return;
    }

    const categoryObj = categories.find(c => c.slug === form.categorySlug);
    const stateObj = states.find(s => s.id === form.stateId);
    const districtObj = districts.find(d => d.id === form.districtId);
    const reporterObj = reporters.find(r => r.id === form.reporterId);

    const tags = form.tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    NewsService.saveArticle({
      id: editingArticle?.id,
      title: form.title,
      subtitle: form.subtitle,
      content: form.content,
      summary: form.summary || form.content.slice(0, 150),
      featuredImage: form.featuredImage,
      videoUrl: form.videoUrl || undefined,
      categorySlug: form.categorySlug,
      categoryName: categoryObj?.nameHindi || 'स्थानीय',
      stateId: form.stateId,
      stateName: stateObj?.nameHindi || 'मध्य प्रदेश',
      districtId: form.districtId,
      districtName: districtObj?.nameHindi || 'उज्जैन',
      cityName: form.cityName,
      reporterId: form.reporterId,
      reporterName: reporterObj?.name,
      authorName: reporterObj?.name || form.authorName,
      isBreaking: form.isBreaking,
      isFeatured: form.isFeatured,
      isSpecialReport: form.isSpecialReport,
      tags,
      status: 'published'
    });

    setModalOpen(false);
    showToast(`✅ '${form.title}' समाचार सफलतापूर्वक प्रकाशित/अद्यतित किया गया!`);
    loadAll();
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const confirmDeleteArticle = () => {
    if (deleteTarget) {
      NewsService.deleteArticle(deleteTarget.id);
      showToast(`🗑️ '${deleteTarget.title}' समाचार सफलतापूर्वक हटाया गया।`, 'info');
      setDeleteTarget(null);
      loadAll();
    }
  };

  const filteredArticles = articles.filter(a => {
    const title = a.title || '';
    const summary = a.summary || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'all' || a.categorySlug === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-200 pb-4">
        <div>
          <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#D71920]" />
            <span>समाचार प्रबंधन (News Article CMS)</span>
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            समाचार व वीडियो पोस्ट करें, फोटो/वीडियो अपलोड करें, संपादित करें एवं प्रकाशित करें।
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs shadow-sm hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>नया समाचार जोड़ें (Add News)</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white border border-red-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="शीर्षक खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-2 focus:border-[#D71920] outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-600 font-bold">श्रेणी:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-[#D71920] rounded-lg p-2 font-bold outline-none"
          >
            <option value="all">समस्त श्रेणियां</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.nameHindi}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-red-50 text-[#D71920] font-bold uppercase border-b border-red-100">
              <tr>
                <th className="p-3">शीर्षक (Title)</th>
                <th className="p-3">श्रेणी</th>
                <th className="p-3">स्थान</th>
                <th className="p-3">रिपोर्टर</th>
                <th className="p-3 text-center">फ्लैग्स</th>
                <th className="p-3 text-center">पाठक</th>
                <th className="p-3 text-right">कार्रवाई (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredArticles.map((art) => (
                <tr key={art.id} className="hover:bg-red-50/40 transition">
                  <td className="p-3 font-bold font-serif-devanagari text-gray-900 max-w-sm">
                    <p className="line-clamp-1">{art.title}</p>
                    <p className="text-[10px] text-gray-500 font-mono font-normal">
                      {new Date(art.publishDate).toLocaleString('hi-IN')}
                    </p>
                  </td>
                  <td className="p-3">
                    <span className="bg-red-50 text-[#D71920] px-2 py-0.5 rounded border border-red-200 text-[10px] font-bold">
                      {art.categoryName}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {art.districtName || art.stateName || 'विशेष'}
                  </td>
                  <td className="p-3 text-gray-800 font-bold">
                    {art.reporterName || art.authorName}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleBreaking(art)}
                        className={`p-1 rounded border transition cursor-pointer ${
                          art.isBreaking
                            ? 'bg-red-100 text-red-700 border-red-300 font-bold shadow-xs'
                            : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-red-50 hover:text-red-600'
                        }`}
                        title={art.isBreaking ? 'बड़ी खबर (सक्रिय - बंद करने के लिए क्लिक करें)' : 'बड़ी खबर (Breaking) बनाएं'}
                      >
                        <Flame className={`w-3.5 h-3.5 ${art.isBreaking ? 'fill-red-600 text-red-600' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(art)}
                        className={`p-1 rounded border transition cursor-pointer ${
                          art.isFeatured
                            ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold shadow-xs'
                            : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                        title={art.isFeatured ? 'मुख्य समाचार (सक्रिय - बंद करने के लिए क्लिक करें)' : 'मुख्य समाचार (Featured) बनाएं'}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${art.isFeatured ? 'text-amber-700' : ''}`} />
                      </button>

                      {art.videoUrl && (
                        <span className="p-1 bg-blue-100 text-blue-800 border border-blue-200 rounded" title="वीडियो समाचार">
                          <Video className="w-3.5 h-3.5 text-blue-700" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-[#D71920]">
                    {art.views}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(art)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded border border-gray-200 transition cursor-pointer"
                        title="संपादित करें"
                      >
                        <Edit3 className="w-4 h-4 text-gray-800" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(art)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 transition cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Article Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-red-200 rounded-2xl max-w-3xl w-full p-6 text-gray-900 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <h3 className="font-black text-lg font-serif-devanagari text-[#D71920]">
                {editingArticle ? 'समाचार सम्पादित करें' : 'नया समाचार / वीडियो प्रकाशित करें'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-gray-800 font-bold mb-1">समाचार का मुख्य शीर्षक (Headline) *</label>
                <input
                  type="text"
                  required
                  placeholder="मुख्य शीर्षक दर्ज करें..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:border-[#D71920] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-1">उप-शीर्षक (Sub-headline / Punch Line)</label>
                <input
                  type="text"
                  placeholder="उप-शीर्षक भरें..."
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-800 rounded-lg p-2 focus:border-[#D71920] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-800 font-bold mb-1">श्रेणी (Category)</label>
                  <select
                    value={form.categorySlug}
                    onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-[#D71920] font-bold rounded-lg p-2 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.nameHindi}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">राज्य (State)</label>
                  <select
                    value={form.stateId}
                    onChange={(e) => setForm({ ...form, stateId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 outline-none font-bold"
                  >
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.nameHindi}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">जिला (District)</label>
                  <select
                    value={form.districtId}
                    onChange={(e) => setForm({ ...form, districtId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 outline-none font-bold"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.nameHindi}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-1">संवाददाता (Reporter Tag)</label>
                <select
                  value={form.reporterId}
                  onChange={(e) => setForm({ ...form, reporterId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 outline-none font-bold"
                >
                  <option value="">सम्पादकीय मण्डल (Default)</option>
                  {reporters.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.designation})</option>
                  ))}
                </select>
              </div>

              {/* Upload Image Section (URL or File Upload) */}
              <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-2">
                <label className="block text-[#D71920] font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>मुख्य चित्र (Featured Photo) - URL या डिवाइस से अपलोड</span>
                  </span>
                  <label className="px-3 py-1 bg-[#D71920] text-white rounded text-[11px] font-bold cursor-pointer hover:bg-[#A80F16] transition flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>फोटो अपलोड करें</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </label>

                <input
                  type="text"
                  placeholder="https://... या उपर्युक्त बटन से फोटो चुनें"
                  value={form.featuredImage}
                  onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-xs text-gray-800 rounded-lg p-2 outline-none font-mono"
                />

                {form.featuredImage && (
                  <div className="w-28 h-20 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                    <img src={form.featuredImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Upload Video Section (URL or File Upload) */}
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                <label className="block text-blue-900 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-blue-700" />
                    <span>वीडियो समाचार (Video URL or Direct Upload)</span>
                  </span>
                  <label className="px-3 py-1 bg-blue-700 text-white rounded text-[11px] font-bold cursor-pointer hover:bg-blue-800 transition flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>वीडियो फ़ाइल अपलोड करें</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileUpload}
                      className="hidden"
                    />
                  </label>
                </label>

                <input
                  type="text"
                  placeholder="YouTube embed URL / MP4 URL अथवा फ़ाइल अपलोड करें..."
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-xs text-gray-800 rounded-lg p-2 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-1">समाचार का विस्तृत विवरण (Content Body) *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="समाचार का विस्तृत विवरण भरें..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 text-sm focus:border-[#D71920] outline-none font-serif-devanagari font-medium"
                ></textarea>
              </div>

              {/* Special Toggles */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-6 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer text-red-700 font-bold">
                  <input
                    type="checkbox"
                    checked={form.isBreaking}
                    onChange={(e) => setForm({ ...form, isBreaking: e.target.checked })}
                    className="w-4 h-4 accent-[#D71920] cursor-pointer"
                  />
                  <span>बड़ी खबर (Breaking News)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-amber-800 font-bold">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                  <span>मुख्य बैनर खबर (Featured Hero)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#D71920] font-bold">
                  <input
                    type="checkbox"
                    checked={form.isSpecialReport}
                    onChange={(e) => setForm({ ...form, isSpecialReport: e.target.checked })}
                    className="w-4 h-4 accent-red-800 cursor-pointer"
                  />
                  <span>विशेष रिपोर्ट (Special Ground Report)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs shadow-md hover:opacity-95 cursor-pointer"
                >
                  समाचार प्रकाशित करें (Publish Now)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-300 rounded-2xl max-w-md w-full p-6 text-gray-900 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900 font-serif-devanagari">समाचार हटाने की पुष्टि करें</h3>
                <p className="text-xs text-gray-500 font-medium">यह समाचार स्थायी रूप से हट जाएगा।</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs font-bold text-gray-800 line-clamp-2">
              "{deleteTarget.title}"
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
                onClick={confirmDeleteArticle}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                हाँ, समाचार हटाएं (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-3 animate-bounce">
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
        </div>
      )}
    </div>
  );
};
