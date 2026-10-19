import React, { useState } from 'react';

export type ColumnCategory = 'all' | 'basic' | 'finance' | 'risk_ops';

export interface ColumnConfigItem {
  id: string;
  name: string;
  category: 'basic' | 'finance' | 'risk_ops';
  categoryLabel: string;
  description: string;
  visible: boolean;
  required?: boolean;
}

export const DEFAULT_USER_COLUMNS: ColumnConfigItem[] = [
  {
    id: 'uid_kyc',
    name: '用户UID',
    category: 'basic',
    categoryLabel: '基础身份',
    description: '展示用户唯一ID与一键复制功能',
    visible: true,
    required: true
  },
  {
    id: 'user_info',
    name: '用户昵称 / 注册账号 / 关联邮箱',
    category: 'basic',
    categoryLabel: '基础身份',
    description: '用户头像、昵称、注册手机号与脱敏关联邮箱',
    visible: true,
    required: true
  },
  {
    id: 'invite_code',
    name: '邀请码',
    category: 'basic',
    categoryLabel: '基础身份',
    description: '用户注册绑定的邀请码',
    visible: true
  },
  {
    id: 'tier',
    name: '会员等级',
    category: 'basic',
    categoryLabel: '基础身份',
    description: 'LV1 新客 ~ LV5 殿堂资深做市商分级阶梯标签',
    visible: true
  },
  {
    id: 'tags',
    name: '客服运营标签',
    category: 'risk_ops',
    categoryLabel: '运营与风控',
    description: '核心主力、大宗出卡、VIP专享、低频唤醒等精细化分层标签',
    visible: true
  },
  {
    id: 'channel_rep',
    name: '渠道归因 / 专职客服',
    category: 'risk_ops',
    categoryLabel: '运营与风控',
    description: '获客推广引流渠道与当前分配的专属客服经理或工单专员',
    visible: true
  },
  {
    id: 'gmv',
    name: '累计出卡总额',
    category: 'finance',
    categoryLabel: '交易与资金',
    description: '历史累计出卡成交人民币总额',
    visible: true
  },
  {
    id: 'trades',
    name: '成单笔数 / 核销率',
    category: 'finance',
    categoryLabel: '交易与资金',
    description: '累计成交订单笔数与平均成功核销达成率',
    visible: true
  },
  {
    id: 'last_card_time',
    name: '最近出卡时间',
    category: 'finance',
    categoryLabel: '交易与资金',
    description: '最近一笔出卡提交距离当前的相对时间或具体时点',
    visible: true
  },
  {
    id: 'status_risk',
    name: '账号状态 / 风控信誉',
    category: 'risk_ops',
    categoryLabel: '运营与风控',
    description: '正常/限制交易/冻结状态、反欺诈评级 Tier-A/B/C 及涉诉预警',
    visible: true
  },
  {
    id: 'points',
    name: '积点可用余额 (PTS)',
    category: 'finance',
    categoryLabel: '交易与资金',
    description: '用户当前账户可兑付流通的积点总额及换算',
    visible: false
  },
  {
    id: 'pending_settlement',
    name: '待结算款项 / 质押',
    category: 'finance',
    categoryLabel: '交易与资金',
    description: '在途待划拨结算款项及争议押款保证金',
    visible: false
  },
  {
    id: 'credit_score',
    name: '履约信用评分',
    category: 'risk_ops',
    categoryLabel: '运营与风控',
    description: '基于交易真实度、凭据合规与核销履约综合计算的 0-100 信用分',
    visible: false
  },
  {
    id: 'prefer_cards',
    name: '主力偏好卡种',
    category: 'risk_ops',
    categoryLabel: '运营与风控',
    description: '用户出卡频次最高的礼品卡品牌（如 Apple、Steam、Razer 等）',
    visible: false
  },
  {
    id: 'last_card_detail',
    name: '最近一笔卡单详情',
    category: 'finance',
    categoryLabel: '交易与资金',
    description: '展示最近出卡卡种名称、申报面值与即时核销状态',
    visible: false
  },
  {
    id: 'registered_info',
    name: '注册时间 / 活跃天数',
    category: 'basic',
    categoryLabel: '基础身份',
    description: '用户首次注册入驻平台的时间与连续活跃自然日',
    visible: false
  },
  {
    id: 'location_device',
    name: '归属地区 / 终端设备',
    category: 'basic',
    categoryLabel: '基础身份',
    description: '常用地理位置归属、登录设备型号及末次操作IP',
    visible: false
  }
];

