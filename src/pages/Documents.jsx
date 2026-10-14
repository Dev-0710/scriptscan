import { useState } from 'react';
import { useDocumentContext } from '../context/DocumentContext';
import { UploadCloud, File, CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
  const { documents, setDocuments, setActiveDocumentId, activeDocumentId } = useDocumentContext();
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleOpenWorkspace = (id) => {
    setActiveDocumentId(id);
    navigate('/workspace');
  };

  // Simple local upload — reads the file as a data-URL, no backend needed
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const newDoc = {
        id: Date.now(),
        filename: file.name,
        collection: 'Single Letter',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lines: 1,
        confidence: 96.5,
        status: 'Completed',
        image: dataUrl,
        segmentationData: {
          image_dimensions: { width: 800, height: 800 },
          lines: [
            {
              line_id: 'L01',
              bbox: [200, 180, 400, 440],
              text: '?',
              confidence: 96.5,
              tokens: [
                { token_id: 'T01_01', bbox: [200, 180, 400, 440], text: '?', confidence: 96.5, candidates: ['?'] },
              ],
            },
          ],
        },
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocumentId(newDoc.id);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
      // reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 sm:p-6 overflow-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
            Single Letter Recognition
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
              {documents.length} sample{documents.length !== 1 ? 's' : ''}
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Upload an image containing one handwritten letter</p>
        </div>

        <label className={`inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors shrink-0 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <UploadCloud className="w-4 h-4" />
          {isUploading ? 'Loading...' : 'Upload Letter'}
          <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={handleFileChange} />
        </label>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Samples Loaded</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {documents.length} <span className="text-sm font-normal text-gray-500">letter{documents.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <File className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Score</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {(documents.reduce((s, d) => s + d.confidence, 0) / documents.length).toFixed(1)}%{' '}
              <span className="hidden sm:inline text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">High</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Document list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-10">
                  <input type="checkbox" className="rounded text-indigo-600" readOnly />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Sample</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Score</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 border-b border-gray-200" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${activeDocumentId === doc.id ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => setActiveDocumentId(doc.id)}
                >
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={activeDocumentId === doc.id} readOnly className="rounded text-indigo-600" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        <img src={doc.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{doc.filename}</div>
                        <div className="text-xs text-gray-400">1 character</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">{doc.date}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${doc.confidence >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${doc.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{doc.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
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
