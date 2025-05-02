// lib/services/TranslationService.ts
const translationCache = new Map<string, string>();

interface LibreTranslateResponse {
  translatedText: string;
}

export async function translateText(text: string, source: string, target: string) {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source,
        target,
      }),
    });

    if (!response.ok) {
      throw new Error('Translation request failed');
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error: any) {
    console.error('Error translating text:', error);
    throw error;
  }
}

export async function translateObject<T extends Record<string, any>>(
  obj: T,
  targetLang: string,
  sourceLang: string,
): Promise<T> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      result[key] = await translateText(obj[key], sourceLang, targetLang);
    } else {
      result[key] = obj[key];
    }
  }
  
  return result as T;
}