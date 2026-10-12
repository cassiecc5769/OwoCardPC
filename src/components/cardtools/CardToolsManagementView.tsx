import React, { useState, useEffect } from 'react';
import { NavPath } from '../../types';
import { ToolManagementTab } from './ToolManagementTab';
import { MerchantAuthTab } from './MerchantAuthTab';
import { INITIAL_TOOLS, INITIAL_MERCHANT_AUTHS } from './mockCardToolsData';

interface CardToolsManagementViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
}

export type CardToolTab = 'tools_list' | 'merchant_auth';

export const CardToolsManagementView: React.FC<CardToolsManagementViewProps> = ({
  currentPath = 'card-tools-management',
  onNavigate
}) => {
  // 页面包含两个 Tab: 工具列表 / 商户授权
  const [activeTab, setActiveTab] = useState<CardToolTab>('tools_list');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 双向路由联动
  useEffect(() => {
    if (currentPath === 'card-tools-auth') {
      setActiveTab('merchant_auth');
    } else if (
      currentPath === 'card-tools-management' ||
      currentPath === 'card-tools' ||
      currentPath === 'card-tools-query' ||
      currentPath === 'card-tools-logs' ||
      currentPath === 'card-tools-evidence'
    ) {
      setActiveTab('tools_list');
    }
  }, [currentPath]);

  const handleTabChange = (next: CardToolTab) => {
    setActiveTab(next);
    if (onNavigate) {
      const routeMap: Record<CardToolTab, NavPath> = {
        tools_list: 'card-tools-management',
        merchant_auth: 'card-tools-auth'
      };
      onNavigate(routeMap[next]);
    }
  };

  // 关键概览数据
  const totalTools = INITIAL_TOOLS.length;
  const activeTools = INITIAL_TOOLS.filter(t => t.status === 'ENABLED').length;
  const degradedTools = INITIAL_TOOLS.filter(t => t.healthStatus !== 'HEALTHY').length;
  const totalAuths = INITIAL_MERCHANT_AUTHS.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="space-y-4 text-xs text-slate-800 antialiased animate-in fade-in duration-200 pb-12">
      {/* 全局反馈 Toast */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* 模块顶部 Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">handyman</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">工具管理（工具列表 / 商户授权）</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                Card Tool Service
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              统一管理平台已接入的卡工具能力（<strong className="text-slate-700">Brand + Country + Capability + Source</strong>），以及这些能力如何被系统、平台人员和商户使用。
            </p>
          </div>
        </div>

        {/* 顶部概览 KPI Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-slate-500 font-sans">已接入工具: </span>
            <strong className="text-slate-900 font-bold">{totalTools}</strong> 个
            <span className="text-emerald-700 ml-1">({activeTools} 启用中)</span>
          </div>
          {degradedTools > 0 && (
            <div className="px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-xs font-mono text-amber-800">
              <span className="font-sans">通道抖动: </span>
              <strong className="font-bold">{degradedTools}</strong> 个
            </div>
          )}
          <div className="px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200 text-xs font-mono text-purple-800">
            <span className="font-sans">商户能力授权: </span>
            <strong className="font-bold">{totalAuths}</strong> 项生效
          </div>
        </div>
      </div>

      {/* 2 大标准 Tab 导航栏 (工具列表 / 商户授权) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          {
            id: 'tools_list',
            label: '工具列表',
            icon: 'table_rows',
            badge: `${totalTools} 个能力实例`,
            badgeClass: 'bg-blue-100 text-blue-800 font-bold'
          },
          {
            id: 'merchant_auth',
            label: '商户授权',
            icon: 'verified_user',
            badge: `${totalAuths} 项授权`,
            badgeClass: 'bg-purple-100 text-purple-800 font-bold'
          }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as CardToolTab)}
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

      {/* Tab 1: 工具列表 */}
      {activeTab === 'tools_list' && (
        <ToolManagementTab showToast={showToast} />
      )}

      {/* Tab 2: 商户授权 */}
      {activeTab === 'merchant_auth' && (
        <MerchantAuthTab showToast={showToast} />
      )}
    </div>
  );
};
