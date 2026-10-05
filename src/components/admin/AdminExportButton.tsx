'use client';

/**
 * Reusable Admin Export Button / Dropdown Component
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 */

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import type { ExportFormat } from '@/lib/export/export-utils';

interface AdminExportButtonProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
  label?: string;
}

export function AdminExportButton({
  onExport,
  disabled = false,
  label = 'Export',
}: AdminExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div className="inline-flex rounded-lg shadow-2xs">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onExport('csv')}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-surface text-charcoal border border-border rounded-l-lg hover:bg-surface-subtle transition-colors disabled:opacity-50"
          title="Export as CSV"
        >
          <Download className="w-3.5 h-3.5 text-muted" />
          <span>{label} CSV</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className="px-2 py-2 text-xs bg-surface text-muted border-y border-r border-border rounded-r-lg hover:bg-surface-subtle hover:text-charcoal transition-colors border-l-0 disabled:opacity-50"
          aria-expanded={isOpen}
          aria-label="More export formats"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg bg-surface border border-border shadow-lg py-1 text-xs">
          <button
            type="button"
            onClick={() => {
              onExport('csv');
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-charcoal hover:bg-surface-subtle flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-emerald-700" />
            <div>
              <span className="font-medium block">Export CSV</span>
              <span className="text-[10px] text-muted">UTF-8 compatible (.csv)</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              onExport('excel');
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-charcoal hover:bg-surface-subtle flex items-center gap-2 border-t border-border/50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <div>
              <span className="font-medium block">Export Excel</span>
              <span className="text-[10px] text-muted">Styled Spreadsheet (.xls)</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
