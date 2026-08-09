import React from 'react';
import { AdType } from '../../types/news';
import { AdvertisementContainer } from './AdvertisementContainer';

interface AdBannerProps {
  type?: AdType;
  className?: string;
  children?: React.ReactNode;
}

export const AdBanner: React.FC<AdBannerProps> = (props) => {
  return <AdvertisementContainer {...props} />;
};

export { AdvertisementContainer };


