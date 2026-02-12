import React from 'react';

export function TablePagination({ total, page, pageSize, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 mt-2">
      <button
        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Prev
      </button>
      <span className="text-sm">Page {page} of {totalPages}</span>
      <button
        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default TablePagination;
