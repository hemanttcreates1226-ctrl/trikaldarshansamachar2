import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, XCircle, Award, FileText, Search, Printer, Download, Trash2, ShieldCheck, Check, AlertCircle, X } from 'lucide-react';
import { MemberApplication } from '../../../types/news';
import { NewsService } from '../../../services/newsService';

export const ApplicationsManagerView: React.FC = () => {
  const [apps, setApps] = useState<MemberApplication[]>([]);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<MemberApplication | null>(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MemberApplication | null>(null);

  const loadAll = () => {
    const list = NewsService.getApplications();
    setApps(list);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenReview = (app: MemberApplication) => {
    setSelectedApp(app);
    setRemarksInput(app.adminRemarks || '');
  };

  const handleApprove = (id: string) => {
    const remarks = remarksInput.trim() || 'आवेदन सम्पादकीय मण्डल द्वारा स्वीकृत। प्रेस ID कार्ड एवं नियुक्ति पत्र जारी।';
    const updated = NewsService.approveApplication(id, remarks);
    if (updated) {
      setSelectedApp(updated);
      showToast(`✅ '${updated.fullName}' का आवेदन सफलतापूर्वक स्वीकृत! प्रेस ID: ${updated.pressId || 'जारी'}`);
      loadAll();
    }
  };

  const handleReject = (id: string) => {
    const remarks = remarksInput.trim() || 'आवश्यक दस्तावेजों/योग्यता की कमी हेतु अस्वीकृत।';
    const updated = NewsService.rejectApplication(id, remarks);
    if (updated) {
      setSelectedApp(updated);
      showToast(`❌ '${updated.fullName}' का आवेदन निरस्त कर दिया गया है।`, 'error');
      loadAll();
    }
  };

  const confirmDeleteApplication = () => {
    if (deleteTarget) {
      NewsService.deleteApplication(deleteTarget.id);
      if (selectedApp?.id === deleteTarget.id) {
        setSelectedApp(null);
      }
      showToast(`🗑️ '${deleteTarget.fullName}' का आवेदन सूची से हटा दिया गया है।`, 'info');
      setDeleteTarget(null);
      loadAll();
    }
  };

  const handlePrintApplicationPDF = (app: MemberApplication) => {
    window.print();
  };

  const filteredApps = apps.filter(a =>
    a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.mobile.includes(search) ||
    a.districtName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-xs font-bold transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-700' :
          toast.type === 'error' ? 'bg-red-900 text-red-100 border-red-700' :
          'bg-gray-900 text-gray-100 border-gray-700'
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* Header */}
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

      {/* Search Input Bar */}
      <div className="bg-white border border-red-100 rounded-xl p-4 flex items-center gap-2 text-xs shadow-xs">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="आवेदक का नाम, Application ID, जिला या मोबाइल नंबर खोजें..."
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
                <th className="p-3 text-right">समीक्षा व कारर्वाई (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">
                    कोई आवेदन नहीं मिला।
                  </td>
                </tr>
              ) : (
                filteredApps.map((a) => (
                  <tr key={a.id} className="hover:bg-red-50/40 transition">
                    <td className="p-3 font-mono font-bold text-[#D71920]">{a.id}</td>
                    <td className="p-3 font-bold text-gray-900 font-serif-devanagari">{a.fullName}</td>
                    <td className="p-3 font-bold text-gray-800">
                      {a.position === 'bureau_chief' ? 'ब्यूरो चीफ' : 'संवाददाता'}
                    </td>
                    <td className="p-3 text-gray-600">{a.districtName}, {a.stateName}</td>
                    <td className="p-3 font-mono font-bold text-gray-700">{a.mobile}</td>
                    <td className="p-3">
                      {a.status === 'approved' && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>स्वीकृत (Approved)</span>
                        </span>
                      )}
                      {a.status === 'pending' && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-300 px-2 py-1 rounded font-bold text-[10px] animate-pulse inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>समीक्षा हेतु (Pending)</span>
                        </span>
                      )}
                      {a.status === 'rejected' && (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded font-bold text-[10px] inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>निरस्त (Rejected)</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {a.status === 'approved' && (
                          <button
                            onClick={() => handlePrintApplicationPDF(a)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition flex items-center gap-1 cursor-pointer text-[11px]"
                            title="प्रिंट आवेदन / पीडीएफ"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenReview(a)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-[#D71920] border border-red-200 rounded-lg font-bold transition cursor-pointer text-[11px] flex items-center gap-1"
                        >
                          <span>समीक्षा करें</span>
                          <span>→</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(a)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition cursor-pointer"
                          title="आवेदन हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white border-2 border-red-200 rounded-2xl max-w-2xl w-full p-6 text-gray-900 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div>
                <h3 className="font-black text-lg font-serif-devanagari text-[#D71920] flex items-center gap-2">
                  <span>आवेदन समीक्षा: {selectedApp.fullName}</span>
                </h3>
                <p className="text-[11px] text-gray-500 font-mono font-bold">App ID: {selectedApp.id}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)} 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Indicator */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
              <span className="font-bold text-gray-700">वर्तमान स्थिति:</span>
              <div>
                {selectedApp.status === 'approved' && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-black text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>स्वीकृत (Approved) - Press ID: {selectedApp.pressId || 'जारी'}</span>
                  </span>
                )}
                {selectedApp.status === 'pending' && (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full font-black text-xs flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>समीक्षा हेतु (Pending Review)</span>
                  </span>
                )}
                {selectedApp.status === 'rejected' && (
                  <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full font-black text-xs flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>निरस्त (Rejected)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Application Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-red-50/50 p-4 rounded-xl border border-red-100 font-sans font-medium">
              <p><span className="text-gray-500 font-bold">आवेदक नाम:</span> <strong className="text-gray-900">{selectedApp.fullName}</strong></p>
              <p><span className="text-gray-500 font-bold">पिता का नाम:</span> {selectedApp.fatherName}</p>
              <p><span className="text-gray-500 font-bold">वांछित पद:</span> <span className="text-[#D71920] font-bold">{selectedApp.position === 'bureau_chief' ? 'ब्यूरो चीफ' : 'संवाददाता'}</span></p>
              <p><span className="text-gray-500 font-bold">स्थान:</span> {selectedApp.districtName}, {selectedApp.stateName}</p>
              <p><span className="text-gray-500 font-bold">मोबाइल:</span> {selectedApp.mobile}</p>
              <p><span className="text-gray-500 font-bold">ईमेल:</span> {selectedApp.email}</p>
              <p className="col-span-1 sm:col-span-2"><span className="text-gray-500 font-bold">शैक्षणिक योग्यता:</span> {selectedApp.qualification}</p>
              <p className="col-span-1 sm:col-span-2"><span className="text-gray-500 font-bold">पत्रकारिता अनुभव:</span> {selectedApp.experience}</p>
            </div>

            {/* Admin Remarks Input */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">प्रशासनिक टिप्पणी (Admin Remarks):</label>
              <input
                type="text"
                placeholder="समीक्षा टिप्पणी दर्ज करें (उदा. सम्पादकीय मण्डल द्वारा स्वीकृत...)"
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-xs outline-none focus:border-[#D71920] font-medium"
              />
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-900 text-xs font-bold cursor-pointer"
              >
                बंद करें
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                {/* Reject Button */}
                <button
                  type="button"
                  onClick={() => handleReject(selectedApp.id)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  <XCircle className="w-4 h-4 text-red-700" />
                  <span>निरस्त करें (Reject)</span>
                </button>

                {/* Approve Button */}
                <button
                  type="button"
                  onClick={() => handleApprove(selectedApp.id)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 active:scale-95 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>स्वीकृत करें & ID जारी करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-red-300 rounded-2xl max-w-md w-full p-6 text-gray-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900 font-serif-devanagari">आवेदन हटाने की पुष्टि करें</h3>
                <p className="text-xs text-gray-500 font-medium">यह आवेदन सूची से स्थायी रूप से हट जाएगा।</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs font-bold text-gray-800">
              "{deleteTarget.fullName}" (ID: {deleteTarget.id} - {deleteTarget.districtName})
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
                onClick={confirmDeleteApplication}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                हाँ, आवेदन हटाएं (Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

