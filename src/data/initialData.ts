import {
  NewsArticle,
  Category,
  State,
  District,
  Reporter,
  MemberApplication,
  IDCard,
  JoiningLetter,
  Advertisement,
  SocialLink,
  WebsiteSettings,
  PanchangInfo
} from '../types/news';
import { DEFAULT_LOGO_BASE64 } from '../assets/defaultLogoData';

export const INITIAL_SETTINGS: WebsiteSettings = {
  logoImageUrl: DEFAULT_LOGO_BASE64,
  brandTitle: "त्रिकाल दर्शन",
  brandBadgeText: "समाचार",
  siteName: "त्रिकाल दर्शन समाचार",
  logoTitle: "Trikal Darshan Samachar",
  brandNameHindi: "त्रिकाल दर्शन समाचार",
  taglineHindi: "सत्य की त्रिकाल दृष्टि",
  tagline: "सत्य की त्रिकाल दृष्टि",
  contactNumber: "+91 6232876013",
  contactEmail: "trikaldarshannews72@gmail.com",
  addressHindi: "त्रिकाल दर्शन समाचार मीडिया हाऊस, कोठी रोड, उज्जैन (म.प्र.) 456010",
  address: "कोठी रोड, जिला उज्जैन (म.प्र.) 456010",
  editorName: "राजकमल पांडेय (प्रधान सम्पादक)",
  breakingTickerSpeed: 10,
  footerAboutHindi: "त्रिकाल दर्शन समाचार भारत का अग्रणी और निष्पक्ष डिजिटल समाचार मंच है। हम स्थानीय समस्याओं, ग्राउंड रिपोर्टिंग और सत्य की खोज को सर्वोपरि मानते हैं।",
  emergencyContact: "+91 6232876013"
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', nameHindi: 'ताज़ा खबर', nameEnglish: 'Latest News', slug: 'latest-news', sortOrder: 1, isHidden: false },
  { id: 'cat-2', nameHindi: 'स्थानीय', nameEnglish: 'Local News', slug: 'local-news', sortOrder: 2, isHidden: false },
  { id: 'cat-3', nameHindi: 'राज्य', nameEnglish: 'State News', slug: 'state-news', sortOrder: 3, isHidden: false },
  { id: 'cat-4', nameHindi: 'देश', nameEnglish: 'National', slug: 'national-news', sortOrder: 4, isHidden: false },
  { id: 'cat-5', nameHindi: 'राजनीति', nameEnglish: 'Politics', slug: 'politics', sortOrder: 5, isHidden: false },
  { id: 'cat-6', nameHindi: 'अपराध', nameEnglish: 'Crime', slug: 'crime', sortOrder: 6, isHidden: false },
  { id: 'cat-7', nameHindi: 'शिक्षा', nameEnglish: 'Education', slug: 'education', sortOrder: 7, isHidden: false },
  { id: 'cat-8', nameHindi: 'रोजगार', nameEnglish: 'Employment', slug: 'employment', sortOrder: 8, isHidden: false },
  { id: 'cat-9', nameHindi: 'व्यापार', nameEnglish: 'Business', slug: 'business', sortOrder: 9, isHidden: false },
  { id: 'cat-10', nameHindi: 'कृषि', nameEnglish: 'Agriculture', slug: 'agriculture', sortOrder: 10, isHidden: false },
  { id: 'cat-11', nameHindi: 'धर्म एवं आध्यात्म', nameEnglish: 'Religion', slug: 'religion', sortOrder: 11, isHidden: false },
  { id: 'cat-12', nameHindi: 'खेल', nameEnglish: 'Sports', slug: 'sports', sortOrder: 12, isHidden: false },
  { id: 'cat-13', nameHindi: 'मनोरंजन', nameEnglish: 'Entertainment', slug: 'entertainment', sortOrder: 13, isHidden: false },
  { id: 'cat-14', nameHindi: 'स्वास्थ्य', nameEnglish: 'Health', slug: 'health', sortOrder: 14, isHidden: false },
  { id: 'cat-15', nameHindi: 'टेक्नोलॉजी', nameEnglish: 'Technology', slug: 'technology', sortOrder: 15, isHidden: false },
  { id: 'cat-16', nameHindi: 'विशेष रिपोर्ट', nameEnglish: 'Special Reports', slug: 'special-reports', sortOrder: 16, isHidden: false },
];

export const INITIAL_STATES: State[] = [
  { id: 'st-mp', nameHindi: 'मध्य प्रदेश', nameEnglish: 'Madhya Pradesh', slug: 'madhya-pradesh', isEnabled: true },
  { id: 'st-up', nameHindi: 'उत्तर प्रदेश', nameEnglish: 'Uttar Pradesh', slug: 'uttar-pradesh', isEnabled: true },
  { id: 'st-rj', nameHindi: 'राजस्थान', nameEnglish: 'Rajasthan', slug: 'rajasthan', isEnabled: true },
  { id: 'st-cg', nameHindi: 'छत्तीसगढ़', nameEnglish: 'Chhattisgarh', slug: 'chhattisgarh', isEnabled: true },
  { id: 'st-dl', nameHindi: 'दिल्ली NCR', nameEnglish: 'Delhi NCR', slug: 'delhi-ncr', isEnabled: true },
  { id: 'st-mh', nameHindi: 'महाराष्ट्र', nameEnglish: 'Maharashtra', slug: 'maharashtra', isEnabled: true },
];

