import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, Maximize, Check, Image, FileText as EditorIcon } from 'lucide-react';

const DUMMY_DATA = {
  image_dimensions: { width: 1200, height: 1600 },
  lines: [
    {
      line_id: 'L01',
      bbox: [100, 150, 1000, 60],
      text: "In nomine Domini amen. Sciant presentes et futuri quod ego Johannes",
      confidence: 98.4,
      tokens: [
        { token_id: 'T01_01', text: "In", bbox: [100, 150, 50, 60], confidence: 99 },
        { token_id: 'T01_02', text: "nomine", bbox: [160, 150, 150, 60], confidence: 99 },
        { token_id: 'T01_03', text: "Domini", bbox: [320, 150, 140, 60], confidence: 99 },
        { token_id: 'T01_04', text: "amen.", bbox: [470, 150, 120, 60], confidence: 99 },
      ]
    },
    {
      line_id: 'L03',
      bbox: [100, 300, 980, 65],
      text: "omnibus terris et appurtenances adiacentibus",
      confidence: 74.8,
      tokens: [
        { token_id: 'T03_01', text: "omnibus", bbox: [100, 300, 180, 65], confidence: 95 },
        { token_id: 'T03_02', text: "terris", bbox: [290, 300, 120, 65], confidence: 90 },
        { token_id: 'T03_03', text: "et", bbox: [420, 300, 50, 65], confidence: 98 },
        { token_id: 'T03_04', text: "appurtenances", bbox: [480, 300, 260, 65], confidence: 64.2, candidates: ["appurtenances", "appertentiis"] },
        { token_id: 'T03_05', text: "adiacentibus", bbox: [750, 300, 230, 65], confidence: 85 }
      ]
    }
  ]
};

