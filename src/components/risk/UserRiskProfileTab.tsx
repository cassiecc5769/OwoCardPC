import React, { useState } from 'react';
import { UserRiskProfile, RelatedAccountInfo } from './riskTypes';

interface UserRiskProfileTabProps {
  showToast: (msg: string) => void;
}

const MOCK_USER_RISK_PROFILES: UserRiskProfile[] = [
  {
    userId: 'UID-88912',
    userName: 'Chinedu Obi',
    userPhone: '138****0912',
    userEmail: 'chinedu.obi@example.com',
    deviceFingerprint: 'DEV-FP-88912-AF92',
    currentRiskLevel: 'MEDIUM',
    currentTradeRestrictions: '单日交易最高限额 $200.00，大额单需二次验证',
    currentDispatchRestrictions: '优先路由至保函兜底商户池',
    historicalRiskOrdersCount: 3,
    historicalRiskOrdersAmount: 450,
    riskCardsCount: 2,
    afterSaleDisputesCount: 1,
    cardProbeSweepsCount: 4,
    chargebackFraudCount: 0,
    relatedAccounts: [
      {
        userId: 'UID-88913',
        userName: 'Adebayo Adeleke (同设备关企)',
        relationshipType: '同设备指纹',
        associationScore: 92,
        riskLevel: 'HIGH',
        tradeAllowed: false
      },
      {
        userId: 'UID-88920',
        userName: 'Kofi Mensah (下线裂变)',
        relationshipType: '推荐/邀请关系',
        associationScore: 78,
        riskLevel: 'LOW',
        tradeAllowed: true
      }
    ],
    actionMatrix: {
      allowTrade: true,
      requireManualReview: true,
      extendCollateralStakingHours: 72,
      restrictSkus: ['Apple US $500', 'Steam UK £100'],
      maxTradeAmountLimit: 200,
      routeToFallbackMerchantOnly: true,
      blockTrade: false
    }
  },
  {
    userId: 'UID-88934',
    userName: 'Kofi Mensah (黑灰产嫌疑)',
    userPhone: '139****8834',
    userEmail: 'kofi.m@example.com',
    deviceFingerprint: 'DEV-FP-99210-BLOCK',
    currentRiskLevel: 'BLOCK',
    currentTradeRestrictions: '全盘封锁出卡交易，禁止提交单据',
    currentDispatchRestrictions: '路由熔断，不参与任何公海派单',
    historicalRiskOrdersCount: 12,
    historicalRiskOrdersAmount: 3400,
    riskCardsCount: 9,
    afterSaleDisputesCount: 5,
    cardProbeSweepsCount: 28,
    chargebackFraudCount: 2,
    relatedAccounts: [
      {
        userId: 'UID-88912',
        userName: 'Chinedu Obi',
        relationshipType: '同设备指纹',
        associationScore: 92,
        riskLevel: 'MEDIUM',
        tradeAllowed: true
      },
      {
        userId: 'UID-88955',
        userName: 'Emmanuel Mensah',
        relationshipType: '相同提现地址',
        associationScore: 98,
        riskLevel: 'BLOCK',
        tradeAllowed: false
      }
    ],
    actionMatrix: {
      allowTrade: false,
      requireManualReview: true,
      extendCollateralStakingHours: 168,
      restrictSkus: ['全卡种封锁'],
      maxTradeAmountLimit: 0,
      routeToFallbackMerchantOnly: false,
      blockTrade: true
    }
  }
];

