import React from 'react';
import { CardSkuMasterItem } from './types';

interface CardBrandLogoProps {
  card?: Partial<CardSkuMasterItem> | { brandName?: string; cardType?: string; iconType?: string; id?: string };
  brandName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const CardBrandLogo: React.FC<CardBrandLogoProps> = ({ card, brandName: propBrand, size = 'md' }) => {
  const sizeClass = 
    size === 'xs' ? 'w-5 h-5 rounded-md' :
    size === 'sm' ? 'w-6 h-6 rounded-lg' : 
    size === 'lg' ? 'w-10 h-10 rounded-lg' : 
    size === 'xl' ? 'w-12 h-12 rounded-xl' : 'w-8 h-8 rounded-lg';

  const iconClass = size === 'xs' ? 'w-3 h-3' : 'w-4 h-4';

  const name = (propBrand || card?.brandName || (card as any)?.cardType || card?.id || '').toLowerCase();
  const iconType = card?.iconType || '';

  // 1. Apple
  if (iconType === 'apple' || name.includes('apple') || name.includes('itunes') || name.includes('苹果')) {
    return (
      <div className={`${sizeClass} bg-black flex items-center justify-center shrink-0 shadow-xs`}>
        <svg className={`${iconClass} fill-white`} viewBox="0 0 170 170">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.8-11.87-14.28-5.46-8.37-9.75-17.72-12.87-28.05-3.12-10.33-4.68-20.2-4.68-29.61 0-13.15 3.3-24.18 9.9-33.09 6.6-8.91 15.02-13.43 25.26-13.56 5.1 0 10.45 1.25 16.05 3.75 5.6 2.5 9.4 3.79 11.4 3.87 1.63 0 5.48-1.32 11.55-3.96 6.07-2.64 11.49-3.83 16.26-3.57 12.37.64 21.93 5.43 28.67 14.37-10.89 6.53-16.22 15.54-16 27.03.22 8.91 3.59 16.33 10.12 22.26 6.53 5.93 14.18 9.24 22.95 9.93-2.18 6.53-4.8 12.63-7.87 18.33zM119.22 33.64c0-7.39 2.68-14.24 8.04-20.55 5.36-6.31 12.01-10.44 19.95-12.39.22 1.09.33 2.18.33 3.26 0 7.39-2.82 14.46-8.47 21.2-5.65 6.74-12.38 10.76-20.19 12.06-.22-1.2-.33-2.4-.33-3.58z" />
        </svg>
      </div>
    );
  }

  // 2. Steam
  if (iconType === 'steam' || name.includes('steam') || name.includes('蒸汽')) {
    return (
      <div className={`${sizeClass} bg-[#171a21] flex items-center justify-center shrink-0 shadow-xs`}>
        <svg className={`${iconClass} fill-white`} viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 0 0-10 9.8c0 4.8 3.4 8.8 8 9.8l2.6-3.7a3.5 3.5 0 0 1-1.6-3 3.5 3.5 0 0 1 3.5-3.5c.3 0 .7 0 1 .1l3-4.4A10 10 0 0 0 12 2zm6.6 6.4a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zm-7.6 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0z" />
        </svg>
      </div>
    );
  }

  // 3. Google Play
  if (iconType === 'google' || name.includes('google') || name.includes('谷歌')) {
    return (
      <div className={`${sizeClass} bg-white flex items-center justify-center shrink-0 shadow-xs border border-slate-200`}>
        <svg className={iconClass} viewBox="0 0 24 24">
          <path d="M3.6 1.8l10.8 10.2L3.6 22.2c-.3-.3-.6-.8-.6-1.5V3.3c0-.7.3-1.2.6-1.5z" fill="#4285F4" />
          <path d="M17.4 8.7L4.9 1.5c-.4-.2-.9-.2-1.3.3l10.8 10.2 3-3.3z" fill="#FBBC04" />
          <path d="M17.4 15.3l-3-3.3L3.6 22.2c.4.5.9.5 1.3.3l12.5-7.2z" fill="#EA4335" />
          <path d="M21.5 11.2l-4.1-2.5-3 3.3 3 3.3 4.1-2.5c.7-.4.7-1.2 0-1.6z" fill="#34A853" />
        </svg>
      </div>
    );
  }

  // 4. Amazon
  if (iconType === 'amazon' || name.includes('amazon') || name.includes('亚马逊')) {
    return (
      <div className={`${sizeClass} bg-white flex items-center justify-center shrink-0 shadow-xs border border-slate-200`}>
        <span className={`font-mono ${size === 'xs' ? 'text-[9px]' : 'text-[11px]'} font-bold text-[#FF9900]`}>
          a<span className={size === 'xs' ? 'text-[7px] text-slate-800' : 'text-[8px] text-slate-800'}>mazon</span>
        </span>
      </div>
    );
  }

  // 5. Razer Gold
  if (iconType === 'razer' || name.includes('razer') || name.includes('雷蛇')) {
    return (
      <div className={`${sizeClass} bg-black flex items-center justify-center shrink-0 shadow-xs border border-emerald-500/40`}>
        <span className={`font-mono ${size === 'xs' ? 'text-[8px]' : 'text-[11px]'} font-bold text-emerald-400 tracking-tight`}>
          RZG
        </span>
      </div>
    );
  }

  // 6. Vanilla
  if (iconType === 'vanilla' || name.includes('vanilla') || name.includes('香草')) {
    return (
      <div className={`${sizeClass} bg-[#047857] flex items-center justify-center shrink-0 shadow-xs text-white font-bold ${size === 'xs' ? 'text-[7px]' : 'text-[9px]'} font-mono tracking-tighter`}>
        VAN
      </div>
    );
  }

  // 7. Nike
  if (name.includes('nike') || name.includes('耐克')) {
    return (
      <div className={`${sizeClass} bg-black flex items-center justify-center shrink-0 shadow-xs text-white`}>
        <svg className={`${iconClass} fill-white`} viewBox="0 0 24 24">
          <path d="M21.707 5.293c-.391-.391-1.023-.391-1.414 0l-12 12-4-4c-.391-.391-1.023-.391-1.414 0s-.391 1.023 0 1.414l4.707 4.707c.391.391 1.023.391 1.414 0l12.707-12.707c.391-.391.391-1.023 0-1.414z" />
        </svg>
      </div>
    );
  }

  // 8. Sephora
  if (name.includes('sephora') || name.includes('丝芙兰')) {
    return (
      <div className={`${sizeClass} bg-white flex items-center justify-center shrink-0 shadow-xs border border-slate-200 text-black font-serif font-black ${size === 'xs' ? 'text-xs' : 'text-sm'}`}>
        S
      </div>
    );
  }

  // 9. Target
  if (name.includes('target') || name.includes('塔吉特')) {
    return (
      <div className={`${sizeClass} bg-white flex items-center justify-center shrink-0 shadow-xs border border-slate-200`}>
        <span className={`${size === 'xs' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} rounded-full border-2 border-rose-600 flex items-center justify-center`}>
          <span className={`${size === 'xs' ? 'w-0.5 h-0.5' : 'w-1 h-1'} rounded-full bg-rose-600`}></span>
        </span>
      </div>
    );
  }

  // 10. Walmart
  if (name.includes('walmart') || name.includes('沃尔玛')) {
    return (
      <div className={`${sizeClass} bg-[#0071ce] flex items-center justify-center shrink-0 shadow-xs text-amber-300 font-bold ${size === 'xs' ? 'text-[10px]' : 'text-xs'}`}>
        ✱
      </div>
    );
  }

  // Fallback: Standard high-end slate badge with clean monogram
  const monogram = ((card as any)?.iconText || name.slice(0, 3).toUpperCase() || 'GC').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3) || 'GC';
  return (
    <div className={`${sizeClass} bg-slate-900 flex items-center justify-center shrink-0 shadow-xs text-white font-bold ${size === 'xs' ? 'text-[8px]' : 'text-[10px]'} font-mono tracking-wider`}>
      {monogram}
    </div>
  );
};
