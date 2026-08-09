import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit3, Trash2 } from 'lucide-react';
import { Category } from '../../../types/news';
import { NewsService } from '../../../services/newsService';

export const CategoryManagerView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameHindi, setNameHindi] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    setCategories(NewsService.getCategories());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameHindi || !slug) return;

    NewsService.addCategory({
      nameHindi,
      nameEnglish: nameEnglish || nameHindi,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      sortOrder: categories.length + 1,
      isHidden: false
    });

    setNameHindi('');
    setNameEnglish('');
    setSlug('');
    setCategories(NewsService.getCategories());
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-red-200 pb-4">
        <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-[#D71920]" />
          <span>श्रेणी प्रबंधन (News Categories)</span>
        </h2>
        <p className="text-xs text-gray-600 font-medium">वेबसाइट के मुख्य नेविगेशन बार की श्रेणियों को प्रबंधित करें।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <form onSubmit={handleAdd} className="md:col-span-5 bg-white border border-red-100 rounded-2xl p-5 space-y-4 text-xs shadow-xs">
          <h3 className="font-black text-sm text-[#D71920] font-serif-devanagari border-b border-red-100 pb-2">नई श्रेणी जोड़ें</h3>

          <div>
            <label className="block text-gray-800 font-bold mb-1">श्रेणी का नाम (हिंदी में) *</label>
            <input
              type="text"
              required
              placeholder="उदा. व्यापार, कृषि, अपराध"
              value={nameHindi}
              onChange={(e) => {
                setNameHindi(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-lg p-2.5 focus:border-[#D71920] outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">श्रेणी का नाम (English)</label>
            <input
              type="text"
              placeholder="e.g. Business, Sports"
              value={nameEnglish}
              onChange={(e) => setNameEnglish(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:border-[#D71920] outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">URL Slug *</label>
            <input
              type="text"
              required
              placeholder="e.g. business"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-[#D71920] font-mono font-bold rounded-lg p-2.5 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>श्रेणी जोड़ें (Save Category)</span>
          </button>
        </form>

        <div className="md:col-span-7 bg-white border border-red-100 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-red-50 text-[#D71920] font-bold uppercase border-b border-red-100">
              <tr>
                <th className="p-3">क्रम</th>
                <th className="p-3">श्रेणी (हिंदी)</th>
                <th className="p-3">Slug</th>
                <th className="p-3 text-center">स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-red-50/40">
                  <td className="p-3 font-mono font-bold text-gray-500">{c.order}</td>
                  <td className="p-3 font-bold text-gray-900 font-serif-devanagari">{c.nameHindi}</td>
                  <td className="p-3 font-mono text-[#D71920] font-bold">{c.slug}</td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      सक्रिय (Active)
                    </span>
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
