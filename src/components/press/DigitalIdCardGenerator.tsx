import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { 
  Award, Upload, RefreshCw, Printer, Download, Eye, FileText, 
  MapPin, Phone, Mail, Globe, CheckCircle2, User, Calendar, 
  ShieldCheck, Sparkles, Image as ImageIcon, CreditCard, Copy, Check,
  Loader2
} from 'lucide-react';
import { NewsService } from '../../services/newsService';
import { DEFAULT_LOGO_BASE64 } from '../../assets/defaultLogoData';

// Default realistic Rajkamal signature SVG asset
const DEFAULT_SIGNATURE_SVG = '/rajkamal_signature.svg';

// Default sample reporter photograph
const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';

export interface IDCardFormData {
  name: string;
  logo: string;
  photo: string;
  pressId: string;
  joiningDate: string;
  expiryDate: string;
  location: string;
  mobile: string;
  designationHindi: string;
  designationEnglish: string;
  website: string;
  email: string;
  address: string;
  signature: string;
  orgTitle: string;
  orgCategory: string;
  tagline: string;
  ribbonText: string;
  backHeaderTitle: string;
  authorizationHeading: string;
  authorizationText: string;
  bottomTagline: string;
}

const DEFAULT_FORM_DATA: IDCardFormData = {
  name: 'राहुल शर्मा',
  logo: DEFAULT_LOGO_BASE64,
  photo: DEFAULT_PHOTO,
  pressId: 'TDS/EMP/2025/078',
  joiningDate: '01 मई 2025',
  expiryDate: '31 मई 2026',
  location: 'नई दिल्ली',
  mobile: '+91 98765 43210',
  designationHindi: 'वरिष्ठ संवाददाता',
  designationEnglish: 'SENIOR CORRESPONDENT',
  website: 'www.trikaldarshansamachar.com',
  email: 'trikaldarshannews72@gmail.com',
  address: 'B-12, प्रथम तल, पत्रकार पुरम, नई दिल्ली - 110002',
  signature: DEFAULT_SIGNATURE_SVG,
  orgTitle: 'त्रिकाल दर्शन',
  orgCategory: 'समाचार',
  tagline: 'सत्य की त्रिकाल दृष्टि',
  ribbonText: 'डिजिटल मीडिया प्रतिनिधि • DIGITAL MEDIA REP',
  backHeaderTitle: 'डिजिटल मीडिया पहचान पत्र',
  authorizationHeading: 'डिजिटल मीडिया अधिकृतता (Authorization)',
  authorizationText: 'धारक त्रिकाल दर्शन समाचार का अधिकृत डिजिटल मीडिया प्रतिनिधि है। इन्हें किसी भी क्षेत्र में समाचार संग्रह, रिपोर्टिंग एवं डिजिटल कवरेज हेतु अधिकृत किया गया है। कृपया आवश्यक सहयोग प्रदान करें।',
  bottomTagline: '✧ सत्य की त्रिकाल दृष्टि ✧',
};

