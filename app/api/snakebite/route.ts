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
            Age: item.Age ? Number(item.Age) : null,
            SAV_Volumn: item.SAV_Volumn ? Number(item.SAV_Volumn) : null
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
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const csvString = buffer.toString('utf-8');

    const csvData = await new Promise<any[]>((resolve, reject) => {
      parse(csvString, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim(),
        complete: (results) => resolve(results.data),
        error: (error: any) => reject(error)
      });
    });

    
    const cleanData: SnakebiteDbRecord[] = csvData.map(item => ({
      'Date of arrival': item['Date of arrival'] 
    ? new Date(item['Date of arrival']).toISOString().split('T')[0] 
    : null,
      'Sex': item.Sex ? String(item.Sex) : null,
      'Age': item.Age ? parseInt(item.Age as string) : null,
      'Location': item.Location || null,
      'Arrival Period': item['Arrival Period'] || null,
      'General': item.General || null,
      'General 2': item['General 2'] || null,
      'Snake Type': item['Snake Type'] || null,
      'SAV Effect': item['SAV Effect'] || null,
      'Clinical findings': item['Clinical findings'] || null,
      'Clinical findings3': item['Clinical findings3'] || null,
      'Clinical findings4': item['Clinical findings4'] || null,
      'Clinical findings5': item['Clinical findings5'] || null,
      'Clinical findings6': item['Clinical findings6'] || null,
      'Clinical findings7': item['Clinical findings7'] || null,
      'Clinical findings8': item['Clinical findings8'] || null,
      'Clinical findings9': item['Clinical findings9'] || null,
      'Clinical findings10': item['Clinical findings10'] || null,
      'Clinical findings11': item['Clinical findings11'] || null,
      'Vital signs': item['Vital signs'] || null,
      'Vital signs12': item['Vital signs12'] || null,
      'Vital signs13': item['Vital signs13'] || null,
      'Vital signs14': item['Vital signs14'] || null,
      'Vital signs15': item['Vital signs15'] || null,
      'Vital signs16': item['Vital signs16'] || null,
      'Vital signs17': item['Vital signs17'] || null,
      'Tests performed': item['Tests performed'] || null,
      'Tests performed18': item['Tests performed18'] || null,
      'Presumptive': item.Presumptive || null,
      'SAV Nums': item['SAV Nums'] || null,
      'Treatment given19': item['Treatment given19'] || null,
      'SAV Volumn': item['SAV Volumn'] || null,
      'Treatment given21': item['Treatment given21'] || null,
      'Treatment given22': item['Treatment given22'] || null,
      'Treatment given23': item['Treatment given23'] || null,
      'Column24': item.Column24 || null,
      'Column25': item.Column25 || null,
      'Column26': item.Column26 || null,
      'Outcome': item.Outcome || null,
      "Plainte l'arrivé": item["Plainte l'arrivé"] || null,
      'Column27': item.Column27 || null,
      'Column28': item.Column28 || null,
      'Location (Updated)': item['Location (Updated)'] || null,
      'Arrival Period - Num(Updated)': item['Arrival Period - Num(Updated)'] || null,
      'Arrival Period29': item['Arrival Period29'] || null,
      'Arrival Period (Updated)': item['Arrival Period (Updated)'] || null,
      'Traditional medicine or touniquet': item['Traditional medicine or touniquet'] || null,
      'Traditional medicine or touniquet (Updated)': item['Traditional medicine or touniquet (Updated)'] || null,
      'DIAGNOSTIC': item.DIAGNOSTIC || null,
      'Outcome (Updated)': item['Outcome (Updated)'] || null,
      'Age Group': item['Age Group'] || null
    }));

    const columns = [
      'Date of arrival', 'Sex', 'Age', 'Location', 'Arrival Period', 'General', 
      'General 2', 'Snake Type', 'SAV Effect', 'Clinical findings', 'Clinical findings3',
      'Clinical findings4', 'Clinical findings5', 'Clinical findings6', 'Clinical findings7',
      'Clinical findings8', 'Clinical findings9', 'Clinical findings10', 'Clinical findings11',
      'Vital signs', 'Vital signs12', 'Vital signs13', 'Vital signs14', 'Vital signs15',
      'Vital signs16', 'Vital signs17', 'Tests performed', 'Tests performed18', 'Presumptive',
      'SAV Nums', 'Treatment given19', 'SAV Volumn', 'Treatment given21', 'Treatment given22',
      'Treatment given23', 'Column24', 'Column25', 'Column26', 'Outcome', "Plainte l'arrivé",
      'Column27', 'Column28', 'Location (Updated)', 'Arrival Period - Num(Updated)',
      'Arrival Period29', 'Arrival Period (Updated)', 'Traditional medicine or touniquet',
      'Traditional medicine or touniquet (Updated)', 'DIAGNOSTIC', 'Outcome (Updated)', 'Age Group'
    ];

    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < cleanData.length; i += batchSize) {
      const batch = cleanData.slice(i, i + batchSize);
      const values = batch.map(item => columns.map(col => (item as any)[col]));
      
      await db.query(`
        INSERT INTO snakebite_2019 
        (${columns.map(col => `\`${col}\``).join(', ')})
        VALUES ?
      `, [values]);
      
      insertedCount += batch.length;
    }

    return NextResponse.json(
      { 
        success: true, 
        inserted: insertedCount,
        warnings: cleanData.length - insertedCount
      },
      { status: 200 }
    );

  } catch (err) {
    console.error('Database import error:', err);
    return NextResponse.json(
      { 
        error: "Import failed",
        message: err instanceof Error ? err.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' ? { stack: err instanceof Error ? err.stack : null } : {})
      },
      { status: 500 }
    );
  }
}