export const INITIAL_DISTRICTS: District[] = [
  { id: 'dt-ujn', stateId: 'st-mp', nameHindi: 'उज्जैन', nameEnglish: 'Ujjain', slug: 'ujjain', isEnabled: true },
  { id: 'dt-ind', stateId: 'st-mp', nameHindi: 'इंदौर', nameEnglish: 'Indore', slug: 'indore', isEnabled: true },
  { id: 'dt-bhp', stateId: 'st-mp', nameHindi: 'भोपाल', nameEnglish: 'Bhopal', slug: 'bhopal', isEnabled: true },
  { id: 'dt-jbp', stateId: 'st-mp', nameHindi: 'जबलपुर', nameEnglish: 'Jabalpur', slug: 'jabalpur', isEnabled: true },
  { id: 'dt-gwl', stateId: 'st-mp', nameHindi: 'ग्वालियर', nameEnglish: 'Gwalior', slug: 'gwalior', isEnabled: true },
  { id: 'dt-rpr', stateId: 'st-cg', nameHindi: 'रायपुर', nameEnglish: 'Raipur', slug: 'raipur', isEnabled: true },
  { id: 'dt-lko', stateId: 'st-up', nameHindi: 'लखनऊ', nameEnglish: 'Lucknow', slug: 'lucknow', isEnabled: true },
  { id: 'dt-jpr', stateId: 'st-rj', nameHindi: 'जयपुर', nameEnglish: 'Jaipur', slug: 'jaipur', isEnabled: true },
];

export const INITIAL_REPORTERS: Reporter[] = [
  {
    id: 'rep-1',
    name: 'राजकमल पांडेय ',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    mobile: '+91 6232876013',
    email: 'trikaldarshannews72@gmail.com',
    designation: 'ब्यूरो चीफ (उज्जैन संभाग)',
    role: 'bureau_chief',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-ujn',
    districtName: 'उज्जैन',
    bio: '4 वर्षों का पत्रकारिता अनुभव। महाकाल कॉरिडोर, धार्मिक मामलों एवं स्थानीय प्रशासन पर विश्लेषणात्मक रिपोर्टिंग।',
    articlesCount: 142,
    status: 'active'
  },
  {
    id: 'rep-2',
    name: 'अमित वर्मा',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    mobile: '9425012345',
    email: 'amit.verma@trikaldarshan.com',
    designation: 'वरिष्ठ जिला संवाददाता',
    role: 'district_reporter',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-ind',
    districtName: 'इंदौर',
    bio: 'इंदौर स्वच्छता, आईटी हब एवं क्राइम रिपोर्टिंग में विशेष विशेषज्ञता।',
    articlesCount: 98,
    status: 'active'
  },
  {
    id: 'rep-3',
    name: 'सुनीता जोशी',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    mobile: '9827054321',
    email: 'sunita.joshi@trikaldarshan.com',
    designation: 'राज्य संवाददाता',
    role: 'reporter',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-bhp',
    districtName: 'भोपाल',
    bio: 'मंत्रालय, विधानसभा, शिक्षा एवं महिला सुरक्षा मुद्दों पर विशेष कवरेज।',
    articlesCount: 76,
    status: 'active'
  }
];

export const INITIAL_NEWS: NewsArticle[] = [];

export const INITIAL_APPLICATIONS: MemberApplication[] = [
  {
    id: 'TDS-APP-2026-101',
    fullName: 'विक्रम सिंह सोलंकी',
    fatherName: 'श्री मानसिंह सोलंकी',
    dob: '1994-05-15',
    gender: 'पुरुष',
    mobile: '9826223344',
    email: 'vikram.solanki@gmail.com',
    address: '12, फ्रीगंज मेन रोड, उज्जैन (म.प्र.)',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-ujn',
    districtName: 'उज्जैन',
    qualification: 'माखनलाल चतुर्वेदी विश्वविद्यालय से पत्रकारिता में स्नातक (BJMC)',
    experience: '5 वर्ष का प्रिंट एवं डिजिटल मीडिया का अनुभव',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
    position: 'district_reporter',
    reason: 'त्रिकाल दर्शन समाचार के माध्यम से उज्जैन जिले की जनसमस्याओं को निष्पक्षता से उठाना चाहता हूँ।',
    status: 'approved',
    submittedAt: '2026-08-02T10:00:00Z',
    adminRemarks: 'योग्य एवं अनुभवी उम्मीदवार। जिला रिपोर्टर पद हेतु स्वीकृत।',
    memberId: 'TDS-MEM-8801',
    pressId: 'TDS-PRESS-0101'
  },
  {
    id: 'TDS-APP-2026-102',
    fullName: 'पूजा रघुवंशी',
    fatherName: 'श्री आनंद रघुवंशी',
    dob: '1998-11-20',
    gender: 'महिला',
    mobile: '9425887766',
    email: 'pooja.raghu@gmail.com',
    address: '45, साकेत नगर, इंदौर (म.प्र.)',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-ind',
    districtName: 'इंदौर',
    qualification: 'मास कम्यूनिकेशन में स्नातकोत्तर (MJMC)',
    experience: '3 वर्ष डिजिटल न्यूज़ एंकर एवं रिपोर्टर',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
    position: 'video_journalist',
    reason: 'वीडियो ग्राउंड रिपोर्टिंग में विशेषज्ञता है।',
    status: 'pending',
    submittedAt: '2026-08-06T14:30:00Z'
  }
];

