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

export const INITIAL_SETTINGS: WebsiteSettings = {
  logoImageUrl: '/logo.png',
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

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'उज्जैन में विकास कार्यों को लेकर प्रशासन ने जारी किया नया मास्टर प्लान, शिप्रा तट का होगा कायाकल्प',
    subtitle: 'सिंहस्थ 2028 की तैयारियों के तहत 1200 करोड़ रुपये की परियोजनाओं को मिली स्वीकृति',
    content: `उज्जैन (त्रिकाल दर्शन ब्यूरो): उज्जैन शहर के आगामी 20 वर्षों के सुनियोजित विकास और सिंहस्थ महाकुंभ 2028 की तैयारियों को ध्यान में रखते हुए संभागायुक्त एवं कलेक्टर की अध्यक्षता में उच्च स्तरीय बैठक आयोजित की गई। 

बैठक में शिप्रा नदी के सभी प्रमुख घाटों के सौंदर्यीकरण, रामघाट एवं दत्त अखाड़ा क्षेत्र के चौड़ीकरण तथा रामघाट से काल भैरव मंदिर तक कॉरिडोर निर्माण के प्रस्ताव पर अंतिम मुहर लगा दी गई है।

प्रमुख विकास बिंदु:
1. शिप्रा नदी को सदानीरा बनाने के लिए कान्ह डायवर्जन प्रोजेक्ट में तेजी।
2. महाकाल लोक के द्वितीय चरण में नवग्रह वाटिका एवं वैदिक वेधशाला का आधुनिक विस्तार।
3. बाहरी रिंग रोड का 6-लेन चौड़ीकरण एवं 4 नए फ्लाईओवरों का निर्माण।
4. श्रद्धालुओं के लिए 50,000 वाहनों की क्षमता वाली स्मार्ट मल्टीलेवल पार्किंग।

संभागायुक्त ने स्पष्ट किया कि सभी निर्माण कार्य गुणवत्ता मानकों के अनुरूप तय समयसीमा में पूर्ण किए जाएंगे। स्थानीय निवासियों एवं साधु-संतों से भी इस संदर्भ में सुझाव आमंत्रित किए गए हैं।`,
    summary: 'सिंहस्थ 2028 को देखते हुए उज्जैन के कायाकल्प का मास्टर प्लान तैयार, 1200 करोड़ रुपये की योजनाओं को मिली हरी झंडी।',
    featuredImage: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?w=1200&q=80',
    categorySlug: 'local-news',
    categoryName: 'स्थानीय',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-ujn',
    districtName: 'उज्जैन',
    cityName: 'उज्जैन शहर',
    reporterId: 'rep-1',
    reporterName: 'राजकमल पांडेय',
    authorName: 'राजकमल पांडेय (ब्यूरो चीफ)',
    tags: ['उज्जैन', 'महाकाल', 'सिंहस्थ 2028', 'स्मार्ट सिटी'],
    views: 8520,
    isBreaking: true,
    isFeatured: true,
    publishDate: '2026-08-07T18:30:00Z',
    status: 'published',
    slug: 'ujjain-master-plan-2028-shipra-river'
  },
  {
    id: 'news-2',
    title: 'इंदौर में यातायात व्यवस्था को लेकर बड़ा बदलाव, 15 प्रमुख चौराहों पर शुरू हुआ AI ऑटोमैटिक सिग्नल सिस्टम',
    subtitle: 'ट्रैफिक जाम से मिलेगी मुक्ति, एम्बुलेंस को स्वचालित ग्रीन कॉरिडोर की मिलेगी सुविधा',
    content: `इंदौर (त्रिकाल दर्शन ब्यूरो): स्वच्छता में सिरमौर इंदौर शहर ने अब ट्रैफिक मैनेजमेंट में भी तकनीकी क्रांति की शुरुआत कर दी है। नगर निगम और इंदौर यातायात पुलिस के संयुक्त तत्वावधान में आज शहर के 15 सबसे व्यस्त चौराहों पर एआई-संचालित स्मार्ट ट्रैफिक कंट्रोल सिस्टम लागू कर दिया गया।

यह सिस्टम आर्टिफिशियल इंटेलिजेंस के माध्यम से चौराहे पर वाहनों के घनत्व का स्वतः विश्लेषण करता है और जिस दिशा में ट्रैफिक अधिक होता है, वहां सिग्नल की हरी लाइट का समय बढ़ा देता है।

इसके साथ ही एम्बुलेंस एवं फायर ब्रिगेड वाहनों के लिए ऑटोमैटिक जीपीएस बेस्ड ग्रीन कॉरिडोर सिस्टम भी सक्रिय किया गया है। महापौर एवं पुलिस आयुक्त ने कंट्रोल रूम का निरीक्षण कर प्रणाली के सफल परीक्षण की घोषणा की।`,
    summary: 'इंदौर में 15 प्रमुख चौराहों पर AI स्मार्ट ट्रैफिक सिग्नल चालू, एम्बुलेंस के लिए बनेगा अपने आप ग्रीन कॉरिडोर।',
    featuredImage: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200&q=80',
    categorySlug: 'technology',
    categoryName: 'टेक्नोलॉजी',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-ind',
    districtName: 'इंदौर',
    reporterId: 'rep-2',
    reporterName: 'अमित वर्मा',
    authorName: 'अमित वर्मा',
    tags: ['इंदौर', 'ट्रैफिक', 'AI टेक्नोलॉजी', 'स्मार्ट सिटी'],
    views: 6340,
    isBreaking: false,
    isFeatured: true,
    publishDate: '2026-08-07T16:15:00Z',
    status: 'published',
    slug: 'indore-ai-traffic-signal-system'
  },
  {
    id: 'news-3',
    title: 'भोपाल में शिक्षा विभाग ने जारी किए नए दिशा-निर्देश, बोर्ड परीक्षाओं में डिजिटलीकरण को बढ़ावा',
    subtitle: 'छात्रों के लिए ऑन-डिमांड मॉडल प्रश्न-पत्र और एआई ट्यूटर पोर्टल का शुभारंभ',
    content: `भोपाल (त्रिकाल दर्शन ब्यूरो): मध्य प्रदेश माध्यमिक शिक्षा मंडल (MPBSE) ने आगामी बोर्ड परीक्षाओं के दृष्टिगत बड़ा प्रशासनिक निर्णय लिया है। प्रदेश के सभी शासकीय एवं अशासकीय विद्यालयों के विद्यार्थियों के लिए डिजिटल लर्निंग पोर्टल जारी किया गया है।

मुख्य विशेषताएं:
- कक्षा 9वीं से 12वीं तक के विद्यार्थियों के लिए निःशुल्क डिजिटल अध्ययन सामग्री।
- वीडियो लेक्चर्स और पिछले 10 वर्षों के हल प्रश्न-पत्र।
- प्रश्नोत्तर समाधान हेतु 24x7 हेल्पलाइन सुविधा।`,
    summary: 'मध्य प्रदेश शिक्षा विभाग ने बोर्ड परीक्षाओं हेतु एआई ट्यूटर पोर्टल लॉन्च किया, विद्यार्थियों को मुफ्त में मिलेगी पठन सामग्री।',
    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
    categorySlug: 'education',
    categoryName: 'शिक्षा',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-bhp',
    districtName: 'भोपाल',
    reporterId: 'rep-3',
    reporterName: 'सुनीता जोशी',
    authorName: 'सुनीता जोशी',
    tags: ['भोपाल', 'शिक्षा', 'बोर्ड परीक्षा', 'MPBSE'],
    views: 4120,
    isBreaking: false,
    isFeatured: true,
    publishDate: '2026-08-07T14:10:00Z',
    status: 'published',
    slug: 'bhopal-education-board-digital-portal'
  },
  {
    id: 'news-4',
    title: 'किसानों के लिए सरकार ने जारी की नई सौर पंप सब्सिडी योजना, 90% तक की छूट का ऐलान',
    subtitle: 'अन्नदाताओं को सिंचाई संकट से मुक्ति दिलाने के लिए पीएम कुसुम योजना का विस्तार',
    content: `नई दिल्ली / भोपाल: केंद्र एवं मध्य प्रदेश सरकार के संयुक्त प्रयास से पीएम कुसुम योजना के तहत कृषकों को सौर ऊर्जा आधारित सिंचाई पंप लगाने के लिए 90 प्रतिशत तक की छूट प्रदान की जा रही है। 

कृषि मंत्री ने राज्य स्तरीय कृषि सम्मेलन को संबोधित करते हुए कहा कि दूरदराज के कृषि क्षेत्रों में जहां बिजली की लाइन नहीं है, वहां यह योजना वरदान साबित होगी। 

ऑनलाइन आवेदन हेतु आधिकारिक पोर्टल पर रजिस्ट्रेशन शुरू हो चुके हैं। इच्छुक किसान भाई अपने नजदीकी जन सेवा केंद्र या कृषि विभाग कार्यालय में संपर्क कर सकते हैं।`,
    summary: 'किसान भाइयों के लिए सोलर पंप पर 90% सब्सिडी, ऑनलाइन आवेदन प्रक्रिया प्रारंभ।',
    featuredImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80',
    categorySlug: 'agriculture',
    categoryName: 'कृषि',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    authorName: 'विशेष प्रतिनिधि',
    tags: ['कृषि', 'किसान योजना', 'सोलर पंप', 'PM Kusum'],
    views: 9810,
    isBreaking: true,
    isFeatured: false,
    publishDate: '2026-08-07T12:00:00Z',
    status: 'published',
    slug: 'solar-pump-subsidies-for-farmers'
  },
  {
    id: 'news-5',
    title: 'साइबर ठगी से सावधान: साइबर पुलिस ने जारी की नई गाइडलाइन, फर्जी कॉल आने पर तुरंत करें 1930 पर शिकायत',
    subtitle: 'ऑनलाइन फ्रॉड के बढ़ते मामलों को देखते हुए मालवा-निमाड़ क्षेत्र में विशेष एडवाइजरी जारी',
    content: `उज्जैन/इंदौर: साइबर अपराधियों द्वारा डिजिटल अरेस्ट, पार्ट-टाइम जॉब झांसा और क्रेडिट कार्ड ब्लॉक करने के नाम पर की जा रही धोखाधड़ी से आमजन को बचाने के लिए साइबर क्राइम पुलिस ने कड़े कदम उठाए हैं।

यदि आपके साथ कोई ऑनलाइन वित्तीय धोखाधड़ी होती है तो तुरंत हेल्पलाइन नंबर 1930 पर कॉल करें। शुरुआती 1 से 2 घंटे (गोल्डन आवर्स) में शिकायत दर्ज होने पर पुलिस राशि होल्ड कराने में सफल रहती है।`,
    summary: 'साइबर ठगी की स्थिति में 1930 हेल्पलाइन पर तुरंत संपर्क करें, साइबर पुलिस की अहम एडवाइजरी।',
    featuredImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80',
    categorySlug: 'crime',
    categoryName: 'अपराध',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-ujn',
    districtName: 'उज्जैन',
    reporterId: 'rep-1',
    reporterName: 'राकेश शर्मा',
    authorName: 'राकेश शर्मा',
    tags: ['अपराध', 'साइबर फ्रॉड', 'पुलिस एडवाइजरी'],
    views: 3200,
    isBreaking: false,
    isFeatured: false,
    publishDate: '2026-08-07T10:30:00Z',
    status: 'published',
    slug: 'cyber-crime-advisory-helpline-1930'
  },
  {
    id: 'news-6',
    title: 'विशेष रिपोर्ट: मालवांचल की प्राचीन जल संचयन प्रणालियां और आज के जल संकट का समाधान',
    subtitle: 'त्रिकाल दर्शन की विशेष खोजी ग्राउंड रिपोर्ट',
    content: `उज्जैन/धार: कभी अपने लबालब तालाबों और सदानीरा नदियों के लिए पहचाने जाने वाला मालवा अंचल आज भूजल स्तर के गिरते स्तर से जूझ रहा है।

त्रिकाल दर्शन की विशेष टीम ने उज्जैन, देवास, धार और मंदसौर के 20 से अधिक गांवों का दौरा किया और यह जानने का प्रयास किया कि परमार कालीन और होलकर कालीन बावड़ियां आज किस स्थिति में हैं।

रिपोर्ट में पाया गया कि यदि पारंपरिक बावडियों और तालाबों का पुनरुद्धार कर दिया जाए तो क्षेत्र में जल संकट का स्थायी समाधान निकल सकता है।`,
    summary: 'मालवा की ऐतिहासिक बावड़ियों एवं जल निकायों के संरक्षण पर विशेष पड़ताल।',
    featuredImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200&q=80',
    categorySlug: 'special-reports',
    categoryName: 'विशेष रिपोर्ट',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-ujn',
    districtName: 'उज्जैन',
    isSpecialReport: true,
    authorName: 'त्रिकाल इन्वेस्टिगेशन टीम',
    tags: ['विशेष रिपोर्ट', 'मालवा', 'जल संरक्षण'],
    views: 7420,
    isBreaking: false,
    isFeatured: true,
    publishDate: '2026-08-06T15:00:00Z',
    status: 'published',
    slug: 'special-report-malwa-water-heritage'
  },
  {
    id: 'news-7',
    title: 'महाकाल मंदिर में भस्म आरती के नए नियम जारी, श्रद्धालुओं को ऑनलाइन स्लॉट बुकिंग में मिली बड़ी राहत',
    subtitle: 'सावन और विशेष पर्वों पर सुगम दर्शन हेतु ऐप और वेबसाइट पर बढ़ीं सुविधाएं',
    content: `उज्जैन: विश्व प्रसिद्ध श्री महाकालेश्वर मंदिर प्रबंध समिति की महत्वपूर्ण बैठक में श्रद्धालुओं के हित में कई निर्णय लिए गए। 

भस्म आरती की नि:शुल्क अनुमति प्रक्रिया को पारदर्शी बनाने के लिए अब क्यूआर कोड युक्त ई-पास व्यवस्था लागू कर दी गई है। साथ ही दिव्यांगजनों और बुजुर्ग श्रद्धालुओं के लिए विशेष ई-रिक्शा सेवा निःशुल्क शुरू की गई है।`,
    summary: 'श्री महाकालेश्वर भस्म आरती दर्शन हेतु ऑनलाइन ई-पास प्रक्रिया आसान, श्रद्धालुओं में खुशी।',
    featuredImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80',
    categorySlug: 'religion',
    categoryName: 'धर्म एवं आध्यात्म',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-ujn',
    districtName: 'उज्जैन',
    reporterId: 'rep-1',
    reporterName: 'राकेश शर्मा',
    authorName: 'राकेश शर्मा',
    tags: ['महाकाल', 'भस्म आरती', 'उज्जैन', 'धर्म'],
    views: 12500,
    isBreaking: true,
    isFeatured: true,
    publishDate: '2026-08-07T08:00:00Z',
    status: 'published',
    slug: 'mahakal-bhasma-aarti-new-rules'
  },
  {
    id: 'news-8',
    title: 'मध्य प्रदेश लोक सेवा आयोग (MPPSC) ने जारी किया राज्य सेवा परीक्षा का नया शेड्यूल',
    subtitle: 'अभ्यर्थियों के लिए विभिन्न पदों हेतु आवेदन की तिथियां घोषित',
    content: `इंदौर: मध्य प्रदेश लोक सेवा आयोग (MPPSC) ने आगामी परीक्षाओं का संशोधित कैलेंडर आधिकारिक वेबसाइट पर जारी कर दिया है। 

प्रशासनिक सेवा, पुलिस सेवा एवं राजस्व विभाग के रिक्त पदों हेतु विस्तृत अधिसूचना जारी कर दी गई है। आयु सीमा में कोविड उपरांत दी गई छूट को आगे जारी रखा गया है।`,
    summary: 'MPPSC ने राज्य सेवा परीक्षा भर्ती परीक्षा का विस्तृत कैलेंडर जारी किया।',
    featuredImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80',
    categorySlug: 'employment',
    categoryName: 'रोजगार',
    stateId: 'st-mp',
    stateName: 'मध्य प्रदेश',
    districtId: 'dt-ind',
    districtName: 'इंदौर',
    authorName: 'शिक्षा ब्यूरो',
    tags: ['MPPSC', 'रोजगार', 'सरकारी नौकरी', 'इंदौर'],
    views: 8900,
    isBreaking: false,
    isFeatured: false,
    publishDate: '2026-08-06T11:20:00Z',
    status: 'published',
    slug: 'mppsc-state-service-schedule-released'
  }
];

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
