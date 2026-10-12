import React, { useState } from 'react';
import { NavPath } from '../../types';

interface BusinessReportsViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
}

export const BusinessReportsView: React.FC<BusinessReportsViewProps> = ({ currentPath, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'custom' | 'export'>(() => {
    if (currentPath === 'report-custom') return 'custom';
    if (currentPath === 'report-export') return 'export';
    return 'standard';
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const [dateRange, setDateRange] = useState('2026-10-01 至 2026-10-05');

  const standardReports = [
    { id: 'REP-01', name: '平台全网经营日报 (GMV与息差核算)', cycle: '每日生成', format: 'XLSX / CSV', updated: '2026-10-05 06:00', rows: '14,280' },
    { id: 'REP-02', name: '收卡商户质押与结算对账单', cycle: '每日对账', format: 'XLSX', updated: '2026-10-05 04:30', rows: '142' },
    { id: 'REP-03', name: '出卡用户交易流水与KYC分级报表', cycle: '实时/周报', format: 'CSV', updated: '2026-10-04 23:59', rows: '38,910' },
    { id: 'REP-04', name: '卡风控 Card Check 与异常拦截周报', cycle: '每周一', format: 'PDF / XLSX', updated: '2026-10-04 00:00', rows: '1,208' },
    { id: 'REP-05', name: '全渠道推广归因与佣金计提表', cycle: '每月/周结', format: 'XLSX', updated: '2026-10-03 18:00', rows: '5,620' },
  ];

  const exportTasks = [
    { id: 'EXP-901', name: '2026年9月_全量Apple卡核销明细.csv', size: '14.8 MB', creator: '财务-王琳', status: 'COMPLETED', time: '14:20:12' },
    { id: 'EXP-900', name: '10月第一周_商户SLA违规扣罚汇总.xlsx', size: '2.1 MB', creator: '运营-张主管', status: 'COMPLETED', time: '11:15:30' },
    { id: 'EXP-899', name: '高频异常用户UID特征分析包.zip', size: '48.2 MB', creator: '风控-李工', status: 'PROCESSING', time: '14:50:02' },
  ];

  return (
    <div className="flex flex-col w-full gap-4 text-slate-800 antialiased pb-12">
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">报表中心 · 数据分析与台账导出</h1>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              REPORTS-HUB
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            提供平台交易、商户结算、渠道佣金、风控拦截等多维标准报表与自定义数据透视导出。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('已创建新导出任务，正在排队异步生成...')}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>新建导出任务</span>
          </button>
        </div>
      </div>

      {/* 3 大标准 Tab 导航栏 (统一标准风格) */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          {
            id: 'standard',
            label: '标准报表',
            icon: 'table_chart',
            badge: `${standardReports.length} 份`,
            badgeClass: 'bg-blue-100 text-blue-800'
          },
          {
            id: 'custom',
            label: '自定义报表',
            icon: 'dashboard_customize'
          },
          {
            id: 'export',
            label: '报表导出任务',
            icon: 'download',
            badge: `${exportTasks.length} 个任务`,
            badgeClass: 'bg-purple-100 text-purple-800'
          }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3.5 font-bold rounded-t-lg transition-colors shrink-0 flex items-center gap-2 relative cursor-pointer text-xs ${
                isActive
                  ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-blue-100 text-blue-800' : tab.badgeClass
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col gap-4">

        {/* Tab 1: Standard Reports */}
        {activeTab === 'standard' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>已收录 5 种官方经分与财务审计标准数据模板</span>
              <span className="font-mono">时间跨度: {dateRange}</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">报表编码</th>
                    <th className="py-2.5 px-3">报表名称</th>
                    <th className="py-2.5 px-3">生成周期</th>
                    <th className="py-2.5 px-3">格式</th>
                    <th className="py-2.5 px-3">最新更新</th>
                    <th className="py-2.5 px-3">记录行数</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standardReports.map(rep => (
                    <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{rep.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{rep.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{rep.cycle}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-blue-600 font-medium">{rep.format}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{rep.updated}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{rep.rows}</td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        <button
                          onClick={() => showToast(`已下载报表【${rep.name}】`)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                        >
                          下载
                        </button>
                        <button
                          onClick={() => showToast(`已调阅在线明细视图`)}
                          className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          预览
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Reports */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-800">自定义报表生成器</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">分析业务域</label>
                  <select className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs">
                    <option>交易与订单明细</option>
                    <option>商户供给与履约时效</option>
                    <option>渠道推广与裂变收益</option>
                    <option>风控拦截与碰卡存证</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">聚合维度</label>
                  <select className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs">
                    <option>按天 / 按卡种面额</option>
                    <option>按商户承接能力</option>
                    <option>按用户KYC等级</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">指标项</label>
                  <select className="w-full bg-white p-2 rounded-lg border border-slate-200 text-xs">
                    <option>GMV + 核销耗时 + 拒单率 + 平台息差</option>
                    <option>仅核销成功金额与结算放款</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => showToast('已成功执行自定义透视查询，共匹配 3,820 条记录！')}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  生成透视报表
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Export Tasks */}
        {activeTab === 'export' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>导出队列任务列表 (保留 7 天)</span>
              <button
                onClick={() => showToast('已刷新导出队列')}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                刷新状态
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {exportTasks.map(task => (
                <div key={task.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">description</span>
                    <div>
                      <div className="font-semibold text-slate-800">{task.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        文件大小: {task.size} · 操作人: {task.creator} · 创建时间: {task.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                    }`}>
                      {task.status === 'COMPLETED' ? '已生成' : '打包中'}
                    </span>
                    {task.status === 'COMPLETED' && (
                      <button
                        onClick={() => showToast(`已触发下载: ${task.name}`)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium cursor-pointer"
                      >
                        下载
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
