import { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinishedGoodsRotation } from "@/features/reports/api";

export function RotationReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: rows = [],
    isLoading,
    isError,
  } = useFinishedGoodsRotation({
    start_date: startDate,
    end_date: endDate,
  });

  const columns = [
    { key: "code", header: "Código" },
    { key: "description", header: "Descripción" },
    { key: "total_sold", header: "Unidades vendidas" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">Desde</Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date">Hasta</Label>
          <Input
            id="end_date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isError={isError}
        getRowKey={(row) => row.product_id}
        emptyMessage="No hay salidas de productos terminados en este rango."
      />
    </div>
  );
}
