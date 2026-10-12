import React, { useState } from 'react';

interface UserSegmentsTabProps {
  showToast: (msg: string) => void;
  onNavigateToGrowth?: () => void;
}

export interface SegmentItem {
  id: string;
  name: string;
  type: '动态人群' | '静态快照';
  // 分群基于：标签 + 属性 + 行为 + 交易
  conditions: {
    tags: string[]; // 标签
    attributes: string; // 属性 (例如 国家 US, KYC 状态)
    behavior: string; // 行为 (例如 注册时间, 登录频次)
    transactions: string; // 交易 (例如 Apple US >= 5笔, GMV >= $5000)
  };
  userCount: number;
  linkedModules: Array<'增长运营' | '会员运营' | '活动运营'>; // 被哪些模块直接引用
  description: string;
  lastCalculatedAt: string;
}

const INITIAL_SEGMENTS: SegmentItem[] = [
  {
    id: 'SEG-01',
    name: '注册 7 天未首单出卡新人',
    type: '动态人群',
    conditions: {
      tags: ['新用户'],
      attributes: '国家: 全部 ｜ 渠道: 全部',
      behavior: '注册时间 >= 7 天 且 活跃登录 >= 1 次',
      transactions: '累计卡单数 = 0 笔'
    },
    userCount: 4280,
    linkedModules: ['增长运营', '活动运营'],
    description: '用于首单促活专项，避免各模块重复圈人',
    lastCalculatedAt: '14:38:00'
  },
  {
    id: 'SEG-02',
    name: '30 天未复购沉寂出卡人',
    type: '动态人群',
    conditions: {
      tags: ['已首单', '成长期'],
      attributes: 'KYC 状态: 基础或高级',
      behavior: '近 30 天无新卡单提交',
      transactions: '历史交易笔数 >= 1 笔'
    },
    userCount: 2950,
    linkedModules: ['增长运营', '活动运营', '会员运营'],
    description: '老客二次激活加息券直达',
    lastCalculatedAt: '14:38:00'
  },
  {
    id: 'SEG-03',
    name: '最近 90 天 Apple US 交易 >= 5 笔',
    type: '动态人群',
    conditions: {
      tags: ['高价值', '活跃用户'],
      attributes: '国家: US ｜ 偏好卡种: Apple Gift Card',
      behavior: '近 90 天高频访问',
      transactions: 'Apple US 成功结算笔数 >= 5 笔 且 GMV >= $1,000'
    },
    userCount: 1840,
    linkedModules: ['增长运营', '会员运营'],
    description: '核心卡种大宗撮合保价合约专线',
    lastCalculatedAt: '14:38:00'
  },
  {
    id: 'SEG-04',
    name: '高价值且最近活跃下降 (流失预警)',
    type: '动态人群',
    conditions: {
      tags: ['高价值', '活跃下降', '保级告警'],
      attributes: '会员等级: VIP3 / VIP4 / VIP5',
      behavior: '近 14 天活跃度环比下降超 50%',
      transactions: '历史总 GMV >= $5,000'
    },
    userCount: 320,
    linkedModules: ['增长运营', '会员运营'],
    description: '触发 VIP 专属客服电话与 1V1 特权挽留',
    lastCalculatedAt: '14:38:00'
  }
];

export const UserSegmentsTab: React.FC<UserSegmentsTabProps> = ({ showToast, onNavigateToGrowth }) => {
  const [segments, setSegments] = useState<SegmentItem[]>(INITIAL_SEGMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 新建分群表单
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'动态人群' | '静态快照'>('动态人群');
  const [newTags, setNewTags] = useState('新用户');
  const [newAttrs, setNewAttrs] = useState('国家: US');
  const [newBehavior, setNewBehavior] = useState('近 7 天无交易');
  const [newTxn, setNewTxn] = useState('交易笔数 = 0');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('请输入人群分群名称！');
      return;
    }
    const item: SegmentItem = {
      id: `SEG-0${segments.length + 1}`,
      name: newName.trim(),
      type: newType,
      conditions: {
        tags: [newTags],
        attributes: newAttrs,
        behavior: newBehavior,
        transactions: newTxn
      },
      userCount: 850,
      linkedModules: ['增长运营', '活动运营'],
      description: newDesc || '自定义多维圈选人群',
      lastCalculatedAt: new Date().toTimeString().split(' ')[0]
    };
    setSegments([item, ...segments]);
    setIsModalOpen(false);
    setNewName('');
    showToast(`✅ 用户分群【${item.name}】创建成功！可直接被【增长运营】、【会员运营】与【活动运营】全平台引用。`);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 顶部标题与多维分群机制说明卡 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">hub</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">用户分群中枢（基于：标签 + 属性 + 行为 + 交易）</h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                全局统一圈人底座
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              形成动态/静态人群包。<strong className="text-slate-700">人群可被【增长运营】、【会员运营】、【活动运营】直接引用，避免各业务模块重复圈人。</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">group_add</span>
          <span>新建多维人群包</span>
        </button>
      </div>

      {/* 核心示例分群卡片矩阵 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {segments.map(seg => (
          <div key={seg.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                    {seg.type}
                  </span>
                  <strong className="text-slate-900 text-sm">{seg.name}</strong>
                </div>
                <span className="font-mono text-blue-700 font-black text-sm">
                  {seg.userCount.toLocaleString()} 人
                </span>
              </div>

              <p className="text-slate-500 text-xs">{seg.description}</p>

              {/* 4 维圈选组合条件 */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                <div>🏷️ 标签条件: <strong className="text-slate-800 font-sans">{seg.conditions.tags.join(', ')}</strong></div>
                <div>👤 属性条件: <strong className="text-slate-700 font-sans">{seg.conditions.attributes}</strong></div>
                <div>⚡ 行为条件: <strong className="text-slate-700 font-sans">{seg.conditions.behavior}</strong></div>
                <div>💳 交易条件: <strong className="text-blue-700 font-sans">{seg.conditions.transactions}</strong></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400">已授权引用:</span>
                {seg.linkedModules.map(m => (
                  <span key={m} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                    {m}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  showToast(`人群【${seg.name}】已成功注入增长/活动营销执行队列！`);
                  if (onNavigateToGrowth) onNavigateToGrowth();
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
              >
                引用触达
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 新建多维分群模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[20px]">hub</span>
                <h3 className="font-bold text-slate-900 text-sm">创建多维用户分群（标签+属性+行为+交易）</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSegment} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">人群包名称 (Segment Name):</label>
                <input
                  type="text"
                  placeholder="例如：最近90天Steam消费超$500活跃群"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">人群类型:</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="动态人群">动态人群 (每日定时重新计算并增删)</option>
                  <option value="静态快照">静态快照 (当前时间点锁定用户名单)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">1. 标签组合:</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">2. 属性条件:</label>
                  <input
                    type="text"
                    value={newAttrs}
                    onChange={e => setNewAttrs(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">3. 行为特征:</label>
                  <input
                    type="text"
                    value={newBehavior}
                    onChange={e => setNewBehavior(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">4. 交易事实:</label>
                  <input
                    type="text"
                    value={newTxn}
                    onChange={e => setNewTxn(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">业务用途与说明:</label>
                <input
                  type="text"
                  placeholder="说明该人群适合由哪个运营模块承接"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  保存分群并授权模块引用
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
