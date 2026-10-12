import React, { useState } from 'react';

export interface FinancialColumnConfig {
  gmv: boolean;
  spreadAmount: boolean;
  spreadRate: boolean;
  commission: boolean;
  subsidy: boolean;
  badDebt: boolean;
  gatewayFee: boolean;
  netProfit: boolean;
  netMarginRate: boolean;
  profitShare: boolean;
  evaluationTag: boolean;
}

export const DEFAULT_FINANCIAL_COLUMN_CONFIG: FinancialColumnConfig = {
  gmv: true,
  spreadAmount: true,
  spreadRate: true,
  commission: true,
  subsidy: true,
  badDebt: true,
  gatewayFee: true,
  netProfit: true,
  netMarginRate: true,
  profitShare: true,
  evaluationTag: true,
};

interface FinancialColumnConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: FinancialColumnConfig;
  onSave: (cols: FinancialColumnConfig) => void;
  onShowToast: (msg: string) => void;
}

export const FinancialColumnConfigModal: React.FC<FinancialColumnConfigModalProps> = ({
  isOpen,
  onClose,
  columns,
  onSave,
  onShowToast,
}) => {
  const [localCols, setLocalCols] = useState<FinancialColumnConfig>(columns);

  if (!isOpen) return null;

  const columnDefinitions: { key: keyof FinancialColumnConfig; label: string; group: string; desc: string }[] = [
    { key: 'gmv', label: '成交 GMV (USD)', group: '规模口径', desc: '全网交易总流水' },
    { key: 'spreadAmount', label: '交易直接利差', group: '收入口径', desc: '平台收卡折率与商户承揽折率直接价差' },
    { key: 'spreadRate', label: '利差率 (%)', group: '收入口径', desc: '综合利差与 GMV 比例 (Take Rate)' },
    { key: 'commission', label: '推广佣金', group: '直接经营成本', desc: '支付给推荐人/代理的佣金冲扣' },
    { key: 'subsidy', label: '营销活动补贴', group: '直接经营成本', desc: '卡券补贴与活动打折成本' },
    { key: 'badDebt', label: '售后与坏账损耗', group: '直接经营成本', desc: '争议退款、空卡与欺诈冲抵' },
    { key: 'gatewayFee', label: '直接网关费', group: '直接经营成本', desc: '支付渠道与收单通道费' },
    { key: 'netProfit', label: '平台经营毛利 (USD)', group: '毛利效益', desc: '利差扣除直接成本后的净经营贡献' },
    { key: 'netMarginRate', label: '经营毛利率 (%)', group: '毛利效益', desc: '经营毛利占 GMV 比例' },
    { key: 'profitShare', label: '毛利贡献占比', group: '贡献结构', desc: '占平台总毛利的分成比例' },
    { key: 'evaluationTag', label: '经营评价标签', group: '风控标签', desc: '现金牛/高毛利/走量防御/警示等' },
  ];

  const handleToggle = (key: keyof FinancialColumnConfig) => {
    setLocalCols((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleReset = () => {
    setLocalCols(DEFAULT_FINANCIAL_COLUMN_CONFIG);
    onShowToast('已重置为系统标准 13 列指标集');
  };

  const handleApply = () => {
    onSave(localCols);
    onShowToast('自定义指标列配置已生效');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-container-low/80 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">view_column</span>
            <div>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">自定义指标列 (13项)</h3>
              <p className="text-[11px] text-on-surface-variant">自由定制财务单元经济学多维报表呈现列</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Column items list */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 gap-2">
            {columnDefinitions.map((col) => {
              const checked = localCols[col.key];
              return (
                <label
                  key={col.key}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                    checked
                      ? 'bg-primary/5 border-primary/30 text-on-surface'
                      : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggle(col.key)}
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-on-surface">{col.label}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-code-token bg-surface-container text-outline">
                          {col.group}
                        </span>
                      </div>
                      <p className="text-[11px] text-outline mt-0.5">{col.desc}</p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-[18px] ${checked ? 'text-primary' : 'text-outline-variant'}`}>
                    {checked ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-container-low/40 border-t border-outline-variant/20 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container text-xs transition-colors cursor-pointer"
          >
            恢复默认
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg hover:bg-surface-container text-outline text-xs transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 bg-primary text-on-primary hover:bg-primary/90 text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              应用配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
