import React, { useState, useMemo } from 'react';
import {
  MerchantAuthItem,
  CapabilityCode,
  AuthStatus,
  AuthType,
  ToolAuditLogItem,
  CAPABILITY_MAP
} from './types';
import { INITIAL_MERCHANT_AUTHS, INITIAL_AUDIT_LOGS } from './mockCardToolsData';

interface MerchantAuthTabProps {
  showToast: (msg: string) => void;
}

export const MerchantAuthTab: React.FC<MerchantAuthTabProps> = ({ showToast }) => {
  const [authList, setAuthList] = useState<MerchantAuthItem[]>(INITIAL_MERCHANT_AUTHS);
  const [auditLogs, setAuditLogs] = useState<ToolAuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // 3 大视角: 按商户查看 | 按工具查看 | 授权审计记录
  const [viewPerspective, setViewPerspective] = useState<'by_merchant' | 'by_tool' | 'audit_logs'>('by_merchant');

  // Filters
  const [filterMerchant, setFilterMerchant] = useState<string>('ALL');
  const [filterBrand, setFilterBrand] = useState<string>('ALL');
  const [filterCapability, setFilterCapability] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 新增授权模态框状态
  const [showGrantModal, setShowGrantModal] = useState<boolean>(false);
  const [grantMerchantId, setGrantMerchantId] = useState<string>('MID-M01');
  const [grantBrand, setGrantBrand] = useState<string>('Apple');
  const [grantCountry, setGrantCountry] = useState<string>('US');
  const [grantCapability, setGrantCapability] = useState<CapabilityCode>('BALANCE_CHECK');
  const [grantAuthType, setGrantAuthType] = useState<AuthType>('PERMANENT');
  const [grantEffectiveDate, setGrantEffectiveDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [grantExpireDate, setGrantExpireDate] = useState<string>('2026-12-31');
  const [grantDailyQuota, setGrantDailyQuota] = useState<string>('20000');
  const [grantMaxQps, setGrantMaxQps] = useState<string>('30');
  const [grantReason, setGrantReason] = useState<string>('签署标准接卡协议，开通该能力');

  // 过滤后的授权列表
  const filteredAuths = useMemo(() => {
    return authList.filter(item => {
      if (filterMerchant !== 'ALL' && item.merchantId !== filterMerchant) return false;
      if (filterBrand !== 'ALL' && item.brand !== filterBrand) return false;
      if (filterCapability !== 'ALL' && item.capability !== filterCapability) return false;
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mMch = item.merchantName.toLowerCase().includes(q) || item.merchantId.toLowerCase().includes(q);
        const mBrand = item.brand.toLowerCase().includes(q);
        const mReason = item.reason.toLowerCase().includes(q);
        if (!mMch && !mBrand && !mReason) return false;
      }
      return true;
    });
  }, [authList, filterMerchant, filterBrand, filterCapability, filterStatus, searchQuery]);

  // 按商户分组聚合
  const groupedByMerchant = useMemo(() => {
    const map: Record<string, { merchantName: string; merchantCode: string; items: MerchantAuthItem[] }> = {};
    filteredAuths.forEach(a => {
      if (!map[a.merchantId]) {
        map[a.merchantId] = {
          merchantName: a.merchantName,
          merchantCode: a.merchantCode,
          items: []
        };
      }
      map[a.merchantId].items.push(a);
    });
    return map;
  }, [filteredAuths]);

  // 按工具能力分组聚合
  const groupedByTool = useMemo(() => {
    const map: Record<string, { brand: string; country: string; capability: CapabilityCode; items: MerchantAuthItem[] }> = {};
    filteredAuths.forEach(a => {
      const key = `${a.brand}_${a.country}_${a.capability}`;
      if (!map[key]) {
        map[key] = {
          brand: a.brand,
          country: a.country,
          capability: a.capability,
          items: []
        };
      }
      map[key].items.push(a);
    });
    return map;
  }, [filteredAuths]);

  // 切换授权状态 (启用/关闭)
  const handleToggleAuthStatus = (auth: MerchantAuthItem) => {
    const nextStatus: AuthStatus = auth.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    const updated: MerchantAuthItem = {
      ...auth,
      status: nextStatus,
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // 生成审计日志
    const newLog: ToolAuditLogItem = {
      logId: `LOG-AUD-${Date.now().toString().slice(-6)}`,
      operator: '当前管理员 (张总 · AD01)',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      actionType: nextStatus === 'ACTIVE' ? 'MERCHANT_GRANT' : 'MERCHANT_REVOKE',
      actionName: nextStatus === 'ACTIVE' ? '恢复商户能力授权' : '关闭商户能力授权',
      targetObject: `${auth.merchantName} (${auth.merchantId}) · ${auth.brand} ${auth.country} ${auth.capability}`,
      beforeState: `状态: ${auth.status}`,
      afterState: `状态: ${nextStatus}`,
      reason: `管理员快捷操作: ${nextStatus === 'ACTIVE' ? '恢复生效' : '暂停权限'}`,
      ipAddress: '102.89.20.11'
    };

    setAuthList(prev => prev.map(a => a.authId === auth.authId ? updated : a));
    setAuditLogs(prev => [newLog, ...prev]);
    showToast(`已${nextStatus === 'ACTIVE' ? '恢复' : '关闭'}商户 [${auth.merchantName}] 的 ${auth.brand} ${auth.country} ${auth.capabilityName} 授权！已写入审计日志。`);
  };

  // 提交新增授权
  const handleGrantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const merchantMap: Record<string, { name: string; code: string }> = {
      'MID-M01': { name: '易兑数字供应链', code: 'MCH-ED-001' },
      'MID-M02': { name: '极速卡业科技', code: 'MCH-JS-002' },
      'MID-M03': { name: '全球数码直通', code: 'MCH-QQ-003' }
    };

    const targetMerchant = merchantMap[grantMerchantId] || { name: '商户', code: grantMerchantId };
    const isSensitive = CAPABILITY_MAP[grantCapability]?.isSensitive || false;

    const newAuth: MerchantAuthItem = {
      authId: `AUTH-${grantMerchantId.slice(-3)}-${grantBrand.slice(0, 3).toUpperCase()}-${grantCountry.toUpperCase()}-${grantCapability.slice(0, 3)}`,
      merchantId: grantMerchantId,
      merchantName: targetMerchant.name,
      merchantCode: targetMerchant.code,
      brand: grantBrand,
      country: grantCountry,
      capability: grantCapability,
      capabilityName: CAPABILITY_MAP[grantCapability]?.name || grantCapability,
      status: 'ACTIVE',
      authType: grantAuthType,
      effectiveFrom: `${grantEffectiveDate} 00:00:00`,
      expiresAt: grantAuthType === 'PERMANENT' ? 'PERMANENT' : `${grantExpireDate} 23:59:59`,
      isSensitive,
      dailyCallQuota: Number(grantDailyQuota) || 10000,
      todayUsedCalls: 0,
      maxQps: Number(grantMaxQps) || 20,
      grantedBy: '平台管理员 (陈华)',
      reason: grantReason.trim(),
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const newLog: ToolAuditLogItem = {
      logId: `LOG-AUD-${Date.now().toString().slice(-6)}`,
      operator: '平台管理员 (陈华 · AD02)',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      actionType: isSensitive ? 'SENSITIVE_ACCESS' : 'MERCHANT_GRANT',
      actionName: `开通商户能力授权${isSensitive ? ' (高风险敏感能力)' : ''}`,
      targetObject: `${targetMerchant.name} (${grantMerchantId}) · ${grantBrand} ${grantCountry} ${grantCapability}`,
      beforeState: '未授权 (NO_AUTH)',
      afterState: `生效中 (ACTIVE: ${grantAuthType === 'PERMANENT' ? '永久授权' : `临时授权至 ${grantExpireDate}`}, 配额: ${grantDailyQuota}/天)`,
      reason: grantReason.trim(),
      ipAddress: '102.89.20.11'
    };

    setAuthList(prev => [newAuth, ...prev]);
    setAuditLogs(prev => [newLog, ...prev]);
    setShowGrantModal(false);
    showToast(`已成功为商户 [${targetMerchant.name}] 授权 [${grantBrand} ${grantCountry} ${newAuth.capabilityName}]！`);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased pb-8">
      {/* 顶部定位说明与视角切换栏 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm">
                商户业务能力授权（Merchant × Brand × Country × Capability）
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-[10px] font-bold border border-purple-200">
                能力级业务鉴权
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              商户只感知自身是否拥有卡种能力，不感知底层服务来源（Source 属于平台内部路由）。敏感能力（快充/补全/明文卡密）需记录使用原因并留痕审计。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* 3 大视角切换 */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setViewPerspective('by_merchant')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                viewPerspective === 'by_merchant' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">store</span>
              <span>按商户查看</span>
            </button>
            <button
              onClick={() => setViewPerspective('by_tool')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                viewPerspective === 'by_tool' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">handyman</span>
              <span>按工具查看</span>
            </button>
            <button
              onClick={() => setViewPerspective('audit_logs')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                viewPerspective === 'audit_logs' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">history_edu</span>
              <span>授权审计日志 ({auditLogs.length})</span>
            </button>
          </div>

          <button
            onClick={() => setShowGrantModal(true)}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add_moderator</span>
            <span>授予商户能力</span>
          </button>
        </div>
      </div>

      {/* 筛选条 (在非日志视角下显示) */}
      {viewPerspective !== 'audit_logs' && (
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterMerchant}
              onChange={e => setFilterMerchant(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">全部商户</option>
              <option value="MID-M01">易兑数字供应链 (MID-M01)</option>
              <option value="MID-M02">极速卡业科技 (MID-M02)</option>
              <option value="MID-M03">全球数码直通 (MID-M03)</option>
            </select>

            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">全部 Brand 品牌</option>
              <option value="Apple">Apple</option>
              <option value="Steam">Steam</option>
              <option value="Sephora">Sephora</option>
              <option value="Target">Target</option>
              <option value="Vanilla">Vanilla</option>
            </select>

            <select
              value={filterCapability}
              onChange={e => setFilterCapability(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">全部 Capability 能力</option>
              <option value="BALANCE_CHECK">BALANCE_CHECK (余额查询)</option>
              <option value="ORDER_CHECK">ORDER_CHECK (订单查询)</option>
              <option value="FAST_REDEEM">FAST_REDEEM (快充 · 敏感)</option>
              <option value="CODE_COMPLETE">CODE_COMPLETE (卡码补全 · 敏感)</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">全部授权状态</option>
              <option value="ACTIVE">生效中 (ACTIVE)</option>
              <option value="PENDING">待生效 (PENDING)</option>
              <option value="EXPIRED">已过期 (EXPIRED)</option>
              <option value="REVOKED">已关闭 (REVOKED)</option>
            </select>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                search
              </span>
              <input
                type="text"
                placeholder="搜索商户 / 品牌 / 原因..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-purple-500 w-60"
              />
            </div>
          </div>

          <span className="text-slate-400 font-mono text-[11px]">
            共 {filteredAuths.length} 条授权关系
          </span>
        </div>
      )}

      {/* 视角 1: 按商户查看 (By Merchant) */}
      {viewPerspective === 'by_merchant' && (
        <div className="space-y-4">
          {Object.entries(groupedByMerchant).map(([mId, mGroup]) => (
            <div key={mId} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                    {mId.slice(-2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{mGroup.merchantName}</span>
                      <span className="text-[11px] text-slate-300 font-mono">({mId} · {mGroup.merchantCode})</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  已获 {mGroup.items.filter(i => i.status === 'ACTIVE').length} 项生效能力 / 共 {mGroup.items.length} 项授权
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold whitespace-nowrap">
                      <th className="py-2.5 px-3">Brand</th>
                      <th className="py-2.5 px-3">Country</th>
                      <th className="py-2.5 px-3">Capability 能力</th>
                      <th className="py-2.5 px-3">授权状态</th>
                      <th className="py-2.5 px-3">授权类型</th>
                      <th className="py-2.5 px-3">有效期范围</th>
                      <th className="py-2.5 px-3">日调用限额 / 今日已用</th>
                      <th className="py-2.5 px-3">QPS 限流</th>
                      <th className="py-2.5 px-3">授权原因 / 审批人</th>
                      <th className="py-2.5 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {mGroup.items.map(auth => (
                      <tr key={auth.authId} className="hover:bg-purple-50/30 transition-colors font-sans whitespace-nowrap">
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                          {auth.brand}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {auth.country}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 font-mono">{auth.capability}</span>
                            <span className="text-[11px] text-slate-500">({auth.capabilityName})</span>
                            {auth.isSensitive && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                敏感权限
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            auth.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                            auth.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {auth.status === 'ACTIVE' ? '● 生效中' : auth.status === 'PENDING' ? '▲ 待生效' : '✕ 已关闭'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            auth.authType === 'PERMANENT' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {auth.authType === 'PERMANENT' ? '永久授权' : '临时授权'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {auth.expiresAt === 'PERMANENT' ? '永久有效' : auth.expiresAt}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-purple-700">{auth.todayUsedCalls.toLocaleString()}</span>
                            <span className="text-slate-400">/</span>
                            <span>{auth.dailyCallQuota.toLocaleString()} 笔</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                          {auth.maxQps} QPS
                        </td>
                        <td className="py-2.5 px-3 text-[11px]">
                          <div className="text-slate-800 max-w-xs truncate">{auth.reason}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{auth.grantedBy}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleToggleAuthStatus(auth)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                              auth.status === 'ACTIVE'
                                ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {auth.status === 'ACTIVE' ? '关闭授权' : '恢复授权'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 视角 2: 按工具能力查看 (By Tool Capability) */}
      {viewPerspective === 'by_tool' && (
        <div className="space-y-4">
          {Object.entries(groupedByTool).map(([toolKey, group]) => (
            <div key={toolKey} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{group.brand} ({group.country}) · {group.capability} ({CAPABILITY_MAP[group.capability]?.name})</span>
                  {CAPABILITY_MAP[group.capability]?.isSensitive && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500 text-white">
                      敏感高危权限
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  已向 {group.items.filter(i => i.status === 'ACTIVE').length} 家商户授权
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">商户名称</th>
                      <th className="py-2.5 px-3">商户编码</th>
                      <th className="py-2.5 px-3">授权状态</th>
                      <th className="py-2.5 px-3">授权类型</th>
                      <th className="py-2.5 px-3">有效期</th>
                      <th className="py-2.5 px-3">日配额 / 今日已用</th>
                      <th className="py-2.5 px-3">授权原因与审批人</th>
                      <th className="py-2.5 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {group.items.map(auth => (
                      <tr key={auth.authId} className="hover:bg-purple-50/30 transition-colors font-sans">
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">
                          {auth.merchantName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {auth.merchantId} ({auth.merchantCode})
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            auth.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {auth.status === 'ACTIVE' ? '● 生效中' : '✕ 已关闭'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {auth.authType === 'PERMANENT' ? '永久授权' : '临时授权'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {auth.expiresAt === 'PERMANENT' ? '永久有效' : auth.expiresAt}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {auth.todayUsedCalls.toLocaleString()} / {auth.dailyCallQuota.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-700">
                          {auth.reason} ({auth.grantedBy})
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleToggleAuthStatus(auth)}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-50 border border-purple-200 rounded cursor-pointer"
                          >
                            {auth.status === 'ACTIVE' ? '关闭' : '开启'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 视角 3: 授权审计日志 (Audit Logs) */}
      {viewPerspective === 'audit_logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-[18px]">history_edu</span>
              卡工具能力授权与配置审计追溯日志 (Audit Trail)
            </span>
            <span className="text-xs text-slate-400 font-mono">不可篡改留痕</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold whitespace-nowrap">
                  <th className="py-2.5 px-3">日志 ID / 操作时间</th>
                  <th className="py-2.5 px-3">操作专员</th>
                  <th className="py-2.5 px-3">变更类型</th>
                  <th className="py-2.5 px-3">目标授权对象</th>
                  <th className="py-2.5 px-3">变更前状态</th>
                  <th className="py-2.5 px-3">变更后状态</th>
                  <th className="py-2.5 px-3">业务原因与审批单号</th>
                  <th className="py-2.5 px-3">操作 IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.map(log => (
                  <tr key={log.logId} className="hover:bg-slate-50 font-sans">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 font-mono text-xs">{log.logId}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.timestamp}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {log.operator}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        log.actionType === 'SENSITIVE_ACCESS' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        log.actionType === 'MERCHANT_GRANT' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {log.actionName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {log.targetObject}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {log.beforeState}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-700 font-semibold">
                      {log.afterState}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-700 max-w-xs">
                      {log.reason}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 授予商户能力弹窗 */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                授予商户卡工具能力 (Merchant Authorization)
              </h3>
              <button
                onClick={() => setShowGrantModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleGrantSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">选择目标商户 (Merchant)</label>
                <select
                  value={grantMerchantId}
                  onChange={e => setGrantMerchantId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="MID-M01">易兑数字供应链 (MID-M01 · Tier-S)</option>
                  <option value="MID-M02">极速卡业科技 (MID-M02 · Tier-A)</option>
                  <option value="MID-M03">全球数码直通 (MID-M03 · Tier-A)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Brand (品牌)</label>
                  <select
                    value={grantBrand}
                    onChange={e => setGrantBrand(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Steam">Steam</option>
                    <option value="Sephora">Sephora</option>
                    <option value="Target">Target</option>
                    <option value="Vanilla">Vanilla</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Country (国家/区域)</label>
                  <select
                    value={grantCountry}
                    onChange={e => setGrantCountry(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="US">美国 (US)</option>
                    <option value="Global">全球 (Global)</option>
                    <option value="CA">加拿大 (CA)</option>
                    <option value="UK">英国 (UK)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Capability (能力)</label>
                <select
                  value={grantCapability}
                  onChange={e => setGrantCapability(e.target.value as CapabilityCode)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="BALANCE_CHECK">BALANCE_CHECK (余额查询)</option>
                  <option value="STATUS_CHECK">STATUS_CHECK (状态查询)</option>
                  <option value="ORDER_CHECK">ORDER_CHECK (订单查询)</option>
                  <option value="FAST_REDEEM">FAST_REDEEM (快充 · 敏感高危)</option>
                  <option value="CODE_COMPLETE">CODE_COMPLETE (卡码补全 · 敏感高危)</option>
                </select>
                {CAPABILITY_MAP[grantCapability]?.isSensitive && (
                  <div className="mt-1.5 p-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-[11px]">
                    ⚠️ 注意：[{grantCapability}] 属于高风险敏感能力，授权时必须签署兜底协议并提交审批单号。
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">授权模式</label>
                  <select
                    value={grantAuthType}
                    onChange={e => setGrantAuthType(e.target.value as AuthType)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="PERMANENT">永久授权</option>
                    <option value="TEMPORARY">临时授权 (指定到期时间)</option>
                  </select>
                </div>

                {grantAuthType === 'TEMPORARY' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">到期时间 (Expires At)</label>
                    <input
                      type="date"
                      value={grantExpireDate}
                      onChange={e => setGrantExpireDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">每日调用限额 (Daily Quota)</label>
                  <input
                    type="number"
                    value={grantDailyQuota}
                    onChange={e => setGrantDailyQuota(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">QPS 限流 (Max QPS)</label>
                  <input
                    type="number"
                    value={grantMaxQps}
                    onChange={e => setGrantMaxQps(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">授权原因与审批单号 (Reason & Audit Note)</label>
                <textarea
                  rows={2}
                  value={grantReason}
                  onChange={e => setGrantReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  placeholder="例如: 审批单 #OA-20261006-891: 完成准入保证金缴纳，签署快充协议..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                >
                  确认授权并留痕
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
