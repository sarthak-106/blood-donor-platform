'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'mr' | 'ta' | 'bn' | 'te';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string
        ) => void;
      };
    };
  }
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    findDonors: 'Find Donors',
    bloodGroupGuide: 'Blood Group Guide',
    compatibilityMatrix: 'Compatibility Matrix',
    bloodBanks: 'Blood Banks',
    community: 'Community',
    camps: 'Donation Camps',
    eligibility: 'Check Eligibility',
    emergencySos: 'Emergency SOS',
    signIn: 'Sign In',
    register: 'Register as Donor',
    requestBlood: 'Request Blood',
    call104: 'Helpline 104',
    portal: 'Portal',
    heroTitle: 'Emergency Blood Matching & Voluntary Donor Network',
    heroSubtitle:
      'Connecting critical patients directly with voluntary blood donors, 24x7 blood banks, and verified hospitals across India.',
    selectBloodGroup: 'Select blood group',
    searchDonors: 'Search Donors Now',
    units: 'Units Required',
    urgent: 'Urgent',
    critical: 'Critical SOS',
    verifiedDonor: 'Verified Donor',
    platelets: 'Platelets',
    plasma: 'Plasma',
    wholeBlood: 'Whole Blood',
    language: 'Language',
    howItWorks: 'How The Platform Works',
    howItWorksSubtitle: 'A seamless, transparent loop designed to bridge the gap between donors and patients in need.',
    step1Title: '1. Search or Trigger SOS',
    step1Desc: 'Recipients filter by blood group and metro location or trigger an instant Emergency SOS broadcast to all compatible nearby donors.',
    step2Title: '2. Instant Donor Notification',
    step2Desc: 'Available donors receive rapid alerts with patient details and hospital location, allowing them to accept and share an estimated arrival time.',
    step3Title: '3. Hospital Verification & Donation',
    step3Desc: 'The donor presents their digital QR pass at the hospital or blood bank. Certified cross-matching is performed and the donation is logged.',
    featuredDonors: 'Featured Available Donors',
    viewAllDonors: 'View All Donors',
    allCities: 'All Cities',
    readyToSaveLife: 'Ready to Become a Verified Life Saver?',
    readyToSaveLifeDesc: 'Join thousands of voluntary donors. Track your donation milestones, earn digital badges, and save lives in your local community.',
  },
  hi: {
    findDonors: 'रक्तदाता खोजें',
    bloodGroupGuide: 'ब्लड ग्रुप गाइड',
    compatibilityMatrix: 'रक्त मिलान चार्ट',
    bloodBanks: 'ब्लड बैंक',
    community: 'समुदाय व आभार',
    camps: 'रक्तदान शिविर',
    eligibility: 'पात्रता जांचें',
    emergencySos: 'आपातकालीन SOS',
    signIn: 'लॉग इन करें',
    register: 'रक्तदाता पंजीकरण',
    requestBlood: 'रक्त का अनुरोध करें',
    call104: 'हेल्पलाइन 104',
    portal: 'पोर्टल',
    heroTitle: 'आपातकालीन रक्त मिलान एवं स्वैच्छिक रक्तदाता नेटवर्क',
    heroSubtitle:
      'गंभीर मरीजों को भारत भर के स्वैच्छिक रक्तदाताओं, 24x7 ब्लड बैंकों और सत्यापित अस्पतालों से सीधे जोड़ना।',
    selectBloodGroup: 'ब्लड ग्रुप चुनें',
    searchDonors: 'रक्तदाता खोजें',
    units: 'यूनिट आवश्यकता',
    urgent: 'तत्काल',
    critical: 'अति-आपातकालीन SOS',
    verifiedDonor: 'सत्यापित रक्तदाता',
    platelets: 'प्लेटलेट्स',
    plasma: 'प्लाज्मा',
    wholeBlood: 'संपूर्ण रक्त',
    language: 'भाषा',
    howItWorks: 'यह प्लेटफॉर्म कैसे काम करता है',
    howItWorksSubtitle: 'जरूरतमंद मरीजों और रक्तदाताओं को आपस में जोड़ने के लिए एक सुरक्षित और पारदर्शी प्रणाली।',
    step1Title: '1. खोजें या आपातकालीन SOS भेजें',
    step1Desc: 'मरीज ब्लड ग्रुप और शहर के अनुसार खोज सकते हैं या आसपास के सभी अनुकूल रक्तदाताओं को तत्काल SOS अलर्ट भेज सकते हैं।',
    step2Title: '2. तत्काल रक्तदाता अलर्ट',
    step2Desc: 'उपलब्ध रक्तदाताओं को अस्पताल और मरीज की जानकारी के साथ त्वरित सूचना मिलती है, जिससे वे रक्तदान स्वीकार कर सकते हैं।',
    step3Title: '3. अस्पताल सत्यापन व रक्तदान',
    step3Desc: 'रक्तदाता अस्पताल या ब्लड बैंक में अपना डिजिटल QR पास दिखाते हैं, जहां क्रॉस-मैचिंग के बाद रक्तदान दर्ज किया जाता है।',
    featuredDonors: 'प्रमुख उपलब्ध रक्तदाता',
    viewAllDonors: 'सभी रक्तदाता देखें',
    allCities: 'सभी शहर',
    readyToSaveLife: 'जीवन रक्षक बनने के लिए तैयार हैं?',
    readyToSaveLifeDesc: 'हजारों स्वैच्छिक रक्तदाताओं से जुड़ें। अपने रक्तदान को ट्रैक करें, डिजिटल बैज प्राप्त करें और अपने शहर में जानें बचाएं।',
  },
  mr: {
    findDonors: 'रक्तदाते शोधा',
    bloodGroupGuide: 'रक्तगट मार्गदर्शक',
    compatibilityMatrix: 'सुसंगतता चार्ट',
    bloodBanks: 'रक्तपेढी',
    community: 'समुदाय व कृतज्ञता',
    camps: 'रक्तदान शिबिरे',
    eligibility: 'पात्रता तपासा',
    emergencySos: 'आपत्कालीन SOS',
    signIn: 'साइन इन',
    register: 'रक्तदाता नोंदणी',
    requestBlood: 'रक्ताची विनंती करा',
    call104: 'हेल्पलाइन 104',
    portal: 'पोर्टल',
    heroTitle: 'आपत्कालीन रक्त जुळवणी व स्वयंसेवी रक्तदाता नेटवर्क',
    heroSubtitle:
      'गंभीर रुग्णांना संपूर्ण भारतातील स्वयंसेवी रक्तदाते, 24x7 रक्तपेढ्या आणि रुग्णालयांशी थेट जोडणे.',
    selectBloodGroup: 'रक्तगट निवडा',
    searchDonors: 'रक्तदाते शोधा',
    units: 'आवश्यक युनिट्स',
    urgent: 'तातडीचे',
    critical: 'अति-आपत्कालीन',
    verifiedDonor: 'सत्यापित रक्तदाता',
    platelets: 'प्लेटलेट्स',
    plasma: 'प्लाझ्मा',
    wholeBlood: 'संपूर्ण रक्त',
    language: 'भाषा',
    howItWorks: 'हे प्लॅटफॉर्म कसे कार्य करते',
    howItWorksSubtitle: 'गरजू रुग्ण आणि रक्तदाते यांना थेट जोडण्यासाठी एक पारदर्शक आणि सुरक्षित व्यवस्था.',
    step1Title: '1. शोधा किंवा आपत्कालीन SOS पाठवा',
    step1Desc: 'रुग्ण रक्तगट व शहरानुसार शोधू शकतात किंवा जवळच्या सर्व सुसंगत रक्तदात्यांना तात्काळ SOS पाठवू शकतात.',
    step2Title: '2. तात्काळ रक्तदाता सूचना',
    step2Desc: 'उपलब्ध रक्तदात्यांना रुग्णाची व रुग्णालयाची माहिती त्वरित मिळते, जेणेकरून ते रक्तदान स्वीकारू शकतील.',
    step3Title: '3. रुग्णालय पडताळणी व रक्तदान',
    step3Desc: 'रक्तदाता आपला डिजिटल QR पास दाखवून रुग्णालयात सुरक्षित रक्तदान करतात आणि त्याची नोंद होते.',
    featuredDonors: 'उपलब्ध रक्तदाते',
    viewAllDonors: 'सर्व रक्तदाते पहा',
    allCities: 'सर्व शहरे',
    readyToSaveLife: 'जीवनदाता होण्यास तयार आहात का?',
    readyToSaveLifeDesc: 'हजारो स्वयंसेवी रक्तदात्यांशी जोडा. आपले रक्तदान ट्रॅक करा आणि समाजात जीव वाचवा.',
  },
  ta: {
    findDonors: 'இரத்த தானம் தேடுக',
    bloodGroupGuide: 'இரத்தக் குழு வழிகாட்டி',
    compatibilityMatrix: 'பொருத்தம் மேட்ரிக்ஸ்',
    bloodBanks: 'இரத்த வங்கிகள்',
    community: 'சமூகம்',
    camps: 'இரத்த தான முகாம்கள்',
    eligibility: 'தகுதியை சரிபார்க்கவும்',
    emergencySos: 'அவசர SOS',
    signIn: 'உள்நுழைக',
    register: 'தானம் செய்பவர் பதிவு',
    requestBlood: 'இரத்தம் கோருக',
    call104: 'உதவி எண் 104',
    portal: 'போர்டல்',
    heroTitle: 'அவசர இரத்த பொருத்தம் மற்றும் தன்னார்வ கொடையாளர் வலைப்பின்னல்',
    heroSubtitle:
      'நோயாளிக்கு தன்னார்வ இரத்தக் கொடையாளர்கள் மற்றும் இரத்த வங்கிகளுடன் நேரடி தொடர்பு.',
    selectBloodGroup: 'இரத்த வகையைத் தேர்ந்தெடுக்கவும்',
    searchDonors: 'தேடுங்கள்',
    units: 'தேவையான அலகுகள்',
    urgent: 'அவசரம்',
    critical: 'மிக அவசர SOS',
    verifiedDonor: 'சரிபார்க்கப்பட்ட கொடையாளர்',
    platelets: 'பிளேட்லெட்டுகள்',
    plasma: 'பிளாஸ்மா',
    wholeBlood: 'முழு இரத்தம்',
    language: 'மொழி',
    howItWorks: 'இயங்குதளம் எவ்வாறு செயல்படுகிறது',
    howItWorksSubtitle: 'நோயாளிக்கும் இரத்த தானம் செய்பவர்களுக்கும் இடையே ஒரு நேரடி மற்றும் பாதுகாப்பான அமைப்பு.',
    step1Title: '1. தேடுங்கள் அல்லது SOS அனுப்பவும்',
    step1Desc: 'இரத்தக் குழு மற்றும் நகரம் மூலம் வடிகட்டி உடனடியாக அருகிலுள்ள கொடையாளர்களுக்கு SOS எச்சரிக்கை அனுப்பவும்.',
    step2Title: '2. உடனடி கொடையாளர் அறிவிப்பு',
    step2Desc: 'அருகிலுள்ள கொடையாளர்கள் நோயாளி மற்றும் மருத்துவமனை விவரங்களுடன் உடனடி அறிவிப்பைப் பெறுவர்.',
    step3Title: '3. மருத்துவமனை சரிபார்ப்பு மற்றும் தானம்',
    step3Desc: 'கொடையாளர் மருத்துவமனையில் டிஜிட்டல் QR பாஸை காட்டி இரத்த தானம் செய்கிறார்கள்.',
    featuredDonors: 'கிடைக்கக்கூடிய கொடையாளர்கள்',
    viewAllDonors: 'அனைத்து கொடையாளர்களையும் காண்க',
    allCities: 'அனைத்து நகரங்களும்',
    readyToSaveLife: 'உயிர் காப்பாளராக மாற தயாரா?',
    readyToSaveLifeDesc: 'ஆயிரக்கணக்கான தன்னார்வ கொடையாளர்களுடன் இணையுங்கள் மற்றும் உயிர்களைக் காப்பாற்றுங்கள்.',
  },
  bn: {
    findDonors: 'রক্তদাতা খুঁজুন',
    bloodGroupGuide: 'ব্লাড গ্রুপ গাইড',
    compatibilityMatrix: 'কম্প্যাটিবিলিটি চার্ট',
    bloodBanks: 'ব্লাড ব্যাংক',
    community: 'কমিউনিটি',
    camps: 'রক্তদান শিবির',
    eligibility: 'যোগ্যতা যাচাই করুন',
    emergencySos: 'জরুরী SOS',
    signIn: 'সাইন ইন',
    register: 'রক্তদাতা নিবন্ধন',
    requestBlood: 'রক্তের অনুরোধ করুন',
    call104: 'হেল্পলাইন ১০৪',
    portal: 'পোর্টাল',
    heroTitle: 'জরুরী রক্ত সংযোগ ও স্বেচ্ছাসেবী রক্তদাতা নেটওয়ার্ক',
    heroSubtitle:
      'সংকটজনক রোগীদের সরাসরি স্বেচ্ছাসেবী রক্তদাতা ও ২৪x৭ ব্লাড ব্যাংকের সাথে যুক্ত করা।',
    selectBloodGroup: 'রক্তের গ্রুপ বেছে নিন',
    searchDonors: 'অনুসন্ধান করুন',
    units: 'প্রয়োজনীয় ইউনিট',
    urgent: 'জরুরী',
    critical: 'অতি-জরুরী SOS',
    verifiedDonor: 'যাচাইকৃত রক্তদাতা',
    platelets: 'প্লাটিলেট',
    plasma: 'প্লাজমা',
    wholeBlood: 'সম্পূর্ণ রক্ত',
    language: 'ভাষা',
    howItWorks: 'প্ল্যাটফর্মটি কীভাবে কাজ করে',
    howItWorksSubtitle: 'রোগী ও রক্তদাতাদের মধ্যে সরাসরি ও নিরাপদ যোগাযোগ নিশ্চিত করার একটি সহজ ব্যবস্থা।',
    step1Title: '১. অনুসন্ধান করুন বা জরুরী SOS পাঠান',
    step1Desc: 'রক্তের গ্রুপ ও শহর অনুযায়ী খুঁজুন অথবা আশেপাশের সকল রক্তদাতাদের কাছে তাত্ক্ষণিক SOS সতর্কতা পাঠান।',
    step2Title: '২. তাত্ক্ষণিক রক্তদাতা বিজ্ঞপ্তি',
    step2Desc: 'উপলব্ধ রক্তদাতারা রোগীর অবস্থা ও হাসপাতালের অবস্থান সম্পর্কে দ্রুত বিজ্ঞপ্তি পান।',
    step3Title: '৩. হাসপাতাল যাচাইকরণ ও রক্তদান',
    step3Desc: 'রক্তদাতা হাসপাতালে ডিজিটাল QR পাস প্রদর্শন করে নিরাপদ রক্তদান সম্পন্ন করেন।',
    featuredDonors: 'উপলব্ধ রক্তদাতাগণ',
    viewAllDonors: 'সকল রক্তদাতা দেখুন',
    allCities: 'সকল শহর',
    readyToSaveLife: 'জীবন রক্ষাকারী হতে প্রস্তুত?',
    readyToSaveLifeDesc: 'হাজার হাজার স্বেচ্ছাসেবী রক্তদাতার সাথে যুক্ত হোন এবং মানুষের জীবন বাঁচান।',
  },
  te: {
    findDonors: 'రక్తదాతలను వెతకండి',
    bloodGroupGuide: 'బ్లడ్ గ్రూప్ గైడ్',
    compatibilityMatrix: 'సరిపోలిక చార్ట్',
    bloodBanks: 'బ్లడ్ బ్యాంకులు',
    community: 'కమ్యూనిటీ',
    camps: 'రక్తదాన శిబిరాలు',
    eligibility: 'అర్హతను తనిఖీ చేయండి',
    emergencySos: 'ఎమర్జెన్సీ SOS',
    signIn: 'సైన్ ఇన్',
    register: 'రక్తదాతగా నమోదు',
    requestBlood: 'రక్తం అభ్యర్థించండి',
    call104: 'హెల్ప్‌లైన్ 104',
    portal: 'పోర్టల్',
    heroTitle: 'ఎమర్జెన్సీ రక్తం మరియు స్వచ్ఛంద రక్తదాతల నెట్‌వర్క్',
    heroSubtitle:
      'బాధపడుతున్న రోగులను స్వచ్ఛంద రక్తదాతలు మరియు 24x7 బ్లడ్ బ్యాంకులతో తక్షణమే అనుసంధానించడం.',
    selectBloodGroup: 'బ్లడ్ గ్రూప్ ఎంచుకోండి',
    searchDonors: 'వెతకండి',
    units: 'కావలసిన యూనిట్లు',
    urgent: 'అత్యవసరం',
    critical: 'క్రిటికల్ SOS',
    verifiedDonor: 'ధృవీకరించబడిన దాత',
    platelets: 'ప్లేట్‌లెట్స్',
    plasma: 'ప్లాస్మా',
    wholeBlood: 'సంపూర్ణ రక్తం',
    language: 'భాష',
    howItWorks: 'ఈ ప్లాట్‌ఫారమ్ ఎలా పనిచేస్తుంది',
    howItWorksSubtitle: 'రోగులు మరియు రక్తదాతల మధ్య ప్రత్యక్ష సంబంధాన్ని ఏర్పరచడానికి సులభమైన వ్యవస్థ.',
    step1Title: '1. శోధించండి లేదా SOS పంపండి',
    step1Desc: 'బ్లడ్ గ్రూప్ మరియు నగరం ప్రకారం శోధించండి లేదా సమీపంలోని దాతలకు తక్షణ SOS హెచ్చరికను పంపండి.',
    step2Title: '2. తక్షణ రక్తదాత నోటిఫికేషన్',
    step2Desc: 'అందుబాటులో ఉన్న దాతలకు రోగి మరియు ఆసుపత్రి వివరాలతో తక్షణ అలర్ట్ చేరుతుంది.',
    step3Title: '3. ఆసుపత్రి ధృవీకరణ మరియు రక్తదానం',
    step3Desc: 'దాత డిజిటల్ QR పాస్‌ను ఆసుపత్రిలో చూపించి రక్తదానం పూర్తి చేస్తారు.',
    featuredDonors: 'అందుబాటులో ఉన్న రక్తదాతలు',
    viewAllDonors: 'అందరి దాతలను చూడండి',
    allCities: 'అన్ని నగరాలు',
    readyToSaveLife: 'ప్రాణదాత కావడానికి సిద్ధంగా ఉన్నారా?',
    readyToSaveLifeDesc: 'వేలాది మంది స్వచ్ఛంద రక్తదాతలతో చేరండి మరియు ప్రాణాలను రక్షించండి.',
  },
};

