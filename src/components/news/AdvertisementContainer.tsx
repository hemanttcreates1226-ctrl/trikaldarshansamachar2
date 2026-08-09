import React from 'react';
import { Megaphone, ExternalLink } from 'lucide-react';
import { AdType } from '../../types/news';
import { NewsService } from '../../services/newsService';

export interface AdvertisementContainerProps {
  type?: AdType;
  label?: string;
  subLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export const AdvertisementContainer: React.FC<AdvertisementContainerProps> = ({
  type = 'top_banner',
  label = 'विज्ञापन • ADVERTISEMENT',
  subLabel = 'प्रायोजित सामग्री',
  className = '',
  children,
}) => {
  const ads = NewsService.getAdvertisements().filter(a => a.isActive && a.type === type);
  const ad = ads[0];

  return (
    <div
      className={`w-full bg-gray-50/90 border border-gray-200/90 rounded-lg p-4 sm:p-5 my-6 shadow-sm flex flex-col justify-between select-none ${className}`}
      aria-label="विज्ञापन (Advertisement)"
    >
      {/* Unified Advertisement Header Label */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-2 mb-3 text-gray-500 text-[10px] sm:text-xs font-bold tracking-wider uppercase font-sans">
        <span className="flex items-center gap-1.5 bg-gray-200/80 text-gray-700 px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-wide">
          <Megaphone className="w-3 h-3 text-[#D71920]" />
          {label}
        </span>
        {subLabel && (
          <span className="text-gray-400 font-medium text-[10px] hidden sm:inline">
            {subLabel}
          </span>
        )}
      </div>

      {/* Strict Padding Content Box */}
      <div className="relative w-full overflow-hidden rounded bg-white border border-gray-100 flex items-center justify-center min-h-[80px]">
        {children ? (
          children
        ) : ad ? (
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block w-full text-center p-1"
          >
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-auto max-h-40 object-cover rounded hover:opacity-95 transition duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition rounded flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-black/80 text-white text-[11px] font-bold px-3 py-1 rounded shadow-md flex items-center gap-1 transition">
                <span>विस्तार से देखें</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </a>
        ) : (
          <div className="w-full py-4 px-4 bg-gradient-to-r from-red-50/40 via-gray-50 to-red-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="space-y-0.5">
              <p className="font-bold text-xs sm:text-sm text-gray-800">
                त्रिकाल दर्शन समाचार डिजिटल नेटवर्क पर अपना विज्ञापन प्रकाशित करें
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                मध्य प्रदेश, उत्तर प्रदेश व राजस्थान के लाखों पाठकों तक सीधी पहुँच बनाएं
              </p>
            </div>
            <a
              href="mailto:ads@trikaldarshan.com"
              className="shrink-0 px-4 py-2 bg-[#D71920] hover:bg-[#A80F16] text-white rounded font-bold text-xs shadow transition flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>विज्ञापन दरें देखें</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
