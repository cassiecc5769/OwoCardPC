import React, { useState } from 'react';

export interface ProductRequirement {
  id: string;
  code: string;
  source: '经营问题' | '运营计划' | '人工发现' | '客服反馈' | '财务风控';
  title: string;
  currentIssue: string;
  impactScope: string;
  currentWorkaround: string;
  suggestedCapability: string;
  expectedMetric: string;
  actualVerifiedMetric?: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'pending_eval' | 'scheduled' | 'developing' | 'released' | 'verifying' | 'completed';
  statusLabel: string;
  statusBadge: string;
  ownerTech: string;
  proposer: string;
  createdDate: string;
  releasedDate?: string;
}

export const INITIAL_PRODUCT_REQUIREMENTS: ProductRequirement[] = [
  {
    id: 'REQ-01',
    code: 'PRD-FEAT-202610-01',
    source: '经营问题',
    title: '报价自动监听与批量催价引擎',
    currentIssue: '目前需人工每小时比对外部行情与商户报价，再逐家发消息催价，日均耗时 2.3h',
    impactScope: '覆盖 12 个重点卡种，日影响 GMV ¥8.6万',
    currentWorkaround: '运营/客服人工查价并在收卡业务端群发通知',
    suggestedCapability: '接入外部实时行情爬虫，支持价差倒挂自动识别与一键/定时批量通知商户',
    expectedMetric: '人工耗时从 2.3h/天 降至 ＜0.5h/天，低价跟价时效从 45min 缩短至 5min',
    actualVerifiedMetric: '实际验证: 人工耗时降至 0.4h/天 (-82%)，跟价时效 6.2min，达标闭环！',
    priority: 'P0',
    status: 'completed',
    statusLabel: '已闭环验证',
    statusBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    ownerTech: '交易平台研发组 (陈工)',
    proposer: '平台运营 (张立)',
    createdDate: '2026-09-18',
    releasedDate: '2026-09-28',
  },
  {
    id: 'REQ-02',
    code: 'PRD-FEAT-202610-02',
    source: '客服反馈',
    title: '模糊卡密 OCR 增强与置信度自适应分流',
    currentIssue: '反光涂层卡图识别率仅 62%，每天产生 48 笔低置信度工单需要客服人工看图打字',
    impactScope: '涉及 US 实体卡，日影响 120 笔卡单',
    currentWorkaround: '客服在异常订单池逐单人工放大图片核对并修正卡密',
    suggestedCapability: '引入端侧图像自适应去反光滤镜与卡段正则字典纠错，置信度＞85% 自动放行',
    expectedMetric: 'OCR 人工复核量降低 60%，平均入单时效缩短 2.8 分钟',
    priority: 'P0',
    status: 'developing',
    statusLabel: '开发中 (预计10/8上线)',
    statusBadge: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    ownerTech: 'AI算法引擎组 (刘工)',
    proposer: '平台客服 (李主管)',
    createdDate: '2026-09-26',
  },
  {
    id: 'REQ-03',
    code: 'PRD-FEAT-202610-03',
    source: '财务风控',
    title: '商户低积点动态阶梯预警与自动降权熔断',
    currentIssue: '商户积点跌破阈值后无自动停单保护，导致出单后商户因无余额无法结算卡款',
    impactScope: '平台全部 64 家接卡承揽商户',
    currentWorkaround: '财务专员定时导出积点报表手工催补水',
    suggestedCapability: '设立 10万/5万 两级动态水位，跌破 5万 自动降权 50% 派单，耗尽即刻熔断下线',
    expectedMetric: '低积点停收事件降为 0，资金风险事件为 0',
    priority: 'P1',
    status: 'verifying',
    statusLabel: '上线效果验证中',
    statusBadge: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    ownerTech: '清算核心架构组 (王工)',
    proposer: '平台财务 (赵总账)',
    createdDate: '2026-09-22',
    releasedDate: '2026-10-01',
    actualVerifiedMetric: '实测: 过去48小时拦截 3 起欠费接单风险，未发生因欠款导致的卡单违约',
  },
  {
    id: 'REQ-04',
    code: 'PRD-FEAT-202610-04',
    source: '运营计划',
    title: 'OWO APP 新客注册 72h 首单阶梯加息券智能触达',
    currentIssue: 'A渠道拉新用户次日留存 38.2%，首单转化率仅 52.8%，流失严重',
    impactScope: '月均 8,000+ 新注册用户',
    currentWorkaround: '运营人工筛选未首单名单，手动通过站内信群发召回券',
    suggestedCapability: '系统触发式自动化工作流：注册+2h/24h/48h 未出卡自动推不同面额加息券',
    expectedMetric: '新用户首单转化率由 52.8% 提升至 65.0% (+12.2pp)',
    priority: 'P0',
    status: 'scheduled',
    statusLabel: '已排期 (Sprint 24)',
    statusBadge: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
    ownerTech: '用户增长产品组 (高工)',
    proposer: '平台运营 (王雪)',
    createdDate: '2026-10-01',
  },
];