function setGoogleTransCookie(lang: Language) {
  if (typeof document === 'undefined') return;
  const hostname = window.location.hostname;
  const val = lang === 'en' ? '' : `/en/${lang}`;
  const expire = lang === 'en' ? 'expires=Thu, 01 Jan 1970 00:00:00 UTC;' : '';

  document.cookie = `googtrans=${val}; path=/; ${expire}`;
  document.cookie = `googtrans=${val}; domain=.${hostname}; path=/; ${expire}`;
  document.cookie = `googtrans=${val}; domain=${hostname}; path=/; ${expire}`;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'lifelink_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // 1. Restore saved language
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as Language | null;
      if (saved && TRANSLATIONS[saved]) {
        setLanguageState(saved);
        if (saved !== 'en') {
          setGoogleTransCookie(saved);
        }
      }
    } catch (e) {
      console.warn('Could not read language from localStorage', e);
    }

    // 2. Initialize Google Translate Script for full page translation
    if (typeof window !== 'undefined' && !document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        try {
          if (window.google?.translate?.TranslateElement) {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                includedLanguages: 'en,hi,mr,ta,bn,te',
                autoDisplay: false,
              },
              'google_translate_element'
            );
          }
        } catch (err) {
          console.warn('Google translate init error', err);
        }
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
      setGoogleTransCookie(lang);

      // Trigger translate combo if present
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      }

      // If switching back to English or combo not mounted, a reload cleanly resets the DOM
      if (lang === 'en' || !select) {
        window.location.reload();
      }
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div id="google_translate_element" style={{ display: 'none' }} aria-hidden="true" />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    };
  }
  return context;
}
