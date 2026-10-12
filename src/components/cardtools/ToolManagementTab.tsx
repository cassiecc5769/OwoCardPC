import React, { useState, useMemo } from 'react';
import {
  ToolItem,
  CapabilityCode,
  CallerType,
  SourcePriority,
  CAPABILITY_MAP
} from './types';
import { INITIAL_TOOLS } from './mockCardToolsData';

interface ToolManagementTabProps {
  showToast: (msg: string) => void;
}

export const ToolManagementTab: React.FC<ToolManagementTabProps> = ({ showToast }) => {
  const [tools, setTools] = useState<ToolItem[]>(INITIAL_TOOLS);
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'hierarchy'>('table');

  // Filters
  const [filterBrand, setFilterBrand] = useState<string>('ALL');
  const [filterCountry, setFilterCountry] = useState<string>('ALL');
  const [filterCapability, setFilterCapability] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 新增/编辑工具配置模态框
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [formBrand, setFormBrand] = useState<string>('Apple');
  const [formCountry, setFormCountry] = useState<string>('US');
  const [formCapability, setFormCapability] = useState<CapabilityCode>('BALANCE_CHECK');
  const [formToolName, setFormToolName] = useState<string>('');
  const [formSource, setFormSource] = useState<string>('');
  const [formPriority, setFormPriority] = useState<SourcePriority>('PRIMARY');
  const [formTimeout, setFormTimeout] = useState<string>('3000');
  const [formRetry, setFormRetry] = useState<string>('2次 / 指数退避 (1s/2s)');
  const [formCallers, setFormCallers] = useState<CallerType[]>(['SYSTEM', 'MERCHANT', 'PLATFORM_CS']);
  const [formEndpoint, setFormEndpoint] = useState<'DIRECT_API' | 'POS_GATEWAY' | 'RPC_PIPELINE' | 'OCR_AI_CLUSTER'>('DIRECT_API');

  // 在线探活与测试状态
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testLog, setTestLog] = useState<string | null>(null);

  // 过滤列表
  const filteredTools = useMemo(() => {
    return tools.filter(t => {
      if (filterBrand !== 'ALL' && t.brand !== filterBrand) return false;
      if (filterCountry !== 'ALL' && t.country !== filterCountry) return false;
      if (filterCapability !== 'ALL' && t.capability !== filterCapability) return false;
      if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mId = t.toolId.toLowerCase().includes(q);
        const mName = t.name.toLowerCase().includes(q);
        const mSource = t.source.toLowerCase().includes(q);
        const mBrand = t.brand.toLowerCase().includes(q);
        if (!mId && !mName && !mSource && !mBrand) return false;
      }
      return true;
    });
  }, [tools, filterBrand, filterCountry, filterCapability, filterStatus, searchQuery]);

  // 构造成 Brand + Country + Capability + Source 的层级树
  const hierarchyTree = useMemo(() => {
    const map: Record<string, Record<string, Record<string, ToolItem[]>>> = {};

    filteredTools.forEach(tool => {
      if (!map[tool.brand]) map[tool.brand] = {};
      if (!map[tool.brand][tool.country]) map[tool.brand][tool.country] = {};
      if (!map[tool.brand][tool.country][tool.capability]) map[tool.brand][tool.country][tool.capability] = [];
      map[tool.brand][tool.country][tool.capability].push(tool);
    });

    return map;
  }, [filteredTools]);

  // 快速切换启用 / 停用
  const handleToggleStatus = (tool: ToolItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = tool.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    const updated: ToolItem = {
      ...tool,
      status: nextStatus,
      updatedTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    setTools(prev => prev.map(t => t.toolId === tool.toolId ? updated : t));
    if (selectedTool?.toolId === tool.toolId) {
      setSelectedTool(updated);
    }
    showToast(`已${nextStatus === 'ENABLED' ? '启用' : '停用'}工具 [${tool.name}]。${nextStatus === 'DISABLED' ? '已从当前活跃路由摘除，历史调用记录已保留。' : '已重新挂载至实时路由。'}`);
  };

  // 执行在线即时探活测试
  const handleRunLiveTest = (tool: ToolItem) => {
    setIsTesting(true);
    setTestLog(null);
    setTimeout(() => {
      setIsTesting(false);
      const latency = Math.floor(600 + Math.random() * 800);
      setTestLog(`[${new Date().toISOString().slice(11, 19)}] 探活成功！网关 HTTP 200 OK，响应耗时: ${latency}ms，数字签名有效。`);
      showToast(`工具 [${tool.name}] 在线测试通过！响应延时: ${latency}ms`);
    }, 800);
  };

  // 打开新增/编辑弹窗
  const handleOpenConfigModal = (tool?: ToolItem) => {
    if (tool) {
      setEditingTool(tool);
      setFormBrand(tool.brand);
      setFormCountry(tool.country);
      setFormCapability(tool.capability);
      setFormToolName(tool.name);
      setFormSource(tool.source);
      setFormPriority(tool.sourcePriority);
      setFormTimeout(String(tool.timeoutMs));
      setFormRetry(tool.retryPolicy);
      setFormCallers(tool.callerTypes);
      setFormEndpoint(tool.endpointType);
    } else {
      setEditingTool(null);
      setFormBrand('Apple');
      setFormCountry('US');
      setFormCapability('BALANCE_CHECK');
      setFormToolName('Apple US 备用直连查询通道 C');
      setFormSource('Apple Partner Direct Edge Node C');
      setFormPriority('BACKUP_1');
      setFormTimeout('3500');
      setFormRetry('2次 / 指数退避 (1s/2s)');
      setFormCallers(['SYSTEM', 'MERCHANT', 'PLATFORM_CS']);
      setFormEndpoint('DIRECT_API');
    }
    setShowConfigModal(true);
  };

  // 保存配置
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formToolName.trim() || !formSource.trim()) {
      showToast('请完整填写工具名称与服务来源！');
      return;
    }

    if (editingTool) {
      const updated: ToolItem = {
        ...editingTool,
        name: formToolName.trim(),
        brand: formBrand,
        country: formCountry,
        capability: formCapability,
        capabilityName: CAPABILITY_MAP[formCapability]?.name || formCapability,
        source: formSource.trim(),
        sourcePriority: formPriority,
        timeoutMs: Number(formTimeout) || 3000,
        retryPolicy: formRetry,
        callerTypes: formCallers,
        endpointType: formEndpoint,
        updatedTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      setTools(prev => prev.map(t => t.toolId === editingTool.toolId ? updated : t));
      if (selectedTool?.toolId === editingTool.toolId) setSelectedTool(updated);
      showToast(`已成功更新工具配置: [${updated.name}]`);
    } else {
      const newTool: ToolItem = {
        toolId: `TOOL-${formBrand.slice(0, 3).toUpperCase()}-${formCountry.toUpperCase()}-${formCapability.slice(0, 3)}-${Date.now().toString().slice(-2)}`,
        name: formToolName.trim(),
        brand: formBrand,
        country: formCountry,
        capability: formCapability,
        capabilityName: CAPABILITY_MAP[formCapability]?.name || formCapability,
        source: formSource.trim(),
        sourcePriority: formPriority,
        status: 'ENABLED',
        healthStatus: 'HEALTHY',
        timeoutMs: Number(formTimeout) || 3000,
        retryPolicy: formRetry,
        callerTypes: formCallers,
        version: 'v1.0.0',
        updatedTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        description: `新接入的 ${formBrand} ${formCountry} ${CAPABILITY_MAP[formCapability]?.name} 工具能力`,
        endpointType: formEndpoint,
        primarySource: formSource.trim(),
        backupSource: 'Standby Failover Pool',
        inputMapping: 'CardCode (string) -> Request.payload',
        outputMapping: 'Response.data -> StandardResult',
        stats: {
          successRate: 100,
          failureRate: 0,
          avgLatencyMs: 950,
          todayCalls: 0,
          recentAnomaly: '新接入暂无异常',
          recentCalledTime: '刚刚接入'
        },
        versionHistory: [
          { version: 'v1.0.0', operator: '当前管理员', changeNote: '初始接入配置与上线', date: new Date().toISOString().slice(0, 10) }
        ]
      };
      setTools(prev => [newTool, ...prev]);
      showToast(`已成功接入并启用新卡工具: [${newTool.name}] (${newTool.toolId})`);
    }
    setShowConfigModal(false);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased pb-8">
      {/* 架构定位说明条 */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-4 rounded-xl border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">account_tree</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm">
                卡工具能力拓扑架构：Brand ➔ Country ➔ Capability ➔ Source
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                解耦品牌独立页面
              </span>
            </div>
            <p className="text-slate-600 text-xs mt-0.5">
              业务系统（交易/商户/客服）统一调用 <strong>Card Tool Service</strong>，仅需指定 <span className="font-mono font-semibold text-blue-700">Brand + Country + Capability</span>，底层自动匹配主备 Source 并执行故障重试与 Failover。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white p-1 rounded-lg border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-[#004ac6] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">table_rows</span>
              <span>14字段表格</span>
            </button>
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'hierarchy' ? 'bg-[#004ac6] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">account_tree</span>
              <span>层级拓扑树</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenConfigModal()}
            className="px-3.5 py-2 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>接入新工具能力</span>
          </button>
        </div>
      </div>

      {/* 筛选与搜索栏 */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Brand 筛选 */}
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

          {/* Country 筛选 */}
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="ALL">全部 Country 国家</option>
            <option value="US">美国 (US)</option>
            <option value="Global">全球 (Global)</option>
            <option value="CA">加拿大 (CA)</option>
            <option value="UK">英国 (UK)</option>
          </select>

          {/* Capability 筛选 */}
          <select
            value={filterCapability}
            onChange={e => setFilterCapability(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="ALL">全部 5 大能力 (Capability)</option>
            <option value="BALANCE_CHECK">BALANCE_CHECK (余额查询)</option>
            <option value="STATUS_CHECK">STATUS_CHECK (状态查询)</option>
            <option value="ORDER_CHECK">ORDER_CHECK (订单查询)</option>
            <option value="FAST_REDEEM">FAST_REDEEM (快充 · 敏感)</option>
            <option value="CODE_COMPLETE">CODE_COMPLETE (卡码补全 · 敏感)</option>
          </select>

          {/* 状态筛选 */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            <option value="ALL">全部状态</option>
            <option value="ENABLED">已启用 (ENABLED)</option>
            <option value="DISABLED">已停用 (DISABLED)</option>
          </select>

          {/* 搜索 */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="搜索 Tool ID / 工具名称 / Source 服务源..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          共检索到 {filteredTools.length} 个工具服务实例
        </span>
      </div>

      {/* 视图 1: 14 大核心标准字段表格 */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold whitespace-nowrap">
                  <th className="py-2.5 px-3">Tool ID</th>
                  <th className="py-2.5 px-3">工具名称</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">Capability</th>
                  <th className="py-2.5 px-3">Source (实际服务源)</th>
                  <th className="py-2.5 px-3">优先级</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Health Status</th>
                  <th className="py-2.5 px-3">Timeout</th>
                  <th className="py-2.5 px-3">Retry</th>
                  <th className="py-2.5 px-3">Caller Type</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Updated Time</th>
                  <th className="py-2.5 px-3 text-right sticky right-0 bg-slate-50">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredTools.map(tool => (
                  <tr
                    key={tool.toolId}
                    onClick={() => setSelectedTool(tool)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer font-sans whitespace-nowrap ${
                      tool.status === 'DISABLED' ? 'opacity-60 bg-slate-50/50' : ''
                    }`}
                  >
                    {/* 1. Tool ID */}
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {tool.toolId}
                    </td>

                    {/* 2. 工具名称 */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{tool.name}</span>
                        {CAPABILITY_MAP[tool.capability]?.isSensitive && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            敏感
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Brand */}
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {tool.brand}
                    </td>

                    {/* 4. Country */}
                    <td className="py-2.5 px-3 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {tool.country}
                      </span>
                    </td>

                    {/* 5. Capability */}
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                        tool.capability === 'FAST_REDEEM' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        tool.capability === 'CODE_COMPLETE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        tool.capability === 'ORDER_CHECK' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {tool.capability} ({tool.capabilityName})
                      </span>
                    </td>

                    {/* 6. Source */}
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {tool.source}
                    </td>

                    {/* 7. Source Priority */}
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        tool.sourcePriority === 'PRIMARY'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}>
                        {tool.sourcePriority === 'PRIMARY' ? 'Primary【主】' : 'Backup【备】'}
                      </span>
                    </td>

                    {/* 8. Status */}
                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => handleToggleStatus(tool, e)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          tool.status === 'ENABLED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title="点击切换启用/停用"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tool.status === 'ENABLED' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{tool.status}</span>
                      </button>
                    </td>

                    {/* 9. Health Status */}
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tool.healthStatus === 'HEALTHY' ? 'bg-emerald-50 text-emerald-700' :
                        tool.healthStatus === 'DEGRADED' ? 'bg-amber-50 text-amber-700 animate-pulse' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {tool.healthStatus === 'HEALTHY' ? '● 正常' : tool.healthStatus === 'DEGRADED' ? '▲ 抖动' : '✕ 不可用'}
                      </span>
                    </td>

                    {/* 10. Timeout */}
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {tool.timeoutMs}ms
                    </td>

                    {/* 11. Retry */}
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {tool.retryPolicy}
                    </td>

                    {/* 12. Caller Type */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        {tool.callerTypes.map((c, i) => (
                          <span key={i} className="text-[9px] px-1 rounded bg-slate-100 text-slate-600 font-mono">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* 13. Version */}
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {tool.version}
                    </td>

                    {/* 14. Updated Time */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {tool.updatedTime}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right sticky right-0 bg-white group-hover:bg-blue-50/40">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleRunLiveTest(tool);
                          }}
                          className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded border border-slate-200 text-xs font-semibold cursor-pointer"
                          title="在线即时探活测试"
                        >
                          测试
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenConfigModal(tool);
                          }}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold cursor-pointer"
                        >
                          配置
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 视图 2: Brand ➔ Country ➔ Capability ➔ Source 层级树形拓扑视图 */}
      {viewMode === 'hierarchy' && (
        <div className="space-y-4">
          {Object.entries(hierarchyTree).map(([brand, countries]) => (
            <div key={brand} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-blue-400">category</span>
                  <span className="font-bold text-sm">Brand: {brand}</span>
                  <span className="text-[11px] text-slate-400 font-mono">({Object.keys(countries).length} 个国家/地区)</span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {Object.entries(countries).map(([country, caps]) => (
                  <div key={country} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Country: {country}
                      </span>
                      <span className="text-slate-500 text-xs">已接入 {Object.keys(caps).length} 项标准卡能力</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(caps).map(([capCode, toolList]) => {
                        const primary = toolList.find(t => t.sourcePriority === 'PRIMARY') || toolList[0];
                        const backups = toolList.filter(t => t.sourcePriority !== 'PRIMARY');

                        return (
                          <div
                            key={capCode}
                            onClick={() => setSelectedTool(primary)}
                            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-blue-600 text-[16px]">
                                  {CAPABILITY_MAP[capCode as CapabilityCode]?.icon || 'handyman'}
                                </span>
                                {capCode}
                              </span>
                              <span className="text-[10px] text-slate-500 font-sans">
                                {CAPABILITY_MAP[capCode as CapabilityCode]?.name}
                              </span>
                            </div>

                            {/* 主源展示 */}
                            <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-200/80 text-[11px] space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-800 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Primary【主源】
                                </span>
                                <span className="font-mono text-[10px] text-emerald-700">{primary.stats.avgLatencyMs}ms</span>
                              </div>
                              <div className="text-slate-800 font-medium truncate">{primary.source}</div>
                            </div>

                            {/* 备源展示 */}
                            {backups.length > 0 ? (
                              backups.map(bk => (
                                <div key={bk.toolId} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-700 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                      Backup【备源】
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-500">{bk.stats.avgLatencyMs}ms</span>
                                  </div>
                                  <div className="text-slate-600 truncate">{bk.source}</div>
                                </div>
                              ))
                            ) : (
                              <div className="text-[10px] text-slate-400 italic px-1">
                                暂无备用通道 (单点主源)
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                              <span>SLA: {primary.stats.successRate}%</span>
                              <span>Timeout: {primary.timeoutMs}ms</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 工具详情抽屉 (包含 5 大板块: 基础信息 / 能力范围 / 调用策略 / 运行情况 / 版本记录) */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* 抽屉 Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-400 text-[22px]">handyman</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{selectedTool.name}</h3>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold font-mono bg-blue-600 text-white">
                      {selectedTool.toolId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    {selectedTool.brand} · {selectedTool.country} · {selectedTool.capability} ({selectedTool.sourcePriority})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTool(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 抽屉 Body: 5 大板块 */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-800">
              {/* 板块 1: 基础信息 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                  1. 基础信息 (Basic Information)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 font-sans block">Brand & Country</span>
                    <span className="font-bold text-slate-900">{selectedTool.brand} ({selectedTool.country})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">Capability Code</span>
                    <span className="font-bold text-blue-700">{selectedTool.capability}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">运行状态 / 健康度</span>
                    <span className="font-bold text-emerald-700">{selectedTool.status} · {selectedTool.healthStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">当前部署版本</span>
                    <span className="font-bold text-slate-800">{selectedTool.version}</span>
                  </div>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">{selectedTool.description}</p>
              </div>

              {/* 板块 2: 能力范围 & 输入输出 Mapping */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
                  2. 能力范围与协议映射 (Capability & Mapping)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 font-sans block font-semibold mb-1">输入协议 Mapping (Input):</span>
                    <code className="text-blue-700">{selectedTool.inputMapping}</code>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 font-sans block font-semibold mb-1">输出协议 Mapping (Output):</span>
                    <code className="text-emerald-700">{selectedTool.outputMapping}</code>
                  </div>
                </div>
              </div>

              {/* 板块 3: 调用策略与路由配置 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-3.5 bg-purple-600 rounded-full"></span>
                  3. 调用策略与主备路由 (Policy & Routing Rules)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 font-sans block">超时时间 (Timeout)</span>
                    <span className="font-bold text-slate-900">{selectedTool.timeoutMs}ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">重试策略 (Retry Policy)</span>
                    <span className="font-bold text-slate-900">{selectedTool.retryPolicy}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block">允许调用主体 (Callers)</span>
                    <span className="font-bold text-slate-900">{selectedTool.callerTypes.join(' / ')}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600">
                  <span>服务来源拓扑: </span>
                  <strong className="text-emerald-700 font-mono">{selectedTool.primarySource}</strong>
                  <span className="text-slate-400"> ➔ Failover 备源: </span>
                  <strong className="text-slate-700 font-mono">{selectedTool.backupSource}</strong>
                </div>
              </div>

              {/* 板块 4: 运行情况 (成功率、失败率、耗时、最近异常、探活) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
                    4. 实时运行情况与探活诊断 (Runtime Health & Live Diagnostics)
                  </span>
                  <button
                    onClick={() => handleRunLiveTest(selectedTool)}
                    disabled={isTesting}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#004ac6] border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">sensors</span>
                    <span>{isTesting ? '正在探测中...' : '发起即时探活'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-sans block">成功率</span>
                    <span className="text-lg font-bold text-emerald-700">{selectedTool.stats.successRate}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-sans block">平均耗时</span>
                    <span className="text-lg font-bold text-slate-900">{selectedTool.stats.avgLatencyMs}ms</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-sans block">今日调用量</span>
                    <span className="text-lg font-bold text-blue-700">{selectedTool.stats.todayCalls.toLocaleString()} 笔</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-sans block">最近调用时间</span>
                    <span className="text-[11px] font-bold text-slate-600 block mt-1">{selectedTool.stats.recentCalledTime}</span>
                  </div>
                </div>

                {testLog && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg font-mono text-[11px]">
                    {testLog}
                  </div>
                )}
              </div>

              {/* 板块 5: 版本记录 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-3.5 bg-slate-600 rounded-full"></span>
                  5. 版本发布与变更审计记录 (Version & Change History)
                </span>
                <div className="space-y-1.5">
                  {selectedTool.versionHistory.map((vh, vi) => (
                    <div key={vi} className="p-2 bg-white rounded-lg border border-slate-200/70 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700">{vh.version}</span>
                        <span className="text-slate-700">{vh.changeNote}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {vh.operator} · {vh.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 抽屉 Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={e => handleToggleStatus(selectedTool, e)}
                className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  selectedTool.status === 'ENABLED'
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {selectedTool.status === 'ENABLED' ? '停用此工具实例' : '启用此工具实例'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenConfigModal(selectedTool);
                    setSelectedTool(null);
                  }}
                  className="px-4 py-2 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  编辑此工具配置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新增/编辑配置弹窗 */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingTool ? `编辑工具配置: ${editingTool.toolId}` : '接入与配置新卡工具能力'}
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Brand (品牌)</label>
                  <select
                    value={formBrand}
                    onChange={e => setFormBrand(e.target.value)}
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
                    value={formCountry}
                    onChange={e => setFormCountry(e.target.value)}
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Capability (5 大标准业务能力)</label>
                <select
                  value={formCapability}
                  onChange={e => setFormCapability(e.target.value as CapabilityCode)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="BALANCE_CHECK">BALANCE_CHECK (余额查询 - 查询卡当前余额)</option>
                  <option value="STATUS_CHECK">STATUS_CHECK (状态查询 - 查询卡当前状态)</option>
                  <option value="ORDER_CHECK">ORDER_CHECK (订单查询 - 查询相关外部订单)</option>
                  <option value="FAST_REDEEM">FAST_REDEEM (快充 - 执行快充能力 · 敏感能力)</option>
                  <option value="CODE_COMPLETE">CODE_COMPLETE (卡码补全 - 补全卡码信息 · 敏感能力)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">工具名称 (Tool Name)</label>
                <input
                  type="text"
                  value={formToolName}
                  onChange={e => setFormToolName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  placeholder="例如: Apple US 官方直连余额查验"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">实际服务来源 (Source)</label>
                <input
                  type="text"
                  value={formSource}
                  onChange={e => setFormSource(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  placeholder="例如: Apple Enterprise Direct API Node 01"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">优先级 (Source Priority)</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as SourcePriority)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="PRIMARY">PRIMARY【主通道】</option>
                    <option value="BACKUP_1">BACKUP_1【第一备用通道】</option>
                    <option value="BACKUP_2">BACKUP_2【第二备用通道】</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">超时时间 (Timeout ms)</label>
                  <input
                    type="number"
                    value={formTimeout}
                    onChange={e => setFormTimeout(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">重试策略 (Retry Policy)</label>
                <input
                  type="text"
                  value={formRetry}
                  onChange={e => setFormRetry(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  placeholder="例如: 2次 / 指数退避 (1s/2s)"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004ac6] hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                >
                  保存并生效
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