export interface ProductRequirementsPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSource?: string;
  initialProblem?: string;
  initialTitle?: string;
  initialPriority?: 'P0' | 'P1' | 'P2';
}

export const ProductRequirementsPoolModal: React.FC<ProductRequirementsPoolModalProps> = ({
  isOpen,
  onClose,
  initialSource = '经营问题',
  initialProblem = '',
  initialTitle = '',
  initialPriority = 'P0',
}) => {
  const [requirements, setRequirements] = useState<ProductRequirement[]>(INITIAL_PRODUCT_REQUIREMENTS);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formSource, setFormSource] = useState(initialSource);
  const [formTitle, setFormTitle] = useState(initialTitle);
  const [formCurrentIssue, setFormCurrentIssue] = useState(initialProblem);
  const [formImpact, setFormImpact] = useState('');
  const [formWorkaround, setFormWorkaround] = useState('');
  const [formSuggested, setFormSuggested] = useState('');
  const [formExpectedMetric, setFormExpectedMetric] = useState('');
  const [formPriority, setFormPriority] = useState<'P0' | 'P1' | 'P2'>(initialPriority);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCurrentIssue.trim()) {
      showToast('请完整填写需求标题与业务问题描述！');
      return;
    }

    const newReq: ProductRequirement = {
      id: `REQ-0${requirements.length + 1}`,
      code: `PRD-FEAT-202610-0${requirements.length + 1}`,
      source: formSource as any,
      title: formTitle,
      currentIssue: formCurrentIssue,
      impactScope: formImpact || '涉及核心交易与运营流程',
      currentWorkaround: formWorkaround || '人工介入处理',
      suggestedCapability: formSuggested || '建议系统自动化产品能力',
      expectedMetric: formExpectedMetric || '显著改善业务指标与降低人工',
      priority: formPriority,
      status: 'pending_eval',
      statusLabel: '待产品评估',
      statusBadge: 'bg-slate-100 text-slate-700 border-slate-300 font-semibold',
      ownerTech: '待分配',
      proposer: '当前登录人员',
      createdDate: new Date().toISOString().split('T')[0],
    };

    setRequirements([newReq, ...requirements]);
    showToast(`✅ 优化需求【${newReq.title}】已提交并进入 PRD V4.0 产品需求池！`);
    setActiveTab('list');
    setFormTitle('');
    setFormCurrentIssue('');
    setFormImpact('');
    setFormWorkaround('');
    setFormSuggested('');
    setFormExpectedMetric('');
  };

  const filteredReqs = requirements.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">build</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">产品与技术需求闭环池 (PRD V4.0 第十/三十二节)</h2>
                <span className="px-2 py-0.2 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono border border-blue-400/30">
                  指标闭环验证机制
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                闭环链条：<strong>待评估 ➔ 已排期 ➔ 开发中 ➔ 已上线 ➔ 效果验证 (指标改善) ➔ 完成闭环</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab & Subheader */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'list' ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              <span>需求池明细 ({requirements.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'create' ? 'bg-white text-blue-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">add_task</span>
              <span>提报新优化需求</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">状态过滤:</span>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 text-xs focus:outline-none"
              >
                <option value="all">全部状态</option>
                <option value="pending_eval">待评估</option>
                <option value="scheduled">已排期</option>
                <option value="developing">开发中</option>
                <option value="verifying">效果验证中</option>
                <option value="completed">已闭环验证</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {toastMsg && (
            <div className="mb-4 p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-emerald-400 text-[16px]">info</span>
              <span>{toastMsg}</span>
            </div>
          )}

          {activeTab === 'list' ? (
            <div className="space-y-3">
              {filteredReqs.map(req => (
                <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.priority === 'P0' ? 'bg-rose-100 text-rose-700' :
                        req.priority === 'P1' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {req.priority}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px] font-bold">{req.code}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{req.title}</h4>
                      <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                        来源: {req.source}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10.5px] border ${req.statusBadge}`}>
                      {req.statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">当前痛点与影响范围：</span>
                      <span className="text-slate-700 font-medium">{req.currentIssue}</span>
                      <div className="text-[10.5px] text-slate-500 mt-0.5">影响: {req.impactScope}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">建议系统能力：</span>
                      <span className="text-slate-700 font-medium">{req.suggestedCapability}</span>
                      <div className="text-[10.5px] text-blue-600 mt-0.5 font-semibold">预期指标: {req.expectedMetric}</div>
                    </div>
                  </div>

                  {/* 闭环验证成效 (PRD V4.0 第32节核心) */}
                  {req.actualVerifiedMetric && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">verified</span>
                        <span>{req.actualVerifiedMetric}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-mono font-bold">闭环达成率 100%</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>提报人: <strong className="text-slate-600">{req.proposer}</strong> · 研发对接: <strong className="text-slate-600">{req.ownerTech}</strong></span>
                    <span>提报日期: {req.createdDate} {req.releasedDate && `· 上线: ${req.releasedDate}`}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">需求来源：</label>
                  <select
                    value={formSource}
                    onChange={e => setFormSource(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="经营问题">经营问题 (运营工作台发现)</option>
                    <option value="运营计划">运营计划 (专项协同发现)</option>
                    <option value="客服反馈">客服反馈 (高频人工处理)</option>
                    <option value="财务风控">财务风控 (对账/资金风险)</option>
                    <option value="人工发现">人工日常发现</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">需求优先级：</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="P0">P0 (严重阻断/高危/大GMV影响)</option>
                    <option value="P1">P1 (中度低效/需尽快支持)</option>
                    <option value="P2">P2 (体验优化/长期规划)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">功能模块名称：</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：Steam 晚高峰自动调权调度"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">当前业务哪里低效 / 存在什么问题：</label>
                <textarea
                  required
                  rows={2}
                  placeholder="清晰描述当前系统缺失或设计缺陷..."
                  value={formCurrentIssue}
                  onChange={e => setFormCurrentIssue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">影响范围 (用户/订单/金额/人工)：</label>
                  <input
                    type="text"
                    placeholder="例如：日均 300+ 笔订单，影响 GMV ¥4.2万"
                    value={formImpact}
                    onChange={e => setFormImpact(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">当前替代处理方式：</label>
                  <input
                    type="text"
                    placeholder="例如：客服专席手动改派，耗时 5 分钟"
                    value={formWorkaround}
                    onChange={e => setFormWorkaround(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">建议新增 / 优化什么系统能力：</label>
                <textarea
                  rows={2}
                  placeholder="阐述期望的技术产品解决方案..."
                  value={formSuggested}
                  onChange={e => setFormSuggested(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">预期指标效果 (上线后闭环验收标准)：</label>
                <input
                  type="text"
                  placeholder="例如：平均处理时效由 18 分钟缩短至 5 分钟以内，人工降低 70%"
                  value={formExpectedMetric}
                  onChange={e => setFormExpectedMetric(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  提报并录入需求池
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
