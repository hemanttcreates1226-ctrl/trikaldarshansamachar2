// Universal fallback image helper for Trikal Darshan Samachar
import React from 'react';

export const DEFAULT_NEWS_IMAGE =
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';

export const DEFAULT_FALLBACK_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23b81218"/><rect x="20" y="20" width="760" height="410" fill="%23ffffff" rx="8"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%23b81218" font-family="Arial, sans-serif" font-weight="bold" font-size="32">त्रिकाल दर्शन समाचार</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="%23666666" font-family="Arial, sans-serif" font-weight="bold" font-size="18">सत्य की त्रिकाल दृष्टि</text></svg>';

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  customFallback?: string
) {
  const target = e.currentTarget;
  if (!target) return;
  const fallback = customFallback || DEFAULT_FALLBACK_SVG;
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