export const UserRiskProfileTab: React.FC<UserRiskProfileTabProps> = ({ showToast }) => {
  const [selectedUserIndex, setSelectedUserIndex] = useState<number>(0);
  const [searchKw, setSearchQuery] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [targetLevel, setTargetLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCK'>('LOW');

  const profile = MOCK_USER_RISK_PROFILES[selectedUserIndex];

  const handleApplyOverride = () => {
    if (!overrideReason.trim()) {
      showToast('⚠️ 修改风险等级必须填写调整原因与安全评估依据');
      return;
    }
    profile.currentRiskLevel = targetLevel;
    setShowOverrideModal(false);
    showToast(`🔒 已更新用户 ${profile.userId} 风险等级为【${targetLevel}】，调账与风控指令已生效！`);
  };

  return (
    <div className="space-y-4 text-xs antialiased text-slate-800">
      {/* 顶部定位说明 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
            <span className="material-symbols-outlined text-xl">account_tree</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">用户风险画像与关联图谱</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Card + Order + User + Related User + Device + Merchant
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              回答：这个用户及其关联关系是否存在持续风险。建立设备、邀请关系、提现地址与交易行为关联图谱。
              原则：<strong>关联 ≠ 自动定罪</strong>，输出规则判断与交易控制 Matrix。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSelectedUserIndex(selectedUserIndex === 0 ? 1 : 0)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
          >
            切换示范用户 ({selectedUserIndex === 0 ? '黑灰产账号' : '正常用户'})
          </button>
        </div>
      </div>

      {/* 核心用户风险看板与控制 Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧 1 栏: 4.3 用户风险画像基本档案 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">person_search</span>
              <span className="font-bold text-slate-900 text-sm">用户风险画像档案</span>
            </div>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              profile.currentRiskLevel === 'BLOCK' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
              profile.currentRiskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
              profile.currentRiskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              等级: {profile.currentRiskLevel}
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">用户姓名 / UID:</span>
                <span className="font-bold text-slate-900">{profile.userName} ({profile.userId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">电话 / 邮箱:</span>
                <span className="text-slate-700">{profile.userPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">设备指纹 (Device):</span>
                <span className="text-indigo-700 font-bold">{profile.deviceFingerprint}</span>
              </div>
            </div>

            {/* 6 大核心风险指标 (4.3) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block font-sans">历史风险订单</span>
                <span className="font-bold text-slate-900">{profile.historicalRiskOrdersCount} 单 (${profile.historicalRiskOrdersAmount})</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block font-sans">风险卡数</span>
                <span className="font-bold text-rose-700">{profile.riskCardsCount} 张</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block font-sans">售后争议件数</span>
                <span className="font-bold text-purple-700">{profile.afterSaleDisputesCount} 件</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-400 text-[10px] block font-sans">扫卡/撞库记录</span>
                <span className="font-bold text-amber-700">{profile.cardProbeSweepsCount} 次</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1 text-[11px] font-sans">
              <div className="text-slate-500 font-semibold">当前交易限制:</div>
              <div className="text-slate-800 font-mono font-medium">{profile.currentTradeRestrictions}</div>
              <div className="text-slate-500 font-semibold pt-1">当前派单限制:</div>
              <div className="text-slate-800 font-mono font-medium">{profile.currentDispatchRestrictions}</div>
            </div>

            <button
              onClick={() => {
                setTargetLevel(profile.currentRiskLevel);
                setShowOverrideModal(true);
              }}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs transition-colors cursor-pointer"
            >
              手动人工干预 / 调整风险等级
            </button>
          </div>
        </div>

        {/* 右侧 2 栏: 4.4 关联风险图谱 & 4.5 风险结果参与交易 Matrix */}
        <div className="lg:col-span-2 space-y-4">
          {/* 4.4 关联风险图谱卡片 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">hub</span>
                <span className="font-bold text-slate-900 text-sm">关联账户图谱与业务信号 (Related Users)</span>
              </div>
              <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                原则: 关联 ≠ 自动定罪 (生成信号分值交由规则引擎判定)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2 px-3">关联账户</th>
                    <th className="py-2 px-3">业务关联信号来源</th>
                    <th className="py-2 px-3">关联度置信分</th>
                    <th className="py-2 px-3">关联账户风险等级</th>
                    <th className="py-2 px-3">交易权限</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {profile.relatedAccounts.map((acc: RelatedAccountInfo, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{acc.userName} ({acc.userId})</td>
                      <td className="py-2.5 px-3 text-indigo-700">{acc.relationshipType}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{acc.associationScore}%</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          acc.riskLevel === 'BLOCK' ? 'bg-rose-100 text-rose-800' :
                          acc.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          acc.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {acc.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {acc.tradeAllowed ? (
                          <span className="text-emerald-700 font-bold">✅ 允许交易</span>
                        ) : (
                          <span className="text-rose-700 font-bold">❌ 拦截封锁</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4.5 风险结果参与交易 Action Matrix */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[18px]">tune</span>
                <span className="font-bold text-slate-900 text-sm">风险结果参与交易与派单控制 Matrix</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">输出控制指令供交易引擎与派单路由执行</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-sans block">是否允许交易</span>
                <span className={`font-bold text-sm ${profile.actionMatrix.allowTrade ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {profile.actionMatrix.allowTrade ? '✅ 允许交易' : '❌ 拦截阻断'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-sans block">人工复核触发</span>
                <span className="font-bold text-amber-700 text-sm">
                  {profile.actionMatrix.requireManualReview ? '⚠️ 需人工审核' : '免审直通'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-sans block">延长质押保证金</span>
                <span className="font-bold text-indigo-700 text-sm">
                  +{profile.actionMatrix.extendCollateralStakingHours} 小时
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200/80 space-y-1">
                <span className="text-slate-400 text-[10px] font-sans block">单笔最高面额限额</span>
                <span className="font-bold text-slate-900 text-sm">
                  ${profile.actionMatrix.maxTradeAmountLimit}.00
                </span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg text-indigo-900 text-xs flex justify-between items-center">
              <div>
                <strong>限制受控 SKU 范围:</strong> {profile.actionMatrix.restrictSkus.join(', ')}
              </div>
              <div>
                <strong>兜底派单限制:</strong> {profile.actionMatrix.routeToFallbackMerchantOnly ? '仅允许保函商户接单' : '公海正常竞价'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 修改风险等级 Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">调整用户风险等级 (Manual Risk Override)</span>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">选择目标风险等级</label>
                <select
                  value={targetLevel}
                  onChange={e => setTargetLevel(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium outline-none focus:border-blue-500"
                >
                  <option value="LOW">LOW (低风险放行)</option>
                  <option value="MEDIUM">MEDIUM (中风险关怀/限额)</option>
                  <option value="HIGH">HIGH (高风险/延长质押72h)</option>
                  <option value="BLOCK">BLOCK (高危完全封锁)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">调整原因与评估依据 (必填)</label>
                <textarea
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                  placeholder="例如：已人工抽查小票实物证明与手持证件，确认非盗刷账号"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowOverrideModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">
                取消
              </button>
              <button onClick={handleApplyOverride} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer">
                确认生效并记录日志
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
