import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, XCircle, Award, FileText, Search, Printer, Download } from 'lucide-react';
import { MemberApplication } from '../../../types/news';
import { NewsService } from '../../../services/newsService';

export const ApplicationsManagerView: React.FC = () => {
  const [apps, setApps] = useState<MemberApplication[]>([]);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<MemberApplication | null>(null);
  const [remarksInput, setRemarksInput] = useState('');

  const loadAll = () => {
    setApps(NewsService.getApplications());
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleApprove = (id: string) => {
    if (confirm('क्या आप इस आवेदन को स्वीकार करके प्रेस ID कार्ड एवं नियुक्ति पत्र जारी करना चाहते हैं?')) {
      NewsService.approveApplication(id, remarksInput || 'आवेदन सम्पादकीय मण्डल द्वारा स्वीकृत।');
      setSelectedApp(null);
      loadAll();
    }
  };

  const handleReject = (id: string) => {
    if (confirm('क्या आप इस आवेदन को निरस्त करना चाहते हैं?')) {
      NewsService.rejectApplication(id, remarksInput || 'आवश्यक दस्तावेजों/योग्यता की कमी हेतु अस्वीकृत।');
      setSelectedApp(null);
      loadAll();
    }
  };

  const handlePrintPDF = (app: MemberApplication) => {
    window.print();
  };

  const filteredApps = apps.filter(a =>
    a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.mobile.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-200 pb-4">
        <div>
          <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#D71920]" />
            <span>पत्रकारिता आवेदन प्रबंधन (Applications Review)</span>
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            नागरिकों एवं पत्रकारों द्वारा जमा किए गए आवेदनों का सत्यापन, अनुमोदन एवं प्रेस ID कार्ड / पीडीएफ डिलीवरी।
          </p>
        </div>
      </div>

      <div className="bg-white border border-red-100 rounded-xl p-4 flex items-center gap-2 text-xs shadow-xs">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="आवेदक का नाम, Application ID या मोबाइल नंबर खोजें..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-medium rounded-lg p-2 focus:border-[#D71920] outline-none"
        />
      </div>

      {/* Applications Data Table */}
      <div className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-red-50 text-[#D71920] font-bold uppercase border-b border-red-100">
              <tr>
                <th className="p-3">App ID</th>
                <th className="p-3">आवेदक नाम</th>
                <th className="p-3">वांछित पद</th>
                <th className="p-3">स्थान</th>
                <th className="p-3">संपर्क</th>
                <th className="p-3">स्थिति (Status)</th>
                <th className="p-3 text-right">समीक्षा (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.map((a) => (
                <tr key={a.id} className="hover:bg-red-50/40 transition">
                  <td className="p-3 font-mono font-bold text-[#D71920]">{a.id}</td>
                  <td className="p-3 font-bold text-gray-900 font-serif-devanagari">{a.fullName}</td>
                  <td className="p-3 font-bold text-gray-800">{a.position}</td>
                  <td className="p-3 text-gray-600">{a.districtName}, {a.stateName}</td>
                  <td className="p-3 font-mono font-bold text-gray-700">{a.mobile}</td>
                  <td className="p-3">
                    {a.status === 'approved' && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                        स्वीकृत (Approved)
                      </span>
                    )}
                    {a.status === 'pending' && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-300 px-2 py-0.5 rounded font-bold text-[10px] animate-pulse">
                        समीक्षा हेतु (Pending)
                      </span>
                    )}
                    {a.status === 'rejected' && (
                      <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold text-[10px]">
                        निरस्त (Rejected)
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {a.status === 'approved' && (
                        <button
                          onClick={() => handlePrintPDF(a)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition flex items-center gap-1 cursor-pointer"
                          title="PDF / प्रिंट करें"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedApp(a)}
                        className="px-3 py-1 bg-gray-100 hover:bg-red-50 text-[#D71920] border border-red-200 rounded font-bold transition cursor-pointer"
                      >
                        समीक्षा करें →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-200 rounded-2xl max-w-2xl w-full p-6 text-gray-900 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <h3 className="font-black text-lg font-serif-devanagari text-[#D71920]">
                आवेदन समीक्षा: {selectedApp.fullName} ({selectedApp.id})
              </h3>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-700 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-red-50/50 p-4 rounded-xl border border-red-100 font-sans font-medium">
              <p><span className="text-gray-500 font-bold">नाम:</span> <strong className="text-gray-900">{selectedApp.fullName}</strong></p>
              <p><span className="text-gray-500 font-bold">पिता का नाम:</span> {selectedApp.fatherName}</p>
              <p><span className="text-gray-500 font-bold">पद:</span> <span className="text-[#D71920] font-bold">{selectedApp.position}</span></p>
              <p><span className="text-gray-500 font-bold">स्थान:</span> {selectedApp.districtName}, {selectedApp.stateName}</p>
              <p><span className="text-gray-500 font-bold">मोबाइल:</span> {selectedApp.mobile}</p>
              <p><span className="text-gray-500 font-bold">ईमेल:</span> {selectedApp.email}</p>
              <p className="col-span-2"><span className="text-gray-500 font-bold">योग्यता:</span> {selectedApp.qualification}</p>
              <p className="col-span-2"><span className="text-gray-500 font-bold">अनुभव:</span> {selectedApp.experience}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">प्रशासनिक टिप्पणी (Admin Remarks):</label>
              <input
                type="text"
                placeholder="समीक्षा टिप्पणी दर्ज करें..."
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 text-xs outline-none font-medium"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-xs font-bold cursor-pointer"
              >
                बंद करें
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleReject(selectedApp.id)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-red-700" />
                  <span>निरस्त करें (Reject)</span>
                </button>

                <button
                  onClick={() => handleApprove(selectedApp.id)}
                  className="px-5 py-2 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:opacity-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>स्वीकृत करें & ID जारी करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
