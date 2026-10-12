import React, { useState } from 'react';
import { UserItem } from '../types';

interface UserDetailViewProps {
  user: UserItem;
  onBack: () => void;
  onUpdateUser: (updatedUser: UserItem) => void;
}

export const UserDetailView: React.FC<UserDetailViewProps> = ({
  user,
  onBack,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'trades' | 'persona' | 'referral' | 'benefits' | 'aftersales' | 'risk' | 'logs'
  >('profile');

  // Modals & States
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showAdjustRateModal, setShowAdjustRateModal] = useState(false);
  const [spreadDiscount, setSpreadDiscount] = useState('+0.0200 (上浮 200 BPS)');
  const [creditLimit, setCreditLimit] = useState(user.collateral.toString());

  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponType, setCouponType] = useState('大客户出卡专属 +1.5% 加价券');
  const [couponValidDays, setCouponValidDays] = useState('7天有效');

  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeReason, setFreezeReason] = useState('涉诉卡密核验排查');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`已复制 ${label}: ${text}`);
  };

  const handleSaveRateAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const collateralNum = parseFloat(creditLimit);
    onUpdateUser({
      ...user,
      collateral: isNaN(collateralNum) ? user.collateral : collateralNum
    });
    setShowAdjustRateModal(false);
    showToast(`已成功为用户 ${user.name} 调整专属结算折率及授信额度`);
  };

  const handleAddTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || newTagInput).trim();
    if (!tag) return;
    if (!user.tags.includes(tag)) {
      onUpdateUser({
        ...user,
        tags: [...user.tags, tag]
      });
      showToast(`已添加新标签: "${tag}"`);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateUser({
      ...user,
      tags: user.tags.filter(t => t !== tagToRemove)
    });
    showToast(`已移除标签: "${tagToRemove}"`);
  };

  const handleToggleFreeze = () => {
    const isCurrentlyFrozen = user.riskLabel === '限制交易' || user.accountState === '限制交易';
    const nextLabel = isCurrentlyFrozen ? '正常履约' : '限制交易';
    const nextAccount = isCurrentlyFrozen ? '正常' : '限制交易';
    const nextRiskTier = isCurrentlyFrozen ? 'Tier-A' : 'Tier-C';

    onUpdateUser({
      ...user,
      riskLabel: nextLabel,
      accountState: nextAccount,
      riskTier: nextRiskTier
    });
    setShowFreezeModal(false);
    showToast(isCurrentlyFrozen ? `已成功解除用户 ${user.name} 的交易限制` : `已对用户 ${user.name} 实施临时风控冻结并挂起交易`);
  };

  const isFrozen = user.riskLabel === '限制交易' || user.accountState === '限制交易';

  return (
    <div className="flex flex-col w-full space-y-4 text-slate-800 antialiased pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 backdrop-blur border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 顶部面包屑与快捷全局指令栏 (Action Toolbar) */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>返回用户列表</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>平台作业端</span>
            <span>/</span>
            <span>客户管理</span>
            <span>/</span>
            <span>用户管理</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">
              用户详情 360° 档案中枢 (UID: {user.uid})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setShowAdjustRateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">percent</span>
            <span>调整结算折率/授信</span>
          </button>
          <button
            onClick={() => setShowTagModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-600">label</span>
            <span>修改运营标签</span>
          </button>
          <button
            onClick={() => setShowCouponModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">confirmation_number</span>
            <span>补发加价券</span>
          </button>
          <button
            onClick={() => setShowFreezeModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
              isFrozen
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isFrozen ? 'lock_open' : 'gpp_bad'}
            </span>
            <span>{isFrozen ? '解除冻结放行' : '限制交易/冻结'}</span>
          </button>
          <button
            onClick={() => {
              showToast('已启动安全打印引擎，生成包含水印防伪的 360° 用户合规履约凭证');
              window.print?.();
            }}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
            title="打印档案凭证"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
          </button>
        </div>
      </header>

      {/* 固定全景摘要 Master Header 卡片 */}
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          {/* Left: User Core Profile & Badges */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <div className={`w-16 h-16 rounded-2xl ${user.avatarBg} text-white font-bold text-2xl flex items-center justify-center shadow-sm`}>
                {user.initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" title="当前实时在线">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                <div className="flex items-center gap-1 font-code-token text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  <span>{user.uid}</span>
                  <button
                    onClick={() => copyToClipboard(user.uid, 'UID')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="复制UID"
                  >
                    <span className="material-symbols-outlined text-[13px]">content_copy</span>
                  </button>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  isFrozen
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {isFrozen ? '限制交易挂起' : '正常在册'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold ${user.tierColor}`}>
                  <span className="material-symbols-outlined text-[15px]">
                    {user.tier.includes('LV5') ? 'diamond' : user.tier.includes('LV4') ? 'workspace_premium' : 'military_tech'}
                  </span>
                  <span>{user.tier}</span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-code-token flex-wrap">
                <span>手机: <strong className="text-slate-800">{user.phone}</strong> ({user.kycStatus === 'KYC高级' ? 'KYC-3 高级认证' : user.kycStatus})</span>
                <span>·</span>
                <span>区域: <strong className="text-slate-800">{user.location || '尼日利亚 (Lagos, Ikeja Hub)'}</strong></span>
                <span>·</span>
                <span>风控等级: <strong className="text-emerald-700 font-semibold">{user.riskTier || 'Tier-A'} {user.creditScore}分</strong> (极低风险)</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <span className="text-slate-400">渠道归因:</span>
                <span className="text-slate-800 font-medium">{user.channel}</span>
                <span className="text-slate-300">/</span>
                <span className="font-code-token text-slate-600">{user.employeeRef}</span>
              </div>
            </div>
          </div>

          {/* Right: Financial Stat Mosaic (3-column metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto shrink-0">
            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/70 flex flex-col justify-between min-w-[160px]">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">累计交易金额</span>
              <div className="my-1">
                <span className="text-lg font-bold text-slate-900 font-numeric-stat">
                  ¥{user.gmv.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-code-token">
                折合 ${(user.gmvUsd || Math.round(user.gmv / 6.9)).toLocaleString()} USD · 流水+24.8%
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/70 flex flex-col justify-between min-w-[160px]">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">累计卡单履约</span>
              <div className="my-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 font-numeric-stat">
                  {user.tradesCount}
                </span>
                <span className="text-xs text-slate-500">笔</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-code-token font-medium">
                成功率 99.4% · 争议单: 1笔 已完结
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/70 flex flex-col justify-between min-w-[160px]">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">最新作业时效</span>
              <div className="my-1">
                <span className="text-lg font-bold text-blue-700 font-numeric-stat">
                  14分钟前
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-code-token">
                2026-08-27 15:32:10 · 活跃在线
              </span>
            </div>
          </div>
        </div>

        {/* Growth Value Progress bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 w-full max-w-xl">
            <span className="text-slate-500 font-medium shrink-0">成长值段位:</span>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((user.growthPoints || 8650) / (user.maxGrowthPoints || 10000)) * 100)}%` }}
              />
            </div>
            <span className="font-code-token font-bold text-slate-800 shrink-0">
              {user.growthPoints || 8650} / {user.maxGrowthPoints || 10000} PTS
            </span>
          </div>
          <span className="text-slate-400 font-code-token shrink-0">
            距晋升 LV5 殿堂做市商 还需 1,350 PTS (预计本周达成)
          </span>
        </div>
      </section>

      {/* 8 大企业级功能 Tab 切换栏 */}
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 px-4 gap-2 overflow-x-auto text-xs font-semibold bg-slate-50/70 scrollbar-none">
          {[
            { key: 'profile', label: '01 用户概况 (360°)', icon: 'person' },
            { key: 'trades', label: `02 交易记录 (${user.tradesCount})`, icon: 'receipt_long' },
            { key: 'persona', label: '03 用户画像 (VIP)', icon: 'radar' },
            { key: 'referral', label: '04 推广关系 (2级/48人)', icon: 'hub' },
            { key: 'benefits', label: '05 营销权益 (3券有效)', icon: 'loyalty' },
            { key: 'aftersales', label: '06 服务/售后 (1完结)', icon: 'support_agent' },
            { key: 'risk', label: '07 风险记录 (绿点)', icon: 'security' },
            { key: 'logs', label: '08 操作日志 (SEC-LOG)', icon: 'history' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3.5 px-3 relative shrink-0 cursor-pointer flex items-center gap-1.5 transition-colors ${
                activeTab === tab.key
                  ? 'text-[#004ac6] font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#004ac6] rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: 01 用户概况 (360°) */}
        {activeTab === 'profile' && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Span 7 */}
              <div className="lg:col-span-7 space-y-5">
                {/* Module 1: 基础资料与身份鉴权 (Identity & KYC) */}
                <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">badge</span>
                      <h3 className="font-bold text-slate-900 text-xs">
                        基础资料与身份鉴权 (Identity & KYC)
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold">
                      全项核验通过
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">用户识别码 / 系统UID</span>
                      <div className="flex items-center gap-1.5 mt-0.5 font-code-token font-bold text-slate-800">
                        <span>{user.uid}</span>
                        <span className="text-slate-400 font-normal text-[11px]">/ USR-902104</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">客户姓名 (KYC全称 / 称谓)</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{user.name} (Ade-CardKing)</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">注册与业务绑定手机</span>
                      <span className="font-code-token text-slate-800 mt-0.5 block">{user.phone} · SMS OTP 强校验</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">安全凭据安全邮箱</span>
                      <span className="font-code-token text-slate-800 mt-0.5 block">{user.email || 'adebayo.trader@alhikma.ng'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">KYC 鉴权等级与证件形态</span>
                      <span className="font-medium text-slate-800 mt-0.5 block">
                        Tier-3 (国际护照 + 活体动态人脸, KYC-202511-99)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">注册时间与触达通道</span>
                      <span className="font-code-token text-slate-800 mt-0.5 block">
                        {user.registeredDate || '2025-11-04 09:18:22'} (拉各斯地推档口)
                      </span>
                    </div>
                  </div>

                  {/* Terminal & Security Baseline */}
                  <div className="pt-3 border-t border-slate-200/60 text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">devices</span>
                      <span>终端安全基线:</span>
                      <strong className="text-slate-700">{user.deviceModel || 'Apple iPhone 15 Pro Max (iOS 17.5.1 / App v3.4.1)'}</strong>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">lan</span>
                      <span>最后登录 IP:</span>
                      <strong className="text-slate-700 font-code-token">{user.lastIp || '102.89.44.112 (尼日利亚 拉各斯 莱基半岛 MTN固定商用专线)'}</strong>
                    </div>
                  </div>
                </div>

                {/* Module 3: 交易能力与数据摘要 (Trading Summary) */}
                <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-4.5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">query_stats</span>
                      <h3 className="font-bold text-slate-900 text-xs">
                        交易能力与数据摘要 (Trading Summary)
                      </h3>
                    </div>
                    <span className="text-slate-400 font-code-token text-[11px]">近30天滚动统计</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">近30日成交流水</span>
                      <span className="text-base font-bold text-slate-900 font-numeric-stat mt-0.5 block">
                        ¥8,450,000
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">成功出卡笔数</span>
                      <span className="text-base font-bold text-emerald-700 font-numeric-stat mt-0.5 block">
                        310 单 (99.36%)
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">平均单笔客单价</span>
                      <span className="text-base font-bold text-slate-900 font-numeric-stat mt-0.5 block">
                        ¥134,800
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">平均核销放款时效</span>
                      <span className="text-base font-bold text-blue-700 font-numeric-stat mt-0.5 block">
                        4分12秒
                      </span>
                    </div>
                  </div>

                  {/* 出卡偏好分布 */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">出卡偏好分布 (Top Gift Cards):</span>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Apple Store & iTunes 实体卡 (62%)</span>
                          <span className="font-code-token font-bold text-slate-800">¥25,916,000</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '62%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Steam Wallet 全球卡密 (28%)</span>
                          <span className="font-code-token font-bold text-slate-800">¥11,704,000</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '28%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Google Play / Razer Gold (10%)</span>
                          <span className="font-code-token font-bold text-slate-800">¥4,180,000</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '10%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 集中出卡活跃窗口 (WAT 拉各斯时间) */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">集中出卡活跃窗口 (WAT 拉各斯时间):</span>
                      <span className="font-code-token text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        主力窗口: 14:00 - 19:00 WAT (当地档口打烊盘点)
                      </span>
                    </div>
                    {/* 24-hour micro bar visualization */}
                    <div className="flex items-end gap-1 h-12 pt-2 px-2 bg-white rounded-lg border border-slate-200/80">
                      {[1, 0, 0, 0, 1, 2, 3, 5, 8, 12, 16, 22, 28, 35, 48, 52, 49, 44, 32, 20, 14, 8, 4, 2].map((val, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-slate-100 hover:bg-blue-600 rounded-xs transition-colors group relative cursor-pointer"
                          style={{ height: `${Math.max(10, (val / 52) * 100)}%` }}
                        >
                          <span className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap z-10 font-code-token">
                            {idx}:00 ({val}单)
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-code-token px-1">
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00 (高峰)</span>
                      <span>23:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Span 5 */}
              <div className="lg:col-span-5 space-y-5">
                {/* Module 2: 等级成长与演进流水 (VIP Tier Evolution) */}
                <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-[18px]">military_tech</span>
                      <h3 className="font-bold text-slate-900 text-xs">
                        等级成长与演进流水 (VIP Tier Evolution)
                      </h3>
                    </div>
                    <span className="text-amber-700 font-bold text-xs">LV3 黄金会员</span>
                  </div>

                  {/* 黄金会员专属运营特权 Banner */}
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200/80 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[15px] text-amber-600">stars</span>
                      黄金会员专属运营特权 (Tier-3 Perks):
                    </span>
                    <ul className="text-amber-800 text-[11px] space-y-0.5 list-disc list-inside">
                      <li>出卡上浮 <strong>+200 BPS</strong> 溢价 (+0.0200 专属折率)</li>
                      <li>通道专享 <strong>极速核销免排队</strong></li>
                      <li>客服通道 <strong>7x24h 专家直通</strong></li>
                    </ul>
                  </div>

                  {/* Stream of level changes */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">等级晋升与成长流水记录:</span>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-800">LV2 白银 → LV3 黄金</strong>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded font-code-token font-semibold">+1,200 PTS</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-code-token">2026-08-15 · 自动触发晋升规则 (SYS-AUTO)</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-800">LV1 普通 → LV2 白银</strong>
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 rounded font-code-token font-semibold">+850 PTS</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-code-token">2026-05-20 · 累计出卡破 ¥1,000,000 触发</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-800">初始注册 → LV1 普通</strong>
                            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 rounded font-code-token font-semibold">+100 PTS</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-code-token">2025-11-04 · 地推专员录入登记 (EMP-8802)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module 4: 关联快速穿透视图 (Recent Orders & Risk Guard) */}
                <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">receipt</span>
                      <h3 className="font-bold text-slate-900 text-xs">
                        最近卡单穿透与风控守护 (Recent Orders)
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('trades')}
                      className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold cursor-pointer"
                    >
                      查看全部单据 →
                    </button>
                  </div>

                  {/* 3 Recent orders */}
                  <div className="space-y-2">
                    {user.transactions.slice(0, 3).map(tx => (
                      <div
                        key={tx.id}
                        className="bg-white p-3 rounded-lg border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 truncate">{tx.card}</span>
                          <span className="text-[11px] text-slate-400 font-code-token">
                            {tx.id} · {tx.time} · 汇率 {tx.rate || '0.9200'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-bold text-slate-900 font-numeric-stat">
                            ¥{tx.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Risk & Service Highlights */}
                  <div className="pt-2 border-t border-slate-200/60 space-y-2 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block">风控合规与客诉画像:</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">历史争议率</span>
                        <span className="font-bold text-slate-800 text-xs font-code-token">0.32%</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">累计获赔金额</span>
                        <span className="font-bold text-emerald-700 text-xs font-code-token">¥0.00</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">黑产关联度</span>
                        <span className="font-bold text-slate-800 text-xs font-code-token">0.00% (纯净)</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-slate-700 text-[11px] leading-relaxed">
                      <strong>运营主管最新人工备注:</strong> 「尼日利亚 Ikeja 电脑城核心批发大户，日均出卡稳定在 50~100 张实体小票，核销配合度极高，建议维持 VIP 绿色直通通道放款。」
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Watermark */}
            <div className="text-center py-2 text-[10px] text-slate-300 font-code-token">
              敏感数据水印保护 SESSION: 8a91-fd23-0091 | NODE: LAGOS-GATE-01 | 当前操作人: OP-882 (Sarah)
            </div>
          </div>
        )}

        {/* Tab 2: 02 交易记录 */}
        {activeTab === 'trades' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs">出卡交易明细流水 ({user.tradesCount} 笔)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="搜索单号 / 卡种..."
                  className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs w-48"
                />
                <button
                  onClick={() => showToast('已导出当前用户全量卡单流水')}
                  className="h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-md text-xs font-medium cursor-pointer"
                >
                  导出流水
                </button>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="h-9 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="px-3">订单号</th>
                  <th className="px-3">礼品卡种类</th>
                  <th className="px-3">折算结算金额</th>
                  <th className="px-3">核销专属汇率</th>
                  <th className="px-3">成单时间</th>
                  <th className="px-3">履约状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {user.transactions.map(tx => (
                  <tr key={tx.id} className="h-11 hover:bg-slate-50/80">
                    <td className="px-3 font-code-token font-bold text-slate-800">{tx.id}</td>
                    <td className="px-3 font-medium text-slate-900">{tx.card}</td>
                    <td className="px-3 font-bold font-numeric-stat text-slate-900">¥{tx.amount.toLocaleString()}</td>
                    <td className="px-3 font-code-token text-slate-600">{tx.rate || '0.9200'}</td>
                    <td className="px-3 font-code-token text-slate-500">{tx.time}</td>
                    <td className="px-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: 03 用户画像 (VIP) */}
        {activeTab === 'persona' && (
          <div className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs">出卡用户 360° 全维特征画像</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">业务偏好特征</span>
                <p className="text-slate-600">主力经营 Apple 实体卡与 Steam 全球卡，习惯批量手持原始小票拍照上传，核销拒绝率低于 0.2%。</p>
                <div className="flex flex-wrap gap-1 pt-2">
                  {user.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px]">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">活跃时段与环境</span>
                <p className="text-slate-600">集中在西非时间 (WAT) 下午 14:00 至 19:00，通过固定的商用光纤专线上线，设备指纹长期稳定无漂移。</p>
                <span className="text-[11px] text-slate-500 font-code-token">峰值时段: {user.peakHours}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">资金结算习惯</span>
                <p className="text-slate-600">主要采用 OPay 银行账户或 TRC20 链上秒级清算，提现频率高，无沉淀资金滞留风险。</p>
                <span className="text-[11px] text-slate-500 font-code-token">链上地址: {user.usdtAddress}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 04 推广关系 */}
        {activeTab === 'referral' && (
          <div className="p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900">推广归属与裂变网络</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span>直属邀请专员: <strong className="text-slate-800">{user.employeeRef}</strong></span>
                <span>裂变返佣比例: <strong className="text-emerald-700 font-code-token">{user.referralShare}</strong></span>
              </div>
              <p className="text-slate-500 text-[11px]">
                该用户通过拉各斯电脑城地推档口签约入驻，名下已邀请 48 名次级出卡商户，近 30 天贡献间接出卡流水 ¥3,840,000。
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: 05 营销权益 */}
        {activeTab === 'benefits' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">已发放营销权益与加息补贴券 (3张有效)</h3>
              <button
                onClick={() => setShowCouponModal(true)}
                className="px-3 py-1.5 bg-[#004ac6] text-white rounded-lg font-semibold cursor-pointer"
              >
                + 补发加价券
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-900 block">大客户出卡专属 +1.5% 加价券</span>
                <span className="text-amber-700 font-code-token text-[11px] block">单笔上限 ¥500 · 有效期至今日 24:00</span>
                <span className="text-amber-600 text-[10px]">来源: 5月西非出卡季专属权益</span>
              </div>
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 block">Apple/Steam 实体卡专属 +2.0% 补贴</span>
                <span className="text-blue-700 font-code-token text-[11px] block">无门槛 · 剩余 3 天</span>
                <span className="text-blue-600 text-[10px]">来源: 钻石商户月度保级礼包</span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-900 block">极速放款 VIP 绿色通行证</span>
                <span className="text-emerald-700 font-code-token text-[11px] block">核销成功秒级打款无需人工二审</span>
                <span className="text-emerald-600 text-[10px]">永久有效</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: 06 服务/售后 */}
        {activeTab === 'aftersales' && (
          <div className="p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900">客服工单与争议售后记录</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">工单 #TK-20260819-01 (已完结)</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold">已核实放款</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                卡图边缘轻微模糊，客服 OP-882 (Sarah) 联系用户补传高清照片后，核销成功，历时 12 分钟闭环。
              </p>
            </div>
          </div>
        )}

        {/* Tab 7: 07 风险记录 */}
        {activeTab === 'risk' && (
          <div className="p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900">反洗钱与风控拦截审计记录</h3>
            {user.riskLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                该用户历史信誉评级极高，无任何高危碰撞、涉诉黑产违规记录。
              </div>
            ) : (
              user.riskLogs.map((log, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.title}</span>
                    <span className="text-slate-400 font-code-token text-[11px]">{log.time}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.desc}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 8: 08 操作日志 */}
        {activeTab === 'logs' && (
          <div className="p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900">安全合规审计与平台作业日志</h3>
            <div className="space-y-2 font-code-token text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <span>[2026-08-27 12:48:02] OP-882 查看用户 360° 全息档案 (SESSION-LAGOS)</span>
                <span className="text-slate-400">SUCCESS</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <span>[2026-08-15 14:20:11] 系统触发等级跃迁: LV2 白银 -&gt; LV3 黄金</span>
                <span className="text-emerald-700">AUTO-PASS</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <span>[2025-11-04 09:18:22] 档口地推专员 EMP-8802 录入直属邀请白名单</span>
                <span className="text-blue-700">CREATED</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modal: 调整结算折率/授信 */}
      {showAdjustRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">调整专属折率与履约授信</h3>
              <button
                onClick={() => setShowAdjustRateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveRateAdjust} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">专属出卡折率浮动点差 (BPS)</label>
                <input
                  type="text"
                  value={spreadDiscount}
                  onChange={e => setSpreadDiscount(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-code-token"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">免押授信/风险保证金 (¥ RMB)</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={e => setCreditLimit(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600 font-code-token font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustRateModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#004ac6] text-white rounded-lg font-semibold cursor-pointer"
                >
                  确认调整
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: 修改运营标签 */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">客群运营标签管理</h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-slate-500 block">当前已赋予标签 (点击可快速移除):</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.tags.map(tag => (
                    <span
                      key={tag}
                      onClick={() => handleRemoveTag(tag)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-rose-50 hover:text-rose-700 border border-blue-200 hover:border-rose-200 rounded-md cursor-pointer transition-colors flex items-center gap-1 group"
                    >
                      <span>{tag}</span>
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-slate-500 block">新增自定义标签:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入新标签..."
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    className="flex-1 h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                  />
                  <button
                    onClick={() => handleAddTag()}
                    className="px-4 h-9 bg-[#004ac6] text-white rounded-lg font-semibold cursor-pointer shrink-0"
                  >
                    添加
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: 补发加价券 */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">补发营销加价券</h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">选择权益券种</label>
                <select
                  value={couponType}
                  onChange={e => setCouponType(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option>大客户出卡专属 +1.5% 加价券</option>
                  <option>Apple/Steam 实体卡专属 +2.0% 补贴</option>
                  <option>首单保费 100% 豁免券</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">有效期设置</label>
                <select
                  value={couponValidDays}
                  onChange={e => setCouponValidDays(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option>7天有效</option>
                  <option>15天有效</option>
                  <option>30天有效</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowCouponModal(false);
                    showToast(`已向 ${user.name} 补发: ${couponType}`);
                  }}
                  className="px-4 py-1.5 bg-[#004ac6] text-white rounded-lg font-semibold cursor-pointer"
                >
                  确认补发
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: 限制交易/冻结 */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                {isFrozen ? '确认解除冻结放行？' : '确认限制该用户出卡交易？'}
              </h3>
              <button
                onClick={() => setShowFreezeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600">
                {isFrozen
                  ? `解除后，用户 ${user.name} (${user.uid}) 将恢复正常出卡核销与自动提现权限。`
                  : `限制交易后，用户 ${user.name} (${user.uid}) 提交的卡单将被系统阻断，资金提现将被强制挂起待审。`}
              </p>
              {!isFrozen && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">冻结限制原因</label>
                  <input
                    type="text"
                    value={freezeReason}
                    onChange={e => setFreezeReason(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-rose-600"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowFreezeModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleToggleFreeze}
                  className={`px-4 py-1.5 rounded-lg font-semibold text-white cursor-pointer ${
                    isFrozen ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isFrozen ? '确认解除限制' : '执行风控冻结'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
