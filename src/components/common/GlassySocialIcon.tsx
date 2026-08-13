import React from 'react';
import {
  Youtube,
  Facebook,
  Instagram,
  Send,
  Twitter,
  Globe
} from 'lucide-react';

export const WhatsappIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
);

export interface GlassySocialIconProps {
  platform: string;
  url?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GlassySocialIcon: React.FC<GlassySocialIconProps> = ({
  platform,
  url = '#',
  label,
  size = 'md',
  className = ''
}) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const sizePadding = size === 'sm' ? 'p-2' : size === 'lg' ? 'p-3' : 'p-2.5';

  const getPlatformStyles = (p: string) => {
    switch (p.toLowerCase()) {
      case 'youtube':
        return {
          bg: 'bg-[#FF0000] hover:bg-[#D60000]',
          icon: <Youtube className={sizeClass} />
        };
      case 'facebook':
        return {
          bg: 'bg-[#1877F2] hover:bg-[#1464CC]',
          icon: <Facebook className={sizeClass} />
        };
      case 'instagram':
        return {
          bg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90',
          icon: <Instagram className={sizeClass} />
        };
      case 'whatsapp':
      case 'whatsappchannel':
        return {
          bg: 'bg-[#25D366] hover:bg-[#20ba5a]',
          icon: <WhatsappIcon className={sizeClass} />
        };
      case 'telegram':
        return {
          bg: 'bg-[#229ED9] hover:bg-[#1d87ba]',
          icon: <Send className={sizeClass} />
        };
      case 'twitter':
      case 'x':
        return {
          bg: 'bg-[#000000] hover:bg-[#222222]',
          icon: <Twitter className={sizeClass} />
        };
      default:
        return {
          bg: 'bg-[#D71920] hover:bg-[#A80F16]',
          icon: <Globe className={sizeClass} />
        };
    }
  };

  const style = getPlatformStyles(platform);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={label || platform}
      className={`relative inline-flex items-center justify-center rounded-xl ${sizePadding} ${style.bg} text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer shrink-0 ${className}`}
    >
      <span className="shrink-0">
        {style.icon}
      </span>
    </a>
  );
};

