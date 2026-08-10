import React, { useState, useEffect } from 'react';
import defaultLogoImg from '../../assets/9.png';
import { NewsService } from '../../services/newsService';

interface LogoProps {
  variant?: 'full' | 'compact' | 'light' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const TrikalLogo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  showTagline = true,
  className = ''
}) => {
  const [brandSettings, setBrandSettings] = useState({
    logoImageUrl: defaultLogoImg,
    brandTitle: 'त्रिकाल दर्शन',
    brandBadgeText: 'समाचार',
    taglineHindi: 'सत्य की त्रिकाल दृष्टि'
  });

  const loadBrandSettings = () => {
    try {
      const s = NewsService.getSettings();
      setBrandSettings({
        logoImageUrl: defaultLogoImg,
        brandTitle: s.brandTitle || s.siteName || 'त्रिकाल दर्शन',
        brandBadgeText: s.brandBadgeText || 'समाचार',
        taglineHindi: s.taglineHindi || s.tagline || 'सत्य की त्रिकाल दृष्टि'
      });
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadBrandSettings();
    const handleUpdate = () => loadBrandSettings();
    window.addEventListener('tds_data_updated', handleUpdate);
    return () => window.removeEventListener('tds_data_updated', handleUpdate);
  }, []);

  const imageSizeClasses = {
    sm: 'h-9 w-9 sm:h-10 sm:w-10',
    md: 'h-13 w-13 sm:h-15 sm:w-15 md:h-16 md:w-16',
    lg: 'h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24',
    xl: 'h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32'
  }[size];

  const titleSizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl md:text-3xl lg:text-3xl',
    lg: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    xl: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
  }[size];

  const badgeSizeClasses = {
    sm: 'text-[9px] px-1 py-0.5',
    md: 'text-[10px] sm:text-xs md:text-sm px-2 py-0.5',
    lg: 'text-xs sm:text-sm md:text-base px-2.5 py-1',
    xl: 'text-sm sm:text-base md:text-lg px-3 py-1.5'
  }[size];

  const taglineSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-[11px] sm:text-xs md:text-sm',
    lg: 'text-xs sm:text-sm md:text-base',
    xl: 'text-sm sm:text-base md:text-lg'
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-3 select-none max-w-full ${className}`}>
      {/* Visual Logo Emblem: Locked official high resolution logo image */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <img
          src={defaultLogoImg}
          alt={brandSettings.brandTitle}
          referrerPolicy="no-referrer"
          className={`${imageSizeClasses} object-contain rounded-full`}
        />
      </div>

      {/* Brand Typography with Prominent Main Heading & Tagline Size */}
      {variant !== 'compact' && (
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 leading-snug flex-wrap max-w-full">
            <span
              className={`font-black tracking-normal font-serif-devanagari ${titleSizeClasses} text-gray-900 drop-shadow-2xs py-0.5`}
            >
              {brandSettings.brandTitle}
            </span>
            {brandSettings.brandBadgeText && (
              <span
                className={`font-black tracking-wider ${badgeSizeClasses} rounded-md bg-[#D71920] text-white shadow-xs inline-flex items-center justify-center leading-tight shrink-0`}
              >
                {brandSettings.brandBadgeText}
              </span>
            )}
          </div>

          {showTagline && brandSettings.taglineHindi && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 leading-tight max-w-full overflow-hidden">
              <span className="h-0.5 sm:h-1 w-3 sm:w-4 bg-[#D71920] rounded-full shrink-0"></span>
              <p
                className={`font-black tracking-wide italic text-[#D71920] ${taglineSizeClasses} whitespace-nowrap overflow-hidden text-ellipsis`}
              >
                "{brandSettings.taglineHindi.replace(/^["']|["']$/g, '')}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


