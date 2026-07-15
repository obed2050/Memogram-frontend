import { useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const DataTable = ({ columns, data, page = 1, totalPages = 1, onPageChange, loading, emptyMessage = 'No data' }) => {
  if (loading) {
    return (
      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              {columns.map((col, i) => (
                <th key={i} className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-500 text-sm">{emptyMessage}</td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-dark-surface/50 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3 text-gray-300">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-dark-border">
          <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-400 disabled:opacity-30"
            >
              <HiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-400 disabled:opacity-30"
            >
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
