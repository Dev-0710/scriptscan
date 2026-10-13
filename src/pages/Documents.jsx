import { useState } from 'react';
import { useDocumentContext } from '../context/DocumentContext';
import { Search, Filter, UploadCloud, ChevronRight, File, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
  const { documents, setDocuments, setActiveDocumentId, activeDocumentId } = useDocumentContext();
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleOpenWorkspace = (id) => {
    setActiveDocumentId(id);
    navigate('/workspace');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-3 sm:p-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 shrink-0">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
            Historical Archives &amp; Lab Notebooks
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">ID: arc-7749-v8</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Engine Pipeline v3.2 CTC-Bidi • Updated 3m ago</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            Batch Re-run
          </button>
          <label className={`bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <UploadCloud className="w-4 h-4" />
            <span>{isUploading ? 'Processing...' : 'New Upload'}</span>
            <input type="file" className="hidden" accept="image/*,.pdf,.tiff" disabled={isUploading} onChange={async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                setIsUploading(true);
                try {
                  const formData = new FormData();
                  formData.append('file', file);

                  const segmentRes = await fetch('http://localhost:8000/api/v1/segment', { method: 'POST', body: formData });
                  const segmented = await segmentRes.json();
                  if (segmented.error) throw new Error(segmented.error);

                  const transcribeRes = await fetch('http://localhost:8000/api/v1/transcribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ document_id: segmented.document_id, lines: segmented.lines })
                  });
                  const transcribed = await transcribeRes.json();

                  const workspaceData = {
                    image_dimensions: segmented.image_dimensions,
                    lines: segmented.lines.map((sLine) => {
                      const tLine = transcribed.lines.find(l => l.line_id === sLine.line_id) || {};
                      return {
                        line_id: sLine.line_id,
                        bbox: sLine.bbox,
                        text: tLine.text || '',
                        confidence: tLine.confidence || 0,
                        tokens: sLine.tokens.map(sTok => {
                          const tTok = (tLine.tokens || []).find(t => t.token_id === sTok.token_id) || {};
                          return { token_id: sTok.token_id, bbox: sTok.bbox, text: tTok.text || '', confidence: tTok.confidence || 0, candidates: [] };
                        })
                      };
                    })
                  };

                  const newDoc = {
                    id: Date.now(),
                    filename: file.name,
                    collection: "New Upload",
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    lines: segmented.lines.length,
                    confidence: 95.0,
                    status: "Completed",
                    image: `data:image/png;base64,${segmented.binarized_preview_base64}`,
                    segmentationData: workspaceData
                  };

                  setDocuments(prev => [newDoc, ...prev]);
                  setActiveDocumentId(newDoc.id);
                } catch (err) {
                  console.error("Upload failed", err);
                  alert("Upload failed: " + err.message);
                } finally {
                  setIsUploading(false);
                }
              }
            }} />
          </label>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 shrink-0">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">Ingested Assets</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">1,428 <span className="text-xs sm:text-sm font-normal text-gray-500">docs</span></div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <File className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">Avg Confidence</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">95.4% <span className="hidden sm:inline text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">High Opt</span></div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Search / Filter bar */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transcripts, filenames..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 shrink-0">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Table — scrollable on mobile */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-10">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="px-3 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Document</th>
                <th className="px-3 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 hidden sm:table-cell">Collection</th>
                <th className="px-3 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 hidden md:table-cell">Date</th>
                <th className="px-3 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Confidence</th>
                <th className="px-3 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 hidden sm:table-cell">Status</th>
                <th className="px-3 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map(doc => (
                <tr key={doc.id}
                  className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${activeDocumentId === doc.id ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => setActiveDocumentId(doc.id)}>
                  <td className="px-3 sm:px-6 py-4">
                    <input type="checkbox" checked={activeDocumentId === doc.id} readOnly className="rounded text-indigo-600 focus:ring-indigo-500" />
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={doc.image} alt="" className="w-full h-full object-cover opacity-80" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 max-w-[120px] sm:max-w-none truncate">{doc.filename}</div>
                        <div className="text-xs text-gray-500">{doc.lines} lines</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{doc.collection}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{doc.date}</td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 sm:w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${doc.confidence > 90 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${doc.confidence}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{doc.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenWorkspace(doc.id); }}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center gap-1 justify-end w-full whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Open Workspace</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