export const INITIAL_ID_CARDS: IDCard[] = [
  {
    id: 'id-card-101',
    applicationId: 'TDS-APP-2026-101',
    memberId: 'TDS-MEM-8801',
    pressId: 'TDS-PRESS-0101',
    name: 'विक्रम सिंह सोलंकी',
    designation: 'जिला संवाददाता (Press)',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    stateName: 'मध्य प्रदेश',
    districtName: 'उज्जैन',
    qrCodeData: 'https://trikaldarshan.com/verify/TDS-PRESS-0101',
    issueDate: '2026-08-03',
    validUntil: '2027-08-02',
    status: 'active'
  }
];

export const INITIAL_JOINING_LETTERS: JoiningLetter[] = [
  {
    id: 'jl-101',
    letterNo: 'TDS/HR/2026/8801',
    applicationId: 'TDS-APP-2026-101',
    memberId: 'TDS-MEM-8801',
    name: 'विक्रम सिंह सोलंकी',
    designation: 'जिला संवाददाता (उज्जैन)',
    stateName: 'मध्य प्रदेश',
    districtName: 'उज्जैन',
    issueDate: '2026-08-03',
    joiningDate: '2026-08-05',
    responsibilities: [
      'उज्जैन जिले की महत्वपूर्ण प्रशासनिक, सामाजिक एवं जनहित की समाचारों का संकलन एवं प्रेषण।',
      'त्रिकाल दर्शन समाचार की नीति निर्देशिका का अक्षरशः पालन।',
      'सत्य, निष्पक्षता एवं सत्यनिष्ठा से रिपोर्टिंग करना।'
    ],
    terms: [
      'यह नियुक्ति पत्र त्रिकाल दर्शन समाचार मीडिया हाऊस द्वारा अधिकृत है।',
      'पत्रकारिता के नैतिक मूल्यों का उल्लंघन करने पर नियुक्ति स्वतः निरस्त मानी जाएगी।',
      'प्रेस परिचय पत्र केवल समाचार संकलन कार्य हेतु वैध है।'
    ]
  }
];

export const INITIAL_ADVERTISEMENTS: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'श्री महाकाल बिल्डर्स एवं डेवलपर्स - उज्जैन',
    type: 'top_banner',
    imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=300',
    targetUrl: '#',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    isActive: true,
    impressions: 45200,
    clicks: 1240
  },
  {
    id: 'ad-2',
    title: 'मालवा एग्रो प्रोडेक्ट्स - जैविक खाद एवं बीज',
    type: 'sidebar',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=400',
    targetUrl: '#',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    isActive: true,
    impressions: 21000,
    clicks: 580
  }
];

export const INITIAL_SOCIAL_LINKS: SocialLink[] = [
  { id: 'soc-1', platform: 'youtube', label: 'YouTube News Channel', url: 'https://youtube.com', isEnabled: true, followersCount: '2.5 लाख' },
  { id: 'soc-2', platform: 'facebook', label: 'Facebook Official Page', url: 'https://facebook.com', isEnabled: true, followersCount: '1.8 लाख' },
  { id: 'soc-3', platform: 'whatsapp', label: 'WhatsApp Official Channel', url: 'https://whatsapp.com', isEnabled: true, followersCount: '85 हज़ार' },
  { id: 'soc-4', platform: 'telegram', label: 'Telegram News Alerts', url: 'https://telegram.org', isEnabled: true, followersCount: '42 हज़ार' },
  { id: 'soc-5', platform: 'instagram', label: 'Instagram Stories', url: 'https://instagram.com', isEnabled: true, followersCount: '95 हज़ार' },
  { id: 'soc-6', platform: 'twitter', label: 'X (Twitter)', url: 'https://twitter.com', isEnabled: true, followersCount: '60 हज़ार' },
];

export const INITIAL_PANCHANG: PanchangInfo = {
  date: '08 अगस्त 2026',
  hindiDate: 'भाद्रपद कृष्ण पक्ष एकादशी, विक्रम संवत 2083',
  tithi: 'एकादशी (अजा एकादशी)',
  nakshatra: 'मृगशिरा नक्षत्र',
  yog: 'हर्षण योग',
  karan: 'बालव करण',
  sunrise: 'सुबह 05:58 बजे',
  sunset: 'शाम 07:05 बजे',
  rahukaal: 'दोपहर 01:30 से 03:00 बजे तक',
  aajKaVichar: 'सत्य का कोई विकल्प नहीं होता, और धर्म का मूल सत्यनिष्ठा में निहित है।'
};
