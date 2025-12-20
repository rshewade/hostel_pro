'use client';

import { useState, useMemo } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import type { TableProps, TableColumn } from '../types';

const Table = <T,>({
  className,
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  ...props
}: TableProps<T>) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortColumn];
      const bVal = (b as any)[sortColumn];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (columnKey: string | number | symbol) => {
    const key = String(columnKey);
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const tableClasses = cn(
    // Base table styles
    'w-full border-collapse bg-white',
    'border border-gray-200 rounded-lg overflow-hidden',

    // Custom classes
    className
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses} {...props}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, columnIndex) => (
              <th
                key={columnIndex}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  'border-b border-gray-200',
                  column.width && `w-${column.width}`,
                  column.sortable && 'cursor-pointer hover:bg-gray-100 select-none'
                )}
                style={column.width ? { width: column.width } : undefined}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <div className="flex flex-col">
                      <svg
                        className={cn(
                          'w-3 h-3',
                          sortColumn === column.key && sortDirection === 'asc'
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <svg
                        className={cn(
                          'w-3 h-3 -mt-1',
                          sortColumn === column.key && sortDirection === 'desc'
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={cn(
                'hover:bg-gray-50',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, columnIndex) => (
                <td
                  key={columnIndex}
                  className="px-4 py-3 text-sm text-gray-900"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.render
                    ? column.render((row as any)[column.key], row)
                    : String((row as any)[column.key] || '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Table.displayName = 'Table';

export { Table };