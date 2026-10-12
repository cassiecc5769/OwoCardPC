import React, { useState } from 'react';
import { NavPath } from '../../types';

interface BenefitsOpsViewProps {
  currentPath?: NavPath;
  onNavigate?: (path: NavPath) => void;
  showToast: (msg: string) => void;
}

export interface BenefitConfigItem {
  id: string;
  name: string; // 权益名称
  type: '加价溢价券' | '现金抵扣红包' | '免提现手续费卡' | '撮合保价特权' | '积分加倍券'; // 类型
  targetCohort: string; // 适用人群
  scene: '新人出卡' | '大额撮合' | '流失召回' | '售后补偿' | '会员专享'; // 适用场景
  validPeriod: string; // 有效期 (例如 7天, 30天)
  costPerUnit: number; // 单张成本 ($)
  totalConfiguredCount: number; // 已发行总量
  usedCount: number; // 已核销使用量
}

export interface BenefitDistributionRecord {
  id: string; // 发放记录单号
  userUid: string; // 1. 用户
  userName: string;
  benefitName: string;
  sourceActivityOrStrategy: string; // 2. 来源活动/策略
  distributionType: '规则自动发放' | '授权人工发放';
  distributedAt: string; // 3. 发放时间
  usedAt: string; // 4. 使用时间
  associatedOrderId: string; // 5. 关联订单
  status: '已使用' | '已领取未使用' | '已过期';
  amountValue: string;
}

const MOCK_BENEFIT_CONFIGS: BenefitConfigItem[] = [
  {
    id: 'BEN-01',
    name: '新人出卡首单 +1.5% 溢价券',
    type: '加价溢价券',
    targetCohort: '注册 7 天未首单新人',
    scene: '新人出卡',
    validPeriod: '7 天',
    costPerUnit: 2.5,
    totalConfiguredCount: 10000,
    usedCount: 4280
  },
  {
    id: 'BEN-02',
    name: '$5.00 无门槛立减现金红包',
    type: '现金抵扣红包',
    targetCohort: '60 天完全无交互沉默出卡人',
    scene: '流失召回',
    validPeriod: '15 天',
    costPerUnit: 5.0,
    totalConfiguredCount: 5000,
    usedCount: 1850
  },
  {
    id: 'BEN-03',
    name: '大客 Apple US 93.5% 保价锁定特权',
    type: '撮合保价特权',
    targetCohort: '高价值出卡人 (VIP4/VIP5)',
    scene: '大额撮合',
    validPeriod: '30 天',
    costPerUnit: 8.0,
    totalConfiguredCount: 1000,
    usedCount: 420
  },
  {
    id: 'BEN-04',
    name: '客诉争议 $10 平台先行关怀金',
    type: '现金抵扣红包',
    targetCohort: '售后争议已结案用户',
    scene: '售后补偿',
    validPeriod: '30 天',
    costPerUnit: 10.0,
    totalConfiguredCount: 500,
    usedCount: 180
  }
];

const MOCK_DISTRIBUTION_RECORDS: BenefitDistributionRecord[] = [
  {
    id: 'REC-DIST-8801',
    userUid: 'U776102',
    userName: 'Mateo Rossi',
    benefitName: '新人出卡首单 +1.5% 溢价券',
    sourceActivityOrStrategy: 'STRAT-01 (新人 7 天转化策略)',
    distributionType: '规则自动发放',
    distributedAt: '2026-10-05 10:15',
    usedAt: '2026-10-05 14:31',
    associatedOrderId: 'ORD-20261005-88392',
    status: '已使用',
    amountValue: '+$1.50'
  },
  {
    id: 'REC-DIST-8802',
    userUid: 'U776105',
    userName: 'Alex_VipTrader',
    benefitName: '大客 Apple US 93.5% 保价锁定特权',
    sourceActivityOrStrategy: 'ACT-202610-002 (大额实体卡专场)',
    distributionType: '授权人工发放',
    distributedAt: '2026-10-04 18:00',
    usedAt: '2026-10-05 11:20',
    associatedOrderId: 'ORD-20261005-88380',
    status: '已使用',
    amountValue: '锁定 93.5%'
  },
  {
    id: 'REC-DIST-8803',
    userUid: 'U776109',
    userName: 'David_NY',
    benefitName: '$5.00 无门槛立减现金红包',
    sourceActivityOrStrategy: 'ACT-202609-009 (老友召回活动)',
    distributionType: '规则自动发放',
    distributedAt: '2026-09-28 09:00',
    usedAt: '-',
    associatedOrderId: '-',
    status: '已过期',
    amountValue: '$5.00'
  }
];