// ==================== FRONT CARD COMPONENT ====================
const FrontCardContent = React.forwardRef<HTMLDivElement, { formData: IDCardFormData }>(
  ({ formData }, ref) => (
    <div
      ref={ref}
      className="w-[330px] h-[522px] bg-white rounded-[20px] overflow-hidden shadow-2xl relative flex flex-col justify-between text-gray-900 border-2 border-red-200 select-none shrink-0"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 30%, rgba(215,25,32,0.02) 0%, rgba(255,255,255,1) 100%)`
      }}
    >
      {/* Subtle Geometric World Pattern background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#d71920_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Top Corner Red Diagonal Accent & Lanyard Slot */}
      <div className="relative">
        {/* Top Red Curve Header */}
        <div className="bg-gradient-to-r from-[#D71920] via-[#A80F16] to-[#D71920] pt-2 pb-3 px-3 relative overflow-hidden shadow-sm">
          {/* Corner Diagonal Shape */}
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rotate-45 pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-20 h-20 bg-black/20 rotate-45 pointer-events-none" />

          {/* Lanyard Slot Cutout */}
          <div className="w-12 h-2.5 bg-gray-900/30 border border-white/40 rounded-full mx-auto mb-1.5 shadow-inner" />

          {/* Circular Logo & Header Titles */}
          <div className="flex items-center justify-center gap-3 relative z-10">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 p-0.5 overflow-hidden bg-white shrink-0 shadow-lg flex items-center justify-center">
              <img src={formData.logo || DEFAULT_LOGO_BASE64} alt="Trikal Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-white text-left">
              <h1 className="font-black font-serif-devanagari text-2xl leading-tight tracking-wide text-white drop-shadow-md">
                {formData.orgTitle || 'त्रिकाल दर्शन'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="bg-white text-[#D71920] font-black text-xs px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                  {formData.orgCategory || 'समाचार'}
                </span>
                <span className="text-[10px] text-amber-300 font-extrabold font-serif-devanagari tracking-tight">
                  {formData.tagline || 'सत्य की त्रिकाल दृष्टि'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Media Representative Badge Ribbon */}
        <div className="bg-gray-900 text-white text-[10px] font-black tracking-widest text-center uppercase py-1 border-y border-amber-500/40 shadow-xs flex items-center justify-center gap-1.5 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
          <span className="truncate">{formData.ribbonText || 'डिजिटल मीडिया प्रतिनिधि • DIGITAL MEDIA REP'}</span>
        </div>
      </div>

      {/* Middle: Employee Photograph & Name */}
      <div className="px-4 py-2 flex flex-col items-center text-center space-y-2 relative z-10 flex-1 justify-center">
        {/* Photo Frame */}
        <div className="w-26 h-32 rounded-2xl overflow-hidden border-3 border-[#D71920] shadow-xl bg-gray-100 shrink-0 relative group">
          <img
            src={formData.photo}
            alt={formData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-6" />
        </div>

        {/* Name & Designation */}
        <div className="space-y-0.5">
          <h2 className="font-black text-xl font-serif-devanagari text-gray-900 tracking-tight leading-tight">
            {formData.name}
          </h2>
          <p className="text-xs font-black text-[#D71920] font-serif-devanagari">
            {formData.designationHindi}
          </p>
          <p className="text-[9px] font-extrabold text-gray-600 uppercase tracking-wider font-mono">
            {formData.designationEnglish}
          </p>
        </div>

        {/* Employee Information Table */}
        <div className="w-full bg-gradient-to-br from-red-50 via-white to-amber-50/30 border-2 border-red-200 rounded-2xl p-3.5 text-xs space-y-2 text-left font-medium shadow-sm">
          <div className="flex items-center justify-between border-b border-red-200 pb-1.5">
            <span className="text-gray-600 font-bold text-xs">ID No.</span>
            <span className="font-black font-mono text-sm text-[#D71920] tracking-wide">{formData.pressId}</span>
          </div>

          <div className="flex items-center justify-between border-b border-red-200 pb-1.5">
            <span className="text-gray-600 font-bold text-xs">जारी तिथि</span>
            <span className="font-extrabold text-xs text-gray-900">{formData.joiningDate}</span>
          </div>

          <div className="flex items-center justify-between border-b border-red-200 pb-1.5">
            <span className="text-gray-600 font-bold text-xs">लोकेशन</span>
            <span className="font-extrabold text-xs text-gray-900">{formData.location}</span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-gray-600 font-bold text-xs">मोबाइल</span>
            <span className="font-extrabold font-mono text-xs text-gray-900">{formData.mobile}</span>
          </div>
        </div>
      </div>

      {/* Bottom Red & Black Ribbon + Signature */}
      <div className="relative mt-1">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-2 flex items-center justify-between border-t-2 border-[#D71920]">
          <div className="text-[9px] text-gray-300 font-bold">
            <p className="text-amber-400 font-black uppercase text-[8px] tracking-wider">VERIFIED MEDIA CARD</p>
            <p className="font-serif-devanagari">त्रिकाल दर्शन समाचार</p>
          </div>

          {/* Signature Box */}
          <div className="flex flex-col items-center">
            <div className="h-8 w-26 flex items-center justify-center">
              <img src={formData.signature} alt="Editor Signature" className="max-h-full max-w-full object-contain filter invert opacity-95" />
            </div>
            <span className="text-[9px] font-black text-amber-300 font-serif-devanagari border-t border-gray-600 pt-0.5">
              प्रधान संपादक
            </span>
          </div>
        </div>

        {/* Red Bottom Bar */}
        <div className="bg-[#D71920] h-1.5 w-full" />
      </div>
    </div>
  )
);
FrontCardContent.displayName = 'FrontCardContent';

// ==================== BACK CARD COMPONENT ====================
const BackCardContent = React.forwardRef<HTMLDivElement, { formData: IDCardFormData; qrCodeUrl: string }>(
  ({ formData, qrCodeUrl }, ref) => (
    <div
      ref={ref}
      className="w-[330px] h-[522px] bg-white rounded-[20px] overflow-hidden shadow-2xl relative flex flex-col justify-between text-gray-900 border-2 border-red-200 select-none shrink-0"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#d71920_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#D71920] via-[#A80F16] to-[#D71920] pt-2 pb-2.5 px-3 relative text-white text-center shadow-xs">
        {/* Lanyard Slot Cutout */}
        <div className="w-12 h-2.5 bg-gray-900/30 border border-white/40 rounded-full mx-auto mb-1.5 shadow-inner" />

        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-full border border-amber-300 overflow-hidden bg-white shrink-0 p-0.5 shadow-sm">
            <img src={formData.logo || DEFAULT_LOGO_BASE64} alt="Trikal Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="font-black text-base font-serif-devanagari tracking-wide text-white">
            {formData.backHeaderTitle || 'डिजिटल मीडिया पहचान पत्र'}
          </span>
        </div>
      </div>

      {/* Middle Content */}
      <div className="p-4 flex flex-col space-y-3 flex-1 justify-between text-center relative z-10">
        {/* Authorization Description Box */}
        <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 text-[11px] text-gray-800 leading-snug font-serif-devanagari space-y-1.5 shadow-2xs">
          <p className="font-bold text-[#D71920] text-xs">
            {formData.authorizationHeading || 'डिजिटल मीडिया अधिकृतता (Authorization)'}
          </p>
          <p className="text-gray-700 font-medium">
            {formData.authorizationText || 'धारक त्रिकाल दर्शन समाचार का अधिकृत डिजिटल मीडिया प्रतिनिधि है। इन्हें किसी भी क्षेत्र में समाचार संग्रह, रिपोर्टिंग एवं डिजिटल कवरेज हेतु अधिकृत किया गया है। कृपया आवश्यक सहयोग प्रदान करें।'}
          </p>
        </div>

        {/* Validity & ID Details Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-[11px] space-y-1 text-left font-medium">
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="text-gray-500 font-bold">जारी करने की तिथि:</span>
            <span className="font-bold text-gray-900">{formData.joiningDate}</span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="text-gray-500 font-bold">वैधता तिथि:</span>
            <span className="font-black text-emerald-700">{formData.expiryDate}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500 font-bold">आई-कार्ड संख्या:</span>
            <span className="font-black font-mono text-[#D71920]">{formData.pressId}</span>
          </div>
        </div>

        {/* QR Code & Editor Signature Row */}
        <div className="flex items-center justify-between bg-white border-2 border-red-100 rounded-xl p-2.5 shadow-2xs">
          {/* QR Code Box */}
          <div className="flex flex-col items-center">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded border border-gray-300 p-0.5 bg-white shadow-2xs" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-[9px] text-gray-400">
                QR CODE
              </div>
            )}
            <span className="text-[8px] font-black text-gray-700 tracking-wider mt-0.5 uppercase">
              SCAN TO VERIFY
            </span>
          </div>

          {/* Official Stamp / Signature */}
          <div className="flex flex-col items-center space-y-1">
            <div className="h-9 w-28 flex items-center justify-center">
              <img src={formData.signature} alt="Editor Signature" className="max-h-full max-w-full object-contain" />
            </div>
            <span className="text-[9px] font-black text-gray-900 font-serif-devanagari border-t border-gray-300 pt-0.5">
              प्रधान संपादक
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Dark Footer Bar */}
      <div className="bg-gray-900 text-white p-3 text-[10px] space-y-1 border-t-2 border-[#D71920]">
        <div className="flex items-center justify-between text-gray-300 font-mono text-[9.5px]">
          <span className="flex items-center gap-1 text-amber-300">
            <Globe className="w-3 h-3 shrink-0 text-[#D71920]" />
            <span>{formData.website}</span>
          </span>
          <span className="flex items-center gap-1 text-gray-300">
            <Mail className="w-3 h-3 shrink-0 text-[#D71920]" />
            <span>{formData.email}</span>
          </span>
        </div>

        <div className="text-gray-400 text-[9px] flex items-start gap-1 font-serif-devanagari">
          <MapPin className="w-3 h-3 shrink-0 text-[#D71920] mt-0.5" />
          <span className="line-clamp-1">{formData.address}</span>
        </div>

        {/* Very Bottom Tagline Strip */}
        <div className="bg-[#D71920] text-white text-[9px] font-bold text-center py-0.5 rounded-sm font-serif-devanagari mt-1 tracking-wider px-1">
          {formData.bottomTagline || '✧ सत्य की त्रिकाल दृष्टि ✧'}
        </div>
      </div>
    </div>
  )
);
BackCardContent.displayName = 'BackCardContent';

export const DigitalIdCardGenerator: React.FC = () => {
  const [formData, setFormData] = useState<IDCardFormData>(DEFAULT_FORM_DATA);
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const offscreenFrontRef = useRef<HTMLDivElement>(null);
  const offscreenBackRef = useRef<HTMLDivElement>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate QR code whenever relevant employee data updates
  useEffect(() => {
    const payload = JSON.stringify({
      org: 'Trikal Darshan Samachar',
      type: 'Digital Media Representative',
      id: formData.pressId,
      name: formData.name,
      desig: `${formData.designationHindi} (${formData.designationEnglish})`,
      loc: formData.location,
      mobile: formData.mobile,
      valid: formData.expiryDate,
      verifyUrl: `${window.location.origin}/verify/${encodeURIComponent(formData.pressId)}`
    });

    QRCode.toDataURL(payload, {
      width: 180,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      }
    }, (err, url) => {
      if (!err && url) {
        setQrCodeUrl(url);
      }
    });
  }, [
    formData.pressId, formData.name, formData.designationHindi, 
    formData.designationEnglish, formData.location, formData.mobile, formData.expiryDate
  ]);

  // Generate new unique ID
  const handleGenerateNewId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({
      ...prev,
      pressId: `TDS/EMP/${year}/${randomNum}`
    }));
  };

  // Logo File Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, logo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, photo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Signature File Upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, signature: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Reset form
  const handleReset = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  // Select existing reporter from database
  const handleSelectReporter = (reporterId: string) => {
    if (!reporterId) return;
    const cards = NewsService.getIDCards();
    const found = cards.find(c => c.id === reporterId || c.pressId === reporterId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        name: found.name,
        photo: found.photo || DEFAULT_PHOTO,
        pressId: found.pressId,
        joiningDate: found.issueDate || '01 मई 2025',
        expiryDate: found.validUntil || '31 मई 2026',
        location: `${found.districtName}, ${found.stateName}`,
        mobile: found.mobile || '+91 98260 12345',
        designationHindi: found.designation,
        designationEnglish: found.designation.toUpperCase().includes('BUREAU') ? 'BUREAU CHIEF' : 'NEWS CORRESPONDENT'
      }));
    }
  };

  // Capture utility with robust fallbacks
  const captureCardToPng = async (element: HTMLElement): Promise<string> => {
    try {
      return await toPng(element, {
        pixelRatio: 3,
        skipFonts: true,
        cacheBust: false,
        backgroundColor: '#ffffff'
      });
    } catch (err) {
      console.warn('toPng primary attempt failed, retrying without pixelRatio scaling:', err);
      return await toPng(element, {
        skipFonts: true,
        cacheBust: false,
        backgroundColor: '#ffffff'
      });
    }
  };

  // Download Front PNG
  const handleDownloadFrontPNG = async () => {
    const targetEl = frontRef.current || offscreenFrontRef.current;
    if (!targetEl) return;
    setIsGenerating(true);
    try {
      const dataUrl = await captureCardToPng(targetEl);
      const link = document.createElement('a');
      link.download = `Trikal_ID_Front_${formData.pressId.replace(/[\/\\?%*:|"<>]/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export front PNG:', err);
      alert('PNG डाउनलोड करने में असफलता हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Back PNG
  const handleDownloadBackPNG = async () => {
    const targetEl = backRef.current || offscreenBackRef.current;
    if (!targetEl) return;
    setIsGenerating(true);
    try {
      const dataUrl = await captureCardToPng(targetEl);
      const link = document.createElement('a');
      link.download = `Trikal_ID_Back_${formData.pressId.replace(/[\/\\?%*:|"<>]/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export back PNG:', err);
      alert('PNG डाउनलोड करने में असफलता हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Full PDF (54mm × 85.6mm CR80 format, 2 pages)
  const handleDownloadPDF = async () => {
    const frontEl = frontRef.current || offscreenFrontRef.current;
    const backEl = backRef.current || offscreenBackRef.current;
    if (!frontEl || !backEl) return;
    setIsGenerating(true);
    try {
      const frontPng = await captureCardToPng(frontEl);
      const backPng = await captureCardToPng(backEl);

      // Create jsPDF document with exact 54mm x 85.6mm CR80 ID dimensions
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [54, 85.6]
      });

      // Page 1: Front
      doc.addImage(frontPng, 'PNG', 0, 0, 54, 85.6);

      // Page 2: Back
      doc.addPage([54, 85.6], 'portrait');
      doc.addImage(backPng, 'PNG', 0, 0, 54, 85.6);

      doc.save(`Trikal_Digital_ID_${formData.pressId.replace(/[\/\\?%*:|"<>]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('PDF डाउनलोड करने में असफलता हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGenerating(false);
    }
  };

  // Print Output
  const handlePrint = () => {
    window.print();
  };

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(formData.pressId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const existingCards = NewsService.getIDCards();

  return (
    <div className="space-y-6">
      {/* Off-screen elements for 100% reliable PNG/PDF capture regardless of active preview tab */}
      <div 
        aria-hidden="true" 
        style={{ position: 'fixed', left: '-9999px', top: '-9999px', pointerEvents: 'none', opacity: 0 }}
      >
        <FrontCardContent ref={offscreenFrontRef} formData={formData} />
        <BackCardContent ref={offscreenBackRef} formData={formData} qrCodeUrl={qrCodeUrl} />
      </div>

      {/* Dedicated Print container for window.print() */}
      <div id="print-only-container" className="hidden">
        <FrontCardContent formData={formData} />
        <BackCardContent formData={formData} qrCodeUrl={qrCodeUrl} />
      </div>

      {/* Print-specific style override */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-only-container, #print-only-container * {
            visibility: visible !important;
          }
          #print-only-container {
            display: flex !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            flex-direction: row !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 30px !important;
            background: white !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-200 pb-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#D71920] text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
              OFFICIAL SYSTEM
            </span>
            <h2 className="text-2xl font-black font-serif-devanagari text-gray-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#D71920]" />
              <span>डिजिटल मीडिया आई-कार्ड जनरेटर (ID Card Generator)</span>
            </h2>
          </div>
          <p className="text-xs text-gray-600 font-medium mt-1">
            त्रिकाल दर्शन समाचार के अधिकृत डिजिटल मीडिया प्रतिनिधियों हेतु डिजिटल प्रेस पहचान पत्र बनाएं, लाइव प्रिव्यू देखें एवं डाउनलोड/प्रिंट करें।
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadFrontPNG}
            disabled={isGenerating}
            className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" /> : <Download className="w-3.5 h-3.5 text-red-400" />}
            <span>Front PNG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadBackPNG}
            disabled={isGenerating}
            className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Download className="w-3.5 h-3.5 text-amber-400" />}
            <span>Back PNG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-4 py-2 bg-gradient-to-r from-[#D71920] to-[#A80F16] text-white text-xs font-black rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            <span>PDF डाउनलोड (54x85.6mm)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट करें</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls Form (6 cols on desktop), Right Live Preview (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT FORM CONTROLS ================= */}
        <div className="lg:col-span-6 bg-white border border-red-100 rounded-2xl p-5 shadow-xs space-y-5 text-xs no-print">
          
          <div className="flex items-center justify-between border-b border-red-100 pb-3">
            <h3 className="font-black text-sm text-[#D71920] font-serif-devanagari flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>प्रतिनिधि विवरण (Employee & Card Details)</span>
            </h3>

            <div className="flex items-center gap-2">
              {existingCards.length > 0 && (
                <select
                  onChange={(e) => handleSelectReporter(e.target.value)}
                  className="bg-red-50 border border-red-200 text-gray-900 font-bold text-[11px] rounded-lg px-2 py-1 outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>-- पत्रकार डेटा ऑटो-फिल करें --</option>
                  {existingCards.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.districtName})</option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="text-gray-500 hover:text-red-600 text-[11px] font-bold flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>रीसेट</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Employee Name */}
            <div>
              <label className="block text-gray-800 font-bold mb-1">1. प्रतिनिधि का नाम (Employee Name) *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-xl p-2.5 outline-none focus:border-[#D71920] focus:bg-white text-sm"
              />
            </div>

            {/* 2 & 3. Hindi Designation & English Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-800 font-bold mb-1">2. पदनाम (हिंदी) *</label>
                <input
                  type="text"
                  required
                  value={formData.designationHindi}
                  onChange={(e) => setFormData({ ...formData, designationHindi: e.target.value })}
                  placeholder="उदा. वरिष्ठ संवाददाता"
                  className="w-full bg-gray-50 border border-gray-300 text-[#D71920] font-bold rounded-xl p-2.5 outline-none focus:border-[#D71920] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-1">3. Designation (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.designationEnglish}
                  onChange={(e) => setFormData({ ...formData, designationEnglish: e.target.value })}
                  placeholder="e.g. SENIOR CORRESPONDENT"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-xl p-2.5 outline-none focus:border-[#D71920] focus:bg-white uppercase"
                />
              </div>
            </div>

            {/* 4, 5 & 6. Uploads: Logo, Photo & Signature */}
            <div className="space-y-4 bg-red-50/50 p-4 rounded-xl border border-red-200">
              {/* Logo Upload Box */}
              <div>
                <label className="block text-gray-900 font-black mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-[#D71920]">
                    <Award className="w-4 h-4" />
                    <span>4. संस्थान / पोर्टल लोगो (Logo Upload from Device)</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">गैलरी / फाइल से चुनें</span>
                </label>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 bg-white p-3 rounded-xl border border-red-200 shadow-2xs">
                  {/* Logo Preview Frame */}
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 bg-white shrink-0 relative group shadow-xs mx-auto sm:mx-0 flex items-center justify-center p-0.5">
                    <img src={formData.logo || DEFAULT_LOGO_BASE64} alt="Logo Preview" className="w-full h-full object-cover rounded-full" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-bold rounded-full">
                      लोगो
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-[#D71920] to-[#A80F16] hover:opacity-95 text-white font-bold rounded-xl text-center cursor-pointer shadow-xs flex items-center justify-center gap-2 text-xs transition"
                      >
                        <Upload className="w-4 h-4" />
                        <span>डिवाइस से लोगो चुनें (Upload Logo)</span>
                      </button>

                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logo: DEFAULT_LOGO_BASE64 })}
                        className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[10px] rounded-xl transition border border-gray-300 cursor-pointer shrink-0"
                      >
                        डिफ़ॉल्ट लोगो
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="या लोगो URL दर्ज करें (Optional)..."
                        value={formData.logo.startsWith('data:') ? '' : formData.logo}
                        onChange={(e) => {
                          if (e.target.value.trim()) {
                            setFormData({ ...formData, logo: e.target.value });
                          }
                        }}
                        className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-[11px] rounded-lg px-2.5 py-1.5 outline-none font-mono focus:border-[#D71920]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Upload Box */}
              <div>
                <label className="block text-gray-900 font-black mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-[#D71920]">
                    <ImageIcon className="w-4 h-4" />
                    <span>5. प्रतिनिधि पासपोर्ट फोटो (Photo Upload from Device) *</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">गैलरी / कैमरा से चुनें</span>
                </label>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 bg-white p-3 rounded-xl border border-red-200 shadow-2xs">
                  {/* Photo Preview Frame */}
                  <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-[#D71920] bg-gray-100 shrink-0 relative group shadow-xs mx-auto sm:mx-0">
                    <img src={formData.photo} alt="Device Upload Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-bold">
                      लाइव
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#D71920] to-[#A80F16] hover:opacity-95 text-white font-bold rounded-xl text-center cursor-pointer shadow-xs flex items-center justify-center gap-2 text-xs transition"
                      >
                        <Upload className="w-4 h-4" />
                        <span>डिवाइस (गैलरी / कैमरे) से फोटो चुनें</span>
                      </button>

                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="या इमेज URL दर्ज करें (Optional)..."
                        value={formData.photo.startsWith('data:') ? '' : formData.photo}
                        onChange={(e) => {
                          if (e.target.value.trim()) {
                            setFormData({ ...formData, photo: e.target.value });
                          }
                        }}
                        className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-[11px] rounded-lg px-2.5 py-1.5 outline-none font-mono focus:border-[#D71920]"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: DEFAULT_PHOTO })}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[10px] rounded-lg transition border border-gray-300 cursor-pointer shrink-0"
                      >
                        डिफ़ॉल्ट फोटो
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Upload Box */}
              <div>
                <label className="block text-gray-900 font-black mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-gray-800">
                    <FileText className="w-4 h-4 text-[#D71920]" />
                    <span>6. प्रधान संपादक हस्ताक्षर (Editor Signature Upload)</span>
                  </span>
                </label>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="w-20 h-10 rounded-lg overflow-hidden border border-gray-300 bg-white p-1 shrink-0 flex items-center justify-center mx-auto sm:mx-0">
                    <img src={formData.signature} alt="Signature" className="max-h-full max-w-full object-contain" />
                  </div>

                  <div className="flex-1 space-y-2 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => signatureInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-gray-100 border border-gray-300 hover:bg-gray-200 rounded-xl text-center font-bold text-gray-800 cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 text-xs transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#D71920]" />
                        <span>डिवाइस से हस्ताक्षर फाइल चुनें</span>
                      </button>

                      <input
                        ref={signatureInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, signature: DEFAULT_SIGNATURE_SVG })}
                        className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[10px] rounded-xl transition border border-gray-300 cursor-pointer shrink-0"
                      >
                        डिफ़ॉल्ट हस्ताक्षर
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="या हस्ताक्षर URL दर्ज करें (Optional)..."
                        value={formData.signature.startsWith('data:') ? '' : formData.signature}
                        onChange={(e) => {
                          if (e.target.value.trim()) {
                            setFormData({ ...formData, signature: e.target.value });
                          }
                        }}
                        className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-[11px] rounded-lg px-2.5 py-1.5 outline-none font-mono focus:border-[#D71920]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. ID Number & Auto-Generate Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-800 font-bold">6. यूनिक आईडी नंबर (ID Number) *</label>
                <button
                  type="button"
                  onClick={handleGenerateNewId}
                  className="text-[11px] font-bold text-[#D71920] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>नया ID जनरेट करें</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.pressId}
                  onChange={(e) => setFormData({ ...formData, pressId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-[#D71920] font-mono font-black rounded-xl p-2.5 outline-none focus:border-[#D71920] focus:bg-white pr-20"
                />
                <button
                  type="button"
                  onClick={copyIdToClipboard}
                  className="absolute right-2 top-2 px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded-lg text-[10px] font-bold hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId ? 'कॉपी हुआ' : 'कॉपी'}</span>
                </button>
              </div>
            </div>

            {/* 7 & 8. Joining Date & Expiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-800 font-bold mb-1">7. जारी तिथि (Joining Date) *</label>
                <input
                  type="text"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-xl p-2.5 outline-none focus:border-[#D71920]"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-1">8. वैधता तिथि (Expiry Date) *</label>
                <input
                  type="text"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-emerald-700 font-bold rounded-xl p-2.5 outline-none focus:border-[#D71920]"
                />
              </div>
            </div>

            {/* 9 & 10. Location & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-800 font-bold mb-1">9. लोकेशन / जिला (Location) *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-xl p-2.5 outline-none focus:border-[#D71920]"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-1">10. मोबाइल नंबर (Mobile) *</label>
                <input
                  type="text"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-mono font-bold rounded-xl p-2.5 outline-none focus:border-[#D71920]"
                />
              </div>
            </div>

            {/* 11 & 12. Website & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-800 font-bold mb-1">11. वेबसाइट (Website)</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-mono rounded-xl p-2.5 outline-none focus:border-[#D71920]"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-1">12. ईमेल (Email)</label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-mono rounded-xl p-2.5 outline-none focus:border-[#D71920]"
                />
              </div>
            </div>

            {/* 13. Address */}
            <div>
              <label className="block text-gray-800 font-bold mb-1">13. कार्यालय का पता (Address)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-medium rounded-xl p-2.5 outline-none focus:border-[#D71920]"
              />
            </div>

            {/* 14. Custom Header & Card Text Customization Section */}
            <div className="bg-amber-50/60 border border-amber-300 rounded-2xl p-4 space-y-3.5">
              <h4 className="font-black text-[#D71920] text-xs flex items-center gap-1.5 border-b border-amber-200 pb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>14. संस्थान शीर्षक, रिबन व कार्ड टेक्स्ट कस्टमाइजेशन (Header & Custom Text)</span>
              </h4>

              {/* Title & Category Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-800 font-bold mb-1">संस्थान का मुख्य नाम (Title)</label>
                  <input
                    type="text"
                    value={formData.orgTitle}
                    onChange={(e) => setFormData({ ...formData, orgTitle: e.target.value })}
                    placeholder="उदा. त्रिकाल दर्शन"
                    className="w-full bg-white border border-amber-300 text-gray-900 font-bold rounded-xl p-2 outline-none focus:border-[#D71920]"
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">कैटेगिरी बैज (Category Badge)</label>
                  <input
                    type="text"
                    value={formData.orgCategory}
                    onChange={(e) => setFormData({ ...formData, orgCategory: e.target.value })}
                    placeholder="उदा. समाचार"
                    className="w-full bg-white border border-amber-300 text-gray-900 font-bold rounded-xl p-2 outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              {/* Tagline & Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-800 font-bold mb-1">संस्थान का स्लोगन (Tagline)</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="उदा. सत्य की त्रिकाल दृष्टि"
                    className="w-full bg-white border border-amber-300 text-gray-900 font-bold rounded-xl p-2 outline-none focus:border-[#D71920]"
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">कार्ड रिबन पट्टी टेक्स्ट (Ribbon)</label>
                  <input
                    type="text"
                    value={formData.ribbonText}
                    onChange={(e) => setFormData({ ...formData, ribbonText: e.target.value })}
                    placeholder="उदा. डिजिटल मीडिया प्रतिनिधि • DIGITAL MEDIA REP"
                    className="w-full bg-white border border-amber-300 text-gray-900 font-bold rounded-xl p-2 outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              {/* Back Card Header & Authorization Heading */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-800 font-bold mb-1">बैक साइड हेडर शीर्षक</label>
                  <input
                    type="text"
                    value={formData.backHeaderTitle}
                    onChange={(e) => setFormData({ ...formData, backHeaderTitle: e.target.value })}
                    placeholder="उदा. डिजिटल मीडिया पहचान पत्र"
                    className="w-full bg-white border border-amber-300 text-gray-900 font-bold rounded-xl p-2 outline-none focus:border-[#D71920]"
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">अधिकृतता शीर्षक (Auth Heading)</label>
                  <input
                    type="text"
                    value={formData.authorizationHeading}
                    onChange={(e) => setFormData({ ...formData, authorizationHeading: e.target.value })}
                    placeholder="उदा. डिजिटल मीडिया अधिकृतता (Authorization)"
                    className="w-full bg-white border border-amber-300 text-gray-900 font-bold rounded-xl p-2 outline-none focus:border-[#D71920]"
                  />
                </div>
              </div>

              {/* Authorization Text */}
              <div>
                <label className="block text-gray-800 font-bold mb-1">अधिकृतता संदेश (Authorization Details)</label>
                <textarea
                  rows={2}
                  value={formData.authorizationText}
                  onChange={(e) => setFormData({ ...formData, authorizationText: e.target.value })}
                  className="w-full bg-white border border-amber-300 text-gray-900 font-medium rounded-xl p-2 outline-none focus:border-[#D71920] text-xs resize-none"
                />
              </div>

              {/* Bottom Strip Tagline */}
              <div>
                <label className="block text-gray-800 font-bold mb-1">बॉटम रेड स्ट्रिप टैगलाइन (Bottom Tagline)</label>
                <input
                  type="text"
                  value={formData.bottomTagline}
                  onChange={(e) => setFormData({ ...formData, bottomTagline: e.target.value })}
                  placeholder="उदा. ✧ सत्य की त्रिकाल दृष्टि ✧"
                  className="w-full bg-white border border-amber-300 text-gray-900 font-bold rounded-xl p-2 outline-none focus:border-[#D71920]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT LIVE PREVIEW PANEL ================= */}
        <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-2xl flex flex-col items-center space-y-5 sticky top-4">
          
          {/* Controls Bar for Preview */}
          <div className="w-full flex items-center justify-between border-b border-gray-800 pb-3 no-print">
            <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-[#D71920]" />
              <span>डिजिटल आई-कार्ड लाइव पूर्वावलोकन (Live Preview)</span>
            </span>

            {/* View Mode Switcher */}
            <div className="bg-gray-800 p-1 rounded-xl flex items-center gap-1 border border-gray-700">
              <button
                type="button"
                onClick={() => setViewMode('front')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'front' ? 'bg-[#D71920] text-white shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
              >
                Front Only
              </button>
              <button
                type="button"
                onClick={() => setViewMode('back')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'back' ? 'bg-[#D71920] text-white shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
              >
                Back Only
              </button>
            </div>
          </div>

          {/* Printable & Screen ID Card Container */}
          <div 
            id="printable-id-card-section"
            className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 py-2 overflow-x-auto"
          >
            {/* ==================== FRONT ID CARD ==================== */}
            {viewMode === 'front' && (
              <FrontCardContent ref={frontRef} formData={formData} />
            )}

            {/* ==================== BACK ID CARD ==================== */}
            {viewMode === 'back' && (
              <BackCardContent ref={backRef} formData={formData} qrCodeUrl={qrCodeUrl} />
            )}
          </div>

          <p className="text-[11px] text-gray-400 text-center font-medium no-print">
            💡 टिप: यह डिजिटल मीडिया आई-कार्ड standard 54mm × 85.6mm CR80 फॉर्मेट में तैयार किया जाता है। PDF या PNG डाउनलोड करके सीधे पीवीसी कार्ड प्रिंटर पर प्रिंट करें।
          </p>
        </div>
      </div>
    </div>
  );
};
