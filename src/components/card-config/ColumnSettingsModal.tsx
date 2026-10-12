import React, { useState } from 'react';

interface ColumnSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveColumns: (settings: Record<string, boolean>) => void;
}

export const ColumnSettingsModal: React.FC<ColumnSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveColumns,
}) => {
  const [columns, setColumns] = useState({
    sku: true,
    brand: true,
    geo: true,
    faceValue: true,
    regex: true,
    ocr: true,
    status: true,
    actions: true,
  });

  if (!isOpen) return null;

  const handleToggle = (col: string) => {
    setColumns((prev) => ({ ...prev, [col]: !prev[col as keyof typeof prev] }));
  };

  const handleSave = () => {
    onSaveColumns(columns);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[20px]">view_column</span>
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">自定义主数据列表显示字段</h3>
              <span className="font-code-token text-[11px] text-slate-500">
                COLUMN PREFERENCES
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 text-xs text-slate-700">
          <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50">
            <span>卡种编码 (SKU) 与内部ID</span>
            <input
              type="checkbox"
              checked={columns.sku}
              disabled
              className="rounded text-blue-600 accent-blue-600 cursor-not-allowed opacity-60"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50">
            <span>卡品牌定义与本地化名称</span>
            <input
              type="checkbox"
              checked={columns.brand}
              disabled
              className="rounded text-blue-600 accent-blue-600 cursor-not-allowed opacity-60"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50">
            <span>发行属地与结算币种</span>
            <input
              type="checkbox"
              checked={columns.geo}
              onChange={() => handleToggle('geo')}
              className="rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50">
            <span>支持面值模型与区间阶梯</span>
            <input
              type="checkbox"
              checked={columns.faceValue}
              onChange={() => handleToggle('faceValue')}
              className="rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50">
            <span>卡密校验正则与物料形态</span>
            <input
              type="checkbox"
              checked={columns.regex}
              onChange={() => handleToggle('regex')}
              className="rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50">
            <span>OCR 识别与风控核验能力</span>
            <input
              type="checkbox"
              checked={columns.ocr}
              onChange={() => handleToggle('ocr')}
              className="rounded text-blue-600 accent-blue-600 cursor-pointer"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer"
          >
            应用偏好
          </button>
        </div>
      </div>
    </div>
  );
};
