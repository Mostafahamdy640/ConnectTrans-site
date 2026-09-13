import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { PageId } from '../types';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  onNavigateHome: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: any;
  };
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  onNavigateHome,
  actionButton,
}) => {
  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-10 sm:py-12 border-b border-slate-800 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>الرئيسية</span>
          </button>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-amber-400 font-bold">{title}</span>
        </nav>

        {/* Title and Subtitle Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            {badge && (
              <span className="inline-block px-3 py-1 bg-blue-600/30 text-blue-300 border border-blue-400/30 text-xs font-bold rounded-lg mb-3">
                {badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {actionButton && (
            <div className="shrink-0">
              <button
                onClick={actionButton.onClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                {actionButton.icon && <actionButton.icon className="w-4 h-4" />}
                <span>{actionButton.label}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
