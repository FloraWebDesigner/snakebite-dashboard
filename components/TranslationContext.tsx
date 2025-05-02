"use client";

import { createContext, useContext, useState } from "react";
import {
  translateText,
  translateObject,
} from "@/components/TranslationService";

type Language = "en" | "fr" | "es" | "de" | "zh";

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  translate: (text: string) => Promise<string>;
  translateData: <T extends Record<string, any>>(data: T[]) => Promise<T[]>;
  loading: boolean;
  error: string | null;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLanguage = async (newLanguage: Language) => {
    setLoading(true);
    setError(null);
    try {
      setLanguageState(newLanguage);
    } catch (err) {
      setError("Failed to change language");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const translate = async (text: string) => {
    if (language === "en") return text;

    try {
      setError(null);
      return await translateText(text, "en", language);
    } catch (err) {
      setError("Translation service unavailable");
      return text;
    }
  };

  const translateData = async <T extends Record<string, any>>(data: T[]) => {
    if (language === "en") return data;

    setLoading(true);
    setError(null);
    try {
      return await Promise.all(
        data.map((item) => translateObject(item, language, "en"))
      );
    } catch (err) {
      setError("Failed to translate data");
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage,
        translate,
        translateData,
        loading,
        error,
      }}
    >
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 p-3 rounded shadow-lg">
          {error}
        </div>
      )}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
