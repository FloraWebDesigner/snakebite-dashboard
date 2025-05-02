"use client";

import { parse } from "papaparse";

export async function importCSVData(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const results = parse(event.target?.result as string, {
          header: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim()
        });
        resolve(results.data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsText(file);
  });
}
export async function importJSONData(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsText(file);
  });
}
