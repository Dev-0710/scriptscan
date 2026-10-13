import { Activity, Server, FileText, Target, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function BatchAnalytics() {
  return (
    <div className="p-3 sm:p-6 bg-slate-50 min-h-full overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Batch Queue &amp; Analytics</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Health: 99.8% Uptime
              </span>
              <span className="hidden sm:inline">• Cluster: eu-central-v100-pool</span>
              <span className="hidden md:inline">• Nodes: 24/24</span>
            </div>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto shrink-0">
            Trigger New Batch
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-semibold uppercase mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Throughput
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">84,290</div>
            <div className="text-xs sm:text-sm text-green-600 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +14.2% vs last
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-semibold uppercase mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> CER
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">1.18%</div>
            <div className="text-xs sm:text-sm text-green-600 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1 rotate-90" /> -0.34% improvement
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-semibold uppercase mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> WER
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">2.76%</div>
            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[97%]"></div>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-semibold uppercase mb-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> GPU Perf
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">142 <span className="text-sm font-normal text-gray-500">p/min</span></div>
            <div className="text-xs text-gray-500 mt-1">Processing throughput</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Error Rate Chart */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Error Rate Trajectory (Epochs 1–12)</h3>
            <div className="h-40 sm:h-48 border-b border-l border-gray-200 relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 Q20,60 40,40 T100,20" fill="none" stroke="#6366f1" strokeWidth="3" />
                <path d="M0,90 Q30,70 60,50 T100,40" fill="none" stroke="#22c55e" strokeWidth="3" />
              </svg>
              <div className="absolute bottom-[-20px] left-0 text-[10px] text-gray-400">Batch B-8800</div>
              <div className="absolute bottom-[-20px] right-0 text-[10px] text-gray-400">Current</div>
            </div>
            <div className="flex gap-4 mt-6 text-xs text-gray-500 justify-center">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> CER (%)</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> WER (%)</div>
            </div>
          </div>

          {/* Confidence Histogram */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Confidence Histogram <span className="text-xs font-normal text-gray-500 ml-2">N=1.84M Tokens</span>
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-green-700">&gt; 90% (High Confidence)</span>
                  <span className="text-gray-500">92.0%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[92%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-indigo-700">70% – 90% (Acceptable)</span>
                  <span className="text-gray-500">6.0%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 w-[6%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-red-700">&lt; 70% (Flagged Manual Review)</span>
                  <span className="text-gray-500">2.0%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[2%]"></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Manual QA: 368 pages
                </div>
                <button className="text-indigo-600 text-sm font-medium hover:underline">Inspect →</button>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Table — scrollable on mobile */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Batch Queue Manager</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[520px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-semibold">Job ID</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">Dataset</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold hidden sm:table-cell">Volume</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">Status &amp; Progress</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 sm:px-6 py-4 font-medium text-indigo-600">#B-8841</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-900">Vatican Archives Cursive Latin</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-600 hidden sm:table-cell">4,200 pages</td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 sm:w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-[74%] h-full bg-indigo-600"></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">74%</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <button className="text-gray-500 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded text-xs font-semibold">Pause</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 sm:px-6 py-4 font-medium text-indigo-600">#B-8839</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-900">University Lab Notebooks 1940–1960</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-600 hidden sm:table-cell">1,150 pages</td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">Completed</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <button className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-xs font-semibold shadow-sm">Export</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
