import React from 'react';
import { Info } from 'lucide-react';

export interface ConfigNoticeProps {
  label: string;
  placeholderValue: string;
  isConfigured?: boolean;
  className?: string;
}

export function ConfigNotice({
  label,
  placeholderValue,
  isConfigured = false,
  className = '',
}: ConfigNoticeProps) {
  if (isConfigured) {
    return <span className={className}>{placeholderValue}</span>;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-amber-50 text-amber-900 border border-amber-200/80 font-mono ${className}`}
      title={`${label}: Pending business configuration in environment or business.ts`}
    >
      <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
      <span>{placeholderValue}</span>
    </span>
  );
}
