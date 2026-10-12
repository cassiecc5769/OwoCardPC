import React from 'react';

// ============================================================================
// 4 & 5. 业务语义状态胶囊 (只读，低视疲劳，浅底+细边+深字)
// ============================================================================
export type SemanticStatusType =
  | 'success'   // 正常/达标/充裕/成功/已结清
  | 'warning'   // 警告/待处理/观察/临界
  | 'danger'    // 危险/致命/严重/拒卡/超时
  | 'dispute'   // 待审/争议/仲裁/复核
  | 'neutral'   // 停收/已关闭/已取消
  | 'info';      // 常规提示

interface StatusBadgeProps {
  status: SemanticStatusType | string;
  label?: string;
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  dot = false,
  className = '',
}) => {
  let style = 'bg-slate-100 text-slate-600 border-slate-200/80';
  let dotColor = 'bg-slate-400';
  let displayLabel = label || status;

  const s = String(status).toLowerCase();

  if (s === 'success' || s.includes('成功') || s.includes('有效') || s.includes('正常') || s.includes('充裕') || s.includes('通过') || s.includes('在收') || s.includes('已完成') || s.includes('已结算') || s.includes('已出账') || s.includes('已解决') || s.includes('履约完成') || s.includes('规则生效') || s.includes('生效中') || s.includes('已移交') || s.includes('active') || s.includes('valid') || s.includes('enabled')) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (s === 'warning' || s.includes('待') || s.includes('临界') || s.includes('超时预警') || s.includes('即将') || s.includes('可疑') || s.includes('处理中') || s.includes('观察') || s.includes('在途') || s.includes('挂账') || s.includes('pending') || s.includes('warning') || s.includes('processing')) {
    style = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (s === 'danger' || s.includes('异常') || s.includes('失败') || s.includes('拦截') || s.includes('超额') || s.includes('超时') || s.includes('拒单') || s.includes('拒卡') || s.includes('拒绝') || s.includes('高风险') || s.includes('断供') || s.includes('零余额') || s.includes('停用') || s.includes('fatal') || s.includes('danger') || s.includes('error') || s.includes('rejected') || s.includes('disabled')) {
    style = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
  } else if (s === 'dispute' || s.includes('争议') || s.includes('仲裁') || s.includes('复核') || s.includes('调账') || s.includes('售后') || s.includes('audit') || s.includes('verifying') || s.includes('dispute') || s.includes('review')) {
    style = 'bg-purple-50 text-purple-700 border-purple-200/80';
    dotColor = 'bg-purple-500';
  } else if (s === 'info' || s.includes('信息') || s.includes('撮合') || s.includes('机制') || s.includes('级联') || s.includes('info')) {
    style = 'bg-blue-50 text-blue-700 border-blue-200/80';
    dotColor = 'bg-blue-500';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border select-none ${style} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>}
      <span>{displayLabel}</span>
    </span>
  );
};

// ============================================================================
// 6. 国家/地区专属徽标 (Region Badges)
// ============================================================================
interface RegionBadgeProps {
  countryCode?: string;
  countryName?: string;
  className?: string;
}

export const RegionBadge: React.FC<RegionBadgeProps> = ({ countryCode = 'US', countryName, className = '' }) => {
  const code = countryCode.toUpperCase();
  let style = 'bg-blue-50 text-blue-700 border-blue-200';
  let flag = '🇺🇸';
  let name = countryName || '美国';

  if (code === 'UK' || code === 'GB') {
    style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    flag = '🇬🇧';
    name = countryName || '英国';
  } else if (code === 'DE' || code === 'EU' || code === 'FR') {
    style = 'bg-cyan-50 text-cyan-700 border-cyan-200';
    flag = code === 'DE' ? '🇩🇪' : code === 'FR' ? '🇫🇷' : '🇪🇺';
    name = countryName || (code === 'DE' ? '德国' : '欧洲');
  } else if (code === 'JP') {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
    flag = '🇯🇵';
    name = countryName || '日本';
  } else if (code === 'GLB' || code === 'GLOBAL') {
    style = 'bg-teal-50 text-teal-700 border-teal-200';
    flag = '🌐';
    name = countryName || '全球通用';
  } else if (code === 'NG') {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    flag = '🇳🇬';
    name = countryName || '尼日利亚';
  } else if (code === 'CA') {
    style = 'bg-red-50 text-red-700 border-red-200';
    flag = '🇨🇦';
    name = countryName || '加拿大';
  } else if (code === 'AU') {
    style = 'bg-amber-50 text-amber-800 border-amber-200';
    flag = '🇦🇺';
    name = countryName || '澳大利亚';
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded font-medium border ${style} ${className}`}>
      <span>{flag}</span>
      <span>{code} · {name}</span>
    </span>
  );
};

// ============================================================================
// 6.2 凭证介质与流转速度标签 (Media & Velocity Badges)
// ============================================================================
interface MediaBadgeProps {
  type: 'physical' | 'ecode' | 'fast' | 'slow' | string;
  label?: string;
  className?: string;
}

export const MediaBadge: React.FC<MediaBadgeProps> = ({ type, label, className = '' }) => {
  const t = type.toLowerCase();
  if (t === 'physical' || t.includes('实体') || t.includes('小票') || t.includes('图片')) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded font-medium border bg-amber-50 text-amber-700 border-amber-200 ${className}`}>
        <span className="material-symbols-outlined text-[12px]">photo_camera</span>
        <span>{label || '实体小票'}</span>
      </span>
    );
  }

  if (t === 'ecode' || t.includes('电子') || t.includes('pin') || t.includes('code')) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded font-medium border bg-purple-50 text-purple-700 border-purple-200 ${className}`}>
        <span className="material-symbols-outlined text-[12px]">code</span>
        <span>{label || '纯电子卡密'}</span>
      </span>
    );
  }

  if (t === 'fast' || t.includes('秒级') || t.includes('快卡')) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 ${className}`}>
        <span className="material-symbols-outlined text-[12px]">bolt</span>
        <span>{label || '秒级直通'}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded font-medium border bg-slate-100 text-slate-600 border-slate-200 ${className}`}>
      <span>{label || '常规处理'}</span>
    </span>
  );
};
