import React from 'react';
import { RuleLifecycleTab } from './types';

interface TradingRulesHealthPipelineProps {
  activeTab: RuleLifecycleTab;
  onSelectTab: (tab: RuleLifecycleTab) => void;
  complianceRate: number;
  fusedMerchantsCount: number;
  unassignedCount: number;
}

export const TradingRulesHealthPipeline: React.FC<TradingRulesHealthPipelineProps> = ({
  activeTab,
  onSelectTab,
  complianceRate,
  fusedMerchantsCount,
  unassignedCount,
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
          <div>
            <span className="text-base font-bold text-slate-900">
              全网履约健康度与时序流转
            </span>
            <span className="ml-2 font-mono text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
              采样周期: 过去 60 分钟 (动态聚合)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">规则合规率:</span>
            <span className="font-mono font-bold text-emerald-600 text-sm">
              {complianceRate}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">流单阻断:</span>
            <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
              正常通行
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">商户惩罚:</span>
            <span className="font-mono bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100 font-semibold">
              {fusedMerchantsCount} 家熔断中
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">异常挂起:</span>
            <span className="font-mono font-bold text-slate-800">
              {unassignedCount} 单
            </span>
          </div>
        </div>
      </div>

      {/* Visual Interactive Order Lifecycle Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4">
        {/* Node 1 */}
        <button
          type="button"
          onClick={() => onSelectTab('order')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'order'
              ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-slate-50 border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-700">01 下单申报</span>
            <span className="font-mono text-[11px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-semibold">
              T+0s
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800">
            出卡端面值与黑名单过滤
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            拦截微额扫库 & 180天防重
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-600 font-semibold pt-2 border-t border-slate-200/60">
            <span>防刷生效中</span>
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </div>
        </button>

        {/* Node 2 */}
        <button
          type="button"
          onClick={() => onSelectTab('dispatch')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'dispatch'
              ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-slate-50 border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-700">02 派单撮合</span>
            <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
              ≤60s
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800">
            自动化加权轮询与保量
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            超时未接直接扣减权益分
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-blue-600 font-semibold pt-2 border-t border-slate-200/60">
            <span>平均 24.6s 接单</span>
            <span className="material-symbols-outlined text-[16px]">speed</span>
          </div>
        </button>

        {/* Node 3 */}
        <button
          type="button"
          onClick={() => onSelectTab('operation')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'operation'
              ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-slate-50 border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-700">03 验卡作业</span>
            <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
              ≤10m
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800">
            商户 API / 手动核销输入
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            OCR 查验与卡密解密挂接
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-600 font-semibold pt-2 border-t border-slate-200/60">
            <span>99.2% 按期提交</span>
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </div>
        </button>

        {/* Node 4 */}
        <button
          type="button"
          onClick={() => onSelectTab('timeout')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'timeout'
              ? 'bg-rose-50/60 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-slate-50 border-slate-200/80 hover:border-rose-400 hover:bg-rose-50/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-rose-600">04 超时熔断</span>
            <span className="font-mono text-[11px] bg-rose-50 text-rose-700 border border-rose-200/80 px-1.5 py-0.5 rounded font-semibold">
              15m 硬线
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800">
            自动剥离至平台兜底池
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            商户冻结接单权限 2 小时
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-rose-600 font-semibold pt-2 border-t border-slate-200/60">
            <span>强约束介入</span>
            <span className="material-symbols-outlined text-[16px]">lock_clock</span>
          </div>
        </button>

        {/* Node 5 */}
        <button
          type="button"
          onClick={() => onSelectTab('dispute')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'dispute'
              ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-slate-50 border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-700">05 争议受理</span>
            <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
              ≤24h
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800">
            凭证多维比对与仲裁
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            质押资金预冻结与自动划转
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 font-semibold pt-2 border-t border-slate-200/60">
            <span>全链路留痕</span>
            <span className="material-symbols-outlined text-[16px]">balance</span>
          </div>
        </button>
      </div>
    </div>
  );
};
