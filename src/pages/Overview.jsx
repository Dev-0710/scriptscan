import { Play, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Overview() {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 h-full">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-12">
        <div className="max-w-5xl mx-auto flex gap-8 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-4 border border-indigo-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              v3.2 BENCHMARK RELEASED
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Turn Historical Folios and Cursive Notes into <span className="text-indigo-600">Precision Text at Scale</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Enterprise handwritten character recognition engine combining calibrated ResNet-50 encoders, bi-directional LSTM spatial decoders, and KenLM 5-gram linguistic rescoring. Built for archivists, legal discovery, and ML infrastructure teams.
            </p>
            <div className="flex gap-4">
              <Link to="/workspace" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-200">
                <Play className="w-4 h-4 fill-current" /> Launch Interactive Workspace
              </Link>
              <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all">
                <FileText className="w-4 h-4" /> Read Whitepaper
              </button>
            </div>
          </div>
          <div className="flex-1 hidden lg:block">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white p-2">
               <img src="/demo-manuscript.png" alt="Demo" className="w-full h-64 object-cover rounded-lg" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
               <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
                 <div className="text-xs font-semibold text-gray-500 mb-1">LIVE DECODING</div>
                 <div className="font-mono text-sm text-gray-800">"...dedi concessi et hac presenti carta mea confirmavi Roberto de..."</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-5xl mx-auto py-12 px-8">
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-indigo-600 mb-1">98.82%</div>
            <div className="text-sm font-semibold text-gray-900">Recognition Accuracy</div>
            <div className="text-xs text-gray-500 mt-1">Standardized IAM Handwriting database</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-indigo-600 mb-1">42 ms</div>
            <div className="text-sm font-semibold text-gray-900">Line Segmentation Latency</div>
            <div className="text-xs text-gray-500 mt-1">TensorRT accelerated on NVIDIA A100</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-indigo-600 mb-1">120+</div>
            <div className="text-sm font-semibold text-gray-900">Handwriting Styles &amp; Dialects</div>
            <div className="text-xs text-gray-500 mt-1">Latin, Gothic, Middle English, Palmer</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-indigo-600 mb-1">100%</div>
            <div className="text-sm font-semibold text-gray-900">NARA Archival Standard</div>
            <div className="text-xs text-gray-500 mt-1">FADGI 4-Star TIFF compliance pipeline</div>
          </div>
        </div>
      </div>
    </div>
  );
}
