"use client";

import { parse } from "papaparse";

interface ImportOptions {
  header?: boolean;
  skipEmptyLines?: boolean;
  transformHeader?: (header: string) => string;
}

export async function importCSVData<T = any>(
  file: File,
  options: ImportOptions = {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  }
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const results = parse(event.target?.result as string, options);
        resolve(results.data as T[]);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsText(file);
  });
}
