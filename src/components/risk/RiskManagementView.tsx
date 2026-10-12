import React, { useState, useEffect } from 'react';
import { NavPath } from '../../types';
import { RiskOverviewTab } from './RiskOverviewTab';
import { PrecheckRunTab } from './PrecheckRunTab';
import { RiskTrendsTab } from './RiskTrendsTab';
import { UserRiskProfileTab } from './UserRiskProfileTab';

interface RiskManagementViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
}

export type RiskSubTab =
  | 'overview'     // 风险概览
  | 'precheck'     // 预检运行
  | 'user_profile' // 用户风险画像与关联图谱 (PRD 4.3 & 4.4)
  | 'trends';      // 风险趋势

export const RiskManagementView: React.FC<RiskManagementViewProps> = ({
  currentPath = 'risk-overview',
  onNavigate
}) => {
  const [subTab, setSubTab] = useState<RiskSubTab>('overview');
  const [precheckFilterDecision, setPrecheckFilterDecision] = useState<string>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // 路由双向同步
  useEffect(() => {
    if (currentPath === 'risk-precheck' || currentPath === 'risk-monitor' || currentPath === 'card-check-logs') {
      setSubTab('precheck');
    } else if (currentPath === 'risk-trends' || currentPath === 'risk-records' || currentPath === 'abnormal-cards') {
      setSubTab('trends');
    } else if (currentPath === 'risk-overview' || currentPath === 'risk-management') {
      setSubTab('overview');
    }
  }, [currentPath]);

  const handleTabChange = (next: RiskSubTab, filterDecision?: string) => {
    setSubTab(next);
    if (filterDecision !== undefined) {
      setPrecheckFilterDecision(filterDecision);
    }
    if (onNavigate) {
      const routeMap: Record<RiskSubTab, NavPath> = {
        overview: 'risk-overview',
        precheck: 'risk-precheck',
        user_profile: 'risk-overview',
        trends: 'risk-trends' as any
      };
      onNavigate(routeMap[next]);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased pb-12">
      {/* 全局反馈 Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 backdrop-blur border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 风控子模块导航 Tab 栏 */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: '风险概览', icon: 'shield' },
          { id: 'precheck', label: '预检运行与规则', icon: 'play_circle' },
          { id: 'user_profile', label: '用户风险画像与关联图谱', icon: 'account_tree' },
          { id: 'trends', label: '风险趋势与记录', icon: 'trending_up' }
        ].map(tab => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as RiskSubTab)}
              className={`px-4 py-3 font-semibold rounded-t-lg transition-colors shrink-0 flex items-center gap-1.5 relative cursor-pointer ${
                isActive
                  ? 'text-blue-700 bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </section>

      {/* 1. 风险概览 */}
      {subTab === 'overview' && (
        <RiskOverviewTab
          showToast={showToast}
          onNavigateToPrecheck={(decision) => handleTabChange('precheck', decision || 'ALL')}
          onNavigateToTrends={() => handleTabChange('trends')}
          onNavigateToAbnormal={() => onNavigate && onNavigate('risk-monitor')}
        />
      )}

      {/* 2. 预检运行 */}
      {subTab === 'precheck' && (
        <PrecheckRunTab
          showToast={showToast}
          onNavigateToTrends={() => handleTabChange('trends')}
          defaultFilterDecision={precheckFilterDecision}
        />
      )}

      {/* 3. 用户风险画像与关联图谱 */}
      {subTab === 'user_profile' && (
        <UserRiskProfileTab showToast={showToast} />
      )}

      {/* 4. 风险趋势 */}
      {subTab === 'trends' && (
        <RiskTrendsTab
          showToast={showToast}
          onNavigateToPrecheck={(decision) => handleTabChange('precheck', decision || 'ALL')}
        />
      )}
    </div>
  );
};
