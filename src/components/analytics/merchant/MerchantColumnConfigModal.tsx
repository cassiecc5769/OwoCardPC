import React from 'react';

export interface ColumnOption {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean;
}

interface MerchantColumnConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnOption[];
  onToggleColumn: (key: string) => void;
  onResetColumns: () => void;
}

export const MerchantColumnConfigModal: React.FC<MerchantColumnConfigModalProps> = ({
  isOpen,
  onClose,
  columns,
  onToggleColumn,
  onResetColumns,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-container-low/80 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">view_column</span>
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">
              自定义多维报表指标列
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* List of columns */}
        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-on-surface-variant mb-3">
            勾选需要展示的履约、风控与时效监控指标列，设置将自动持久化于当前报表视图：
          </p>
          <div className="grid grid-cols-2 gap-2">
            {columns.map((col) => (
              <label
                key={col.key}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                  col.visible
                    ? 'bg-primary/5 border-primary/30 text-on-surface font-medium'
                    : 'bg-surface-container-low/40 border-outline-variant/20 text-outline'
                }`}
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  disabled={col.required}
                  onChange={() => onToggleColumn(col.key)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="truncate">{col.label}</span>
                {col.required && (
                  <span className="text-[10px] text-outline ml-auto bg-surface-container px-1 rounded">
                    固定
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-container-low/40 border-t border-outline-variant/20 flex items-center justify-between">
          <button
            onClick={onResetColumns}
            className="text-xs text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            恢复默认配置
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary text-on-primary hover:bg-primary/90 text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            保存并应用
          </button>
        </div>
      </div>
    </div>
  );
};
