import React, { useState } from 'react';
import { NavPath } from '../../../types';
import { CustomerServiceOperationsTab } from './CustomerServiceOperationsTab';
import { MerchantFulfillmentEfficiencyTab } from './MerchantFulfillmentEfficiencyTab';
import { AutomationEffectivenessTab } from './AutomationEffectivenessTab';

interface OperationalEfficiencyViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
}

export type EfficiencyTab = 'cs_operations' | 'merchant_fulfillment' | 'automation_effectiveness';

export const OperationalEfficiencyView: React.FC<OperationalEfficiencyViewProps> = ({
  onNavigate
}) => {
  // 3 大标准 Tab (PRD 17.4.1: 客服作业 / 商户履约 / 自动化效果)
  const [activeTab, setActiveTab] = useState<EfficiencyTab>('cs_operations');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
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

      {/* 顶部 Header: 页面定位 (PRD 17.4.1 衡量平台“人和机器”到底干得怎么样) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">speed</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">作业效能（人机协同与履约效率看板）</h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200">
                效能看板
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              衡量平台“<strong>人和机器</strong>”到底干得怎么样：完成这些生意用了多少人工、多少自动化、效率有没有提升。
            </p>
          </div>
        </div>

        {/* 顶部微标签 */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
            客服人工人效
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            商户接单履约
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
            多模态自动化
          </span>
        </div>
      </div>

      {/* 3 大标准 Tab 导航栏 (PRD 17.4.1: 客服作业 / 商户履约 / 自动化效果) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          {
            id: 'cs_operations',
            label: '客服作业',
            icon: 'support_agent',
            badge: '工作量/SLA/人效',
            badgeClass: 'bg-blue-100 text-blue-800 font-bold',
            desc: '分析客服工作量、效率和耗时黑洞'
          },
          {
            id: 'merchant_fulfillment',
            label: '商户履约',
            icon: 'store',
            badge: '接单/处理/超时率',
            badgeClass: 'bg-emerald-100 text-emerald-800 font-bold',
            desc: '分析商户接单时效与实际履约质量'
          },
          {
            id: 'automation_effectiveness',
            label: '自动化效果',
            icon: 'smart_toy',
            badge: '替代人工 & 机器人ROI',
            badgeClass: 'bg-purple-100 text-purple-800 font-bold',
            desc: '监测报价机器人、Card Check 与 Card Tool 自动化率'
          }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as EfficiencyTab)}
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
      {/* 17.4.2 Tab 1: 客服作业                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'cs_operations' && (
        <CustomerServiceOperationsTab onNavigate={onNavigate} />
      )}

      {/* ========================================================================= */}
      {/* 17.4.3 Tab 2: 商户履约                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'merchant_fulfillment' && (
        <MerchantFulfillmentEfficiencyTab onNavigate={onNavigate} />
      )}

      {/* ========================================================================= */}
      {/* 17.4.4 Tab 3: 自动化效果                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'automation_effectiveness' && (
        <AutomationEffectivenessTab onNavigate={onNavigate} />
      )}
    </div>
  );
};