export default function WorkspaceView({ activeDocument }) {
  const workspaceData = activeDocument?.segmentationData || DUMMY_DATA;
  
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('raw'); // 'raw', 'otsu'
  const [showBBoxes, setShowBBoxes] = useState(true);
  
  const [activeLineId, setActiveLineId] = useState(null);
  const [activeTokenId, setActiveTokenId] = useState(null);
  const [editingToken, setEditingToken] = useState(null);

  const containerRef = useRef(null);
  const lineRefs = useRef({});

  // Sync scroll on right panel
  useEffect(() => {
    if (activeLineId && lineRefs.current[activeLineId]) {
      lineRefs.current[activeLineId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLineId]);

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const scaleChange = e.deltaY * -0.005;
      const newScale = Math.min(Math.max(0.1, transform.scale + scaleChange), 5);
      setTransform((prev) => ({ ...prev, scale: newScale }));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const preventDefault = (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    container.addEventListener('wheel', preventDefault, { passive: false });
    return () => container.removeEventListener('wheel', preventDefault);
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform({ ...transform, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleLineClick = (lineId) => {
    setActiveLineId(lineId);
    setActiveTokenId(null);
  };

  const handleTokenClick = (e, lineId, tokenId) => {
    e.stopPropagation();
    setActiveLineId(lineId);
    setActiveTokenId(tokenId);
  };

  const [mobileTab, setMobileTab] = useState('image'); // 'image' | 'editor'

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden w-full">
      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-b border-gray-700 bg-gray-800 shrink-0">
        <button
          onClick={() => setMobileTab('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
            mobileTab === 'image' ? 'text-white border-b-2 border-indigo-400 bg-gray-700' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Image className="w-4 h-4" /> Image Viewer
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
            mobileTab === 'editor' ? 'text-white border-b-2 border-indigo-400 bg-gray-700' : 'text-gray-400 hover:text-white'
          }`}
        >
          <EditorIcon className="w-4 h-4" /> Sync Editor
        </button>
      </div>

      {/* Desktop split / Mobile single-tab */}
      <div className="flex flex-1 overflow-hidden">
      {/* Left Panel: Image Viewer */}
      <div className={`flex-col border-r border-gray-200 bg-gray-900 min-w-0 ${
        mobileTab === 'image' ? 'flex' : 'hidden'
      } md:flex flex-1`}>
        {/* Toolbar */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 text-gray-300 shadow-md z-10 shrink-0">
           <div className="flex items-center gap-4 text-sm font-medium overflow-hidden">
             <span className="text-gray-400 shrink-0">Historical Archives /</span>
             <span className="text-white truncate">{activeDocument?.filename || 'Document'}</span>
           </div>
           <div className="flex items-center gap-2 shrink-0 ml-4">
             <button onClick={() => setTransform(prev => ({...prev, scale: prev.scale * 1.2}))} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"><ZoomIn className="w-4 h-4" /></button>
             <button onClick={() => setTransform({x: 0, y: 0, scale: 1})} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"><Maximize className="w-4 h-4" /></button>
           </div>
        </div>
        
        {/* View Options */}
        <div className="h-10 bg-gray-800/80 border-b border-gray-700 flex items-center px-4 gap-4 text-xs font-medium z-10 shrink-0">
          <button onClick={() => setViewMode('raw')} className={`px-3 py-1 rounded transition-colors ${viewMode === 'raw' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>Raw Image</button>
          <button onClick={() => setViewMode('otsu')} className={`px-3 py-1 rounded transition-colors ${viewMode === 'otsu' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>Otsu Binarized</button>
          <div className="flex-1"></div>
          <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
            <input type="checkbox" checked={showBBoxes} onChange={(e) => setShowBBoxes(e.target.checked)} className="rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-offset-gray-900" /> BBoxes
          </label>
        </div>

        {/* Image Area */}
        <div 
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-[#1a1a20] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
           <div 
             className="relative origin-center transition-transform duration-75 ease-out"
             style={{ 
               transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
               width: workspaceData.image_dimensions.width,
               height: workspaceData.image_dimensions.height
             }}
           >
             <img 
               src={activeDocument?.image || 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&q=80'} 
               alt={activeDocument?.filename || 'Document Image'} 
               className={`w-full h-full object-contain pointer-events-none ${viewMode === 'otsu' ? 'contrast-200 grayscale' : ''}`} 
             />
             
             {/* SVG Overlay for Bounding Boxes */}
             {showBBoxes && (
               <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 {workspaceData.lines.map((line) => {
                   const isActiveLine = activeLineId === line.line_id;
                   return (
                     <g key={line.line_id}>
                       <rect
                         x={line.bbox[0]}
                         y={line.bbox[1]}
                         width={line.bbox[2]}
                         height={line.bbox[3]}
                         fill={isActiveLine ? "rgba(99, 102, 241, 0.1)" : "transparent"}
                         stroke={isActiveLine ? "#6366f1" : "rgba(99, 102, 241, 0.4)"}
                         strokeWidth={isActiveLine ? 4 : 2}
                         className="pointer-events-auto cursor-pointer hover:stroke-indigo-400 transition-colors"
                         onClick={(e) => { e.stopPropagation(); handleLineClick(line.line_id); }}
                       />
                       {isActiveLine && line.tokens.map(token => {
                         const isActiveToken = activeTokenId === token.token_id;
                         const isLowConfidence = token.confidence < 70;
                         return (
                           <rect
                             key={token.token_id}
                             x={token.bbox[0]}
                             y={token.bbox[1]}
                             width={token.bbox[2]}
                             height={token.bbox[3]}
                             fill={isActiveToken ? (isLowConfidence ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)") : "transparent"}
                             stroke={isLowConfidence ? "#f59e0b" : "#10b981"}
                             strokeWidth={isActiveToken ? 4 : 2}
                             className="pointer-events-auto cursor-pointer hover:stroke-opacity-100 stroke-opacity-50 transition-colors"
                             onClick={(e) => handleTokenClick(e, line.line_id, token.token_id)}
                           />
                         );
                       })}
                     </g>
                   );
                 })}
               </svg>
             )}
           </div>
        </div>
      </div>

      {/* Right Panel: Transcription Editor */}
      <div className={`bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] z-20 ${
        mobileTab === 'editor' ? 'flex' : 'hidden'
      } md:flex w-full md:w-[400px] lg:w-[480px] shrink-0`}>
        <div className="h-12 border-b border-gray-200 flex items-center px-4 bg-slate-50 justify-between shrink-0">
           <div className="flex gap-4 text-sm font-medium">
             <button className="text-indigo-600 border-b-2 border-indigo-600 h-12">Sync Editor</button>
           </div>
           <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded text-xs font-semibold border border-green-200 transition-colors">
                <Check className="w-3 h-3" /> Accept Verified
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
           {workspaceData.lines.map((line) => {
             const isActive = activeLineId === line.line_id;
             return (
               <div 
                 key={line.line_id}
                 ref={el => lineRefs.current[line.line_id] = el}
                 className={`p-3 rounded-lg border transition-colors cursor-pointer ${isActive ? 'bg-indigo-50/50 border-indigo-200 shadow-sm relative' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'}`}
                 onClick={() => handleLineClick(line.line_id)}
               >
                 {isActive && <div className="absolute -left-3 top-4 w-1 h-8 bg-indigo-600 rounded-r"></div>}
                 
                 <div className="flex items-center gap-2 mb-2">
                   <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-700' : 'text-gray-400'}`}>{line.line_id}</span>
                   <span className={`text-[10px] font-semibold px-1 rounded ${line.confidence < 80 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                     {line.confidence}% Mean CER
                   </span>
                 </div>
                 
                 <div className="text-sm font-serif leading-relaxed text-gray-900 flex flex-wrap gap-1 items-center">
                   {line.tokens ? line.tokens.map(token => {
                     const isTokenActive = activeTokenId === token.token_id;
                     const isLowConfidence = token.confidence < 70;
                     const isEditing = editingToken === token.token_id;
                     
                     return (
                       <span 
                         key={token.token_id}
                         onClick={(e) => handleTokenClick(e, line.line_id, token.token_id)}
                         className={`relative group/word rounded px-0.5 cursor-pointer transition-colors
                           ${isTokenActive ? 'bg-indigo-100 ring-2 ring-indigo-300' : ''}
                           ${isLowConfidence ? 'bg-amber-100/50 border-b-2 border-amber-400 text-amber-900' : 'hover:bg-gray-100'}
                         `}
                       >
                         {isEditing ? (
                           <input 
                             type="text" 
                             autoFocus
                             defaultValue={token.text}
                             onBlur={() => setEditingToken(null)}
                             onKeyDown={(e) => { if (e.key === 'Enter') setEditingToken(null); }}
                             className="border border-indigo-300 rounded px-1 w-20 text-sm font-serif text-gray-900 outline-none"
                           />
                         ) : token.text}
                         
                         {/* Tooltip for Confidence / Alternatives */}
                         {(isTokenActive || (isLowConfidence && !isEditing)) && (
                           <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-md shadow-xl text-left min-w-[140px] z-50 hidden group-hover/word:block group-focus/word:block">
                             <div className="px-2 py-1 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-500">
                               <span>{token.confidence}% CONF</span>
                               <button onClick={(e) => { e.stopPropagation(); setEditingToken(token.token_id); }} className="text-indigo-600 hover:underline">Edit</button>
                             </div>
                             {token.candidates && token.candidates.length > 0 && (
                               <div className="p-1 space-y-0.5">
                                 {token.candidates.map((cand, idx) => (
                                   <button 
                                     key={idx} 
                                     className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded flex items-center"
                                     onClick={(e) => { e.stopPropagation(); setEditingToken(null); }}
                                   >
                                     <span className="opacity-50 w-4">{idx + 1}</span> {cand}
                                   </button>
                                 ))}
                               </div>
                             )}
                           </div>
                         )}
                       </span>
                     );
                   }) : line.text}
                 </div>
               </div>
             );
           })}
        </div>
      </div>
      </div>
    </div>
  );
}
