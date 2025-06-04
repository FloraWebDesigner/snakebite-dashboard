import { getDBConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import {MonthlyData,  DailyData } from "@/app/types/snakebite";
import { unstable_noStore as noStore } from 'next/cache';
import Papa, { parse } from "papaparse";
import type {SnakebiteDbRecord} from "@/app/types/snakebite";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

noStore();

export async function GET() {
    try {
      console.log("Starting fetch...");
        const db = await getDBConnection(); 
        const [monthlyResult, dailyDetails] = await Promise.all([
            db.query<MonthlyData[][]>('CALL get_monthly_snakebite_data()'),
            db.query<DailyData[]>(`
              SELECT 
                \`Date of arrival\` AS Date,
                \`Sex\`,
                \`Age\`,
                \`Snake Type\` AS Snake_Type,
                \`SAV Volumn\` AS SAV_Volumn,
                \`Location (Updated)\` AS Bite_Location,
                \`Arrival Period - Num(Updated)\`,
                \`Arrival Period (Updated)\`,
                \`Traditional medicine or touniquet (Updated)\`,
                \`DIAGNOSTIC\` AS Diagnostic,
                \`Outcome (Updated)\` AS Outcome,
                \`Age Group\` AS Age_Group
              FROM snakebite_2019 
              ORDER BY Date ASC
            `)
          ]);

          const formatDate = (date: any): string | null => {
            if (!date) return null;
            try {
              const d = new Date(date);
              return isNaN(d.getTime()) ? null : d.toISOString();
            } catch {
              return null;
            }
          };
      
          const formattedDailyDetails = dailyDetails[0].map(item => ({
            ...item,
            Date: formatDate(item.Date),
            Age: item.Age !== null ? Number(item.Age) : null,
  SAV_Volumn: item.SAV_Volumn !== null ? Number(item.SAV_Volumn) : 0
          }));
      
          const monthlyData = Array.isArray(monthlyResult[0]) 
            ? monthlyResult[0][0]?.map(item => ({
                ...item,
                date: formatDate(item.date)
              })) || [] 
            : [];
      
          return NextResponse.json({
            monthly: monthlyData,
            dailyDetails: formattedDailyDetails
          });
      
        } catch (err) {
          const error = err as Error;        
          console.error("Database Error:", {
            message: error.message,
            stack: error.stack
          });
          
        
        return NextResponse.json(
            { 
                error: "Database operation failed",
                message: error.message,
                ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
  try {
    const db = await getDBConnection();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const csvString = buffer.toString('utf-8');

    const { data: csvData } = await new Promise<Papa.ParseResult<unknown>>((resolve, reject) => {
      parse(csvString, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => resolve(results),
        error: (error: Error) => reject(error),
        transform: (value: string, field: string) => {
          if (field === 'Date of arrival' || field === 'Date') {
            return parseDate(value);
          }
          return value === '' ? null : value;
        }
      });
    });

    const columnMap: Record<string, keyof SnakebiteDbRecord> = {
      'Date': 'Date of arrival',
      'Sex': 'Sex',
      'Age': 'Age',
      'Snake Type': 'Snake Type',
      'Snake_Type': 'Snake Type',
      'SAV_Volumn': 'SAV Volumn',
      'SAV Volumn': 'SAV Volumn',
      'Bite Location': 'Location (Updated)',
      'Bite_Location': 'Location (Updated)',
      'Arrival Period - Num(Updated)': 'Arrival Period - Num(Updated)',
      'Arrival Period (Updated)': 'Arrival Period (Updated)',
      'Traditional medicine or touniquet (Updated)': 'Traditional medicine or touniquet (Updated)',
      'Diagnostic': 'DIAGNOSTIC',
      'Outcome': 'Outcome (Updated)',
      'Age Group': 'Age Group',
      'Age_Group': 'Age Group'
    };
    
    const cleanData = (csvData as any[]).map((item: any) => {
      const record: Partial<SnakebiteDbRecord> = {};
      
      for (const [csvHeader, dbColumn] of Object.entries(columnMap)) {
        let value = item[csvHeader] ?? item[dbColumn];

        if (value === 'NaN' || value === 'nan' || value === 'N/A') {
          value = null;
        }

        if (dbColumn === 'Date of arrival') {
          record[dbColumn] = parseDate(value);
        } 
        else if (dbColumn === 'SAV Volumn') {
  // 特殊处理SAV Volumn字段
  if (value === null || value === undefined || value === '' || isNaN(value)) {
    (record as any)[dbColumn] = 0; 
  } else {
    const numValue = Number(value);
    (record as any)[dbColumn] = isNaN(numValue) ? 0 : numValue;
  }
} 
        else if (dbColumn === 'Age' ||  dbColumn === 'Arrival Period - Num(Updated)') {
          if (value === '0') {
    (record as any)[dbColumn] = 0;
  } 
          // Convert numeric fields, handling empty/NaN cases
          else if (value === null || value === undefined || value === '') {
            (record as any)[dbColumn] = null;
          } else {
            const numValue = Number(value);
            (record as any)[dbColumn] = isNaN(numValue) ? null : numValue;
          }
        } else {
          // For string fields, convert to null if empty
          (record as any)[dbColumn] = value != null ? String(value) : null;
        }
      }
      
      return record as SnakebiteDbRecord;
    });

    const validData = cleanData.filter((item: SnakebiteDbRecord) => 
      item['Date of arrival'] || item.Sex || item.Age || item['Snake Type']
    );

    const essentialColumns: Array<keyof SnakebiteDbRecord> = [
      'Date of arrival', 'Sex', 'Age', 'Snake Type', 'SAV Volumn',
      'Location (Updated)', 'Arrival Period - Num(Updated)',
      'Arrival Period (Updated)', 'Traditional medicine or touniquet (Updated)',
      'DIAGNOSTIC', 'Outcome (Updated)', 'Age Group'
    ];

    const batchSize = 100;
    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize);
      const values = batch.map((item: SnakebiteDbRecord) => 
        essentialColumns.map(col => {
          const val = item[col];
          // Ensure we don't send undefined or NaN to the database
          return val === undefined || (typeof val === 'number' && isNaN(val)) ? null : val;
        })
      );
      
      await db.query(`
        INSERT INTO snakebite_2019 
        (${essentialColumns.map(col => `\`${col}\``).join(', ')})
        VALUES ?
      `, [values]);
    }

    return NextResponse.json({
      success: true,
      inserted: validData.length,
      sample: validData.slice(0, 3) 
    });

  } catch (err) {
    console.error('Import error:', err);
    return NextResponse.json(
      { 
        error: "Import failed",
        message: err instanceof Error ? err.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? err : undefined
      },
      { status: 500 }
    );
  }
}

function parseDate(dateStr: any): string | null {
  if (!dateStr) return null;
  
  const formats = [
    'yyyy-MM-dd', 
    'MM/dd/yyyy', 
    'dd-MM-yyyy',
    'yyyy/MM/dd',
    'dd/MM/yyyy'
  ];
  
  for (const format of formats) {
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch {}
  }
  
  return null;
}