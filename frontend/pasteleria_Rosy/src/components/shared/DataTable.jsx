import { Inbox } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Tabla generica reutilizada por todos los modulos (productos, lotes, movimientos,
 * reportes...). Recibe columnas declarativas y resuelve loading/error/vacío, para
 * que cada pantalla solo defina QUE mostrar, no COMO mostrarlo.
 *
 * columns: [{ key, header, cell?: (row) => ReactNode, className? }]
 *   - Si no se pasa `cell`, se muestra `row[key]` tal cual.
 *
 * Ejemplo:
 *   <DataTable
 *     columns={[
 *       { key: "code", header: "Código" },
 *       { key: "description", header: "Descripción" },
 *       { key: "total_stock", header: "Stock", cell: (p) => `${p.total_stock} ${p.unit_of_measure}` },
 *     ]}
 *     data={products}
 *     isLoading={isLoading}
 *     isError={isError}
 *   />
 */
export function DataTable({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage = "No se pudo cargar la información. Intenta de nuevo.",
  emptyMessage = "No hay registros para mostrar.",
  skeletonRows = 5,
  getRowKey = (row, index) => row?._id ?? row?.id ?? index,
}) {
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Ocurrió un error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data?.length ? (
            data.map((row, index) => (
              <TableRow key={getRowKey(row, index)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell ? column.cell(row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Inbox className="size-5" />
                  <span>{emptyMessage}</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
