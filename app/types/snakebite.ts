import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface SnakebiteRawData {
  Date: string;
  Sex: string;
  Age: number;
  "Snake_Type": string;
  "SAV_Volumn": string;
  "Bite_Location": string;
  "Arrival Period - Num(Updated)": string;
  "Arrival Period (Updated)": string;
  "Traditional medicine or touniquet (Updated)": string;
  Diagnostic: string;
  "Outcome": string;
  "Age Group": string;
}


export interface MonthlyData extends RowDataPacket{
  year: number;
  month_start: string;  // 'YYYY-MM-01' format
  month_name: string;
  monthly_count: number;
  ytd_count: number;
}

export interface DailyData extends RowDataPacket{
  Date: string;
  [key: string]: any;
}

export async function GET() {
  let db;
  try {
    db = await getDBConnection();
    
    const [dailyRows] = await db.query<(DailyData & RowDataPacket)[]>(`
      SELECT \`Date of arrival\` AS Date 
      FROM snakebite_2019 
      ORDER BY Date ASC
    `);
    
    
    const [monthlyResult] = await db.query<(MonthlyData & RowDataPacket)[][]>(
      'CALL get_monthly_snakebite_data()'
    );
    
    const monthlyRows = Array.isArray(monthlyResult[0]) ? monthlyResult[0] : [];
    
    return NextResponse.json({
      daily: dailyRows,
      monthly: monthlyRows
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  } finally {
    if (db) await db.end();
  }
}

export type SnakebiteDbRecord = {
  'Date of arrival': string | null;
  'Sex': string | null;
  'Age': number | null;
  'Location': string | null;
  'Arrival Period': string | null;
  'General': string | null;
  'General 2': string | null;
  'Snake Type': string | null;
  'SAV Effect': string | null;
  'Clinical findings': string | null;
  'Clinical findings3': string | null;
  'Clinical findings4': string | null;
  'Clinical findings5': string | null;
  'Clinical findings6': string | null;
  'Clinical findings7': string | null;
  'Clinical findings8': string | null;
  'Clinical findings9': string | null;
  'Clinical findings10': string | null;
  'Clinical findings11': string | null;
  'Vital signs': string | null;
  'Vital signs12': string | null;
  'Vital signs13': string | null;
  'Vital signs14': string | null;
  'Vital signs15': string | null;
  'Vital signs16': string | null;
  'Vital signs17': string | null;
  'Tests performed': string | null;
  'Tests performed18': string | null;
  'Presumptive': string | null;
  'SAV Nums': number | null;
  'Treatment given19': string | null;
  'SAV Volumn': string | null;
  'Treatment given21': string | null;
  'Treatment given22': string | null;
  'Treatment given23': string | null;
  'Column24': string | null;
  'Column25': string | null;
  'Column26': string | null;
  'Outcome': string | null;
  "Plainte l'arrivé": string | null;
  'Column27': string | null;
  'Column28': string | null;
  'Location (Updated)': string | null;
  'Arrival Period - Num(Updated)': number | null;
  'Arrival Period29': string | null;
  'Arrival Period (Updated)': string | null;
  'Traditional medicine or touniquet': string | null;
  'Traditional medicine or touniquet (Updated)': string | null;
  'DIAGNOSTIC': string | null;
  'Outcome (Updated)': string | null;
  'Age Group': string | null;
};