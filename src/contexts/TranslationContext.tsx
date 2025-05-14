
import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation, Language } from '@/i18n';

interface TranslationContextType {
  t: (key: string) => string;
  currentLanguage: Language;
  changeLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const translation = useTranslation();
  
  return (
    <TranslationContext.Provider value={translation}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useAppTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useAppTranslation must be used within a TranslationProvider');
  }
  return context;
};
