import React, { useState } from 'react';
import { MetricPillarData } from './types';

interface ExecutivePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MetricPillarData;
  timeRangeLabel: string;
}

export const ExecutivePdfModal: React.FC<ExecutivePdfModalProps> = ({
  isOpen,
  onClose,
  data,
  timeRangeLabel,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-slate-900">
                CardOps OS 平台经营全盘简报 (PDF预览)
              </h3>
              <p className="font-code-token text-xs text-slate-500 mt-0.5">
                EXECUTIVE BRIEFING REPORT · {timeRangeLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body - Printable Document Format */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 bg-slate-100/60">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>简报文件【CardOps_Executive_Briefing_20260919.pdf】已成功生成并下载！</span>
            </div>
          )}

          {/* Paper document sheet */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-[10px] font-label-caps uppercase text-blue-600 font-bold tracking-widest">
                  CONFIDENTIAL · 平台核心经营决策层密级
                </div>
                <h1 className="text-xl font-bold text-slate-900 mt-1">
                  CardOps OS 礼品卡流转平台经营决策报告
                </h1>
                <p className="text-slate-500 text-xs mt-0.5">
                  基准周期：{timeRangeLabel} · 生成节点：OP-01 (超级调度员)
                </p>
              </div>
              <div className="text-right font-code-token text-xs text-slate-400">
                <div>DOC NO: OP-REP-20260919</div>
                <div>STATUS: VERIFIED (99.98%)</div>
              </div>
            </div>

            {/* Strategic KPI Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10.5px] text-slate-500 font-medium">GMV 交易规模</span>
                <div className="text-lg font-bold font-numeric-stat text-slate-900 mt-0.5">
                  ${data.gmv.total.toLocaleString()}.00
                </div>
                <div className="text-[10.5px] text-emerald-600 font-semibold mt-0.5">
                  {data.gmv.momPercent} 环比
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10.5px] text-slate-500 font-medium">活跃买家客群</span>
                <div className="text-lg font-bold font-numeric-stat text-slate-900 mt-0.5">
                  {data.users.totalActive.toLocaleString()} 人
                </div>
                <div className="text-[10.5px] text-emerald-600 font-semibold mt-0.5">
                  {data.users.momPercent} 环比
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10.5px] text-slate-500 font-medium">在网承揽大商</span>
                <div className="text-lg font-bold font-numeric-stat text-slate-900 mt-0.5">
                  {data.merchants.onlineCount} 家
                </div>
                <div className="text-[10.5px] text-slate-500 mt-0.5">
                  负载 {data.merchants.loadRatio}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10.5px] text-slate-500 font-medium">综合净毛利率</span>
                <div className="text-lg font-bold font-numeric-stat text-blue-600 mt-0.5">
                  ${data.margin.netProfit.toLocaleString()}.00
                </div>
                <div className="text-[10.5px] text-blue-600 font-semibold mt-0.5">
                  净率 {data.margin.profitRate}
                </div>
              </div>
            </div>

            {/* Operational Highlights */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 border-l-2 border-blue-600 pl-2">
                核心运行纪要与归因摘要
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs leading-relaxed">
                <li>
                  <strong className="text-slate-800">流动性充盈：</strong>美区 Steam 促销拉升晚高峰 GMV 吞吐至 $142,650/小时，全网撮合平均延迟压降至 24.2ms。
                </li>
                <li>
                  <strong className="text-slate-800">品类集中度稳定：</strong>Apple Store 与 Steam Wallet 占总盘子 79.0%，其中 US 美区贡献 64.0% 交易流水。
                </li>
                <li>
                  <strong className="text-slate-800">获客裂变增强：</strong>推广人 Affiliate 裂变贡献 34% 流量，裂变加权获客比重达 58.0%，获客成本稳步下降。
                </li>
                <li>
                  <strong className="text-slate-800">风控预警响应：</strong>已针对 Apple UK 成功率波动与 Google Play 嫌疑争议订单设立先行垫付保护，系统风控规则库平稳拦截。
                </li>
              </ul>
            </div>

            {/* Signature blocks */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-[11px] text-slate-500">
              <div>
                <div>制表调度员：</div>
                <div className="font-semibold text-slate-800 mt-1">OP-01 (超级调度员)</div>
              </div>
              <div>
                <div>风控复核官：</div>
                <div className="font-semibold text-slate-800 mt-1">SEC-RISK (自动签名)</div>
              </div>
              <div>
                <div>系统版本号：</div>
                <div className="font-code-token text-slate-800 mt-1">CardOps Engine v4.12</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-1.5 font-code-token">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SHA-256 数据加密签名合规</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg font-medium transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>打印文档</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {downloading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>生成并下载中...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>下载 PDF 报告</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
