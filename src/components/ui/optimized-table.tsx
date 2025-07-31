import React, { memo, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VirtualList } from '@/components/ui/virtual-list';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface OptimizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  rowHeight?: number;
  containerHeight?: number;
  virtualized?: boolean;
  onRowClick?: (item: T) => void;
}

function OptimizedTableComponent<T extends { id: string | number }>({
  data,
  columns,
  className,
  rowHeight = 60,
  containerHeight = 400,
  virtualized = false,
  onRowClick,
}: OptimizedTableProps<T>) {
  // Memoize table headers
  const tableHeaders = useMemo(() => (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead key={String(column.key)} className={column.className}>
            {column.header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  ), [columns]);

  // Memoize row renderer
  const renderRow = useCallback((item: T, index: number) => (
    <TableRow
      key={item.id}
      className={cn(
        'cursor-pointer hover:bg-muted/50 transition-colors',
        onRowClick && 'cursor-pointer'
      )}
      onClick={() => onRowClick?.(item)}
    >
      {columns.map((column) => (
        <TableCell key={String(column.key)} className={column.className}>
          {column.render ? column.render(item) : String(item[column.key] || '')}
        </TableCell>
      ))}
    </TableRow>
  ), [columns, onRowClick]);

  // Regular table for small datasets
  if (!virtualized || data.length < 100) {
    return (
      <Table className={cn('w-full', className)}>
        {tableHeaders}
        <TableBody>
          {data.map((item, index) => renderRow(item, index))}
        </TableBody>
      </Table>
    );
  }

  // Virtualized table for large datasets
  return (
    <div className={cn('border rounded-lg', className)}>
      <Table>
        {tableHeaders}
      </Table>
      <VirtualList
        items={data}
        itemHeight={rowHeight}
        containerHeight={containerHeight}
        renderItem={renderRow}
        className="border-t"
      />
    </div>
  );
}

// Export memoized component
export const OptimizedTable = memo(OptimizedTableComponent) as typeof OptimizedTableComponent;