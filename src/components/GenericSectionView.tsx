import React from 'react';
import { NavPath } from '../types';

interface GenericSectionViewProps {
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
}

export const GenericSectionView: React.FC<GenericSectionViewProps> = ({ currentPath, onNavigate }) => {
  // Merchant management specific layout
  if (currentPath === 'merchant-management') {
    return (
      <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80">
            <span className="text-slate-500 font-label-caps text-[11px] uppercase font-semibold">认证接卡商户</span>
            <div className="text-[24px] font-numeric-stat font-bold text-slate-900 mt-1">142 <span className="text-xs text-slate-500 font-normal">家</span></div>
            <span className="text-xs text-emerald-700 font-code-token">正常在岗接单 138 家</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80">
            <span className="text-slate-500 font-label-caps text-[11px] uppercase font-semibold">商户总授信质押池</span>
            <div className="text-[24px] font-numeric-stat font-bold text-blue-600 mt-1">¥18,500,000</div>
            <span className="text-xs text-blue-600 font-code-token">资金履约锁死防穿透</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80">
            <span className="text-slate-500 font-label-caps text-[11px] uppercase font-semibold">平均接卡核销时效</span>
            <div className="text-[24px] font-numeric-stat font-bold text-emerald-700 mt-1">42s</div>
            <span className="text-xs text-emerald-700 font-code-token">SLA 达标率 99.4%</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80">
            <span className="text-slate-500 font-label-caps text-[11px] uppercase font-semibold">商户综合信誉分</span>
            <div className="text-[24px] font-numeric-stat font-bold text-slate-900 mt-1">98.9</div>
            <span className="text-xs text-emerald-700 font-code-token">零重大违规</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">store</span>
              <span className="text-sm font-semibold text-slate-900">签约直连商户名录 (接卡方)</span>
            </div>
            <button
              onClick={() => onNavigate('workbench')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              返回全景大盘
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-xs">星辰数字核销工作室</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-code-token font-semibold">S级认证商</span>
              </div>
              <p className="text-[11px] text-slate-500">接卡范围: Apple / Steam / Vanilla Visa · 日配额 ¥500万</p>
              <div className="text-[11px] font-code-token text-slate-600 flex justify-between border-t border-slate-200/40 pt-1.5">
                <span>保证金: ¥2,000,000</span>
                <span className="text-emerald-700">核销耗时 36s</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-xs">极速卡兑科技有限公司</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-code-token font-semibold">A级认证商</span>
              </div>
              <p className="text-[11px] text-slate-500">接卡范围: Razer Gold / Google Play · 日配额 ¥200万</p>
              <div className="text-[11px] font-code-token text-slate-600 flex justify-between border-t border-slate-200/40 pt-1.5">
                <span>保证金: ¥800,000</span>
                <span className="text-emerald-700">核销耗时 48s</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-xs">万商合众网络</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-code-token font-semibold">S级认证商</span>
              </div>
              <p className="text-[11px] text-slate-500">接卡范围: Steam Wallet US/EU · 日配额 ¥400万</p>
              <div className="text-[11px] font-code-token text-slate-600 flex justify-between border-t border-slate-200/40 pt-1.5">
                <span>保证金: ¥1,500,000</span>
                <span className="text-emerald-700">核销耗时 29s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generic fallback for other sub-pages
  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-4 bg-blue-600 rounded-sm"></span>
            <h2 className="text-base font-semibold text-slate-900">
              功能模块 · {currentPath}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('workbench')}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
          >
            返回工作台大盘
          </button>
        </div>
        <p className="text-xs text-slate-500">
          当前模块已与平台作业端底座（IAM统一鉴权、实时撮合引擎 v3.4.2、积点流水）实现统一挂接。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-900 block">数据同步通道</span>
            <span className="font-code-token text-[11px] text-emerald-700">SH-PROD-01 · 1s轮询同步</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-900 block">风控审计防线</span>
            <span className="font-code-token text-[11px] text-blue-600">双向质押 · 先行介入</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-900 block">业务架构边界</span>
            <span className="font-code-token text-[11px] text-slate-600">平台作业端 (业务管辖)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
