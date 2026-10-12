import React, { useState } from 'react';

interface UserTagsTabProps {
  showToast: (msg: string) => void;
}

export interface SystemTagItem {
  id: string;
  name: string;
  category: '系统标签';
  autoRule: string;
  userCount: number;
  status: '自动计算中' | '正常生效';
  lastUpdatedAt: string;
  badgeClass: string;
}

export interface BusinessTagItem {
  id: string;
  name: string;
  category: '业务标签';
  // 业务标签必须记录：来源 ｜ 规则 ｜ 更新时间 ｜ 是否自动更新
  source: string; // 来源 (例如 运营手工打标 / 渠道导入 / 客服工单打标)
  rule: string; // 规则
  updatedAt: string; // 更新时间
  isAutoUpdate: boolean; // 是否自动更新
  operator: string; // 维护人员 (权限控制)
  userCount: number;
  badgeClass: string;
}

// 系统标签 (自动生成：新用户 ｜ 已首单 ｜ 高价值 ｜ 活跃 ｜ 活跃下降 ｜ 沉默 ｜ 流失 ｜ 风险用户)
const INITIAL_SYSTEM_TAGS: SystemTagItem[] = [
  { id: 'ST-01', name: '新用户', category: '系统标签', autoRule: '注册时间 <= 7 天，无论是否完成交易', userCount: 4280, status: '自动计算中', lastUpdatedAt: '14:38:00', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'ST-02', name: '已首单', category: '系统标签', autoRule: '历史上首次成功结算任意卡单', userCount: 13220, status: '自动计算中', lastUpdatedAt: '14:38:00', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'ST-03', name: '高价值', category: '系统标签', autoRule: '累计 GMV >= $5,000 且 售后争议率 < 1%', userCount: 820, status: '自动计算中', lastUpdatedAt: '14:38:00', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'ST-04', name: '活跃', category: '系统标签', autoRule: '近 30 天内至少提交并成功核销 2 笔卡单', userCount: 18650, status: '自动计算中', lastUpdatedAt: '14:38:00', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'ST-05', name: '活跃下降', category: '系统标签', autoRule: '近 14 天出卡频次或交易额环比下降超 40%', userCount: 1680, status: '自动计算中', lastUpdatedAt: '14:38:00', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'ST-06', name: '沉默', category: '系统标签', autoRule: '连续 60 天无登录且无出卡交互行为', userCount: 5600, status: '自动计算中', lastUpdatedAt: '14:38:00', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'ST-07', name: '流失', category: '系统标签', autoRule: '超过 120 天无任何登录与交易，召回无响应', userCount: 3100, status: '自动计算中', lastUpdatedAt: '14:38:00', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'ST-08', name: '风险用户', category: '系统标签', autoRule: '命中异地 IP 撞卡、黑卡拦截或风控信誉 Tier-C', userCount: 240, status: '自动计算中', lastUpdatedAt: '14:38:00', badgeClass: 'bg-rose-600 text-white font-bold' }
];