interface UserColumnSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfigItem[];
  onSaveColumns: (newColumns: ColumnConfigItem[]) => void;
}

export const UserColumnSettingsModal: React.FC<UserColumnSettingsModalProps> = ({
  isOpen,
  onClose,
  columns,
  onSaveColumns
}) => {
  const [localColumns, setLocalColumns] = useState<ColumnConfigItem[]>(columns);
  const [activeCategory, setActiveCategory] = useState<ColumnCategory>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Sync state whenever opened
  React.useEffect(() => {
    if (isOpen) {
      setLocalColumns(columns);
      setSearchFilter('');
      setActiveCategory('all');
    }
  }, [isOpen, columns]);

  if (!isOpen) return null;

  // Toggle single column visibility
  const handleToggle = (id: string) => {
    setLocalColumns(prev =>
      prev.map(col => {
        if (col.id === id) {
          if (col.required) return col; // Locked required column
          return { ...col, visible: !col.visible };
        }
        return col;
      })
    );
  };

  // Reordering helpers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setLocalColumns(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === localColumns.length - 1) return;
    setLocalColumns(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Preset switchers
  const applyPreset = (preset: 'default' | 'finance' | 'risk' | 'all') => {
    if (preset === 'default') {
      setLocalColumns(DEFAULT_USER_COLUMNS);
      return;
    }

    if (preset === 'finance') {
      const financeIds = new Set(['uid_kyc', 'user_info', 'tier', 'gmv', 'trades', 'points', 'pending_settlement', 'last_card_detail', 'status_risk']);
      setLocalColumns(prev =>
        prev.map(col => ({
          ...col,
          visible: col.required || financeIds.has(col.id)
        }))
      );
      return;
    }

    if (preset === 'risk') {
      const riskIds = new Set(['uid_kyc', 'user_info', 'tier', 'status_risk', 'credit_score', 'prefer_cards', 'last_card_detail', 'location_device', 'channel_rep']);
      setLocalColumns(prev =>
        prev.map(col => ({
          ...col,
          visible: col.required || riskIds.has(col.id)
        }))
      );
      return;
    }

    if (preset === 'all') {
      setLocalColumns(prev => prev.map(col => ({ ...col, visible: true })));
    }
  };

  // Filter columns based on active category and search
  const displayedColumnsWithIndex = localColumns
    .map((col, index) => ({ col, originalIndex: index }))
    .filter(({ col }) => {
      if (activeCategory !== 'all' && col.category !== activeCategory) {
        return false;
      }
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        const matchName = col.name.toLowerCase().includes(query);
        const matchDesc = col.description.toLowerCase().includes(query);
        const matchCat = col.categoryLabel.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      return true;
    });

  const visibleCount = localColumns.filter(c => c.visible).length;
  const totalCount = localColumns.length;

  const handleSave = () => {
    onSaveColumns(localColumns);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-2xs">
              <span className="material-symbols-outlined text-[20px]">view_column</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">自定义出卡用户列表显示列</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-code-token font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  已启用 {visibleCount} / {totalCount} 列
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                勾选需要呈现在账本大表中的字段，支持上下调整展示顺序并本地自动持久化
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Quick Presets & Search Bar */}
        <div className="p-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-500 font-semibold text-[11px] uppercase mr-1">快捷模板:</span>
            <button
              onClick={() => applyPreset('default')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md border border-slate-200 shadow-2xs font-medium transition-colors cursor-pointer"
            >
              默认推荐 (9列)
            </button>
            <button
              onClick={() => applyPreset('finance')}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 rounded-md border border-slate-200 shadow-2xs font-medium transition-colors cursor-pointer"
            >
              💰 交易财务视角
            </button>
            <button
              onClick={() => applyPreset('risk')}
              className="px-2.5 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 rounded-md border border-slate-200 shadow-2xs font-medium transition-colors cursor-pointer"
            >
              🛡️ 风控合规视角
            </button>
            <button
              onClick={() => applyPreset('all')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 shadow-2xs font-medium transition-colors cursor-pointer"
            >
              全选展开 (16列)
            </button>
          </div>

          {/* Search filter input */}
          <div className="relative shrink-0">
            <input
              type="text"
              placeholder="搜索列名或字段说明..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full md:w-52 pl-7 pr-6 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400"
            />
            <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 text-[14px]">
              search
            </span>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs Strip */}
        <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部字段 ({localColumns.length})
          </button>
          <button
            onClick={() => setActiveCategory('basic')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeCategory === 'basic'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <span>🏷️ 基础身份信息</span>
            <span className="text-[10px] font-bold">
              ({localColumns.filter(c => c.category === 'basic').length})
            </span>
          </button>
          <button
            onClick={() => setActiveCategory('finance')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeCategory === 'finance'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>💰 交易与资金数据</span>
            <span className="text-[10px] font-bold">
              ({localColumns.filter(c => c.category === 'finance').length})
            </span>
          </button>
          <button
            onClick={() => setActiveCategory('risk_ops')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeCategory === 'risk_ops'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <span>🛡️ 运营与风控信誉</span>
            <span className="text-[10px] font-bold">
              ({localColumns.filter(c => c.category === 'risk_ops').length})
            </span>
          </button>
        </div>

        {/* Scrollable Column List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[440px]">
          {displayedColumnsWithIndex.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">search_off</span>
              <p className="text-xs">未找到符合搜索条件的字段</p>
            </div>
          ) : (
            displayedColumnsWithIndex.map(({ col, originalIndex }) => {
              const isLocked = !!col.required;
              return (
                <div
                  key={col.id}
                  onClick={() => !isLocked && handleToggle(col.id)}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    col.visible
                      ? 'bg-white border-blue-200/90 shadow-2xs hover:border-blue-300'
                      : 'bg-slate-50/70 border-slate-200/60 opacity-60 hover:opacity-100'
                  } ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {/* Left: Checkbox, Name, Badge, Description */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      disabled={isLocked}
                      onChange={() => handleToggle(col.id)}
                      className={`w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 ${
                        isLocked ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer'
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${col.visible ? 'text-slate-900' : 'text-slate-500'}`}>
                          {col.name}
                        </span>

                        {/* Category Badge */}
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                          col.category === 'basic'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : col.category === 'finance'
                            ? 'bg-amber-50 text-amber-800 border-amber-100'
                            : 'bg-purple-50 text-purple-800 border-purple-100'
                        }`}>
                          {col.categoryLabel}
                        </span>

                        {/* Locked Badge */}
                        {isLocked && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">lock</span>
                            必选保留列
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {col.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Reorder Up / Down Buttons */}
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleMoveUp(originalIndex)}
                      disabled={originalIndex === 0}
                      className={`p-1 rounded border text-xs transition-colors cursor-pointer ${
                        originalIndex === 0
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                      title="向前移动列展示顺序"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                    <button
                      onClick={() => handleMoveDown(originalIndex)}
                      disabled={originalIndex === localColumns.length - 1}
                      className={`p-1 rounded border text-xs transition-colors cursor-pointer ${
                        originalIndex === localColumns.length - 1
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                      title="向后移动列展示顺序"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => setLocalColumns(DEFAULT_USER_COLUMNS)}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            <span>恢复系统默认列排布</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-medium transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>保存并应用偏好 ({visibleCount}列)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
