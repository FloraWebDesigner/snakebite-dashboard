"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MonthlyData } from "@/app/types/snakebite";

type TimeGroup = "date" | "month" | "quarter";
interface ChartData {
  date: string;
  count?: number;
  cumulative?: number;
  daily_count?: number;
  cumulative_count?: number;
  quarterly_count?: number;
  ytd_count?: number;
}

export const description = "Snakebite cases by time period";

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeGroup, setTimeGroup] = React.useState<TimeGroup>("month");
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching data with group=${timeGroup}`);
        const response = await fetch(`/api/snakebite`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const { daily, monthly } = await response.json();
        let processedData: ChartData[] = [];
        
        switch (timeGroup) {
          case "date":
            processedData = processDailyData(daily);
            break;
            case "month":
              processedData = (monthly as MonthlyData[]).map(m => ({
                date: m.month_start,
                count: m.monthly_count,
                cumulative: m.ytd_count
              }));
              break;
          case "quarter":
            processedData = processQuarterlyData(monthly);
            break;
        }
        
        setChartData(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeGroup]);

  const processDailyData = (daily: { Date: string }[]): ChartData[] => {
    const countsByDate: Record<string, number> = {};
    
    daily.forEach(item => {
      const date = new Date(item.Date).toISOString().split('T')[0];
      countsByDate[date] = (countsByDate[date] || 0) + 1;
    });
    
    let cumulative = 0;
    return Object.entries(countsByDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => {
        cumulative += count;
        return {
          date,
          daily_count: count,
          cumulative_count: cumulative
        };
      });
  };

  const processQuarterlyData = (monthly: any[]): ChartData[] => {
    const quarterMap: Record<string, ChartData> = {};

    monthly.forEach(month => {
      const date = new Date(month.month_start);
      const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
      const yearQuarter = `${date.getFullYear()}-${quarter}`;
      
      if (!quarterMap[yearQuarter]) {
        quarterMap[yearQuarter] = {
          date: yearQuarter,
          quarterly_count: 0,
          ytd_count: month.ytd_count
        };
      }
      
      quarterMap[yearQuarter].quarterly_count! += month.monthly_count;
    });

    return Object.values(quarterMap);
  };


  const chartConfig = {
    daily: {
      label: "Cases",
      color: "var(--primary)",
    },
    cumulative: {
      label: "YTD Cases",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  const formatXAxis = (value: string) => {
    if (timeGroup === "quarter") return value.split("-")[1]; // Q1, Q2等
    if (timeGroup === "month") return new Date(value).toLocaleDateString("en-US", { month: "short" });
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTooltip = (value: number, name: string) => {
    const nameMap: Record<string, string> = {
      count: "Cases",
      cumulative: "YTD Total",
      daily_count: "Daily Cases",
      cumulative_count: "Cumulative",
      quarterly_count: "Quarterly Cases",
      ytd_count: "YTD Total"
    };
    return [`${value}`, nameMap[name] || name];
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData.length) return <div className="text-center py-8">No data available</div>;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Snakebite Cases in 2019</CardTitle>
        <CardDescription>
        {{
            date: "Daily Cases",
            month: "Monthly Aggregation",
            quarter: "Quarterly Overview"
          }[timeGroup]}
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeGroup}
            onValueChange={(value: TimeGroup) => setTimeGroup(value)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="date">Daily</ToggleGroupItem>
            <ToggleGroupItem value="month">Monthly</ToggleGroupItem>
            <ToggleGroupItem value="quarter">Quarterly</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeGroup}
            onValueChange={(value: TimeGroup) => setTimeGroup(value)}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
            <SelectItem value="date">Daily</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="quarter">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatXAxis}
              label={{
                value: {
                  date: "Date",
                  month: "Month",
                  quarter: "Quarter"
                }[timeGroup],
                position: "insideBottomRight",
                offset: -10
              }}
            />
            <YAxis label={{ value: "Cases", angle: -90, position: "insideLeft" }} />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              formatter={formatTooltip}
              content={
                <ChartTooltipContent
                labelFormatter={(label) => {
                  if (timeGroup === "quarter") return `Quarter: ${label}`;
                  if (timeGroup === "month") return `Month: ${new Date(label).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
                  return `Date: ${new Date(label).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
                }}
                />
              }
            />
            {timeGroup === "date" ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="daily_count"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.2}
                    name="Daily Cases"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative_count"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.2}
                    name="Cumulative"
                  />
                </>
              ) : timeGroup === "month" ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.2}
                    name="Monthly Cases"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.2}
                    name="YTD Total"
                  />
                </>
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="quarterly_count"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.2}
                    name="Quarterly Cases"
                  />
                  <Area
                    type="monotone"
                    dataKey="ytd_count"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.2}
                    name="YTD Total"
                  />
                </>
              )}
            </AreaChart>
          </ChartContainer>
      </CardContent>
    </Card>
  );
}
