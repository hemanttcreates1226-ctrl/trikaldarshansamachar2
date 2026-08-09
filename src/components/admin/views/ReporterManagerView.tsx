import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, Award } from 'lucide-react';
import { Reporter } from '../../../types/news';
import { NewsService } from '../../../services/newsService';

export const ReporterManagerView: React.FC = () => {
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('जिला संवाददाता');
  const [district, setDistrict] = useState('उज्जैन');
  const [mobile, setMobile] = useState('');

  useEffect(() => {
    setReporters(NewsService.getReporters());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;

    NewsService.addReporter({
      name,
      designation,
      districtName: district,
      mobile,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      status: 'active'
    });

    setName('');
    setMobile('');
    setReporters(NewsService.getReporters());
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-red-200 pb-4">
        <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-[#D71920]" />
          <span>संवाददाता / टीम प्रबंधन (Reporters & Bureau)</span>
        </h2>
        <p className="text-xs text-gray-600 font-medium">पत्रकारों की सूची, पदनाम एवं कार्यक्षेत्र नियंत्रण।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <form onSubmit={handleAdd} className="md:col-span-4 bg-white border border-red-100 rounded-2xl p-5 space-y-3 text-xs shadow-xs">
          <h3 className="font-black text-sm text-[#D71920] font-serif-devanagari border-b border-red-100 pb-2">नया पत्रकार / ब्यूरो जोड़ें</h3>

          <div>
            <label className="block text-gray-800 font-bold mb-1">पत्रकार का पूरा नाम *</label>
            <input
              type="text"
              required
              placeholder="नाम दर्ज करें"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-lg p-2.5 outline-none focus:border-[#D71920]"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">पदनाम (Designation)</label>
            <input
              type="text"
              placeholder="उदा. ब्यूरो चीफ / जिला संवाददाता"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 outline-none focus:border-[#D71920]"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">जिला/कार्यक्षेत्र</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 outline-none focus:border-[#D71920]"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1">मोबाइल नंबर *</label>
            <input
              type="tel"
              required
              placeholder="10 अंकों का नंबर"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 outline-none font-mono font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>टीम सदस्य जोड़ें (Save Member)</span>
          </button>
        </form>

        <div className="md:col-span-8 bg-white border border-red-100 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-red-50 text-[#D71920] font-bold uppercase border-b border-red-100">
              <tr>
                <th className="p-3">सदस्य ID</th>
                <th className="p-3">पत्रकार</th>
                <th className="p-3">पदनाम</th>
                <th className="p-3">स्थान</th>
                <th className="p-3">मोबाइल</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reporters.map((r) => (
                <tr key={r.id} className="hover:bg-red-50/40">
                  <td className="p-3 font-mono text-[#D71920] font-bold">{r.memberId}</td>
                  <td className="p-3 font-bold text-gray-900 font-serif-devanagari">{r.name}</td>
                  <td className="p-3 text-gray-800 font-bold">{r.designation}</td>
                  <td className="p-3 text-gray-600">{r.districtName}</td>
                  <td className="p-3 font-mono font-bold text-gray-800">{r.mobile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
