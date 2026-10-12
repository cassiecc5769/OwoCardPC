import React from 'react';
import { ArrowLeft } from 'lucide-react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: BadgeVariant;
  };
  liveStatus?: {
    text: string;
    subtext?: string;
    pulseColor?: string;
  };
  backButton?: {
    label: string;
    onClick: () => void;
  };
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  liveStatus,
  backButton,
  actions,
  children,
  className = '',
}) => {
  const getBadgeClass = (variant: BadgeVariant = 'primary') => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'danger':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'neutral':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'primary':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <header
      className={`bg-white px-5 py-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-3 flex-wrap">
          {backButton && (
            <button
              type="button"
              onClick={backButton.onClick}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/60"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backButton.label}</span>
            </button>
          )}
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {badge && (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border font-mono ${getBadgeClass(
                badge.variant
              )}`}
            >
              {badge.text}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-1 max-w-4xl leading-relaxed">{description}</p>
        )}
      </div>

      {(liveStatus || actions) && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {liveStatus && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  liveStatus.pulseColor || 'bg-emerald-500'
                } animate-pulse`}
              ></span>
              <span className="text-slate-500">{liveStatus.text}</span>
              {liveStatus.subtext && (
                <strong className="font-mono text-slate-900 font-semibold">
                  {liveStatus.subtext}
                </strong>
              )}
            </div>
          )}
          {actions}
        </div>
      )}

      {children}
    </header>
  );
};
