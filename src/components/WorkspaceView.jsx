import React, { useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

export default function WorkspaceView({ activeDocument }) {
  const segData = activeDocument?.segmentationData;
  const token = segData?.lines?.[0]?.tokens?.[0] || null;
  const confidence = token?.confidence ?? 0;
  const recognized = token?.text ?? '?';
  const candidates = token?.candidates ?? [];

  const [zoom, setZoom] = useState(1);
  const [showBBox, setShowBBox] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [chosen, setChosen] = useState(recognized);

  const bbox = token?.bbox; // [x, y, w, h]
  const imgW = segData?.image_dimensions?.width ?? 800;
  const imgH = segData?.image_dimensions?.height ?? 800;

  const isHigh = confidence >= 90;
  const confColor = isHigh ? '#10b981' : '#f59e0b';
  const confBg = isHigh ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700';

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">

      {/* ── Top toolbar ── */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-400">Documents /</span>
          <span className="text-white font-medium">{activeDocument?.filename}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors text-xs px-2"
            title="Reset zoom"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={showBBox}
              onChange={e => setShowBBox(e.target.checked)}
              className="rounded text-indigo-500"
            />
            BBox
          </label>
        </div>
      </div>

      {/* ── Main split layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Image viewer ── */}
        <div className="flex-1 bg-[#1a1a20] flex items-center justify-center overflow-auto p-6 min-w-0">
          <div
            className="relative"
            style={{
              width: imgW * zoom,
              height: imgH * zoom,
              flexShrink: 0,
            }}
          >
            {/* Document image */}
            <img
              src={activeDocument?.image}
              alt="Handwritten letter"
              className="w-full h-full object-contain select-none rounded shadow-2xl"
              draggable={false}
            />

            {/* Bounding-box overlay */}
            {showBBox && bbox && (
              <svg
                className="absolute inset-0 pointer-events-none"
                width={imgW * zoom}
                height={imgH * zoom}
                viewBox={`0 0 ${imgW} ${imgH}`}
              >
                <rect
                  x={bbox[0]}
                  y={bbox[1]}
                  width={bbox[2]}
                  height={bbox[3]}
                  fill="rgba(99,102,241,0.12)"
                  stroke={confColor}
                  strokeWidth={4}
                  rx={6}
                />
                {/* Confidence label inside bbox */}
                <text
                  x={bbox[0] + 8}
                  y={bbox[1] - 10}
                  fontSize={24}
                  fontWeight="bold"
                  fill={confColor}
                  fontFamily="monospace"
                >
                  {confidence.toFixed(1)}%
                </text>
              </svg>
            )}
          </div>
        </div>

        {/* ── Right: Recognition result panel ── */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.08)] shrink-0">

          {/* Panel header */}
          <div className="px-5 py-4 border-b border-gray-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-gray-800">Recognition Result</h3>
            <p className="text-xs text-gray-400 mt-0.5">Single character · CNN-BiLSTM-CTC</p>
          </div>

          <div className="flex-1 overflow-auto p-5 space-y-5">

            {/* ── Big recognized character display ── */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 py-8 gap-3">
              <div className="text-9xl font-bold text-indigo-700 select-none" style={{ fontFamily: 'Georgia, serif' }}>
                {chosen}
              </div>
              <div className={`text-xs font-semibold px-3 py-1 rounded-full border ${confBg}`}>
                {confidence.toFixed(1)}% confidence
              </div>
            </div>

            {/* ── Confidence bar ── */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Confidence Score</span>
                <span className="font-medium text-gray-700">{confidence.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${confidence}%`, background: confColor }}
                />
              </div>
            </div>

            {/* ── Status badge ── */}
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${confBg}`}>
              {isHigh
                ? <CheckCircle className="w-4 h-4 shrink-0" />
                : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span className="text-xs font-medium">
                {isHigh ? 'High confidence — accepted' : 'Review suggested'}
              </span>
            </div>

            {/* ── Alternative candidates ── */}
            {candidates.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Alternatives
                </p>
                <div className="flex flex-wrap gap-2">
                  {candidates.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => { setChosen(c); setAccepted(false); }}
                      className={`px-4 py-2 rounded-lg border text-lg font-bold transition-all ${
                        chosen === c
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Model info ── */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between"><span>Model</span><span className="font-medium text-gray-700">CNN-BiLSTM-CTC</span></div>
              <div className="flex justify-between"><span>Dataset</span><span className="font-medium text-gray-700">EMNIST Balanced</span></div>
              <div className="flex justify-between"><span>Characters</span><span className="font-medium text-gray-700">62 classes</span></div>
              <div className="flex justify-between"><span>Latency</span><span className="font-medium text-gray-700">12 ms</span></div>
            </div>
          </div>

          {/* ── Accept button ── */}
          <div className="p-4 border-t border-gray-100 shrink-0">
            <button
              onClick={() => setAccepted(true)}
              disabled={accepted}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                accepted
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {accepted ? `✓ Accepted as "${chosen}"` : `Accept "${chosen}"`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