export const BenefitsOpsView: React.FC<BenefitsOpsViewProps> = ({ currentPath, onNavigate, showToast }) => {
  // 3 大子 Tab: 'config' (权益配置) | 'distribution' (权益发放) | 'records' (权益记录可追溯)
  const [subTab, setSubTab] = useState<'config' | 'distribution' | 'records'>('config');

  // 路由同步
  React.useEffect(() => {
    if (currentPath === 'benefit-distribution') setSubTab('distribution');
    else if (currentPath === 'benefit-records') setSubTab('records');
    else if (currentPath === 'benefit-config' || currentPath === 'benefit-management' || currentPath === 'benefits-governance') setSubTab('config');
  }, [currentPath]);

  const [configs] = useState<BenefitConfigItem[]>(MOCK_BENEFIT_CONFIGS);
  const [records, setRecords] = useState<BenefitDistributionRecord[]>(MOCK_DISTRIBUTION_RECORDS);

  // 手动人工发放表单状态
  const [manualUid, setManualUid] = useState('');
  const [manualBenefitId, setManualBenefitId] = useState(MOCK_BENEFIT_CONFIGS[0].id);
  const [manualReason, setManualReason] = useState('大客户出卡关怀补贴');

  const handleManualDistribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUid.trim()) {
      showToast('请输入目标用户 UID 或手机号！');
      return;
    }
    const chosen = configs.find(c => c.id === manualBenefitId) || configs[0];
    const newRecord: BenefitDistributionRecord = {
      id: `REC-DIST-${Date.now().toString().slice(-4)}`,
      userUid: manualUid.trim(),
      userName: `User_${manualUid.slice(-4)}`,
      benefitName: chosen.name,
      sourceActivityOrStrategy: `人工授权发放 (${manualReason})`,
      distributionType: '授权人工发放',
      distributedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      usedAt: '-',
      associatedOrderId: '-',
      status: '已领取未使用',
      amountValue: chosen.type === '现金抵扣红包' ? `$${chosen.costPerUnit}` : '+1.5%'
    };
    setRecords([newRecord, ...records]);
    setManualUid('');
    setSubTab('records');
    showToast(`✅ 权益【${chosen.name}】已成功授权人工发放至用户 ${manualUid}！记录已自动归档入可追溯流水库。`);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 顶部标准子模块导航 Tab 栏 */}
      <section className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
        {[
          { id: 'config', label: `权益配置 (${configs.length})`, icon: 'settings' },
          { id: 'distribution', label: '权益发放', icon: 'card_giftcard' },
          { id: 'records', label: `权益可追溯流水 (${records.length})`, icon: 'receipt_long' }
        ].map(tab => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                const next = tab.id as 'config' | 'distribution' | 'records';
                setSubTab(next);
                if (onNavigate) {
                  const pathMap = {
                    config: 'benefit-config',
                    distribution: 'benefit-distribution',
                    records: 'benefit-records'
                  };
                  onNavigate(pathMap[next] as NavPath);
                }
              }}
              className={`px-4 py-3 font-semibold rounded-t-lg transition-colors shrink-0 flex items-center gap-1.5 relative cursor-pointer ${
                isActive
                  ? 'text-[#004ac6] bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#004ac6]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </section>

      {/* 职责说明 Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-200 shrink-0">
          <span className="material-symbols-outlined text-[22px]">loyalty</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-slate-900 text-sm">权益管理（权益生命周期：配置 ➔ 发放 ➔ 领取 ➔ 使用 ➔ 过期）</h2>
            <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-mono text-[10px] font-bold">
              全流程留痕追溯
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            支持规则自动发放与授权人工发放，权益记录必须全量追溯到：<strong className="text-slate-700">用户 ｜ 来源活动/策略 ｜ 发放时间 ｜ 使用时间 ｜ 关联订单</strong>。
          </p>
        </div>
      </div>

      {/* 视图 1: 权益配置 (名称｜类型｜适用人群｜场景｜有效期｜成本) */}
      {subTab === 'config' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-pink-600">settings</span>
              <span>权益资产库配置（名称 ｜ 类型 ｜ 适用人群 ｜ 场景 ｜ 有效期 ｜ 成本）</span>
            </h3>
            <span className="text-slate-400 text-xs">规范权益资产全生命周期定义</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50/90 font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 h-9">
                  <th className="py-2.5 px-3">1. 权益名称</th>
                  <th className="py-2.5 px-2">2. 类型</th>
                  <th className="py-2.5 px-3">3. 适用人群</th>
                  <th className="py-2.5 px-2">4. 适用场景</th>
                  <th className="py-2.5 px-2 font-mono">5. 有效期</th>
                  <th className="py-2.5 px-2 font-mono text-right">6. 单张成本</th>
                  <th className="py-2.5 px-3 font-mono text-right">核销进度 (已用/总发)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {configs.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200 font-semibold text-[10px]">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{item.targetCohort}</td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                        {item.scene}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-slate-600">{item.validPeriod}</td>
                    <td className="py-2.5 px-2 font-mono font-bold text-rose-600 text-right">${item.costPerUnit.toFixed(1)}</td>
                    <td className="py-2.5 px-3 font-mono text-right text-slate-700">
                      <strong>{item.usedCount.toLocaleString()}</strong> / {item.totalConfiguredCount.toLocaleString()} (
                      {((item.usedCount / item.totalConfiguredCount) * 100).toFixed(0)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 视图 2: 权益发放 (支持：规则自动发放 + 授权人工发放) */}
      {subTab === 'distribution' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[18px] text-blue-600">auto_mode</span>
              <span>1. 规则自动触发发放策略（在运行）</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 block">新人首单阶梯加息自动触发</strong>
                <p className="text-slate-500 text-[11px]">触发条件：注册成功且首单在 24 小时内提交，系统自动发放 +1.5% 溢价券并直接抵扣放款。</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 block">沉默用户 60 天召回自动红包</strong>
                <p className="text-slate-500 text-[11px]">触发条件：用户无交互达 60 天，自动注入 $5.00 现金券并下发 APP Push 提醒。</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-[18px] text-pink-600">person_add</span>
              <span>2. 授权人工特权发放 (客服/运营专享)</span>
            </h3>

            <form onSubmit={handleManualDistribute} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">目标用户 UID / 手机号:</label>
                <input
                  type="text"
                  placeholder="例如 U778901 或 +86 13800000000"
                  value={manualUid}
                  onChange={e => setManualUid(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">选择权益类型:</label>
                <select
                  value={manualBenefitId}
                  onChange={e => setManualBenefitId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                >
                  {configs.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (成本 ${c.costPerUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">人工发放原因及凭据:</label>
                <input
                  type="text"
                  value={manualReason}
                  onChange={e => setManualReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
              >
                确认授权人工发放并记录审计日志
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 视图 3: 权益记录 (必须可追溯到：用户｜来源活动/策略｜发放时间｜使用时间｜关联订单) */}
      {subTab === 'records' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-pink-600">receipt_long</span>
              <span>权益全生命周期可追溯留痕账本（用户 ｜ 来源活动/策略 ｜ 发放时间 ｜ 使用时间 ｜ 关联订单）</span>
            </h3>
            <span className="text-slate-500 font-mono text-xs">满足财务与运营审计合规</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50/90 font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 h-9">
                  <th className="py-2.5 px-3">流水号</th>
                  <th className="py-2.5 px-3">1. 归属用户</th>
                  <th className="py-2.5 px-3">权益标的</th>
                  <th className="py-2.5 px-3">2. 来源活动 / 增长策略</th>
                  <th className="py-2.5 px-2 text-center">发放类型</th>
                  <th className="py-2.5 px-2 font-mono">3. 发放时间</th>
                  <th className="py-2.5 px-2 font-mono">4. 使用时间</th>
                  <th className="py-2.5 px-3 font-mono">5. 关联交易卡单号</th>
                  <th className="py-2.5 px-2 text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {records.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{rec.id}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <strong className="text-slate-800">{rec.userName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono ml-1">({rec.userUid})</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-pink-700">{rec.benefitName}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{rec.sourceActivityOrStrategy}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                        {rec.distributionType}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-slate-500">{rec.distributedAt}</td>
                    <td className="py-2.5 px-2 font-mono text-slate-800 font-semibold">{rec.usedAt}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {rec.associatedOrderId !== '-' ? (
                        <span className="text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                          {rec.associatedOrderId}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.status === '已使用'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : rec.status === '已领取未使用'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
