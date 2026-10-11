import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, MonitorPlay, BarChart2, Zap, User, Loader2 } from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';

export default function AppLayout() {
  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Workspace', path: '/workspace', icon: MonitorPlay },
    { name: 'Batch & Analytics', path: '/batch', icon: BarChart2 },
  ];

  const { setDocuments } = useDocumentContext();
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLaunchBatch = () => {
    setIsBatchRunning(true);
    // Simulate backend processing queue delay for pending documents
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => {
        if (doc.status !== 'Completed') {
          return {
            ...doc,
            status: 'Completed',
            confidence: (95 + Math.random() * 4).toFixed(1)
          };
        }
        return doc;
      }));
      setIsBatchRunning(false);
    }, 2000);
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-gray-50 overflow-hidden">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 shrink-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
              <Zap className="w-5 h-5 fill-current" />
              ScriptScan AI
            </div>
            
            <div className="flex items-center gap-2 border-l pl-6 border-gray-200 text-sm">
               <span className="text-gray-500">Project:</span>
               <select className="bg-transparent font-medium focus:outline-none cursor-pointer">
                 <option>Default Corpus</option>
               </select>
               <div className="flex items-center gap-1.5 ml-2 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 Operational
               </div>
            </div>
          </div>

          <nav className="flex items-center h-full">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 h-full text-sm font-medium transition-colors border-b-2 ${
                    isActive 
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                      : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
               <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
               Engine: CNN+CTC
             </div>
             <button 
               onClick={handleLaunchBatch}
               disabled={isBatchRunning}
               className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${isBatchRunning ? 'opacity-70 cursor-not-allowed' : ''}`}
             >
               {isBatchRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
               {isBatchRunning ? 'Processing...' : 'Launch Batch'}
             </button>
             <div className="relative">
               <button 
                 onClick={() => setShowUserMenu(!showUserMenu)}
                 className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center hover:bg-indigo-200 transition-colors"
               >
                 <User className="w-4 h-4" />
               </button>
               
               {showUserMenu && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                     <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                       <p className="text-sm font-semibold text-gray-900">Research Admin</p>
                       <p className="text-xs text-gray-500 truncate">admin@scriptscan.ai</p>
                     </div>
                     <div className="py-1">
                       <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => setShowUserMenu(false)}>Profile Settings</button>
                       <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => setShowUserMenu(false)}>Manage API Keys</button>
                     </div>
                     <div className="border-t border-gray-100 py-1">
                       <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => setShowUserMenu(false)}>Log Out</button>
                     </div>
                   </div>
                 </>
               )}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <Outlet />
      </main>

      {/* Bottom Operational Status Bar */}
      <footer className="bg-white border-t border-gray-200 h-8 flex items-center justify-between px-4 text-xs text-gray-500 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <span>Model Runtime: 42ms/segment</span>
          <span>CER: 1.2%</span>
          <span>WER: 2.8%</span>
          <span>API: v2.4-online</span>
        </div>
        <div>
          © 2026 ScriptScan AI Engineering Corp. All systems operational.
        </div>
      </footer>
    </div>
  );
}
