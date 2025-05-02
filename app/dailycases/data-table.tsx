"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ExportButton } from "@/components/export";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/components/TranslationContext";
import { translations } from "@/app/types/translate";
import { importCSVData } from "@/components/import";
import { DailyData } from "@/app/types/snakebite";

interface DataTableProps<TData extends DailyData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDataImport?: (data: TData[]) => void;
}

export function DataTable<TData extends DailyData, TValue>({
  columns,
  data,
  onDataImport,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const { language, setLanguage, translate, translateData, loading } =
    useTranslation();
  const [translatedColumns, setTranslatedColumns] = useState(columns);
  const [processedData, setProcessedData] = useState<TData[]>(data);

  useEffect(() => {
    const processData = async () => {
      const result = await translateData(data);
      setProcessedData(result as TData[]);
    };
    processData();
  }, [data, language, translateData]);


  const table = useReactTable({
    data: processedData,
    columns: translatedColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch('/api/snakebite', {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import failed');
      }
  
      // 重新获取数据
      const refreshResponse = await fetch('/api/snakebite');
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh data');
      }
      
      const { dailyDetails } = await refreshResponse.json();
      setProcessedData(dailyDetails);
      
    } catch (error) {
      console.error("Import failed:", error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      event.target.value = "";
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between py-4">
        {/* <div className="flex items-center space-x-4"> */}
        <Input
          placeholder={translations[language]?.search || translations.en.search}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        {/* <LanguageToggle
            value={language}
            onChange={(value) => {
              handleLanguageChange(value as "en" | "fr" | "es" | "de" | "zh");
            }}
            languages={[
              { code: "en", name: "English" },
              { code: "fr", name: "Français" },
              { code: "es", name: "Español" },
              { code: "de", name: "Deutsch" },
              { code: "zh", name: "中文" },
            ]}
          /> */}
        {/* </div> */}
        <div className="flex items-center space-x-2">
          <Button asChild>
            <label className="cursor-pointer">
              {translations[language]?.import || translations.en.import}
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </Button>
          <ExportButton
            data={processedData}
            fileName="snakebite_records"
            label={translations[language]?.export || translations.en.export}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.column.getCanSort() ? (
                      <Button
                        variant="ghost"
                        onClick={() => header.column.toggleSorting()}
                        className="-ml-3 hover:bg-gray-50"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 transition-transform text-slate-300 ${
                            header.column.getIsSorted()
                              ? "rotate-180 text-slate-500"
                              : ""
                          }`}
                        />
                      </Button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  {translations[language]?.translating ||
                    translations.en.translating}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {translations[language]?.noResults ||
                    translations.en.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
