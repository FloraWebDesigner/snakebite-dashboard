"use client";
import { useState, useEffect } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DailyData } from "@/app/types/snakebite";
import { TranslationProvider } from "@/components/TranslationContext";
import Image from "next/image";
import { authPlugins } from "mysql2";

export default function DailyCasesPage() {
  const [data, setData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${window.location.origin}/api/snakebite`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        setData(result.dailyDetails);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDataImport = (newData: DailyData[]) => {
    setData(newData);
    // Optional: show success message
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-4">No data available</div>;
  }

  return (
    <TranslationProvider>
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Image
            src={"/logo-white_h.jpeg"}
            alt="Snakebite Logo"
            width={120}
            height={80}
          />
        <h1 className="text-2xl font-bold ml-6">Daily Cases</h1>
        </div>
        <DataTable
          columns={columns}
          data={data}
          onDataImport={handleDataImport}
        />
      </div>
    </TranslationProvider>
  );
}
