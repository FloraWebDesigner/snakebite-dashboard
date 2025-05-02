"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useMemo } from "react";

interface ExportButtonProps<TData> {
  data: TData[];
  fileName?: string;
  className?: string;
  label?: string;
}

export function ExportButton<TData>({
  data,
  fileName = "data",
  className,
  label = "Export",
}: ExportButtonProps<TData>) {
  const csvContent = useMemo(() => {
    if (!data || data.length === 0) return "";

    const headers = Array.from(
      new Set(data.flatMap((item) => Object.keys(item as object)))
    );

    const rows = data.map((item) =>
      headers
        .map((header) => {
          const value = (item as any)[header];
          return typeof value === "string"
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  }, [data]);

  const handleExport = () => {
    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${fileName}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
