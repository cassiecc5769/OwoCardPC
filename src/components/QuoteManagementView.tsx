import React, { useState, useEffect } from 'react';
import { NavPath } from '../types';
import { QuoteManagementTab } from './quote/QuoteManagementTab';
import { QuoteMonitorTab } from './quote/QuoteMonitorTab';
import { MarketTrendsTab } from './quote/MarketTrendsTab';

interface QuoteManagementViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
}

export type QuoteSecondaryTab = 'quote-management' | 'quote-monitor' | 'market-trends';

export const QuoteManagementView: React.FC<QuoteManagementViewProps> = ({ currentPath, onNavigate }) => {
  // 3 大标准二级菜单 Tab：报价管理 ｜ 报价监控 ｜ 市场行情
  const [activeTab, setActiveTab] = useState<QuoteSecondaryTab>('quote-management');

  // 子级状态定位记忆
  const [managementSubTab, setManagementSubTab] = useState<'platform' | 'merchant' | 'history'>('platform');
  const [monitorSubTab, setMonitorSubTab] = useState<'competitiveness' | 'anomalies' | 'treatment_logs'>('competitiveness');
  const [trendsSubTab, setTrendsSubTab] = useState<'latest' | 'history'>('latest');

  // 动态时钟与全局 Toast 提示
  const [clockStr, setClockStr] = useState<string>('14:38:22');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setClockStr(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 路由与 3 个二级 Tab 双向联动
  useEffect(() => {
    if (!currentPath) return;
    if (currentPath === 'quote-monitor') {
      setActiveTab('quote-monitor');
      setMonitorSubTab('competitiveness');
    } else if (currentPath === 'quote-anomalies') {
      setActiveTab('quote-monitor');
      setMonitorSubTab('anomalies');
    } else if (currentPath === 'market-trends') {
      setActiveTab('market-trends');
      setTrendsSubTab('latest');
    } else if (currentPath === 'price-adjust-logs') {
      setActiveTab('quote-management');
      setManagementSubTab('history');
    } else if (currentPath === 'quote-management' || currentPath === 'quote-realtime' || currentPath === 'quote-operations') {
      setActiveTab('quote-management');
    }
  }, [currentPath]);

  const handleTabChange = (tab: QuoteSecondaryTab, subTabOption?: string) => {
    setActiveTab(tab);
    if (tab === 'quote-management') {
      if (subTabOption === 'history') setManagementSubTab('history');
      else if (subTabOption === 'merchant') setManagementSubTab('merchant');
      else if (subTabOption === 'platform') setManagementSubTab('platform');
    } else if (tab === 'quote-monitor') {
      if (subTabOption === 'anomalies') setMonitorSubTab('anomalies');
      else if (subTabOption === 'treatment_logs') setMonitorSubTab('treatment_logs');
      else if (subTabOption === 'competitiveness') setMonitorSubTab('competitiveness');
    }
    if (onNavigate) {
      if (tab === 'quote-management' && subTabOption === 'history') {
        onNavigate('price-adjust-logs');
      } else if (tab === 'quote-monitor' && subTabOption === 'anomalies') {
        onNavigate('quote-anomalies');
      } else {
        onNavigate(tab as NavPath);
      }
    }
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased text-xs space-y-4">
      {/* 渲染对应的二级模块视图 */}
      {/* 1. 报价管理 (管现在的报价：平台报价 ｜ 商户报价 ｜ 调价记录) */}
      {activeTab === 'quote-management' && (
        <QuoteManagementTab
          key={managementSubTab}
          initialSubTab={managementSubTab}
          showToast={showToast}
          onNavigateToAnomalies={() => handleTabChange('quote-monitor', 'anomalies')}
        />
      )}

      {/* 2. 报价监控 (找哪些报价有问题并推动解决：报价竞争力 ｜ 报价异常 ｜ 处理记录) */}
      {activeTab === 'quote-monitor' && (
        <QuoteMonitorTab
          key={monitorSubTab}
          initialSubTab={monitorSubTab}
          showToast={showToast}
          onNavigateToQuotes={() => handleTabChange('quote-management', 'platform')}
        />
      )}

      {/* 3. 市场行情 (看外部市场现在多少钱：最新行情 ｜ 历史行情) */}
      {activeTab === 'market-trends' && (
        <MarketTrendsTab
          key={trendsSubTab}
          initialSubTab={trendsSubTab}
          showToast={showToast}
          onNavigateToQuotes={() => handleTabChange('quote-management', 'platform')}
        />
      )}

      {/* 全局悬浮 Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-medium flex items-center gap-2 backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
