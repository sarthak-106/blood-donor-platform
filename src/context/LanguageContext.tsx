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

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    findDonors: 'Find Donors',
    bloodGroupGuide: 'Blood Group Guide',
    compatibilityMatrix: 'Compatibility Matrix',
    bloodBanks: 'Blood Banks',
    community: 'Community',
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
  },
  hi: {
    findDonors: 'रक्तदाता खोजें',
    bloodGroupGuide: 'ब्लड ग्रुप गाइड',
    compatibilityMatrix: 'रक्त मिलान चार्ट',
    bloodBanks: 'ब्लड बैंक',
    community: 'समुदाय व आभार',
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
  },
  mr: {
    findDonors: 'रक्तदाते शोधा',
    bloodGroupGuide: 'रक्तगट मार्गदर्शक',
    compatibilityMatrix: 'सुसंगतता चार्ट',
    bloodBanks: 'रक्तपेढी',
    community: 'समुदाय व कृतज्ञता',
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
  },
  ta: {
    findDonors: 'இரத்த தானம் தேடுக',
    bloodGroupGuide: 'இரத்தக் குழு வழிகாட்டி',
    compatibilityMatrix: 'பொருத்தம் மேட்ரிக்ஸ்',
    bloodBanks: 'இரத்த வங்கிகள்',
    community: 'சமூகம்',
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
  },
  bn: {
    findDonors: 'রক্তদাতা খুঁজুন',
    bloodGroupGuide: 'ব্লাড গ্রুপ গাইড',
    compatibilityMatrix: 'কম্প্যাটিবিলিটি চার্ট',
    bloodBanks: 'ব্লাড ব্যাংক',
    community: 'কমিউনিটি',
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
  },
  te: {
    findDonors: 'రక్తదాతలను వెతకండి',
    bloodGroupGuide: 'బ్లడ్ గ్రూప్ గైడ్',
    compatibilityMatrix: 'సరిపోలిక చార్ట్',
    bloodBanks: 'బ్లడ్ బ్యాంకులు',
    community: 'కమ్యూనిటీ',
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
  },
};

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
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as Language | null;
      if (saved && TRANSLATIONS[saved]) {
        setLanguageState(saved);
      }
    } catch (e) {
      console.warn('Could not read language from localStorage', e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
