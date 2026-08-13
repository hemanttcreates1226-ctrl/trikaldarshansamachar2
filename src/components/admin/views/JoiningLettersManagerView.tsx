import React, { useState, useEffect } from 'react';
import { FileText, Printer, Eye, Plus, Edit3, Trash2, Search, X, Check, UserCheck, AlertCircle } from 'lucide-react';
import { JoiningLetter, Reporter, MemberApplication } from '../../../types/news';
import { NewsService } from '../../../services/newsService';
import { JoiningLetterView } from '../../press/JoiningLetterView';

export const JoiningLettersManagerView: React.FC = () => {
  const [letters, setLetters] = useState<JoiningLetter[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [applications, setApplications] = useState<MemberApplication[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<JoiningLetter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<JoiningLetter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JoiningLetter | null>(null);

  // Form State
  const [form, setForm] = useState({
    letterNo: '',
    memberId: '',
    name: '',
    designation: 'जिला संवाददाता',
    stateName: 'मध्य प्रदेश',
    districtName: 'उज्जैन',
    issueDate: new Date().toISOString().split('T')[0],
    joiningDate: new Date().toISOString().split('T')[0],
    responsibilities: [
      'उज्जैन क्षेत्र में सत्य, पारदर्शी एवं निष्पक्ष समाचारों का संकलन।',
      'त्रिकाल दर्शन समाचार की सम्पादकीय नीतियों एवं आचार संहिता का निष्ठापूर्वक पालन।',
      'स्थानीय जनसमस्याओं और विकास कार्यों का यथार्थवादी कवरेज।'
    ],
    terms: [
      'यह नियुक्ति पत्र त्रिकाल दर्शन समाचार मीडिया हाऊस द्वारा जारी अधिकृत दस्तावेज है।',
      'पत्रकारिता के नैतिक मूल्यों का उल्लंघन करने पर नियुक्ति स्वतः निरस्त मानी जाएगी।',
      'प्रेस परिचय पत्र केवल समाचार संकलन कार्य हेतु मान्य होगा।'
    ],
    editorName: 'राजकमल पांडेय - प्रधान सम्पादक (Editor-in-Chief)'
  });

  const [respInput, setRespInput] = useState('');
  const [termInput, setTermInput] = useState('');

  const loadAll = () => {
    const list = NewsService.getJoiningLetters();
    setLetters(list);
    setReporters(NewsService.getReporters());
    setApplications(NewsService.getApplications().filter(a => a.status === 'approved'));
    if (list.length > 0 && !selectedLetter) {
      setSelectedLetter(list[0]);
    } else if (selectedLetter) {
      const updated = list.find(l => l.id === selectedLetter.id);
      setSelectedLetter(updated || (list.length > 0 ? list[0] : null));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingLetter(null);
    const yr = new Date().getFullYear();
    const rnd = Math.floor(8000 + Math.random() * 1000);
    setForm({
      letterNo: `TDS/HR/${yr}/${rnd}`,
      memberId: `TDS-MEM-${rnd}`,
      name: '',
      designation: 'जिला संवाददाता',
      stateName: 'मध्य प्रदेश',
      districtName: 'उज्जैन',
      issueDate: new Date().toISOString().split('T')[0],
      joiningDate: new Date().toISOString().split('T')[0],
      responsibilities: [
        'उज्जैन क्षेत्र में सत्य, पारदर्शी एवं निष्पक्ष समाचारों का संकलन।',
        'त्रिकाल दर्शन समाचार की सम्पादकीय नीतियों एवं आचार संहिता का निष्ठापूर्वक पालन।',
        'स्थानीय जनसमस्याओं और विकास कार्यों का यथार्थवादी कवरेज।'
      ],
      terms: [
        'यह नियुक्ति पत्र त्रिकाल दर्शन समाचार मीडिया हाऊस द्वारा जारी अधिकृत दस्तावेज है।',
        'पत्रकारिता के नैतिक मूल्यों का उल्लंघन करने पर नियुक्ति स्वतः निरस्त मानी जाएगी।',
        'प्रेस परिचय पत्र केवल समाचार संकलन कार्य हेतु मान्य होगा।'
      ],
      editorName: 'राजकमल पांडेय - प्रधान सम्पादक (Editor-in-Chief)'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (letter: JoiningLetter) => {
    setEditingLetter(letter);
    setForm({
      letterNo: letter.letterNo,
      memberId: letter.memberId,
      name: letter.name,
      designation: letter.designation,
      stateName: letter.stateName,
      districtName: letter.districtName,
      issueDate: letter.issueDate,
      joiningDate: letter.joiningDate || letter.issueDate,
      responsibilities: [...letter.responsibilities],
      terms: [...letter.terms],
      editorName: letter.editorName || 'राजकमल पांडेय - प्रधान सम्पादक (Editor-in-Chief)'
    });
    setModalOpen(true);
  };

  const handleAutofillFromReporter = (repId: string) => {
    const rep = reporters.find(r => r.id === repId);
    if (rep) {
      setForm(prev => ({
        ...prev,
        name: rep.name,
        designation: rep.designation || 'जिला संवाददाता',
        stateName: rep.stateName || 'मध्य प्रदेश',
        districtName: rep.districtName || 'उज्जैन',
        memberId: rep.memberId || prev.memberId
      }));
    }
  };

  const handleAutofillFromApp = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      setForm(prev => ({
        ...prev,
        name: app.fullName,
        designation: app.position === 'bureau_chief' ? 'ब्यूरो चीफ' : 'जिला संवाददाता',
        stateName: app.stateName || 'मध्य प्रदेश',
        districtName: app.districtName || 'उज्जैन',
        memberId: app.memberId || prev.memberId
      }));
    }
  };

  const handleAddResponsibility = () => {
    if (!respInput.trim()) return;
    setForm(prev => ({ ...prev, responsibilities: [...prev.responsibilities, respInput.trim()] }));
    setRespInput('');
  };

  const handleRemoveResponsibility = (idx: number) => {
    setForm(prev => ({ ...prev, responsibilities: prev.responsibilities.filter((_, i) => i !== idx) }));
  };

  const handleAddTerm = () => {
    if (!termInput.trim()) return;
    setForm(prev => ({ ...prev, terms: [...prev.terms, termInput.trim()] }));
    setTermInput('');
  };

  const handleRemoveTerm = (idx: number) => {
    setForm(prev => ({ ...prev, terms: prev.terms.filter((_, i) => i !== idx) }));
  };

  const handleSaveLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.letterNo) {
      alert('कृपया पत्रकार का नाम एवं पत्र क्रमांक अवश्य भरें!');
      return;
    }

    const saved = NewsService.saveJoiningLetter({
      id: editingLetter?.id,
      letterNo: form.letterNo,
      memberId: form.memberId,
      name: form.name,
      designation: form.designation,
      stateName: form.stateName,
      districtName: form.districtName,
      issueDate: form.issueDate,
      joiningDate: form.joiningDate,
      responsibilities: form.responsibilities,
      terms: form.terms,
      editorName: form.editorName
    });

    setModalOpen(false);
    setSelectedLetter(saved);
    loadAll();
  };

  const confirmDeleteLetter = () => {
    if (deleteTarget) {
      NewsService.deleteJoiningLetter(deleteTarget.id);
      if (selectedLetter?.id === deleteTarget.id) {
        setSelectedLetter(null);
      }
      setDeleteTarget(null);
      loadAll();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredLetters = letters.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.letterNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-200 pb-4 no-print">
        <div>
          <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#D71920]" />
            <span>नियुक्ति पत्र प्रबंधन (Official Joining Letters CMS)</span>
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            पत्रकारों एवं संवाददाताओं के आधिकारिक नियुक्ति पत्रों का निर्माण, संशोधन, पीडीएफ डाउनलोड एवं प्रिंटिंग।
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white font-black rounded-xl text-xs shadow-sm hover:opacity-95 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>नया नियुक्ति पत्र बनाएं (Create Letter)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar List */}
        <div className="md:col-span-4 bg-white border border-red-100 rounded-2xl p-4 space-y-3 shadow-xs no-print">
          <div className="flex items-center justify-between border-b border-red-100 pb-2">
            <h3 className="font-black text-sm text-[#D71920] font-serif-devanagari">
              नियुक्ति पत्रों की सूची ({filteredLetters.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="पत्रकार का नाम या पत्र क्र. खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:border-[#D71920] outline-none font-medium"
            />
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredLetters.map((l) => (
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenEditModal(l); }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-700 transition"
                    title="संपादित करें"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(l); }}
                    className="p-1 hover:bg-red-100 rounded text-red-600 transition"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredLetters.length === 0 && (
              <p className="text-center text-xs text-gray-500 py-6">कोई नियुक्ति पत्र नहीं मिला।</p>
            )}
          </div>
        </div>

        {/* Selected Letter View & Controls */}
        <div className="md:col-span-8 bg-white border border-red-100 rounded-2xl p-4 flex flex-col items-center justify-center space-y-4 shadow-xs">
          {selectedLetter ? (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between border-b border-red-100 pb-2 no-print flex-wrap gap-2">
                <span className="font-bold text-xs text-gray-900">
                  पूर्वावलोकन: <span className="text-[#D71920]">{selectedLetter.name} ({selectedLetter.letterNo})</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedLetter)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold border border-gray-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>संपादित करें</span>
                  </button>

                  <button
                    onClick={() => setDeleteTarget(selectedLetter)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हटाएं</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-1.5 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white rounded-lg text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>डाउनलोड / प्रिंट करें (PDF)</span>
                  </button>
                </div>
              </div>

              <div className="p-2 border border-red-200 rounded-2xl bg-gray-50/50 shadow-sm overflow-x-auto">
                <JoiningLetterView letter={selectedLetter} />
              </div>
            </div>
          ) : (
            <div className="text-center p-12 space-y-3 no-print">
              <FileText className="w-12 h-12 text-[#D71920] mx-auto opacity-50" />
              <p className="text-xs text-gray-500 font-medium">
                सूची में से किसी नियुक्ति पत्र पर क्लिक करें अथवा नया पत्र बनाएं।
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-[#D71920] text-white rounded-xl text-xs font-bold hover:bg-[#A80F16] cursor-pointer"
              >
                + नया नियुक्ति पत्र बनाएं
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating/Editing Letter */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white border-2 border-red-200 rounded-2xl max-w-3xl w-full p-6 text-gray-900 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <h3 className="font-black text-lg font-serif-devanagari text-[#D71920]">
                {editingLetter ? 'नियुक्ति पत्र सम्पादित करें' : 'नया नियुक्ति पत्र जारी करें'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Autofill Selector */}
            {!editingLetter && (
              <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-[#D71920] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>त्वरित ऑटो-फिल (Quick Autofill from Active Staff / Applications):</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-0.5">संवाददाता से चुनें:</label>
                    <select
                      onChange={(e) => handleAutofillFromReporter(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs text-gray-900 outline-none font-bold"
                    >
                      <option value="">-- पत्रकार चुनें --</option>
                      {reporters.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.designation})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-0.5">स्वीकृत आवेदन से चुनें:</label>
                    <select
                      onChange={(e) => handleAutofillFromApp(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs text-gray-900 outline-none font-bold"
                    >
                      <option value="">-- आवेदक चुनें --</option>
                      {applications.map(a => (
                        <option key={a.id} value={a.id}>{a.fullName} ({a.districtName})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveLetter} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-800 font-bold mb-1">पत्रकार / नामांकित व्यक्ति का नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. विक्रम सिंह सोलंकी"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:border-[#D71920] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">पदनाम (Designation) *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. जिला संवाददाता / ब्यूरो चीफ"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-[#D71920] font-bold rounded-lg p-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-800 font-bold mb-1">पत्र क्रमांक (Letter No) *</label>
                  <input
                    type="text"
                    required
                    value={form.letterNo}
                    onChange={(e) => setForm({ ...form, letterNo: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-mono font-bold rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">सदस्यता ID (Member ID) *</label>
                  <input
                    type="text"
                    required
                    value={form.memberId}
                    onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-mono font-bold rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">जिला (District)</label>
                  <input
                    type="text"
                    value={form.districtName}
                    onChange={(e) => setForm({ ...form, districtName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">राज्य (State)</label>
                  <input
                    type="text"
                    value={form.stateName}
                    onChange={(e) => setForm({ ...form, stateName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-lg p-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-800 font-bold mb-1">जारी करने की तिथि (Issue Date)</label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">प्रधान सम्पादक / हस्ताक्षरकर्ता नाम</label>
                  <input
                    type="text"
                    value={form.editorName}
                    onChange={(e) => setForm({ ...form, editorName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 outline-none font-bold"
                  />
                </div>
              </div>

              {/* Responsibilities Editor */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-gray-900 font-bold">मुख्य उत्तरदायित्व एवं कार्य (Key Responsibilities)</label>
                <div className="space-y-1.5">
                  {form.responsibilities.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 bg-white border border-gray-200 rounded text-xs">
                      <span>• {r}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveResponsibility(i)}
                        className="text-red-600 hover:text-red-800 font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="नया उत्तरदायित्व जोड़ें..."
                    value={respInput}
                    onChange={(e) => setRespInput(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded p-1.5 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddResponsibility}
                    className="px-3 py-1.5 bg-[#D71920] text-white rounded font-bold text-xs hover:bg-[#A80F16]"
                  >
                    + जोड़ें
                  </button>
                </div>
              </div>

              {/* Terms Editor */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-gray-900 font-bold">नियम एवं शर्तें (Terms & Conditions)</label>
                <div className="space-y-1.5">
                  {form.terms.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 bg-white border border-gray-200 rounded text-xs">
                      <span>• {t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(i)}
                        className="text-red-600 hover:text-red-800 font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="नई शर्त जोड़ें..."
                    value={termInput}
                    onChange={(e) => setTermInput(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded p-1.5 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTerm}
                    className="px-3 py-1.5 bg-[#D71920] text-white rounded font-bold text-xs hover:bg-[#A80F16]"
                  >
                    + जोड़ें
                  </button>
                </div>
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
                  नियुक्ति पत्र सुरक्षित करें (Save Letter)
                </button>
              </div>
            </form>
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
                <h3 className="font-black text-base text-gray-900 font-serif-devanagari">नियुक्ति पत्र हटाने की पुष्टि करें</h3>
                <p className="text-xs text-gray-500 font-medium">यह नियुक्ति पत्र स्थायी रूप से हट जाएगा।</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs font-bold text-gray-800">
              "{deleteTarget.name}" (पत्र क्र.: {deleteTarget.letterNo})
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
                onClick={confirmDeleteLetter}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                हाँ, पत्र हटाएं (Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
