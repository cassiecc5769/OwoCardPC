import React, { useState, useMemo } from 'react';
import { PromoterItem } from './types';

interface PromotionPromoterTabProps {
  promoters: PromoterItem[];
  onOpenAssignModal: () => void;
  onOpenRulesModal: () => void;
  onViewAttribution: (promoter: PromoterItem) => void;
  onViewReconciliation: (promoter: PromoterItem) => void;
  onInterveneRisk: (promoter: PromoterItem) => void;
  onShowToast: (msg: string) => void;
}

export const PromotionPromoterTab: React.FC<PromotionPromoterTabProps> = ({
  promoters,
  onOpenAssignModal,
  onOpenRulesModal,
  onViewAttribution,
  onViewReconciliation,
  onInterveneRisk,
  onShowToast
}) => {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [jumpPageInput, setJumpPageInput] = useState('1');

  // Filtered promoters
  const filteredPromoters = useMemo(() => {
    return promoters.filter(p => {
      const matchesSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.inviteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm);

      const matchesTeam = teamFilter === '' || p.teamId === teamFilter;
      const matchesStatus = statusFilter === '' || p.status === statusFilter;

      let matchesTier = true;
      if (tierFilter === 'tier1') {
        matchesTier = p.tier1Count >= p.tier2Count;
      } else if (tierFilter === 'tier2') {
        matchesTier = p.tier2Count > p.tier1Count;
      }

      return matchesSearch && matchesTeam && matchesStatus && matchesTier;
    });
  }, [promoters, searchTerm, teamFilter, statusFilter, tierFilter]);

  // Page slice
  const totalRecords = filteredPromoters.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentSlice = filteredPromoters.slice(startIndex, startIndex + pageSize);

  const handleCopyInviteLink = (code: string) => {
    const link = `https://giftcard.app/invite?ref=${code}&utm_source=staff_referral`;
    navigator.clipboard?.writeText(link);
    onShowToast(`已复制一人一码专属防伪链接: ${code}`);
  };

  const handleExportExcel = () => {
    onShowToast(`已成功导出 ${filteredPromoters.length} 位推广员业绩与两级归因报表 (.xlsx)`);
  };

  const handleJumpPage = () => {
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    } else {
      onShowToast(`请输入有效页码 (1 ~ ${totalPages})`);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTeamFilter('');
    setStatusFilter('');
    setTierFilter('all');
    setCurrentPage(1);
    onShowToast('已重置所有检索过滤条件');
  };

  // Table summary
  const summaryOrders = currentSlice.reduce((acc, cur) => acc + cur.monthlyOrders, 0);
  const summaryGmv = currentSlice.reduce((acc, cur) => acc + cur.gmv, 0);

  return (
    <div className="space-y-4">
      {/* 组合检索与操作过滤栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 border border-slate-200/80">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* 搜索输入与筛选组 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
            {/* 搜索框 */}
            <div className="relative lg:col-span-2">
              <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="搜索推广员工号 / 姓名 / 专属码 / 手机号..."
                className="w-full h-9 pl-9 pr-8 rounded-lg bg-slate-50 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none border border-slate-200/80 focus:border-blue-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* 所属团队下拉 */}
            <div className="relative">
              <select
                value={teamFilter}
                onChange={e => {
                  setTeamFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 px-3 appearance-none rounded-lg bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none border border-slate-200/80 focus:border-blue-500 transition-colors pr-8"
              >
                <option value="">所属团队: 全部 (18组)</option>
                <option value="lagos-1">拉各斯地推一战队</option>
                <option value="online-ads">线上海外投放大队</option>
                <option value="vip-ops">大客商务运营组</option>
                <option value="mideast-direct">中东直营先锋战队</option>
                <option value="abuja-2">阿布贾地推二战队</option>
                <option value="accra-ghana">加纳阿克拉地推战队</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2 text-[18px] text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* 账号状态下拉 */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 px-3 appearance-none rounded-lg bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none border border-slate-200/80 focus:border-blue-500 transition-colors pr-8"
              >
                <option value="">账号状态: 全量状态</option>
                <option value="active">正常接单 (在岗)</option>
                <option value="paused">暂停派码 (合规冻结)</option>
                <option value="offline">离线挂起 (休假/注销)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2 text-[18px] text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* 归因层级口径 */}
            <div className="relative">
              <select
                value={tierFilter}
                onChange={e => {
                  setTierFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 px-3 appearance-none rounded-lg bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none border border-slate-200/80 focus:border-blue-500 transition-colors pr-8"
              >
                <option value="all">层级: 全部归因口径</option>
                <option value="tier1">直属一级客户主导</option>
                <option value="tier2">二级裂变穿透主导</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2 text-[18px] text-slate-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleExportExcel}
              className="h-9 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-2xs border border-slate-200/80 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-600">download</span>
              <span>导出报表 (Excel)</span>
            </button>
            <button
              onClick={onOpenRulesModal}
              className="h-9 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-2xs border border-slate-200/80 cursor-pointer"
              title="查看PRD 4.1合规风控边界定义"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">policy</span>
              <span>两级归因风控规则</span>
            </button>
            <button
              onClick={onOpenAssignModal}
              className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm active:scale-[0.99] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ 分配新推广员</span>
            </button>
          </div>
        </div>

        {/* 筛选快照与统计 */}
        <div className="flex items-center justify-between text-slate-500 font-code-token text-[11px] pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">当前筛选视图:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200/60">
              周期: 2024-03-01 ~ 2024-03-31
            </span>
            {(searchTerm || teamFilter || statusFilter || tierFilter !== 'all') && (
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 flex items-center gap-1 font-semibold border border-blue-200/60">
                过滤生效中
              </span>
            )}
            <button onClick={handleResetFilters} className="text-blue-600 hover:underline cursor-pointer font-medium">
              重置所有筛选
            </button>
          </div>
          <div className="text-slate-400">
            实时匹配专员数: <span className="font-semibold text-slate-800">{filteredPromoters.length}</span> 位 · 归因有效率 99.98%
          </div>
        </div>
      </div>

      {/* 高密度推广员管理与业绩穿透明细表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider h-10 select-none border-b border-slate-200">
                <th className="py-2.5 px-4 font-semibold">推广员工号 / 姓名</th>
                <th className="py-2.5 px-3 font-semibold">专属邀请码</th>
                <th className="py-2.5 px-3 font-semibold">所属战队 / 负责人</th>
                <th className="py-2.5 px-3 font-semibold">业务状态</th>
                <th className="py-2.5 px-3 font-semibold text-right">一级绑客数</th>
                <th className="py-2.5 px-3 font-semibold text-right">二级裂变客</th>
                <th className="py-2.5 px-3 font-semibold text-right">首单转化率</th>
                <th className="py-2.5 px-3 font-semibold text-right">月有效单量</th>
                <th className="py-2.5 px-3 font-semibold text-right">贡献流水 (GMV)</th>
                <th className="py-2.5 px-3 font-semibold text-right">预估提成收益</th>
                <th className="py-2.5 px-4 font-semibold text-center">合规与穿透操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {currentSlice.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 text-xs">
                    没有找到符合条件的推广专员记录，请调整筛选条件或重置。
                  </td>
                </tr>
              ) : (
                currentSlice.map(p => {
                  const isFlagged = p.isFlagged || p.status === 'paused';
                  const isOffline = p.status === 'offline';

                  return (
                    <tr
                      key={p.id}
                      className={`h-12 hover:bg-slate-50/80 transition-colors group ${
                        isFlagged ? 'bg-rose-50/30' : isOffline ? 'opacity-75 bg-slate-50/40' : ''
                      }`}
                    >
                      {/* 工号 / 姓名 */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded font-code-token text-[11px] font-bold flex items-center justify-center ${p.avatarBg}`}
                          >
                            {p.initials}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 text-xs">{p.name}</span>
                              {p.tag && (
                                <span className={`px-1.5 py-0.2 rounded font-code-token text-[10px] font-semibold border ${p.tagColor || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                  {p.tag}
                                </span>
                              )}
                            </div>
                            <span className="font-code-token text-[11px] text-slate-400">
                              {p.id} · {p.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 专属邀请码 */}
                      <td className="py-2.5 px-3">
                        <div
                          onClick={() => handleCopyInviteLink(p.inviteCode)}
                          className="flex items-center gap-1 group/code cursor-pointer"
                          title="点击复制一人一码专属防伪链接"
                        >
                          <span
                            className={`font-code-token text-xs font-semibold px-1.5 py-0.5 rounded border ${
                              p.status === 'paused'
                                ? 'text-slate-400 bg-slate-100 border-slate-200 line-through'
                                : 'text-blue-700 bg-blue-50 border-blue-200/60'
                            }`}
                          >
                            {p.inviteCode}
                          </span>
                          {p.status === 'paused' ? (
                            <span className="material-symbols-outlined text-[14px] text-rose-500">lock</span>
                          ) : (
                            <span className="material-symbols-outlined text-[14px] text-slate-400 group-hover/code:text-blue-600 transition-colors">
                              content_copy
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 所属战队 / 负责人 */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 text-xs">{p.teamName}</span>
                          <span className="text-[11px] text-slate-400">组长: {p.teamLeader}</span>
                        </div>
                      </td>

                      {/* 业务状态 */}
                      <td className="py-2.5 px-3">
                        {p.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-code-token text-[11px] font-semibold border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            正常接单
                          </span>
                        )}
                        {p.status === 'paused' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-code-token text-[11px] font-semibold border border-rose-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            暂停派码 (熔断)
                          </span>
                        )}
                        {p.status === 'offline' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-code-token text-[11px] font-medium border border-slate-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            离线挂起
                          </span>
                        )}
                      </td>

                      {/* 一级绑客数 */}
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-numeric-table text-xs font-semibold ${isFlagged ? 'text-slate-400' : 'text-blue-600'}`}>
                          {p.tier1Count.toLocaleString()}
                        </span>
                        <span className="font-code-token text-[10px] text-slate-400 block">直属渗透</span>
                      </td>

                      {/* 二级裂变客 */}
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-numeric-table text-xs font-semibold ${isFlagged ? 'text-slate-400' : 'text-indigo-600'}`}>
                          {p.tier2Count.toLocaleString()}
                        </span>
                        <span className="font-code-token text-[10px] text-slate-400 block">二级封顶</span>
                      </td>

                      {/* 首单转化率 */}
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-numeric-table text-xs font-semibold ${p.firstOrderConversion >= 80 ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {p.firstOrderConversion.toFixed(1)}%
                        </span>
                      </td>

                      {/* 月有效单量 */}
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-numeric-table text-xs font-semibold text-slate-800">
                          {p.monthlyOrders.toLocaleString()} <span className="text-slate-400 font-normal text-[11px]">笔</span>
                        </span>
                      </td>

                      {/* 贡献流水 (GMV) */}
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-numeric-table text-xs font-bold text-slate-900">
                          ${p.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* 预估提成收益 */}
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-numeric-table text-xs font-bold ${isFlagged ? 'text-rose-600' : 'text-emerald-700'}`}>
                          ${p.estimatedCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`font-code-token text-[10px] block ${isFlagged ? 'text-rose-500' : 'text-slate-400'}`}>
                          {isFlagged ? '暂停出账' : '待交财务'}
                        </span>
                      </td>

                      {/* 合规与穿透操作 */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs">
                          {p.status === 'paused' ? (
                            <>
                              <button
                                onClick={() => onInterveneRisk(p)}
                                className="px-2 py-1 rounded bg-rose-100 text-rose-800 font-medium hover:bg-rose-200 transition-all cursor-pointer"
                              >
                                风控解冻
                              </button>
                              <button
                                onClick={() => onViewAttribution(p)}
                                className="px-2 py-1 rounded hover:bg-slate-100 text-blue-600 font-medium transition-colors cursor-pointer"
                              >
                                穿透审计
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => onViewAttribution(p)}
                                className="px-2 py-1 rounded hover:bg-blue-50 text-blue-600 font-medium transition-colors cursor-pointer"
                                title="穿透查看其下一二级客户详情"
                              >
                                归因客户
                              </button>
                              <button
                                onClick={() => onViewReconciliation(p)}
                                className="px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
                              >
                                对账
                              </button>
                              <button
                                onClick={() => onInterveneRisk(p)}
                                className="px-1.5 py-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                title="业务风控状态干预"
                              >
                                <span className="material-symbols-outlined text-[16px]">tune</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 表格底部快速统计汇总条 */}
        <div className="h-10 bg-slate-50 px-4 flex items-center justify-between font-code-token text-[11px] text-slate-500 border-t border-slate-200">
          <div className="flex items-center gap-4">
            <span>
              当前页合计: <b className="text-slate-900 font-numeric-table">{currentSlice.length}</b> 位代表专员
            </span>
            <span>
              出单累计: <b className="text-slate-900 font-numeric-table">{summaryOrders.toLocaleString()}</b> 单
            </span>
            <span>
              GMV 合计: <b className="text-blue-600 font-bold font-numeric-table">${summaryGmv.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-emerald-700 font-medium">两级归因封顶校验通过 (无超额穿透违规)</span>
          </div>
        </div>
      </div>

      {/* 第四视线层：底部合规底线与两级归因熔断审计公示 + 分页控件 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* 蓝底徽章看板：PRD 4.1 核心推广模型与合规底线公示 */}
        <div className="lg:col-span-8 bg-white p-4 rounded-xl shadow-sm space-y-3 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[16px]">gavel</span>
              </div>
              <h2 className="font-semibold text-slate-900 text-sm">PRD 4.1 核心推广模型与合规底线公示</h2>
            </div>
            <span className="font-code-token text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
              法务与审计联合签批
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* 红线 1 */}
            <div className="p-3 rounded-lg bg-slate-50 space-y-1 border border-slate-100">
              <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
                <span>红线一：全员平级体系</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed font-sans">
                平台不设置“团队长/总代抽成模式”，推广专员之间地位一律平等，严禁自上而下的多层级金字塔抽水体系，彻底杜绝传销与涉传风险。
              </p>
            </div>

            {/* 红线 2 */}
            <div className="p-3 rounded-lg bg-slate-50 space-y-1 border border-slate-100">
              <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                <span>红线二：一人一码终身锁客</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed font-sans">
                专属邀请码由系统 IAM 授权中心统一派发、全局唯一。客户首次完成注册或绑定即终身归因，防范飞单与业务内卷抢单纠纷。
              </p>
            </div>

            {/* 红线 3 */}
            <div className="p-3 rounded-lg bg-slate-50 space-y-1 border border-slate-100">
              <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px]">block</span>
                <span>红线三：两级归因封顶（第3级熔断）</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed font-sans">
                仅支持两级收益穿透（一级直属客 + 二级裂变客）。第 3 级及以上裂变由底层智能合约强制阻断，佣金池归零且不生成任何记账流水。
              </p>
            </div>

            {/* 红线 4 */}
            <div className="p-3 rounded-lg bg-slate-50 space-y-1 border border-slate-100">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px]">account_balance</span>
                <span>红线四：与财务结算硬隔离</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed font-sans">
                推广工作台数据仅作为“出单预估参考”；实质收益经由合规审计后，以只读凭证移交财务结算中心 (04 Finance Hub) 统一调拨划款。
              </p>
            </div>
          </div>
        </div>

        {/* 右侧：分页控制器与操作确认面板 */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl shadow-sm space-y-4 flex flex-col justify-between border border-slate-200/80">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-xs">记录调阅与分页</span>
              <span className="font-code-token text-[11px] text-slate-400">总计 {totalRecords} 条记录</span>
            </div>
            <p className="text-slate-500 text-[11px] font-sans">
              当前呈现第 {startIndex + 1} 至 {Math.min(startIndex + pageSize, totalRecords)} 项 (共 {totalPages} 页)。支持快捷指定页码或导出本视图已对账分片。
            </p>

            {/* 分页按钮组 */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-slate-200/60"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              <div className="flex items-center gap-1 font-numeric-table text-xs">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pNum => (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-8 h-8 rounded-lg font-semibold transition-colors cursor-pointer ${
                      currentPage === pNum
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-slate-400">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-8 h-8 rounded-lg font-semibold transition-colors cursor-pointer ${
                        currentPage === totalPages
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-slate-200/60"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* 快速条数与跳转 */}
          <div className="pt-2 bg-slate-50 p-3 rounded-lg space-y-2 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>每页行数:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 px-2 bg-white rounded text-slate-800 font-code-token text-[11px] border border-slate-200"
              >
                <option value={10}>10 条 / 页</option>
                <option value={20}>20 条 / 页</option>
                <option value={50}>50 条 / 页</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={jumpPageInput}
                onChange={e => setJumpPageInput(e.target.value)}
                placeholder="页码"
                className="w-16 h-7 px-2 text-center bg-white rounded font-code-token text-xs border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleJumpPage}
                className="flex-1 h-7 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
              >
                跳转
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
