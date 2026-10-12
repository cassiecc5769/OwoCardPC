import React, { useState, useEffect } from 'react';
import { NavPath } from '../../types';
import { TradeOperationsTab } from './specialized/TradeOperationsTab';
import { UserOperationsTab } from './specialized/UserOperationsTab';
import { MerchantOperationsTab } from './specialized/MerchantOperationsTab';
import { ProfitLossAnalyticsTab } from './specialized/ProfitLossAnalyticsTab';

interface SpecializedAnalyticsViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
}

export type SpecializedTab = 'trade' | 'user' | 'merchant' | 'profit';

export const SpecializedAnalyticsView: React.FC<SpecializedAnalyticsViewProps> = ({
  currentPath = 'analytics-trade',
  onNavigate
}) => {
  // 4 大标准 Tab (.1: 交易经营 / 用户经营 / 商户经营 / 收益分析)
  const [activeTab, setActiveTab] = useState<SpecializedTab>('trade');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // 路由同步联动
  useEffect(() => {
    if (currentPath === 'user-analytics' || currentPath === 'growth-analytics') {
      setActiveTab('user');
    } else if (currentPath === 'merchant-analytics') {
      setActiveTab('merchant');
    } else if (currentPath === 'financial-analytics') {
      setActiveTab('profit');
    } else if (
      currentPath === 'analytics-trade' ||
      currentPath === 'transaction-analytics' ||
      currentPath === 'channel-analytics' ||
      currentPath === 'service-analytics'
    ) {
      setActiveTab('trade');
    }
  }, [currentPath]);

  const handleTabChange = (tab: SpecializedTab) => {
    setActiveTab(tab);
    if (onNavigate) {
      const pathMap: Record<SpecializedTab, NavPath> = {
        trade: 'transaction-analytics',
        user: 'user-analytics',
        merchant: 'merchant-analytics',
        profit: 'financial-analytics'
      };
      onNavigate(pathMap[tab]);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* 顶部 Header: 经营专题定位 (.1 经营总览回答哪里不对，经营专题继续回答为什么不对) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">query_stats</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">经营专题（深度归因与下钻决策中心）</h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-[10px] font-bold border border-purple-200">
                经营专题
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              经营总览负责告诉管理者“<strong>哪里不对</strong>”，经营专题负责继续回答“<strong>为什么不对</strong>”：涵盖交易漏斗、用户价值、商户供给与真实净收益。
            </p>
          </div>
        </div>

        {/* 4 维度微标签 */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
            交易漏斗
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
            用户生命周期
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
            商户供给履约
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            收益与损益穿透
          </span>
        </div>
      </div>

      {/* 4 大标准 Tab 导航栏 (.1: 交易经营 / 用户经营 / 商户经营 / 收益分析) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          {
            id: 'trade',
            label: '交易经营',
            icon: 'sync_alt',
            badge: '7 步链路漏斗',
            badgeClass: 'bg-blue-100 text-blue-800 font-bold',
            desc: '分析交易规模、转化和失败原因'
          },
          {
            id: 'user',
            label: '用户经营',
            icon: 'group',
            badge: '生命周期 & Cohort',
            badgeClass: 'bg-purple-100 text-purple-800 font-bold',
            desc: '分析用户从注册到首单、复购与 LTV'
          },
          {
            id: 'merchant',
            label: '商户经营',
            icon: 'store',
            badge: '供给/报价/履约/质量',
            badgeClass: 'bg-amber-100 text-amber-800 font-bold',
            desc: '分析商户供给、竞争力与履约稳定度'
          },
          {
            id: 'profit',
            label: '收益分析',
            icon: 'account_balance_wallet',
            badge: '真实净利润穿透',
            badgeClass: 'bg-emerald-100 text-emerald-800 font-bold',
            desc: '穿透赔付与转单损失，看哪里在亏钱'
          }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as SpecializedTab)}
              className={`px-5 py-3.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                isActive
                  ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${tab.badgeClass}`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </section>

      {/* ========================================================================= */}
      {/* Tab 1: 交易经营                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'trade' && (
        <TradeOperationsTab onNavigate={onNavigate} />
      )}

      {/* ========================================================================= */}
      {/* Tab 2: 用户经营                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'user' && (
        <UserOperationsTab onNavigate={onNavigate} />
      )}

      {/* ========================================================================= */}
      {/* Tab 3: 商户经营                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'merchant' && (
        <MerchantOperationsTab onNavigate={onNavigate} />
      )}

      {/* ========================================================================= */}
      {/* Tab 4: 收益分析                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'profit' && (
        <ProfitLossAnalyticsTab onNavigate={onNavigate} />
      )}
    </div>
  );
};
