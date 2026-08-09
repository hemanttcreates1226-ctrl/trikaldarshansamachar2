export type ArticleStatus = 'published' | 'draft' | 'pending' | 'archived';

export interface NewsArticle {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  summary: string;
  featuredImage: string;
  galleryImages?: string[];
  videoUrl?: string;
  categorySlug: string;
  categoryName: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  cityId?: string;
  cityName?: string;
  reporterId?: string;
  reporterName?: string;
  authorName: string;
  tags: string[];
  views: number;
  isBreaking: boolean;
  isFeatured: boolean;
  isSpecialReport?: boolean;
  publishDate: string;
  updatedDate?: string;
  status: ArticleStatus;
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
}

export interface Category {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  slug: string;
  iconName?: string;
  sortOrder: number;
  isHidden: boolean;
}

export interface State {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  slug: string;
  isEnabled: boolean;
}

export interface District {
  id: string;
  stateId: string;
  nameHindi: string;
  nameEnglish: string;
  slug: string;
  isEnabled: boolean;
}

export interface City {
  id: string;
  districtId: string;
  nameHindi: string;
  nameEnglish: string;
  slug: string;
}

export type ReporterRole = 
  | 'reporter' 
  | 'district_reporter' 
  | 'bureau_chief' 
  | 'photographer' 
  | 'video_journalist' 
  | 'editor' 
  | 'contributor';

export interface Reporter {
  id: string;
  name: string;
  photo: string;
  mobile: string;
  email: string;
  designation: string;
  role: ReporterRole;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  bio: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  articlesCount: number;
  status: 'active' | 'disabled';
  memberId?: string;
}

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface MemberApplication {
  id: string; // e.g. TDS-APP-2026-108
  fullName: string;
  fatherName: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  address: string;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  qualification: string;
  experience: string;
  photoUrl: string;
  documentUrl: string;
  resumeUrl?: string;
  position: ReporterRole;
  reason: string;
  status: ApplicationStatus;
  adminRemarks?: string;
  submittedAt: string;
  memberId?: string; // e.g. TDS-MEM-8891
  pressId?: string;  // e.g. TDS-PRESS-042
}

export interface IDCard {
  id: string;
  applicationId: string;
  memberId: string;
  pressId: string;
  name: string;
  designation: string;
  photo: string;
  stateName: string;
  districtName: string;
  mobile?: string;
  qrCodeData: string;
  issueDate: string;
  validUntil: string;
  status: 'active' | 'revoked';
}

export interface JoiningLetter {
  id: string;
  letterNo: string;
  applicationId: string;
  memberId: string;
  name: string;
  designation: string;
  stateName: string;
  districtName: string;
  issueDate: string;
  joiningDate: string;
  responsibilities: string[];
  terms: string[];
}

export type AdType = 'top_banner' | 'sidebar' | 'in_feed' | 'article' | 'mobile';

export interface Advertisement {
  id: string;
  title: string;
  type: AdType;
  imageUrl: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'youtube' | 'whatsapp' | 'telegram' | 'twitter' | 'linkedin';
  label: string;
  url: string;
  isEnabled: boolean;
  followersCount?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: string;
  uploadedAt: string;
}

export interface WebsiteSettings {
  logoImageUrl?: string;
  brandTitle?: string;
  brandBadgeText?: string;
  siteName?: string;
  logoTitle?: string;
  brandNameHindi?: string;
  taglineHindi?: string;
  tagline?: string;
  contactNumber?: string;
  contactEmail?: string;
  addressHindi?: string;
  address?: string;
  editorName?: string;
  breakingTickerSpeed?: number; // in seconds
  footerAboutHindi?: string;
  emergencyContact?: string;
  socialLinks?: {
    facebook: string;
    youtube: string;
    whatsappChannel: string;
    telegram: string;
    instagram: string;
    twitter: string;
  };
}

export interface PanchangInfo {
  date: string;
  hindiDate: string;
  tithi: string;
  nakshatra: string;
  yog: string;
  karan: string;
  sunrise: string;
  sunset: string;
  rahukaal: string;
  aajKaVichar: string;
}
