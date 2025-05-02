"use client";
import { useEffect, useState } from "react";
import { DailyData, MonthlyData } from "@/app/types/snakebite";


export default function Home() {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    console.log("Starting fetch...");
    const fetchData = async () => {
      try {
        const response = await fetch("/api/snakebite", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
          });
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        console.log("API Success:", result);
        setDailyData(result.dailyDetails);
        setMonthlyData(result.monthly); 
        console.log("Daily Data:", result.dailyDetails);
        console.log("Monthly Data:", result.monthly);
      } catch (error) {
        console.error("Full Error Details:", error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!dailyData || dailyData.length === 0) {
    return <div>No data available</div>;
  }

  const headers = dailyData.length > 0 ? Object.keys(dailyData[0]) : [];

  return <div>Check console for API response details</div>;
}