// 业务标签 (有权限运营人员维护)
const INITIAL_BUSINESS_TAGS: BusinessTagItem[] = [
  { id: 'BT-01', name: 'KOL粉丝专属', category: '业务标签', source: '海外KOL一组推广导入', rule: '通过 YouTube 专属兑换邀请码注册', updatedAt: '2026-10-05 10:30', isAutoUpdate: false, operator: '运营主管 (张伟)', userCount: 3820, badgeClass: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'BT-02', name: '大宗实体卡批发商', category: '业务标签', source: '商务拓展人工资质认证', rule: '通过大客户白名单审核并签署线下合约', updatedAt: '2026-10-04 16:20', isAutoUpdate: false, operator: '商务总监 (Sarah)', userCount: 180, badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' },
  { id: 'BT-03', name: '夜间交易偏好者', category: '业务标签', source: '行为画像自动打标规则引擎', rule: '80% 交易时间集中在 22:00 - 04:00 (WAT)', updatedAt: '2026-10-05 02:00', isAutoUpdate: true, operator: '系统规则守护', userCount: 2950, badgeClass: 'bg-slate-100 text-slate-800 border-slate-200' },
  { id: 'BT-04', name: '客诉关怀白名单', category: '业务标签', source: '客服工单系统联动打标', rule: '历史出现重大争议但已友好调解，享优先放款', updatedAt: '2026-10-03 11:45', isAutoUpdate: false, operator: '客服主管 (李倩)', userCount: 65, badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
];

export const UserTagsTab: React.FC<UserTagsTabProps> = ({ showToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<'system' | 'business'>('system');
  const [systemTags] = useState<SystemTagItem[]>(INITIAL_SYSTEM_TAGS);
  const [businessTags, setBusinessTags] = useState<BusinessTagItem[]>(INITIAL_BUSINESS_TAGS);

  // 新建业务标签模态框
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagSource, setNewTagSource] = useState('运营专员手工录入');
  const [newTagRule, setNewTagRule] = useState('');
  const [newTagAuto, setNewTagAuto] = useState(false);

  const handleCreateBusinessTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || !newTagRule.trim()) {
      showToast('请完整填写业务标签名称与判定规则！');
      return;
    }
    const item: BusinessTagItem = {
      id: `BT-0${businessTags.length + 1}`,
      name: newTagName.trim(),
      category: '业务标签',
      source: newTagSource.trim(),
      rule: newTagRule.trim(),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isAutoUpdate: newTagAuto,
      operator: '当前操作员 (运营专员)',
      userCount: 0,
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    setBusinessTags([item, ...businessTags]);
    setIsModalOpen(false);
    setNewTagName('');
    setNewTagRule('');
    showToast(`✅ 业务标签【${item.name}】已成功创建并记录留痕信息！`);
  };

  return (
    <div className="flex flex-col space-y-4 text-xs text-slate-800 antialiased">
      {/* 顶部标题与标签分类规范说明卡 */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <span className="material-symbols-outlined text-[22px]">label</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-sm">用户标签体系（系统标签 ｜ 业务标签）</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                全域底层打标中枢
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              <strong className="text-slate-700">系统标签</strong>（自动生成：新用户 ｜ 已首单 ｜ 高价值 ｜ 活跃 ｜ 活跃下降 ｜ 沉默 ｜ 流失 ｜ 风险用户）。
              <strong className="text-slate-700 ml-1">业务标签</strong>（运营维护，严格留存：来源 ｜ 规则 ｜ 更新时间 ｜ 是否自动更新）。
            </p>
          </div>
        </div>

        {/* 标签类型切换 */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveSubTab('system')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'system' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            系统标签 (8大内置)
          </button>
          <button
            onClick={() => setActiveSubTab('business')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'business' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            业务标签 ({businessTags.length})
          </button>
        </div>
      </div>

      {/* 视图 1: 系统标签 (自动生成 8 大内置) */}
      {activeSubTab === 'system' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-blue-600">smart_toy</span>
              <span>系统自动生成标签（新用户 ｜ 已首单 ｜ 高价值 ｜ 活跃 ｜ 活跃下降 ｜ 沉默 ｜ 流失 ｜ 风险用户）</span>
            </h3>
            <span className="text-slate-400 font-mono text-xs">引擎实时判定 · 零人工介入</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50/90 font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 h-9">
                  <th className="py-2.5 px-3">标签编码 & 名称</th>
                  <th className="py-2.5 px-3">系统自动化判定规则</th>
                  <th className="py-2.5 px-2 font-mono text-center">覆盖用户数</th>
                  <th className="py-2.5 px-2 text-center">计算状态</th>
                  <th className="py-2.5 px-3 font-mono text-right">最新重算时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {systemTags.map(tag => (
                  <tr key={tag.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{tag.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${tag.badgeClass}`}>
                          🏷️ {tag.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">{tag.autoRule}</td>
                    <td className="py-2.5 px-2 font-mono font-bold text-blue-700 text-center">
                      {tag.userCount.toLocaleString()} 人
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium text-[10px] border border-emerald-200">
                        {tag.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-right">{tag.lastUpdatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 视图 2: 业务标签 (必须记录：来源 ｜ 规则 ｜ 更新时间 ｜ 是否自动更新) */}
      {activeSubTab === 'business' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-indigo-600">tune</span>
                <span>业务标签管理（必须记录：来源 ｜ 规则 ｜ 更新时间 ｜ 是否自动更新）</span>
              </h3>
              <p className="text-slate-400 text-xs">有权限的运营人员维护，可直接被用户分群与增长策略引用</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs cursor-pointer flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>新建业务标签</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50/90 font-semibold text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200 h-9">
                  <th className="py-2.5 px-3">业务标签名称</th>
                  <th className="py-2.5 px-3">1. 标签来源</th>
                  <th className="py-2.5 px-3">2. 判定规则定义</th>
                  <th className="py-2.5 px-2 text-center">3. 是否自动更新</th>
                  <th className="py-2.5 px-3">维护人 (权限)</th>
                  <th className="py-2.5 px-2 font-mono text-center">覆盖人数</th>
                  <th className="py-2.5 px-3 font-mono text-right">4. 更新时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {businessTags.map(tag => (
                  <tr key={tag.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${tag.badgeClass}`}>
                        🏷️ {tag.name}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{tag.source}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{tag.rule}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tag.isAutoUpdate
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tag.isAutoUpdate ? '自动更新' : '手动维护'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{tag.operator}</td>
                    <td className="py-2.5 px-2 font-mono font-bold text-slate-900 text-center">
                      {tag.userCount.toLocaleString()} 人
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-right">{tag.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 新建模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[20px]">label</span>
                <h3 className="font-bold text-slate-900 text-sm">创建业务标签（严格留存四要素）</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateBusinessTag} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">标签名称 (Tag Name):</label>
                <input
                  type="text"
                  placeholder="例如：大宗出卡常客"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">1. 标签来源 (Source):</label>
                <input
                  type="text"
                  value={newTagSource}
                  onChange={e => setNewTagSource(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">2. 判定规则 (Rule Definition):</label>
                <textarea
                  rows={2}
                  placeholder="例如：单笔出卡面额超过 $1000 且 30 天内履约正常"
                  value={newTagRule}
                  onChange={e => setNewTagRule(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoUpdateCheck"
                  checked={newTagAuto}
                  onChange={e => setNewTagAuto(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="autoUpdateCheck" className="text-slate-700 font-medium cursor-pointer">
                  4. 启用基于规则引擎的每日自动重算更新
                </label>
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
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
                >
                  保存业务标签
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
