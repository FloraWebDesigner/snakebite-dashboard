"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DailyData } from "../types/snakebite";
import { formatDateForDisplay } from "@/components/formatDate";

export const columns: ColumnDef<DailyData>[] = [
  {
    accessorKey: "Date",
    header: "Date",
    cell: ({ row }) => formatDateForDisplay(row.getValue("Date")),
    enableSorting: true,
  },
  {
    accessorKey: "Sex",
    header: "Sex",
    enableSorting: true,
  },
  {
    accessorKey: "Age",
    header: "Age",
    enableSorting: true,
  },
  {
    accessorKey: "Age_Group",
    header: "Age Group",
    enableSorting: true,
  },
  {
    accessorKey: "Snake_Type",
    header: "Snake Type",
    enableSorting: true,
  },
  {
    accessorKey: "SAV_Volumn",
    header: "SAV Volumn",
    enableSorting: true,
  },
  {
    accessorKey: "Bite_Location",
    header: "Bite Location",
    enableSorting: true,
  },
  {
    accessorKey: "Diagnostic",
    header: "Diagnostic",
    enableSorting: true,
  },
  {
    accessorKey: "Traditional medicine or touniquet (Updated)",
    header: "Medicine",
    enableSorting: true,
  },
  {
    accessorKey: "Outcome",
    header: "Outcome",
    enableSorting: true,
  },
];
