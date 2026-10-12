import React, { useState } from 'react';
import { MerchantItem, MerchantCapabilityRule } from '../types';
import { SAMPLE_CAPABILITY_RULES } from '../data/mockMerchants';

interface MerchantDetailViewProps {
  merchant: MerchantItem;
  initialTab?: number;
  onBack: () => void;
  onUpdateMerchant: (updated: MerchantItem) => void;
}

export const MerchantDetailView: React.FC<MerchantDetailViewProps> = ({
  merchant,
  initialTab = 1,
  onBack,
  onUpdateMerchant
}) => {
  const [activeTab, setActiveTab] = useState<number>(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Capability Rules State (基础承接能力)
  const [rules, setRules] = useState<MerchantCapabilityRule[]>(
    merchant.capabilityRules && merchant.capabilityRules.length > 0
      ? merchant.capabilityRules
      : SAMPLE_CAPABILITY_RULES
  );

  // Capability Rules Filter
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleCountry, setRuleCountry] = useState('全部');
  const [ruleMedia, setRuleMedia] = useState('全部');
  const [ruleStatus, setRuleStatus] = useState('全部');

  // Modals
  const [showAdjustRateModal, setShowAdjustRateModal] = useState(false);
  const [selectedRuleForAdjust, setSelectedRuleForAdjust] = useState<MerchantCapabilityRule | null>(null);
  const [tempAdjustRate, setTempAdjustRate] = useState('');

  const [showMarginModal, setShowMarginModal] = useState(false);
  const [showFuseModal, setShowFuseModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // 动态承接能力 & 承接状态控制 (2.2.2 & 2.2.3)
  const [acceptToggle, setAcceptToggle] = useState<boolean>(merchant.status !== '打烊暂停中' && merchant.status !== '暂停接单');
  const [skuMaintenance, setSkuMaintenance] = useState<boolean>(false);
  const [inFlightOrders, setInFlightOrders] = useState<number>(12);
  const [maxConcurrency, setMaxConcurrency] = useState<number>(20);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // 统一承接状态计算 (2.2.3)
  const computeUnifiedStatus = () => {
    if (merchant.status === '熔断管制中' || merchant.status === '风控冻结') return '风险暂停';
    if (!acceptToggle) return '暂停';
    if (merchant.points < 1000) return '积点不足';
    if (skuMaintenance) return 'SKU维护';
    if (inFlightOrders >= maxConcurrency) return '满载';
    if (inFlightOrders >= maxConcurrency * 0.8) return '接近上限';
    return '正常';
  };

  const currentCapacityStatus = computeUnifiedStatus();

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        const next = !r.isActive;
        showToast(`承接能力通道 [${r.ruleCode}] ${next ? '已开启接单' : '已关闭暂停'}`);
        return { ...r, isActive: next };
      }
      return r;
    });
    setRules(updated);
    onUpdateMerchant({
      ...merchant,
      capabilityRules: updated
    });
  };

  const handleSaveRateAdjust = () => {
    if (!selectedRuleForAdjust || !tempAdjustRate) return;
    const rateVal = parseFloat(tempAdjustRate);
    if (isNaN(rateVal)) return;

    const nextRules = rules.map(r => {
      if (r.id === selectedRuleForAdjust.id) {
        return {
          ...r,
          rate: rateVal,
          rateNote: `手动调价 (${rateVal.toFixed(4)})`
        };
      }
      return r;
    });
    setRules(nextRules);
    onUpdateMerchant({
      ...merchant,
      capabilityRules: nextRules
    });
    setShowAdjustRateModal(false);
    showToast(`通道 [${selectedRuleForAdjust.ruleCode}] 承揽折率已更新为 ${rateVal.toFixed(4)}`);
  };

  const handleToggleEmergencyFuse = () => {
    const isCircuit = merchant.status === '熔断管制中';
    const nextStatus = isCircuit ? '在线接单中' : '熔断管制中';
    onUpdateMerchant({
      ...merchant,
      status: nextStatus
    });
    setShowFuseModal(false);
    showToast(isCircuit ? '已解冻恢复商户接单派单权限' : '已对商户执行紧急熔断暂停派单');
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !merchant.tags.includes(newTagInput.trim())) {
      const updatedTags = [...merchant.tags, newTagInput.trim()];
      onUpdateMerchant({
        ...merchant,
        tags: updatedTags
      });
      setNewTagInput('');
      setShowTagModal(false);
      showToast(`已成功添加商户画像标签: ${newTagInput.trim()}`);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updatedTags = merchant.tags.filter(t => t !== tag);
    onUpdateMerchant({
      ...merchant,
      tags: updatedTags
    });
    showToast(`已移除标签: ${tag}`);
  };

  const filteredRules = rules.filter(r => {
    if (ruleSearch.trim()) {
      const q = ruleSearch.toLowerCase();
      if (!r.cardName.toLowerCase().includes(q) && !r.ruleCode.toLowerCase().includes(q) && !r.currency.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (ruleCountry !== '全部') {
      if (!r.country.includes(ruleCountry) && !r.countryCode.includes(ruleCountry)) {
        return false;
      }
    }
    if (ruleMedia !== '全部') {
      if (!r.mediaType.includes(ruleMedia)) return false;
    }
    if (ruleStatus !== '全部') {
      if (ruleStatus === '启用中' && !r.isActive) return false;
      if (ruleStatus === '已暂停' && r.isActive) return false;
    }
    return true;
  });

  const activeRulesCount = rules.filter(r => r.isActive).length;
  const pausedRulesCount = rules.filter(r => !r.isActive).length;

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased space-y-4 pb-16 text-xs">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 backdrop-blur border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 面包屑与顶部核心动作条 */}
      <section className="w-full px-5 py-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors shrink-0 cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>返回商户列表</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 shrink-0">商户档案与承接工作台</span>
          <span className="text-slate-300">/</span>
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-slate-900 truncate">{merchant.fullName}</span>
            <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold font-mono">
              {merchant.mid}
            </span>
          </div>
        </div>

        {/* 动作按钮簇 */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 text-xs">
          <button
            onClick={() => {
              setSelectedRuleForAdjust(rules[0]);
              setTempAdjustRate(rules[0]?.rate.toString() || '6.8450');
              setShowAdjustRateModal(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">price_change</span>
            <span>调整报价折率</span>
          </button>
          <button
            onClick={() => setShowMarginModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">assured_workload</span>
            <span>催补质押保证金</span>
          </button>
          <button
            onClick={() => setShowFuseModal(true)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer shadow-2xs ${
              merchant.status === '熔断管制中'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {merchant.status === '熔断管制中' ? 'lock_open' : 'gavel'}
            </span>
            <span>{merchant.status === '熔断管制中' ? '解除熔断管制' : '紧急暂停派单 (熔断)'}</span>
          </button>
        </div>
      </section>

      {/* 顶部商户全景与承接状态核心 Summary 卡片 */}
      <section className="w-full">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 gap-4 border-b border-slate-100">
            <div className="flex items-start md:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[28px]">apartment</span>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold text-slate-900">{merchant.fullName}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[13px]">military_tech</span>
                    {merchant.vipTag || '核心商户 (Tier-1)'}
                  </span>

                  {/* 2.2.3 统一承接状态勋章 */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    currentCapacityStatus === '正常' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    currentCapacityStatus === '接近上限' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    currentCapacityStatus === '满载' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    currentCapacityStatus === '积点不足' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                    'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                    <span>承接状态: {currentCapacityStatus}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs">
                  <span>商户编号: <strong className="text-slate-900 font-mono">{merchant.mid}</strong></span>
                  <span>•</span>
                  <span>机构代码: <strong className="text-slate-700 font-mono">{merchant.orgCode || '91310115MA1K4R88X'}</strong></span>
                  <span>•</span>
                  <span>清算席位: <strong className="text-blue-700 font-mono">{merchant.directSeatNode || 'NODE-CN-SH-DIRECT-09'}</strong></span>
                </div>
              </div>
            </div>

            {/* 当前能不能接卡遥测卡片 */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 shrink-0">
              <span className="text-slate-500 font-semibold block text-[11px]">此刻能否接卡判定 (Dispatch Eligibility)</span>
              <div className="flex items-center gap-2 font-bold text-xs">
                {currentCapacityStatus === '正常' || currentCapacityStatus === '接近上限' ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    可纳入派单池 (Eligible)
                  </span>
                ) : (
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                    不可派单 (Ineligible: {currentCapacityStatus})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.2.4 标准 8 大 Tab 结构 */}
      <section className="w-full">
        <div className="bg-white rounded-xl border border-slate-200/80 px-4 pt-1 shadow-xs flex items-center gap-1 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 1, label: '基础信息', icon: 'info' },
            { id: 2, label: '承接能力', icon: 'layers', badge: rules.length },
            { id: 3, label: '当前状态', icon: 'speed', badge: currentCapacityStatus, badgeClass: currentCapacityStatus === '正常' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800' },
            { id: 4, label: '报价', icon: 'request_quote' },
            { id: 5, label: '履约', icon: 'query_stats' },
            { id: 6, label: '资金账户', icon: 'account_balance' },
            { id: 7, label: '异常', icon: 'warning', badge: merchant.disputeCount || 0 },
            { id: 8, label: '工具权限', icon: 'build' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold rounded-t-lg transition-colors shrink-0 flex items-center gap-1.5 relative cursor-pointer ${
                  isActive
                    ? 'text-blue-700 bg-blue-50/70 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    tab.badgeClass || (isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700')
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab 1: 基础信息 */}
      {activeTab === 1 && (
        <section className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
                <h3 className="font-bold text-slate-900 text-sm">主体资质与法定登记档案</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div><span className="text-slate-400 block mb-0.5">企业全称:</span><span className="font-semibold text-slate-800">{merchant.fullName}</span></div>
                <div><span className="text-slate-400 block mb-0.5">法定代表人:</span><span className="font-semibold text-slate-800">{merchant.legalPerson}</span></div>
                <div><span className="text-slate-400 block mb-0.5">机构代码:</span><span className="font-bold text-slate-800 font-mono">{merchant.orgCode || '91310115MA1K4R88X'}</span></div>
                <div><span className="text-slate-400 block mb-0.5">合作在网:</span><span className="font-semibold text-blue-700 font-mono">{merchant.daysActive} 天</span></div>
                <div><span className="text-slate-400 block mb-0.5">联系电话:</span><span className="font-mono text-slate-700">{merchant.phone}</span></div>
                <div><span className="text-slate-400 block mb-0.5">对公邮箱:</span><span className="font-mono text-slate-700">{merchant.email}</span></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">hub</span>
                <h3 className="font-bold text-slate-900 text-sm">直连网络与技术接口</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-600">
                <div><span className="text-slate-400 block mb-0.5">直连席位:</span><span className="text-blue-700 font-bold font-mono">{merchant.directSeatNode || 'NODE-CN-SH-DIRECT-09'}</span></div>
                <div><span className="text-slate-400 block mb-0.5">接口延迟:</span><span className="font-bold text-emerald-700 font-mono">{merchant.apiLatency}</span></div>
                <div><span className="text-slate-400 block mb-0.5">AppID:</span><span className="font-mono text-slate-800">{merchant.appId}</span></div>
                <div><span className="text-slate-400 block mb-0.5">清算周期:</span><span className="font-semibold text-emerald-700">{merchant.settlementCycle}</span></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: 承接能力 (2.2.1 基础承接能力标准模型) */}
      {activeTab === 2 && (
        <section className="w-full space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">view_module</span>
                <span className="font-bold text-slate-900 text-sm">基础承接能力规则矩阵 (Theoretical Capacity)</span>
              </div>
              <span className="text-slate-500 font-mono">
                标准模型: Merchant × Brand × Country × Card Form × Speed × Denomination
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              定义本商户理论上能够接哪些卡。最终派单将结合【当前状态】下的动态负载与积点综合判断。
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Merchant ID</th>
                    <th className="py-2.5 px-3">Brand (卡种)</th>
                    <th className="py-2.5 px-3">Country / Currency</th>
                    <th className="py-2.5 px-3">Card Form (卡介质)</th>
                    <th className="py-2.5 px-3">Speed (交易速度)</th>
                    <th className="py-2.5 px-3">Min Value (下限)</th>
                    <th className="py-2.5 px-3">Max Value (上限)</th>
                    <th className="py-2.5 px-3">Multiple (倍数)</th>
                    <th className="py-2.5 px-3">Max/Order (单单最大)</th>
                    <th className="py-2.5 px-3">Max Continuous (连续卡)</th>
                    <th className="py-2.5 px-3 text-right">Status (状态)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {filteredRules.map(rule => (
                    <tr key={rule.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500">{merchant.mid}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{rule.cardName}</td>
                      <td className="py-2 px-3 text-slate-700">{rule.country} ({rule.currency})</td>
                      <td className="py-2 px-3 text-indigo-700">{rule.mediaType}</td>
                      <td className="py-2 px-3 text-emerald-700">Fast (秒级)</td>
                      <td className="py-2 px-3 text-slate-800">$25</td>
                      <td className="py-2 px-3 text-slate-800">$500</td>
                      <td className="py-2 px-3 text-slate-600">50 倍数</td>
                      <td className="py-2 px-3 text-slate-600">5 张</td>
                      <td className="py-2 px-3 text-slate-600">4 张</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                            rule.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rule.isActive ? '可接单' : '停止接单'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: 当前状态 (2.2.2 动态承接能力 & 2.2.3 承接状态) */}
      {activeTab === 3 && (
        <section className="w-full space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">speed</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">动态承接能力与实时负载遥测</h3>
                  <p className="text-slate-500 text-[11px]">静态配置能接 ≠ 此刻一定可以接。派单系统仅从【正常】与【接近上限】池中自动筛选。</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-500">综合判定结论:</span>
                <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                  currentCapacityStatus === '正常' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {currentCapacityStatus}
                </span>
              </div>
            </div>

            {/* 7 大动态条件卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 条件 1 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>1. 当前接单开关</span>
                  <span className="material-symbols-outlined text-[16px] text-blue-600">toggle_on</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{acceptToggle ? '开启接单中' : '商户手动打烊'}</span>
                  <button
                    onClick={() => setAcceptToggle(!acceptToggle)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      acceptToggle ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    切换开关
                  </button>
                </div>
              </div>

              {/* 条件 2 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>2. 当前可用积点 (Staking)</span>
                  <span className="material-symbols-outlined text-[16px] text-amber-600">toll</span>
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {merchant.points.toLocaleString()} PTS
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  {merchant.points >= 1000 ? '✅ 质押充裕 (足够冲销)' : '❌ 积点不足 (需补缴)'}
                </div>
              </div>

              {/* 条件 3 & 4 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>3. 处理中订单与最大并发</span>
                  <span className="material-symbols-outlined text-[16px] text-purple-600">cloud_sync</span>
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {inFlightOrders} / {maxConcurrency} 单
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  负载率: {((inFlightOrders / maxConcurrency) * 100).toFixed(0)}%
                </div>
              </div>

              {/* 条件 5 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>4. 异常管制状态</span>
                  <span className="material-symbols-outlined text-[16px] text-rose-600">security</span>
                </div>
                <div className="font-bold text-slate-900">
                  {merchant.status === '熔断管制中' ? '⚠️ 风控熔断暂停' : '✅ 正常无管制'}
                </div>
              </div>

              {/* 条件 6 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>5. SKU 临时维护状态</span>
                  <span className="material-symbols-outlined text-[16px] text-indigo-600">build</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{skuMaintenance ? '维护中' : '正常接卡'}</span>
                  <button
                    onClick={() => setSkuMaintenance(!skuMaintenance)}
                    className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                  >
                    切换维护
                  </button>
                </div>
              </div>

              {/* 条件 7 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 col-span-1 sm:col-span-3">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>6. 最近履约质量 (SLA & 成功率)</span>
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                </div>
                <div className="font-mono text-slate-800 text-xs">
                  接单成功率: <strong className="text-emerald-700">99.2%</strong> · SLA 均耗: <strong className="text-blue-700">{merchant.avgTimeSec}s</strong> · 超时率: <strong className="text-slate-700">0.02%</strong> (满足派单门槛)
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: 报价 */}
      {activeTab === 4 && (
        <section className="w-full space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex justify-between items-center">
            <span className="font-bold text-slate-900 text-sm">商户报价明细与折率微调</span>
            <button
              onClick={() => {
                setSelectedRuleForAdjust(rules[0]);
                setTempAdjustRate(rules[0]?.rate.toString() || '6.8450');
                setShowAdjustRateModal(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
            >
              调整买入折率
            </button>
          </div>
        </section>
      )}

      {/* Tab 5: 履约 */}
      {activeTab === 5 && (
        <section className="w-full space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="font-bold text-slate-900 text-sm">履约质量 SLA 统计与接单完成率</span>
          </div>
        </section>
      )}

      {/* Tab 6: 资金账户 */}
      {activeTab === 6 && (
        <section className="w-full space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="font-bold text-slate-900 text-sm">资金账户与质押保证金充值履历</span>
          </div>
        </section>
      )}

      {/* Tab 7: 异常 */}
      {activeTab === 7 && (
        <section className="w-full space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="font-bold text-slate-900 text-sm">异常事件与客诉争议处理记录</span>
          </div>
        </section>
      )}

      {/* Tab 8: 工具权限 (2.2.4 只查看，引导至卡工具管理 ➔ 商户授权) */}
      {activeTab === 8 && (
        <section className="w-full space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700">info</span>
              <span>
                此处为工具权限<strong>只读视图</strong>。如需进行授权开通、变更或解绑，请前往专属配置入口：
              </span>
            </div>
            <button
              onClick={() => showToast('引导跳转：请在左侧菜单点击【08 卡工具管理 ➔ 商户授权】进行授权修改')}
              className="px-3 py-1.5 bg-amber-700 text-white hover:bg-amber-800 rounded-lg font-semibold cursor-pointer shrink-0"
            >
              前往卡工具管理 ➔ 商户授权
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">已调阅商户工具授权现状 (Read-Only)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">Apple 官方余额查验 API</span>
                <span className="text-emerald-700 font-bold">✅ 已授权 (直连调阅)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">Steam 面额及扫卡验真</span>
                <span className="text-emerald-700 font-bold">✅ 已授权 (专线)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">Google Play 余额补全</span>
                <span className="text-slate-500 font-bold">未授权</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 折率微调 Modal */}
      {showAdjustRateModal && selectedRuleForAdjust && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">调整承揽折率</span>
              <button onClick={() => setShowAdjustRateModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">选中卡种规则</label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-900">{selectedRuleForAdjust.cardName} ({selectedRuleForAdjust.ruleCode})</div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">新折率 (买入报价)</label>
                <input
                  type="text"
                  value={tempAdjustRate}
                  onChange={e => setTempAdjustRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono font-bold text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowAdjustRateModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer">取消</button>
              <button onClick={handleSaveRateAdjust} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer">保存并生效</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
