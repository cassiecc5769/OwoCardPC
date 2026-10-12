import React, { useState } from 'react';
import { NavPath } from '../types';
import { ChannelOpsView } from './operations/ChannelOpsView';
import { GrowthOpsView } from './operations/GrowthOpsView';
import { MerchantOpsView } from './operations/MerchantOpsView';
import { MemberOpsView } from './operations/MemberOpsView';
import { ActivityOpsView } from './operations/ActivityOpsView';
import { BenefitsOpsView } from './operations/BenefitsOpsView';
import { OperationPlansView } from './OperationPlansView';

interface GrowthOperationsViewProps {
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
}

export type OperationsModuleTab =
  | 'channel'
  | 'growth'
  | 'merchant'
  | 'member'
  | 'activity'
  | 'benefits'
  | 'plans';

export const GrowthOperationsView: React.FC<GrowthOperationsViewProps> = ({ currentPath, onNavigate }) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // 根据 currentPath 判断激活的运营大类
  const getActiveTab = (): OperationsModuleTab => {
    if (
      currentPath === 'channel-overview' ||
      currentPath === 'channel-quality' ||
      currentPath === 'channel-user-quality' ||
      currentPath === 'channel-issues' ||
      currentPath === 'channel-operations' ||
      currentPath === 'channel-management'
    ) {
      return 'channel';
    }
    if (
      currentPath === 'growth-overview' ||
      currentPath === 'growth-funnel' ||
      currentPath === 'growth-cohort' ||
      currentPath === 'growth-conversion-issues' ||
      currentPath === 'growth-strategy' ||
      currentPath === 'growth-operations' ||
      currentPath === 'campaign-promotion' ||
      currentPath === 'promotion-operations'
    ) {
      return 'growth';
    }
    if (
      currentPath === 'merchant-ops-overview' ||
      currentPath === 'merchant-tiering' ||
      currentPath === 'merchant-ops-issues' ||
      currentPath === 'merchant-ops'
    ) {
      return 'merchant';
    }
    if (
      currentPath === 'member-levels' ||
      currentPath === 'member-growth' ||
      currentPath === 'member-lifecycle' ||
      currentPath === 'member-operations'
    ) {
      return 'member';
    }
    if (
      currentPath === 'activity-management' ||
      currentPath === 'activity-config' ||
      currentPath === 'activity-performance' ||
      currentPath === 'activity-operations'
    ) {
      return 'activity';
    }
    if (
      currentPath === 'benefit-config' ||
      currentPath === 'benefit-distribution' ||
      currentPath === 'benefit-records' ||
      currentPath === 'benefit-management' ||
      currentPath === 'benefits-governance' ||
      currentPath === 'coupon-management' ||
      currentPath === 'marketing-assets'
    ) {
      return 'benefits';
    }
    return 'plans';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: OperationsModuleTab) => {
    const routeMap: Record<OperationsModuleTab, NavPath> = {
      channel: 'channel-overview',
      growth: 'growth-overview',
      merchant: 'merchant-ops-overview',
      member: 'member-levels',
      activity: 'activity-management',
      benefits: 'benefit-config',
      plans: 'plan-management'
    };
    onNavigate(routeMap[tab]);
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased text-xs">
      {/* 渲染对应的运营动作中心视图 (由左侧侧边栏或页面内路由统一驱动) */}
      {activeTab === 'channel' && (
        <ChannelOpsView
          currentPath={currentPath}
          onNavigate={onNavigate}
          showToast={showToast}
        />
      )}

      {activeTab === 'growth' && (
        <GrowthOpsView
          currentPath={currentPath}
          onNavigate={onNavigate}
          showToast={showToast}
        />
      )}

      {activeTab === 'merchant' && (
        <MerchantOpsView
          currentPath={currentPath}
          onNavigate={onNavigate}
          showToast={showToast}
        />
      )}

      {activeTab === 'member' && (
        <MemberOpsView
          currentPath={currentPath}
          onNavigate={onNavigate}
          showToast={showToast}
        />
      )}

      {activeTab === 'activity' && (
        <ActivityOpsView
          currentPath={currentPath}
          onNavigate={onNavigate}
          showToast={showToast}
        />
      )}

      {activeTab === 'benefits' && (
        <BenefitsOpsView
          currentPath={currentPath}
          onNavigate={onNavigate}
          showToast={showToast}
        />
      )}

      {activeTab === 'plans' && (
        <OperationPlansView
          currentPath={currentPath}
          onNavigate={onNavigate}
          showToast={showToast}
        />
      )}

      {/* 浮动 Toast 提示 */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-medium flex items-center gap-2 backdrop-blur-xs animate-in fade-in">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
